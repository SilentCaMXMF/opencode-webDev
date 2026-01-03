# Quick Start Guide

Get the Performance Monitoring Dashboard System up and running in 5 minutes.

## Prerequisites Check

Ensure you have:
- Node.js 18+ (`node --version`)
- Docker (`docker --version`)
- 4GB+ free RAM

## Installation

### 1. Install Dependencies

```bash
cd /home/pedroocalado/githubPages/.opencode/monitoring
npm install
```

### 2. Start Database

```bash
docker-compose up -d postgres
```

Wait 10 seconds for PostgreSQL to initialize.

### 3. Run Migrations

```bash
npm run db:migrate
```

### 4. Seed Sample Data (Optional but Recommended)

```bash
npm run db:seed
```

This creates sample data for all 11 agents so you can see the dashboard populated.

### 5. Start Services

**Terminal 1 - Metrics Collector:**
```bash
npm run collector:start
```

**Terminal 2 - Dashboard:**
```bash
cd dashboard
npm install
npm run dev
```

## Access Your Dashboard

Open your browser to: **http://localhost:3001**

You should see:
- System health overview (healthy)
- All 11 agent status cards with metrics
- WebSocket connection indicator (green)
- Recent alerts panel

## What You're Monitoring

### Agent Status (11 Agents)
- **Orchestrator** - Coordinates all activities
- **Design System** - Design tokens and components
- **Component Developer** - Component implementation
- **Performance Optimizer** - Performance improvements
- **Accessibility** - WCAG compliance
- **Cross Platform** - Browser/device compatibility
- **Testing & QA** - Test coverage and quality
- **Security** - Security audits
- **Animation** - Motion and animations
- **i18n** - Internationalization
- **UX Research** - User experience research

### Key Metrics
- Response time (ms)
- Error rate (%)
- Task completion rate (%)
- Core Web Vitals (LCP, FID, CLS)
- System health status

## Integration Examples

### Add to an Agent

```typescript
import { AgentTracker } from '@integration/agent-tracker';
import { AgentType } from '@types/monitoring';

const tracker = new AgentTracker(
  AgentType.COMPONENT_DEVELOPER,
  'component-developer-1'
);

// Report metrics
await tracker.reportMetrics({
  responseTime: 1200,
  taskCompletionRate: 95,
  errorRate: 2,
  activeTasks: 3,
  completedTasks: 47,
  failedTasks: 1
});
```

### Add to Frontend

```typescript
import { PerformanceCollector } from '@integration/performance-hook';

const collector = new PerformanceCollector('session-123');
await collector.initialize();

// Automatically tracks Core Web Vitals
```

## Common Commands

```bash
# Start collector
npm run collector:start

# Stop collector
# Press Ctrl+C

# Start dashboard
cd dashboard && npm run dev

# Reset database
npm run db:reset

# Seed data
npm run db:seed

# View logs
docker-compose logs -f postgres
```

## Troubleshooting

### Dashboard shows no data?

```bash
# Check collector is running
curl http://localhost:3000/health

# Should return: {"status":"healthy","timestamp":"..."}

# Check agent status endpoint
curl http://localhost:3000/api/v1/agents/status
```

### Database connection failed?

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Port already in use?

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run collector:start
```

## Next Steps

1. **Configure Alerts**: Set up email/Slack notifications
2. **Integrate Agents**: Add tracking to your agents
3. **Customize Dashboard**: Modify colors, thresholds, layouts
4. **Deploy to Production**: Follow SETUP.md for production deployment

## Support

- Full documentation: `/docs/SETUP.md`
- API reference: `/docs/API.md`
- Configuration: `/docs/CONFIGURATION.md`
- Integration guide: `/integration/README.md`

## Quick Reference

| Component | URL | Description |
|-----------|-----|-------------|
| Dashboard | http://localhost:3001 | Main monitoring interface |
| API | http://localhost:3000/api/v1 | REST API endpoints |
| Health | http://localhost:3000/health | Health check |
| Database | localhost:5432 | TimescaleDB |

## Need Help?

Check the detailed guides:
- **Setup Issues**: See SETUP.md troubleshooting section
- **Configuration**: See CONFIGURATION.md
- **API Usage**: See API.md
- **Integration**: See integration/README.md
