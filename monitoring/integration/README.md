# Integration Guide

This guide explains how to integrate the performance monitoring system with your agents and applications.

## Agent Integration

### Basic Integration

```typescript
import { AgentTracker } from '@integration/agent-tracker';
import { AgentType } from '@types/monitoring';

// Create tracker for your agent
const tracker = new AgentTracker(
  AgentType.COMPONENT_DEVELOPER,
  'component-developer-1',
  'http://localhost:3000' // Metrics collector URL
);

// Track task execution
tracker.startTask('create-component');

try {
  // Do your work
  await createComponent();
  tracker.endTask('create-component', 'completed');
} catch (error) {
  tracker.endTask('create-component', 'failed', error.message);
}

// Track Context7 queries
tracker.trackContext7Query('React', 'useState hook', 250, true);

// Report periodic metrics
await tracker.reportMetrics({
  responseTime: 1200,
  taskCompletionRate: 95,
  errorRate: 2,
  activeTasks: 3,
  completedTasks: 47,
  failedTasks: 1
});
```

### Using Decorators

```typescript
import { TrackAgentTask, TrackContext7Query } from '@integration/agent-tracker';

class ComponentDeveloperAgent {
  tracker: AgentTracker;

  constructor(tracker: AgentTracker) {
    this.tracker = tracker;
  }

  @TrackAgentTask('create-component')
  async createComponent(spec: ComponentSpec): Promise<Component> {
    // Your implementation
  }

  @TrackContext7Query('React')
  async getReactDocumentation(topic: string) {
    // Context7 query implementation
  }
}
```

### Using Higher-Order Component

```typescript
import { withTracking } from '@integration/agent-tracker';

class ComponentDeveloperAgent {
  // Your agent implementation
}

// Wrap with tracking
const TrackedComponentDeveloper = withTracking(
  ComponentDeveloperAgent,
  AgentType.COMPONENT_DEVELOPER,
  'component-developer-1'
);
```

## Frontend Integration

### React Integration

```typescript
import { usePerformanceMonitoring } from '@integration/performance-hook';

function Dashboard() {
  const { initialize, getMetrics, getPerformanceScore } = usePerformanceMonitoring();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Performance Score: {getPerformanceScore()}</p>
    </div>
  );
}
```

### Next.js Integration

Add to `pages/_app.tsx` or `app/layout.tsx`:

```typescript
import { PerformanceCollector } from '@integration/performance-hook';

export function RootLayout({ children }: { children: React.ReactNode }) {
  const collector = new PerformanceCollector('session-id');

  useEffect(() => {
    collector.initialize();
  }, []);

  return <html>{children}</html>;
}
```

### Core Web Vitals Collection

```typescript
import { PerformanceCollector } from '@integration/performance-hook';

const collector = new PerformanceCollector('my-session-id');
await collector.initialize();

// Get metrics
const metrics = collector.getMetrics();
const score = collector.getPerformanceScore();

console.log('Performance Score:', score);
```

## Bundle Size Monitoring

### Webpack Integration

```javascript
const { BundleSizeMonitor } = require('@integration/bundle-monitor');

const monitor = new BundleSizeMonitor();

class BundleSizePlugin {
  apply(compiler) {
    compiler.hooks.done.tap('BundleSizePlugin', (stats) => {
      const assets = stats.toJson().assets;

      assets.forEach(asset => {
        if (asset.name.endsWith('.js')) {
          monitor.recordBundle(
            asset.name,
            asset.size,
            Math.round(asset.size * 0.3) // Estimate gzipped size
          );
        }
      });
    });
  }
}

module.exports = {
  plugins: [new BundleSizePlugin()]
};
```

### Next.js Bundle Analysis

```typescript
import { BundleSizeMonitor } from '@integration/bundle-monitor';

// In your next.config.js
const monitor = new BundleSizeMonitor();

const config = {
  webpack: (config, { isServer }) => {
    // Bundle analysis
    if (!isServer) {
      config.plugins.push(
        new BundleSizePlugin(monitor)
      );
    }
    return config;
  }
};
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Performance Monitoring

on:
  push:
    branches: [main]

jobs:
  performance-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Run performance tests
        run: npm run test:performance

      - name: Upload bundle analysis
        uses: actions/upload-artifact@v3
        with:
          name: bundle-analysis
          path: .bundle-analysis/
```

### Performance Regression Detection

```typescript
import { BundleSizeMonitor } from '@integration/bundle-monitor';

const monitor = new BundleSizeMonitor();

// After build
const metrics = monitor.getAllMetrics();
for (const [name, history] of metrics.entries()) {
  const latest = history[history.length - 1];
  const regression = monitor.checkForRegression(name, latest.size);

  if (regression) {
    console.error(`Bundle regression detected in ${name}`);
    process.exit(1);
  }
}
```

## Environment Configuration

Set the following environment variables:

```bash
# Metrics Collector
METRICS_COLLECTOR_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=frontend_design_monitoring
DB_USER=postgres
DB_PASSWORD=postgres

# Email Notifications
EMAIL_SMTP_HOST=smtp.example.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_SECURE=true
EMAIL_SMTP_USER=noreply@example.com
EMAIL_SMTP_PASSWORD=your-password
EMAIL_TO=team@example.com
EMAIL_FROM=monitoring@example.com

# Slack Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

## Docker Deployment

```dockerfile
# Dockerfile for Metrics Collector
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 3000

CMD ["npm", "run", "collector:start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: timescale/timescaledb:latest-pg14
    environment:
      POSTGRES_DB: frontend_design_monitoring
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data

  collector:
    build: .
    depends_on:
      - postgres
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: frontend_design_monitoring
      DB_USER: postgres
      DB_PASSWORD: postgres
    ports:
      - "3000:3000"

  dashboard:
    build: ./dashboard
    ports:
      - "3001:3000"

volumes:
  postgres-data:
```

## Testing Integration

```typescript
import { AgentTracker } from '@integration/agent-tracker';

describe('Agent Tracking', () => {
  let tracker: AgentTracker;

  beforeEach(() => {
    tracker = new AgentTracker(
      AgentType.COMPONENT_DEVELOPER,
      'test-agent',
      'http://localhost:3000'
    );
  });

  it('should track task execution', async () => {
    tracker.startTask('test-task');
    await new Promise(resolve => setTimeout(resolve, 100));
    const duration = tracker.endTask('test-task', 'completed');

    expect(duration).toBeGreaterThan(50);
  });

  it('should track Context7 queries', () => {
    tracker.trackContext7Query('React', 'useState', 250, true);
    // Verify metric was sent
  });
});
```
