# Setup Guide
**Component:** Collaboration Integration System
**Version:** 1.0.0
**Last Updated:** 2026-01-03

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git repository with GitHub
- Slack workspace (optional, for notifications)
- Microsoft Teams (optional, for notifications)
- Jira account (optional, for issue tracking)

## Installation

### 1. Clone and Setup

```bash
# Navigate to your project
cd /home/pedroocalado/githubPages

# The collaboration system is already in .opencode/collaboration/
# Verify the directory exists
ls -la .opencode/collaboration/

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `.opencode/collaboration/` directory:

```bash
cd .opencode/collaboration
cp .env.example .env
```

Edit the `.env` file with your credentials:

```bash
# GitHub
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
GITHUB_OWNER=your-organization
GITHUB_REPO=your-repo

# Slack (optional)
SLACK_TOKEN=xoxb-xxxxxxxxxxxx-xxxxxxxxxxxx-xxxxxxxxxxxx
SLACK_DEFAULT_CHANNEL=#frontend-updates
SLACK_AGENT_ACTIVITY_CHANNEL=#agent-activity

# Microsoft Teams (optional)
TEAMS_APP_ID=your-app-id
TEAMS_APP_SECRET=your-app-secret
TEAMS_TENANT_ID=your-tenant-id

# Jira (optional)
JIRA_HOST=your-domain.atlassian.net
JIRA_EMAIL=your-email@domain.com
JIRA_API_TOKEN=your-api-token
JIRA_PROJECT=FE

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@domain.com
SMTP_PASS=your-password
SMTP_FROM=noreply@yourdomain.com

# Knowledge Base (optional)
NOTION_TOKEN=secret_xxxxxxxxxxxx
CONFLUENCE_USERNAME=your-username
CONFLUENCE_API_TOKEN=your-api-token

# Database (for activity feed and metrics)
DATABASE_URL=postgresql://user:password@localhost:5432/collaboration

# Monitoring
ENABLE_MONITORING=true
MONITORING_URL=http://localhost:3000/metrics

# Workflow Engine
WORKFLOW_TIMEOUT=3600
MAX_CONCURRENT_WORKFLOWS=10
```

### 3. GitHub Integration Setup

#### Create GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Collaboration Integration")
4. Select scopes:
   - `repo` (Full control of private repositories)
   - `issues` (Read and write issues)
   - `pull_requests` (Read and write pull requests)
   - `projects` (Read and write projects)
   - `admin:org` (Manage organization, for team access)
5. Click "Generate token"
6. Copy the token and save it to `GITHUB_TOKEN` in your `.env` file

#### Configure GitHub Repository

```bash
# Create required GitHub labels
npm run github:create-labels

# Create default project board
npm run github:create-project

# Create issue templates
npm run github:setup-templates
```

### 4. Slack Integration Setup

#### Create Slack App

1. Go to https://api.slack.com/apps
2. Click "Create New App"
3. Select "From scratch"
4. Enter App Name and select your Workspace
5. Configure OAuth & Permissions:
   - Scopes:
     - Bot Token Scopes:
       - `chat:write`
       - `chat:write.public`
       - `channels:join`
       - `channels:read`
       - `im:write`
       - `reactions:write`
       - `usergroups:read`
       - `users:read`
   - Install to Workspace
6. Copy the Bot User OAuth Token and save to `SLACK_TOKEN`

#### Create Required Channels

```bash
# Create channels for notifications
npm run slack:create-channels

# This will create:
# - #frontend-updates (general updates)
# - #agent-activity (agent activity feed)
# - #code-review (code review notifications)
# - #deployments (deployment notifications)
# - #alerts (critical alerts)
# - #best-practices (knowledge sharing)
```

### 5. Microsoft Teams Integration Setup (Optional)

#### Create Teams App

1. Go to https://dev.teams.microsoft.com/apps
2. Click "New app"
3. Enter app details
4. Configure Bot:
   - Add bot endpoint
   - Generate app ID and password
5. Save credentials to `.env`:
   - `TEAMS_APP_ID`
   - `TEAMS_APP_SECRET`
   - `TEAMS_TENANT_ID`

### 6. Jira Integration Setup (Optional)

#### Generate API Token

1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Label it appropriately
4. Copy the token and save to `JIRA_API_TOKEN`

### 7. Database Setup

#### PostgreSQL Setup

```bash
# Install PostgreSQL
# On Ubuntu/Debian:
sudo apt-get install postgresql postgresql-contrib

# On macOS:
brew install postgresql

# Start PostgreSQL service
sudo systemctl start postgresql
# or
brew services start postgresql

# Create database
sudo -u postgres psql
CREATE DATABASE collaboration;
CREATE USER collaboration_user WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE collaboration TO collaboration_user;
\q

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### 8. Initialize Services

```bash
# Start all services
npm start

# Or start individual services
npm run github:service &
npm run slack:service &
npm run workflow:service &
npm run knowledge:service &
```

### 9. Verify Installation

```bash
# Run health checks
npm run health-check

# Run tests
npm test

# Verify all integrations
npm run verify-integrations
```

## Configuration

### Basic Configuration

Edit `config.json` to customize behavior:

```json
{
  "github": {
    "token": "${GITHUB_TOKEN}",
    "owner": "your-org",
    "repo": "your-repo",
    "defaultBranch": "main",
    "defaultLabels": ["frontend", "automated"],
    "autoAssign": false,
    "autoLabel": true
  },
  "slack": {
    "token": "${SLACK_TOKEN}",
    "defaultChannel": "#frontend-updates",
    "agentActivityChannel": "#agent-activity",
    "alertChannel": "#alerts",
    "username": "Frontend Bot",
    "iconEmoji": ":robot_face:"
  },
  "notifications": {
    "enabled": true,
    "channels": ["slack"],
    "summarySchedule": "0 9 * * *"
  },
  "workflows": {
    "enabled": true,
    "autoExecute": true
  }
}
```

