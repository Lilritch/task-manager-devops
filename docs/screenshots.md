# Project Screenshots

This page collects the main app, GitOps, and monitoring screenshots.

## DevOps Task Dashboard

![DevOps Task Dashboard](./screenshots/app-dashboard/task-dashboard.png)

The dashboard brings together manual tasks, GitHub issues, failed CI work, and Slack-created tasks.

## Argo CD GitOps

![Argo CD Healthy Sync](./screenshots/argocd/argocd-healthy-sync.png)

Argo CD watches the GitHub repository and deploys the Helm chart into Kubernetes.

![Argo CD Application Details](./screenshots/argocd/argocd-application-details.png)

The application details show the GitHub repository, Helm chart path, target namespace, and auto-sync settings.

## Grafana Kubernetes Monitoring

![Grafana Task Manager Pods](./screenshots/grafana/grafana-task-manager-pods.png)

Grafana shows CPU and memory usage for the frontend, backend, and Postgres pods in the `task-manager-gitops` namespace.

![Grafana Task Manager Network](./screenshots/grafana/grafana-task-manager-network.png)

Grafana also shows network traffic and packet metrics for the same Kubernetes workloads.
