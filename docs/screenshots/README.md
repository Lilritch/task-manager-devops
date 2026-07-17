# Screenshot Guide

Use this folder for project screenshots that you want to show on GitHub.

## Add These Files

Save screenshots with these exact names:

```text
docs/screenshots/app-dashboard/task-dashboard.png
docs/screenshots/argocd/argocd-healthy-sync.png
docs/screenshots/argocd/argocd-application-details.png
docs/screenshots/grafana/grafana-task-manager-pods.png
docs/screenshots/grafana/grafana-task-manager-network.png
```

## What To Capture

App dashboard:

- Open `http://task-manager.local/tasks` or `http://task-manager-gitops.local/tasks`.
- Show the task dashboard with GitHub sync, Slack/manual tasks, and stats visible.

Argo CD:

- Open `https://localhost:8080`.
- Show the `task-manager` application tree with `Synced` and `Healthy`.
- Optional: show the application details page with the GitHub repo, Helm path, and auto-sync settings.

Grafana Kubernetes dashboard:

- Open Grafana.
- Open a Kubernetes dashboard.
- Select the `task-manager-gitops` namespace.
- Show CPU, memory, or network panels.

After adding the image files, open `docs/showcase.md` to preview how they will appear.
