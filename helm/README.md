# Helm Deployment

This folder contains the Helm chart for the DevOps Task Manager app.

## What Helm Deploys

- Next.js frontend Deployment, Service, and Ingress
- FastAPI backend Deployment, Service, and Ingress
- PostgreSQL StatefulSet, Service, and Secret
- App ConfigMap and Secret

## Validate The Chart

```bash
helm lint helm/task-manager
helm template task-manager helm/task-manager --namespace task-manager
```

## Safe Test Install

Use a separate namespace so you do not disturb the raw Kubernetes deployment:

```bash
helm upgrade --install task-manager helm/task-manager \
  -n task-manager-helm \
  --create-namespace \
  --set ingress.host=task-manager-helm.local
```

Check it:

```bash
kubectl get pods -n task-manager-helm
kubectl get ingress -n task-manager-helm
helm status task-manager -n task-manager-helm
```

## Main Install

When you are ready to use Helm as the primary deployment method:

```bash
helm upgrade --install task-manager helm/task-manager \
  -n task-manager \
  --create-namespace
```

## Common Values

Override values with `--set`:

```bash
helm upgrade --install task-manager helm/task-manager \
  -n task-manager \
  --set ingress.host=task-manager.local \
  --set app.githubOwner=Lilritch \
  --set app.githubRepo=task-manager-devops
```

For real deployments, do not keep default secrets in `values.yaml`. Use
environment-specific values or a secret manager.

## Prometheus Metrics

When kube-prometheus-stack is installed, enable backend scraping with:

```bash
helm upgrade --install task-manager helm/task-manager \
  -n task-manager \
  --set monitoring.serviceMonitor.enabled=true
```

The backend exposes metrics at:

```text
/metrics
```
