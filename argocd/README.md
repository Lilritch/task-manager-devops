# Argo CD GitOps

Argo CD watches the GitHub repository and keeps the Kubernetes deployment in
sync with the Helm chart.

## Install Argo CD

```bash
kubectl create namespace argocd
kubectl apply -n argocd --server-side --force-conflicts -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Wait for Argo CD:

```bash
kubectl get pods -n argocd
```

## Create The Application

```bash
kubectl apply -f argocd/task-manager-application.yaml
```

The application points Argo CD at this chart:

```text
helm/task-manager
```

and deploys it into:

```text
task-manager-gitops
```

## Open Argo CD

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Then open:

```text
https://localhost:8080
```

Username:

```text
admin
```

Password:

```bash
kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d
```

## Local Host Entry

To open the GitOps deployment in a browser, add this to `/etc/hosts`:

```text
127.0.0.1 task-manager-gitops.local
```

Then open:

```text
http://task-manager-gitops.local/login
```
