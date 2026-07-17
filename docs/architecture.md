# Architecture

DevOps Task Manager is split into three layers: the app, the delivery pipeline,
and the Kubernetes platform that runs it.

## System Flow

```mermaid
flowchart LR
    user[User] --> frontend[Next.js frontend]
    frontend --> api[FastAPI backend]
    api --> db[(PostgreSQL)]

    github[GitHub Issues and Actions] --> api
    slack[Slack slash command] --> api
    api --> metrics[Prometheus metrics endpoint]
```

The frontend handles login, task creation, filtering, and GitHub sync actions.
The backend owns authentication, task storage, GitHub imports, Slack task
creation, and Prometheus metrics. PostgreSQL stores users and tasks.

## Delivery Flow

```mermaid
flowchart LR
    code[GitHub repository] --> ci[GitHub Actions]
    ci --> images[GitHub Container Registry]
    code --> argo[Argo CD]
    argo --> helm[Helm chart]
    helm --> cluster[Kubernetes cluster]
    images --> cluster
```

GitHub Actions builds the frontend and backend images and pushes them to GHCR.
Argo CD watches the repository and applies the Helm chart into the Kubernetes
cluster. The chart deploys the frontend, backend, PostgreSQL, ingress rules,
secrets, config, and monitoring resources.

## Runtime View

```mermaid
flowchart TB
    ingress[NGINX Ingress]
    frontendSvc[frontend Service]
    backendSvc[backend Service]
    postgresSvc[postgres Service]

    ingress --> frontendSvc
    ingress --> backendSvc
    frontendSvc --> frontendPod[frontend Pod]
    backendSvc --> backendPod[backend Pod]
    backendPod --> postgresSvc
    postgresSvc --> postgresPod[PostgreSQL StatefulSet]

    prometheus[Prometheus] --> serviceMonitor[ServiceMonitor]
    serviceMonitor --> backendSvc
    grafana[Grafana] --> prometheus
```

Ingress routes browser traffic to the frontend and `/api` traffic to the
backend. Prometheus scrapes the backend through the ServiceMonitor, and Grafana
visualizes the Kubernetes and application metrics.
