# DevOps Task Manager

A task management app for tracking day-to-day engineering work across manual
tasks, GitHub issues, failed CI runs, and Slack requests. The project also shows
how the same app moves through containers, CI, Kubernetes, GitOps, and
monitoring.

## Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** FastAPI, SQLAlchemy, JWT auth
- **Database:** PostgreSQL
- **Containers:** Docker, Docker Compose
- **CI:** GitHub Actions (lint, test, build, push image)
- **Orchestration:** Kubernetes, Helm, Argo CD
- **Monitoring:** Prometheus, Grafana

## Status

- [x] Repository setup
- [x] FastAPI backend with auth and task CRUD
- [x] Next.js frontend
- [x] Dockerfiles + docker-compose for local dev
- [x] GitHub Actions CI (lint/test/build)
- [x] DevOps dashboard task sources and filters
- [x] GitHub Issues sync
- [x] Failed GitHub Actions sync
- [x] Slack slash-command endpoint
- [x] Kubernetes manifests
- [x] Helm chart
- [x] Argo CD GitOps deployment
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

See `docs/devops-dashboard-roadmap.md` for the GitHub, Slack, Calendar,
notifications, and monitoring notes.

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
├── helm/               Helm chart
└── README.md
```

## Kubernetes

Kubernetes manifests live in `k8s/base`.

Deploy with:

```bash
kubectl apply -k k8s/base
```

See `k8s/README.md` for cluster setup, ingress, image, and secret steps.

## Helm

The Helm chart lives in `helm/task-manager`.

Install or upgrade the app with:

```bash
helm upgrade --install task-manager helm/task-manager -n task-manager --create-namespace
```

For a safe test install that does not touch the existing `task-manager`
namespace:

```bash
helm upgrade --install task-manager helm/task-manager -n task-manager-helm --create-namespace --set ingress.host=task-manager-helm.local
```

See `helm/README.md` for chart values and verification commands.

## Argo CD

The Argo CD application manifest lives in `argocd/task-manager-application.yaml`.
It deploys the Helm chart from GitHub into the `task-manager-gitops` namespace.

See `argocd/README.md` for install, login, and verification commands.

## Roadmap

Next up: add Prometheus and Grafana monitoring.
