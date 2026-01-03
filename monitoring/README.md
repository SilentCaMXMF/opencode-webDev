# Performance Monitoring Dashboard System

A comprehensive real-time performance monitoring system for the Frontend Design Agent System (11 agents: 1 orchestrator + 10 specialists).

## 📊 Overview

This system provides:
- **Real-time Agent Performance Tracking** for all 11 agents
- **Application Performance Monitoring (APM)** with Core Web Vitals
- **System Health Monitoring** with automated alerts
- **Interactive Dashboard** with visualizations
- **Multi-channel Notifications** (Email, Slack, Dashboard)
- **Historical Data Analysis** with trend charts
- **Easy Integration** with agents and applications

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start database
docker-compose up -d postgres

# 3. Run migrations
npm run db:migrate

# 4. Start collector
npm run collector:start

# 5. Start dashboard (new terminal)
cd dashboard && npm install && npm run dev

# 6. Access dashboard at http://localhost:3001
```

See [QUICKSTART.md](./QUICKSTART.md) for detailed instructions.

## 📁 Project Structure

```
monitoring/
├── collector/              # Metrics collection service
│   ├── src/
│   │   ├── collector.ts    # Main collector with Express + WebSocket
│   │   ├── storage.ts      # TimescaleDB storage layer
│   │   ├── processor.ts    # Metrics processing & anomaly detection
│   │   └── index.ts       # Entry point
├── alerting/              # Alerting system
│   └── src/
│       ├── alert-manager.ts # Alert detection & notifications
│       └── index.ts        # Entry point
├── dashboard/             # Next.js dashboard application
│   ├── app/
│   │   ├── page.tsx       # Main dashboard
│   │   ├── agents/[agent]/page.tsx  # Agent detail pages
│   │   ├── layout.tsx     # Root layout
│   │   └── globals.css    # Styles
│   ├── Dockerfile         # Container definition
│   ├── package.json       # Dependencies
│   ├── tailwind.config.js # Tailwind CSS config
│   └── next.config.js     # Next.js config
├── database/             # Database schema and migrations
│   ├── schema.sql         # TimescaleDB schema
│   └── scripts/
│       ├── migrate.ts     # Migration script
│       └── seed.ts        # Sample data seeding
├── integration/          # Integration layer
│   ├── agent-tracker.ts   # Agent performance tracking
│   ├── performance-hook.ts # Frontend performance monitoring
│   ├── bundle-monitor.ts  # Bundle size tracking
│   └── README.md         # Integration guide
├── types/               # TypeScript type definitions
│   └── monitoring.ts    # Complete type definitions
├── docs/                # Documentation
│   ├── SETUP.md         # Setup guide
│   ├── CONFIGURATION.md # Configuration reference
│   └── API.md           # API documentation
├── docker-compose.yml   # Complete stack deployment
├── package.json         # Root dependencies
├── tsconfig.json        # TypeScript config
└── README.md           # This file
```

## 🎯 Features

### Agent Performance Tracking
- ✅ Response time per agent
- ✅ Task completion rates
- ✅ Error rates and types
- ✅ Context7 query performance
- ✅ Tool usage statistics
- ✅ Agent coordination efficiency

### Application Performance Monitoring (APM)
- ✅ Core Web Vitals (LCP, FID, CLS, FCP, TTI)
- ✅ JavaScript performance metrics
- ✅ Bundle size monitoring
- ✅ API response times
- ✅ Rendering performance
- ✅ Memory usage tracking

### Dashboard Interface
- ✅ Real-time metrics display
- ✅ Historical trend charts (Recharts)
- ✅ Agent performance comparison
- ✅ Alert configuration panel
- ✅ Performance threshold monitoring
- ✅ Anomaly detection alerts
- ✅ Dark mode support
- ✅ Responsive design

### Alerting System
- ✅ Performance threshold alerts
- ✅ Agent anomaly detection
- ✅ System health notifications
- ✅ Multi-channel alerts (Email, Slack, Dashboard)
- ✅ Alert acknowledgment
- ✅ Custom alert rules

### Data Collection
- ✅ REST API for metrics ingestion
- ✅ WebSocket for real-time updates
- ✅ Time-series database (TimescaleDB)
- ✅ Data aggregation and retention policies
- ✅ Historical data export
- ✅ Performance regression detection

## 🔧 Technology Stack

### Backend
- **Node.js 18+** - Runtime
- **Express** - HTTP server
- **WebSocket** - Real-time communication
- **TimescaleDB (PostgreSQL)** - Time-series database
- **TypeScript** - Type safety

### Frontend
- **Next.js 14** - React framework
- **React 18** - UI library
- **Recharts** - Charting library
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **TypeScript** - Type safety

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **npm** - Package manager

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Agent Metrics
```
POST /api/v1/metrics/agent        # Submit agent metrics
GET  /api/v1/metrics              # Query metrics
GET  /api/v1/agents/status        # Get agent status
```

### Application Metrics
```
POST /api/v1/metrics/app          # Submit app metrics
POST /api/v1/metrics/core-web-vitals  # Submit Core Web Vitals
```

### System Health
```
GET /api/v1/system/health         # Get system health
```

### Alerts
```
GET    /api/v1/alerts/rules       # Get alert rules
POST   /api/v1/alerts/rules       # Create alert rule
PUT    /api/v1/alerts/rules/:id   # Update alert rule
DELETE /api/v1/alerts/rules/:id   # Delete alert rule
GET    /api/v1/alerts/active      # Get active alerts
POST   /api/v1/alerts/:id/acknowledge  # Acknowledge alert
POST   /api/v1/alerts/:id/resolve      # Resolve alert
```

See [API.md](./docs/API.md) for complete API documentation.

## 🔌 Integration

### Agent Integration

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

### Frontend Integration

```typescript
import { PerformanceCollector } from '@integration/performance-hook';

