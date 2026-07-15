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
- [ ] Kubernetes manifests
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

## Project structure

```
.
├── frontend/          Next.js app
├── backend/           FastAPI app
├── docker-compose.yml Local dev orchestration
├── .github/workflows/ CI pipeline
├── k8s/                (added in Phase 4)
├── helm/               (added in Phase 4)
└── README.md
```

## Roadmap

See the step-by-step build roadmap in project notes — next up is wiring the frontend
task UI to the backend, then containerizing, then Kubernetes + Argo CD + monitoring.
