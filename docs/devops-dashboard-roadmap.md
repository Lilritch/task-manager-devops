# DevOps Task Dashboard Roadmap

This roadmap tracks how the task manager grows into a fuller DevOps dashboard.
The current version handles manual tasks, GitHub issues, failed CI runs, and
Slack-created tasks. Calendar sync and notifications are the next product
features to add.

## Step 1: Manual Tasks

This part is complete.

Users can:

- Register
- Log in
- Add tasks
- Complete tasks
- Delete tasks
- Filter tasks by source

Useful manual tasks:

```text
Title: Create Kubernetes manifests
Description: Add Deployment and Service files for frontend, backend, and Postgres.
Priority: High
```

```text
Title: Review failed deployment
Description: Check Docker logs and confirm the backend health endpoint is working.
Priority: Medium
```

## Step 2: GitHub Issues Sync

This part is complete.

The dashboard can import open GitHub issues and turn them into tasks.

Imported issue format:

```text
GitHub issue: Fix Docker Compose port conflict
Task source: GitHub Issues
Task title: Fix Docker Compose port conflict
Task link: Original GitHub issue URL
```

### Manual Setup

For public repositories, you can usually type the owner and repo directly in the
dashboard without a token.

For private repositories or higher rate limits:

1. Create a GitHub personal access token.
2. Give it permission to read repository issues and actions.
3. Put it in `backend/.env`:

```env
GITHUB_TOKEN=your_token_here
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-repo-name
```

4. Rebuild the backend:

```bash
docker compose up -d --build backend
```

## Step 3: Failed GitHub Actions Sync

This part is complete.

The dashboard can import failed GitHub Actions workflow runs as high-priority
tasks.

Imported CI format:

```text
Task title: Fix failed CI: CI
Description: Branch and commit that failed
Source: Failed CI
Priority: High
```

Use the same GitHub setup from Step 2.

## Step 4: Slack Sync

The first Slack integration is a slash command endpoint.

Slack command:

```text
/task Fix the failed production deployment
```

Dashboard result:

```text
Source: Slack
Title: Fix the failed production deployment
```

Slack still needs workspace setup outside this repo:

1. Create a Slack app in your Slack workspace.
2. Add a slash command such as `/task`.
3. Point the slash command to this backend endpoint:

```text
POST /integrations/slack/command
```

4. Store Slack secrets in `backend/.env`.
5. Map Slack users to app users.

Slack tasks are assigned to one configured dashboard user:

```env
SLACK_SIGNING_SECRET=your_slack_signing_secret
SLACK_DEFAULT_USER_EMAIL=the_email_you_use_to_log_in
```

For local testing only, you can temporarily allow unsigned Slack-style requests:

```env
SLACK_ALLOW_UNSIGNED=true
```

Do not use `SLACK_ALLOW_UNSIGNED=true` in a real deployment.

Local curl test:

```bash
curl -X POST http://localhost:8000/integrations/slack/command \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "text=Fix the failed deployment&user_id=U123&channel_id=C123"
```

## Step 5: Calendar Sync

Calendar sync will make the dashboard useful for deadlines and deployment
meetings.

Calendar sync usually needs OAuth, so it belongs after the GitHub and Slack
flows are stable.

Possible sources:

- Google Calendar
- Outlook Calendar

Example:

```text
Calendar event: Deploy backend to Kubernetes
Task: Prepare for backend deployment
Due date: Event date
Source: Calendar
```

## Step 6: Notifications

After external tasks are syncing, notifications can make the dashboard more
useful during daily work.

Useful notifications:

- Failed CI run imported
- Task due today
- High-priority task still open
- GitHub issue assigned to the user

Notification options:

- In-app notification
- Email
- Slack message

## Step 7: Monitoring

Monitoring is in place for the Kubernetes deployment:

- `/metrics` endpoint in FastAPI
- Prometheus scraping through `ServiceMonitor`
- Grafana dashboards for Kubernetes workload metrics

Useful app-level metrics to add next:

- Total tasks created
- Tasks imported from GitHub
- Failed sync attempts
- API request count
- API response time

## Best Build Order

1. Manual task app
2. Task sources and dashboard filters
3. GitHub Issues sync
4. Failed GitHub Actions sync
5. Slack sync
6. Kubernetes manifests
7. Helm chart
8. Argo CD
9. Calendar sync
10. Notifications
11. Prometheus and Grafana
