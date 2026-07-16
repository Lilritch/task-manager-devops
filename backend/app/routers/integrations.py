import hashlib
import hmac
import os
import time

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app import auth, models, schemas
from app.database import get_db

router = APIRouter(prefix="/integrations", tags=["integrations"])

GITHUB_API_URL = "https://api.github.com"


def _github_headers() -> dict[str, str]:
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    token = os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def _repo_from_request(request: schemas.GitHubSyncRequest) -> tuple[str, str]:
    owner = request.owner or os.getenv("GITHUB_OWNER")
    repo = request.repo or os.getenv("GITHUB_REPO")
    if not owner or not repo:
        raise HTTPException(
            status_code=400,
            detail="Provide owner/repo in the request or set GITHUB_OWNER and GITHUB_REPO.",
        )
    return owner, repo


def _existing_external_ids(
    db: Session, current_user: models.User, source: str
) -> set[str]:
    rows = (
        db.query(models.Task.external_id)
        .filter(
            models.Task.owner_id == current_user.id,
            models.Task.source == source,
            models.Task.external_id.isnot(None),
        )
        .all()
    )
    return {row[0] for row in rows if row[0]}


def _existing_external_id_for_user(
    db: Session, user: models.User, source: str, external_id: str
) -> bool:
    return (
        db.query(models.Task)
        .filter(
            models.Task.owner_id == user.id,
            models.Task.source == source,
            models.Task.external_id == external_id,
        )
        .first()
        is not None
    )


def _get_github_json(path: str, params: dict[str, str | int]) -> dict | list:
    try:
        response = httpx.get(
            f"{GITHUB_API_URL}{path}",
            headers=_github_headers(),
            params=params,
            timeout=15,
        )
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=f"GitHub API error: {exc.response.text}",
        ) from exc
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"GitHub request failed: {exc}") from exc


@router.post("/github/issues/sync", response_model=schemas.SyncResult)
def sync_github_issues(
    request: schemas.GitHubSyncRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    owner, repo = _repo_from_request(request)
    payload = _get_github_json(
        f"/repos/{owner}/{repo}/issues",
        {"state": "open", "per_page": 50},
    )

    if not isinstance(payload, list):
        raise HTTPException(status_code=502, detail="Unexpected GitHub issues response.")

    existing_ids = _existing_external_ids(db, current_user, "github_issue")
    imported = 0
    skipped = 0

    for issue in payload:
        if issue.get("pull_request"):
            skipped += 1
            continue

        external_id = str(issue["id"])
        if external_id in existing_ids:
            skipped += 1
            continue

        task = models.Task(
            title=issue["title"],
            description=(issue.get("body") or "")[:1000],
            source="github_issue",
            external_id=external_id,
            external_url=issue.get("html_url"),
            priority="medium",
            owner_id=current_user.id,
        )
        db.add(task)
        imported += 1

    db.commit()
    return schemas.SyncResult(
        source="github_issue",
        imported=imported,
        skipped=skipped,
        message=f"Synced open issues from {owner}/{repo}.",
    )


@router.post("/github/actions/sync", response_model=schemas.SyncResult)
def sync_failed_github_actions(
    request: schemas.GitHubSyncRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    owner, repo = _repo_from_request(request)
    payload = _get_github_json(
        f"/repos/{owner}/{repo}/actions/runs",
        {"status": "completed", "per_page": 50},
    )

    runs = payload.get("workflow_runs") if isinstance(payload, dict) else None
    if not isinstance(runs, list):
        raise HTTPException(status_code=502, detail="Unexpected GitHub Actions response.")

    existing_ids = _existing_external_ids(db, current_user, "github_action")
    imported = 0
    skipped = 0

    for run in runs:
        if run.get("conclusion") != "failure":
            skipped += 1
            continue

        external_id = str(run["id"])
        if external_id in existing_ids:
            skipped += 1
            continue

        task = models.Task(
            title=f"Fix failed CI: {run.get('name') or 'GitHub Actions run'}",
            description=(
                f"Branch: {run.get('head_branch') or 'unknown'}\n"
                f"Commit: {run.get('head_sha') or 'unknown'}"
            ),
            source="github_action",
            external_id=external_id,
            external_url=run.get("html_url"),
            priority="high",
            owner_id=current_user.id,
        )
        db.add(task)
        imported += 1

    db.commit()
    return schemas.SyncResult(
        source="github_action",
        imported=imported,
        skipped=skipped,
        message=f"Synced failed workflow runs from {owner}/{repo}.",
    )


def _verify_slack_request(request: Request, raw_body: bytes) -> None:
    signing_secret = os.getenv("SLACK_SIGNING_SECRET")
    if not signing_secret:
        if os.getenv("SLACK_ALLOW_UNSIGNED", "false").lower() == "true":
            return
        raise HTTPException(
            status_code=400,
            detail="Set SLACK_SIGNING_SECRET before accepting Slack requests.",
        )

    timestamp = request.headers.get("x-slack-request-timestamp")
    signature = request.headers.get("x-slack-signature")
    if not timestamp or not signature:
        raise HTTPException(status_code=401, detail="Missing Slack signature headers.")

    try:
        request_time = int(timestamp)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail="Invalid Slack timestamp.") from exc

    if abs(time.time() - request_time) > 60 * 5:
        raise HTTPException(status_code=401, detail="Slack request is too old.")

    basestring = f"v0:{timestamp}:{raw_body.decode()}".encode()
    expected = "v0=" + hmac.new(
        signing_secret.encode(),
        basestring,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected, signature):
        raise HTTPException(status_code=401, detail="Invalid Slack signature.")


@router.post("/slack/command", response_class=PlainTextResponse)
async def create_task_from_slack_command(
    request: Request,
    db: Session = Depends(get_db),
):
    raw_body = await request.body()
    _verify_slack_request(request, raw_body)

    form = await request.form()
    text = str(form.get("text") or "").strip()
    slack_user_id = str(form.get("user_id") or "unknown")
    channel_id = str(form.get("channel_id") or "unknown")
    trigger_id = str(form.get("trigger_id") or "")

    if not text:
        return "Usage: /task Fix the failed deployment"

    default_user_email = os.getenv("SLACK_DEFAULT_USER_EMAIL")
    if not default_user_email:
        raise HTTPException(
            status_code=400,
            detail="Set SLACK_DEFAULT_USER_EMAIL to assign Slack tasks to a dashboard user.",
        )

    user = db.query(models.User).filter(models.User.email == default_user_email).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail=f"No dashboard user found for {default_user_email}.",
        )

    external_id = trigger_id or hashlib.sha256(raw_body).hexdigest()
    if _existing_external_id_for_user(db, user, "slack", external_id):
        return "That Slack task was already added."

    task = models.Task(
        title=text[:255],
        description=f"Created from Slack by user {slack_user_id} in channel {channel_id}.",
        source="slack",
        external_id=external_id,
        priority="medium",
        owner_id=user.id,
    )
    db.add(task)
    db.commit()

    return f"Task added to the dashboard: {task.title}"
