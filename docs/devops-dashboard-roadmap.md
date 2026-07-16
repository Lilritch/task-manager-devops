# DevOps Task Dashboard Roadmap

This project starts as a manual task manager and grows into a DevOps dashboard.
The dashboard can track manual tasks, GitHub issues, failed CI runs, and future
Slack or Calendar tasks.

## Step 1: Manual Tasks

This part is already built.

Users can:

- Register
- Log in
- Add tasks
- Complete tasks
- Delete tasks
- Filter tasks by source

Manual task examples:

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

This part is built.

The dashboard can import open GitHub issues and turn them into tasks.

Example:

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

This part is built.

The dashboard can import failed GitHub Actions workflow runs as high-priority
tasks.

Example:

```text
Task title: Fix failed CI: CI
Description: Branch and commit that failed
Source: Failed CI
Priority: High
```

Use the same GitHub setup from Step 2.

## Step 4: Slack Sync

The first Slack integration is built as a slash command endpoint.

Goal:

```text
/task Fix the failed production deployment
```

Expected result:

```text
Source: Slack
Title: Fix the failed production deployment
```

Real Slack sync needs manual setup outside this repo:

1. Create a Slack app in your Slack workspace.
2. Add a slash command such as `/task`.
3. Point the slash command to this backend endpoint:

```text
POST /integrations/slack/command
```

4. Store Slack secrets in `backend/.env`.
5. Map Slack users to app users.

For this first version, Slack tasks are assigned to one configured dashboard
user:

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

Calendar sync is useful for deadlines and deployment meetings.

Real Calendar sync usually needs OAuth, so it is best after GitHub and Slack.

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

After external tasks are syncing, add notifications.

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

For the DevOps portfolio story, add:

- `/metrics` endpoint in FastAPI
- Prometheus
- Grafana dashboard

Useful metrics:

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
6. Calendar sync
7. Notifications
8. Prometheus and Grafana
9. Kubernetes, Helm, and Argo CD
