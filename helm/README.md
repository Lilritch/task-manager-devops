# Helm Deployment

This folder contains the Helm chart used for the Kubernetes deployment.

## Resources

- Next.js frontend Deployment, Service, and Ingress
- FastAPI backend Deployment, Service, and Ingress
- PostgreSQL StatefulSet, Service, and Secret
- App ConfigMap and Secret

## Validate The Chart

```bash
helm lint helm/task-manager
helm template task-manager helm/task-manager --namespace task-manager
```

## Test Install

Use a separate namespace when checking chart changes:

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

Install the chart into the main namespace:

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

For deployed environments, replace the default values with environment-specific
settings or a secret manager.

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