### Advanced Configuration

See [Configuration Reference](./CONFIGURATION.md) for detailed configuration options.

## Integration with Agents

### Agent Output Integration

Add the following to each agent's configuration:

```typescript
// In your agent implementation
import { CollaborationIntegration } from '@opencode/collaboration';

const collaboration = new CollaborationIntegration(config);

// When agent completes a task
async function onTaskComplete(agentId: string, output: AgentOutput) {
  // Create issue if needed
  if (output.createIssue) {
    const issue = await collaboration.github.createIssue({
      title: output.title,
      body: output.description,
      labels: output.labels,
      priority: output.priority
    });
  }

  // Send notification
  await collaboration.notifications.sendSlack('#agent-activity', {
    text: `Task completed by ${agentId}`,
    blocks: formatAgentOutput(output)
  });

  // Log to activity feed
  await collaboration.activityFeed.logActivity(agentId, {
    type: 'task-complete',
    title: output.title,
    description: output.summary,
    status: 'completed'
  });

  // Capture learning
  await collaboration.knowledge.captureLearning(agentId, output);
}
```

### Handoff Protocol Integration

```typescript
import { AgentHandoffWorkflow } from '@opencode/collaboration';

const handoffWorkflow = new AgentHandoffWorkflow(config);

// Create handoff
async function createHandoff(fromAgent: string, toAgent: string, task: HandoffTask) {
  const handoff = {
    fromAgent,
    toAgent,
    taskTitle: task.title,
    description: task.description,
    context: task.context,
    dependencies: task.dependencies
  };

  const result = await handoffWorkflow.executeHandoff(handoff);

  return result;
}
```

## Workflow Setup

### Create Custom Workflows

```typescript
import { WorkflowEngine } from '@opencode/collaboration';

const engine = new WorkflowEngine(config);

// Define workflow
const workflow = {
  name: 'Custom Feature Workflow',
  description: 'My custom workflow',
  version: '1.0.0',
  enabled: true,
  triggers: [{
    type: 'github-event',
    name: 'Push Trigger',
    config: {
      event: 'push',
      filter: { branch: 'feature/*' }
    }
  }],
  steps: [
    {
      id: 'step-1',
      name: 'First Step',
      type: 'automated',
      action: 'my-action',
      config: { /* action config */ }
    },
    {
      id: 'step-2',
      name: 'Manual Step',
      type: 'manual',
      action: 'manual-approval',
      assignTo: '@user'
    }
  ]
};

// Create workflow
const workflowId = await engine.createWorkflow(workflow);
```

### Enable Built-in Workflows

```bash
# Enable all built-in workflows
npm run workflow:enable-all

# Enable specific workflow
npm run workflow:enable new-feature

# List available workflows
npm run workflow:list
```

## GitHub Actions Integration

Add to your `.github/workflows/collaboration.yml`:

```yaml
name: Collaboration Integration

on:
  workflow_run:
    workflows: ["CI", "CD"]
    types: [completed]
  push:
    branches: [main, develop]

jobs:
  # Create issues from agent outputs
  agent-issues:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Process agent outputs
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npm run collaboration:process-outputs

  # Code review automation
  code-review:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Run automated review
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npm run collaboration:code-review

  # Notifications
  notify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Send notifications
        env:
          SLACK_TOKEN: ${{ secrets.SLACK_TOKEN }}
        run: npm run collaboration:notify
```

## Troubleshooting

### Common Issues

#### GitHub API Rate Limiting

**Problem:** Getting rate limit errors from GitHub

**Solution:**
- Increase `throttle` settings in config
- Use a dedicated service account
- Implement caching

#### Slack Webhook Failures

**Problem:** Messages not appearing in Slack

**Solution:**
- Verify `SLACK_TOKEN` is correct
- Check bot has necessary permissions
- Ensure channel exists and bot is invited

#### Database Connection Issues

**Problem:** Cannot connect to PostgreSQL

**Solution:**
- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Ensure database exists
- Check credentials

#### Workflow Execution Timeout

**Problem:** Workflows timing out

**Solution:**
- Increase `timeout` in workflow definition
- Optimize step execution time
- Check for long-running operations

### Debug Mode

Enable debug logging:

```bash
# Set environment variable
export DEBUG=collaboration:*

# Or in config
{
  "debug": true,
  "logLevel": "debug"
}
```

### Health Checks

```bash
# Check all services
npm run health-check

# Check specific service
npm run health-check:github
npm run health-check:slack
npm run health-check:workflow

# View logs
npm run logs
```

## Next Steps

1. **Review Configuration** - Customize settings for your needs
2. **Test Integrations** - Verify all platforms are working
3. **Create Custom Workflows** - Build workflows for your processes
4. **Set up Monitoring** - Enable performance monitoring
5. **Train Your Team** - Document workflows and integrations

## Additional Resources

- [Configuration Reference](./CONFIGURATION.md)
- [API Reference](./API.md)
- [Component Documentation](./README.md)
- [GitHub Integration Service](./github-integration-service.md)
- [Code Review Automation](./code-review-automation.md)
- [Documentation Generator](./documentation-generator.md)
- [Notification Service](./notification-service.md)
- [Knowledge Management](./knowledge-management.md)
- [Workflow Automation Engine](./workflow-automation-engine.md)

## Support

For issues or questions:
- Check the [Troubleshooting](#troubleshooting) section
- Review logs in `logs/` directory
- Open an issue in the repository
- Contact the development team

---

**Happy collaborating!** 🚀
