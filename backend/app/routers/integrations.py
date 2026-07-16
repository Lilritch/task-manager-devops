import os

import httpx
from fastapi import APIRouter, Depends, HTTPException
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
