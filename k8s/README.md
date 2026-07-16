# Kubernetes Deployment

These manifests deploy the full task manager stack:

- PostgreSQL database
- FastAPI backend
- Next.js frontend
- Ingress routing for frontend and backend API

The local Kubernetes hostname is:

```text
task-manager.local
```

The frontend uses `/api` for backend calls in Kubernetes. The backend ingress
rewrites `/api/...` to the matching FastAPI route.

## Files

```text
k8s/base/namespace.yaml
k8s/base/postgres-secret.yaml
k8s/base/app-configmap.yaml
k8s/base/app-secret.yaml
k8s/base/postgres-statefulset.yaml
k8s/base/postgres-service.yaml
k8s/base/backend-deployment.yaml
k8s/base/backend-service.yaml
k8s/base/frontend-deployment.yaml
k8s/base/frontend-service.yaml
k8s/base/backend-ingress.yaml
k8s/base/frontend-ingress.yaml
```

## Manual Setup

You need a Kubernetes cluster first.

Good local options:

- Docker Desktop Kubernetes
- minikube
- kind

You also need an NGINX ingress controller.

For minikube:

```bash
minikube addons enable ingress
```

For Docker Desktop Kubernetes, install ingress-nginx:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.13.3/deploy/static/provider/cloud/deploy.yaml
```

## Image Setup

The manifests use GitHub Container Registry images:

```text
ghcr.io/lilritch/task-manager-devops/backend:latest
ghcr.io/lilritch/task-manager-devops/frontend:latest
```

After pushing to GitHub, the CI workflow builds and pushes those images.

If Kubernetes cannot pull them, do one of these:

1. Make the GHCR packages public in GitHub.
2. Create an image pull secret for GHCR.
3. For local kind/minikube testing, build and load local images.

## Configure Secrets

Before a real deployment, edit:

```text
k8s/base/app-secret.yaml
k8s/base/postgres-secret.yaml
```

At minimum, change:

```text
SECRET_KEY
POSTGRES_PASSWORD
```

For GitHub private repo sync, set:

```text
GITHUB_TOKEN
```

For Slack sync in a public deployment, set:

```text
SLACK_SIGNING_SECRET
SLACK_DEFAULT_USER_EMAIL
```

Do not commit real production secrets to GitHub.

## Deploy

From the repo root:

```bash
kubectl apply -k k8s/base
```

Check the rollout:

```bash
kubectl get pods -n task-manager
kubectl get services -n task-manager
kubectl get ingress -n task-manager
```

## Local Hostname

For local ingress testing, point `task-manager.local` to your cluster ingress IP.

For minikube:

```bash
minikube ip
```

Then add this line to `/etc/hosts`, replacing the IP:

```text
192.168.49.2 task-manager.local
```

For Docker Desktop Kubernetes, this is often enough:

```text
127.0.0.1 task-manager.local
```

Then open:

```text
http://task-manager.local
```

Backend health through ingress:

```text
http://task-manager.local/api/health
```

## Remove Deployment

```bash
kubectl delete -k k8s/base
```