const collector = new PerformanceCollector('session-123');
await collector.initialize();

// Automatically tracks Core Web Vitals
```

See [integration/README.md](./integration/README.md) for detailed integration guide.

## 🎨 Dashboard Pages

### Main Dashboard (`/`)
- System health overview
- All 11 agent status cards
- Recent alerts panel
- Quick statistics
- Real-time updates via WebSocket

### Agent Details (`/agents/[agent]`)
- Agent-specific performance metrics
- Response time trend chart
- Error rate chart
- Task completion rate chart
- Time range selection

## 📊 Tracked Metrics

### Agent Metrics
- Response time (ms)
- Task completion rate (%)
- Error rate (%)
- Active/completed/failed tasks
- Context7 queries (count, avg time, success rate)
- Tool usage statistics
- Handoffs (received, sent, avg time)

### Application Metrics
- JavaScript execution time
- Bundle size (total, gzipped)
- Rendering performance (first paint, DOM loaded)
- Memory usage
- FPS

### Core Web Vitals
- **LCP** (Largest Contentful Paint) - Target < 2.5s
- **FID** (First Input Delay) - Target < 100ms
- **CLS** (Cumulative Layout Shift) - Target < 0.1
- **FCP** (First Contentful Paint)
- **TTI** (Time to Interactive)

### System Health
- Database health (response time, connections)
- Cache health (hit rate, memory)
- Collector health (uptime, metrics received)
- Dashboard health (active connections)

## 🚢 Deployment

### Local Development
```bash
docker-compose up -d
```

### Production (Docker)
```bash
docker-compose -f docker-compose.yml up -d
```

### Production (Kubernetes)
```bash
kubectl apply -f k8s/
```

### Production (Systemd)
```bash
sudo systemctl enable monitoring-collector
sudo systemctl start monitoring-collector
```

See [SETUP.md](./docs/SETUP.md) for complete deployment guide.

## ⚙️ Configuration

### Environment Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=frontend_design_monitoring
DB_USER=postgres
DB_PASSWORD=your_password

# Collector
PORT=3000
ALLOWED_ORIGINS=http://localhost:3001

# Email Notifications
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your-email@gmail.com
EMAIL_SMTP_PASSWORD=your-app-password
EMAIL_TO=team@example.com

# Slack Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

See [CONFIGURATION.md](./docs/CONFIGURATION.md) for all configuration options.

## 🎯 Alert Thresholds

### Default Alert Rules

| Rule | Threshold | Duration | Severity |
|------|-----------|----------|----------|
| High Response Time | > 5000ms | 300s | High |
| High Error Rate | > 10% | 300s | Critical |
| Low Completion Rate | < 70% | 600s | Medium |
| Poor LCP | > 4000ms | 300s | High |
| Poor CLS | > 0.25 | 300s | High |
| Poor FID | > 300ms | 300s | High |

## 📖 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute setup guide
- **[SETUP.md](./docs/SETUP.md)** - Complete setup and deployment
- **[CONFIGURATION.md](./docs/CONFIGURATION.md)** - Configuration reference
- **[API.md](./docs/API.md)** - Complete API documentation
- **[integration/README.md](./integration/README.md)** - Integration guide
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical overview

## 🔒 Security Considerations

- ⚠️ Change default PostgreSQL password
- ⚠️ Use environment variables for sensitive data
- ⚠️ Enable SSL/TLS for database connections in production
- ⚠️ Implement authentication for production deployments
- ⚠️ Configure firewall rules for port access
- ⚠️ Regular database backups

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run collector in dev mode
npm run collector:dev

# Run dashboard in dev mode
cd dashboard && npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests
npm test
npm run test:watch
```

## 🐛 Troubleshooting

### Dashboard shows no data?
```bash
# Check collector health
curl http://localhost:3000/health

# Check agent status
curl http://localhost:3000/api/v1/agents/status
```

### Database connection failed?
```bash
# Check PostgreSQL
docker-compose ps postgres

# View logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Port already in use?
```bash
# Find process
lsof -i :3000

# Use different port
PORT=3001 npm run collector:start
```

See [SETUP.md](./docs/SETUP.md) troubleshooting section for more details.

## 📈 Performance Optimizations

- ✅ TimescaleDB hypertables for time-series data
- ✅ Continuous aggregates for fast queries
- ✅ Data compression for old data
- ✅ Connection pooling
- ✅ WebSocket for real-time (reduced polling)
- ✅ Indexed queries
- ✅ Batch metric insertion

## 🤝 Contributing

When adding new features:
1. Update TypeScript types in `types/monitoring.ts`
2. Add API endpoint documentation in `docs/API.md`
3. Update configuration reference in `docs/CONFIGURATION.md`
4. Add integration examples in `integration/README.md`
5. Test with sample data: `npm run db:seed`

## 📄 License

MIT

## 🔗 Related Systems

- [Frontend Design Agent System](../../agent/)
- [Context7 Orchestration Layer](../context/orchestration/)
- [Testing Infrastructure](../workflows/)

## 📞 Support

For issues and questions:
- Check [docs/SETUP.md](./docs/SETUP.md) troubleshooting
- Review [docs/API.md](./docs/API.md) for API usage
- See [integration/README.md](./integration/README.md) for integration help

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: January 3, 2026
