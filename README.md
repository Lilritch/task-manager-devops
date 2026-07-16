# Cloud-Native Task Manager with DevOps Pipeline

A task management app built to demonstrate a full production-style delivery pipeline:
app code → containers → CI → Kubernetes → GitOps → monitoring.

## Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** FastAPI, SQLAlchemy, JWT auth
- **Database:** PostgreSQL
- **Containers:** Docker, Docker Compose
- **CI:** GitHub Actions (lint, test, build, push image)
- **Orchestration (later phase):** Kubernetes, Helm, Argo CD
- **Monitoring (later phase):** Prometheus, Grafana

## Status

- [x] Repo scaffold
- [x] FastAPI backend skeleton (auth + task CRUD routes)
- [x] Next.js frontend skeleton
- [x] Dockerfiles + docker-compose for local dev
- [x] GitHub Actions CI (lint/test/build)
- [x] DevOps dashboard task sources and filters
- [x] GitHub Issues sync
- [x] Failed GitHub Actions sync
- [x] Slack slash-command endpoint
- [x] Kubernetes manifests
- [ ] Helm chart
- [ ] Argo CD GitOps deployment
- [ ] Prometheus + Grafana
- [ ] Architecture diagram

## Local development

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs
- Postgres: localhost:5433

## DevOps dashboard integrations

The dashboard supports manual tasks, GitHub Issues imports, and failed GitHub
Actions imports. It also includes a Slack slash-command endpoint for creating
tasks from Slack once you configure a Slack app.

For public repositories, log in and enter the GitHub owner/repo on the tasks
page. For private repositories, add a GitHub token to `backend/.env`:

```env
GITHUB_TOKEN=your_token_here
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-repo-name
```

Then rebuild the backend:

```bash
docker compose up -d --build backend
```

See `docs/devops-dashboard-roadmap.md` for the full GitHub, Slack, Calendar,
notifications, and monitoring plan.

### Slack slash command

The backend endpoint is:

```text
POST /integrations/slack/command
```

Manual setup required:

1. Create a Slack app.
2. Add a slash command like `/task`.
3. Point the slash command at your deployed backend URL.
4. Add these values to `backend/.env`:

```env
SLACK_SIGNING_SECRET=your_slack_signing_secret
SLACK_DEFAULT_USER_EMAIL=the_email_you_use_to_log_in
```

For local curl testing only:

```env
SLACK_ALLOW_UNSIGNED=true
```

## Project structure

```
.
├── frontend/          Next.js app
├── backend/           FastAPI app
├── k8s/               Kubernetes manifests
├── docker-compose.yml Local dev orchestration
├── .github/workflows/ CI pipeline
├── helm/               (added in Phase 4)
└── README.md
```

## Kubernetes

Kubernetes manifests live in `k8s/base`.

Deploy with:

```bash
kubectl apply -k k8s/base
```

See `k8s/README.md` for cluster setup, ingress, image, and secret steps.

## Roadmap

See the step-by-step build roadmap in project notes — next up is wrapping the
Kubernetes manifests into a Helm chart, then Argo CD and monitoring.
