# Argo CD GitOps

Argo CD watches the GitHub repository and deploys the Helm chart automatically.

## Install Argo CD

```bash
kubectl create namespace argocd
kubectl apply -n argocd --server-side --force-conflicts -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Wait for Argo CD:

```bash
kubectl get pods -n argocd
```

## Create The Task Manager App

```bash
kubectl apply -f argocd/task-manager-application.yaml
```

Argo CD will deploy the Helm chart from:

```text
helm/task-manager
```

into:

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

To view the GitOps-deployed app in a browser, add this to `/etc/hosts`:

```text
127.0.0.1 task-manager-gitops.local
```

Then open:

```text
http://task-manager-gitops.local/login
```
