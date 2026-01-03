# Configuration Guide

This guide explains all configuration options for the Frontend Design Performance Monitoring System.

## Environment Variables

### Database Configuration

```bash
# Database connection settings
DB_HOST=localhost              # PostgreSQL host
DB_PORT=5432                   # PostgreSQL port
DB_NAME=frontend_design_monitoring  # Database name
DB_USER=postgres               # Database user
DB_PASSWORD=your_password      # Database password

# Connection pool settings
DB_MAX_CONNECTIONS=20          # Maximum connections in pool
DB_IDLE_TIMEOUT=30000          # Idle connection timeout (ms)
DB_CONNECTION_TIMEOUT=2000     # Connection timeout (ms)
```

### Metrics Collector Configuration

```bash
# Server settings
PORT=3000                      # Metrics collector port
NODE_ENV=production            # Environment (development/production)

# CORS settings
ALLOWED_ORIGINS=http://localhost:3001,https://yourdomain.com

# Data retention
DATA_RETENTION_DAYS=90        # How long to keep metrics data

# WebSocket settings
WS_MAX_CONNECTIONS=1000        # Max WebSocket connections
WS_PING_INTERVAL=30000        # WebSocket ping interval (ms)
```

### Alerting Configuration

```bash
# Email notifications
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_SECURE=true
EMAIL_SMTP_USER=your-email@gmail.com
EMAIL_SMTP_PASSWORD=your-app-password
EMAIL_TO=team@example.com,alerts@example.com
EMAIL_FROM=monitoring@example.com

# Slack notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Alert severity levels
ALERT_COOLDOWN_SECONDS=300   # Minimum time between similar alerts (seconds)
```

### Dashboard Configuration

```bash
# Next.js configuration
NEXT_PUBLIC_COLLECTOR_URL=http://localhost:3000
NEXT_PUBLIC_REFRESH_INTERVAL=5000  # Auto-refresh interval (ms)
NEXT_PUBLIC_MAX_DATA_POINTS=100     # Max data points in charts
```

## Dashboard Configuration File

Create `dashboard/config/dashboard.config.js`:

```javascript
module.exports = {
  // General settings
  title: 'Frontend Design Monitoring',
  description: 'Performance monitoring dashboard',
  
  // Refresh settings
  autoRefresh: {
    enabled: true,
    interval: 5000, // milliseconds
  },
  
  // Chart settings
  charts: {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 300,
    },
    colors: {
      primary: '#3b82f6',
      success: '#22c55e',
      warning: '#eab308',
      danger: '#ef4444',
    },
  },
  
  // Agent cards
  agents: {
    showResponseTime: true,
    showStatus: true,
    showLastSeen: true,
    sortBy: 'type', // 'type' | 'status' | 'responseTime'
  },
  
  // Alert panel
  alerts: {
    maxVisible: 10,
    showResolved: false,
    autoDismiss: false,
  },
  
  // Time range options
  timeRanges: [
    { value: '1h', label: 'Last Hour' },
    { value: '6h', label: 'Last 6 Hours' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
  ],
  
  // Performance thresholds
  thresholds: {
    responseTime: {
      good: 1000,
      warning: 3000,
      critical: 5000,
    },
    errorRate: {
      good: 1,
      warning: 5,
      critical: 10,
    },
    taskCompletion: {
      good: 95,
      warning: 80,
      critical: 70,
    },
    coreWebVitals: {
      lcp: { good: 2500, needsImprovement: 4000 },
      fid: { good: 100, needsImprovement: 300 },
      cls: { good: 0.1, needsImprovement: 0.25 },
      fcp: { good: 1800, needsImprovement: 3000 },
      tti: { good: 3800, needsImprovement: 7300 },
    },
  },
}
```

## Alert Rules Configuration

### Creating Alert Rules

Alert rules can be created via API or database:

```bash
curl -X POST http://localhost:3000/api/v1/alerts/rules \
  -H "Content-Type: application/json" \
  -d '{
    "id": "high-response-time",
    "name": "High Response Time Alert",
    "enabled": true,
    "metricType": "agent_response_time",
    "agentType": "component-developer",
    "condition": "greater_than",
    "threshold": 5000,
    "duration": 300,
    "severity": "high",
    "notificationChannels": ["email", "slack"],
    "metadata": {
      "description": "Alert when agent response time exceeds 5 seconds"
    }
  }'
```

### Predefined Alert Rules

The system comes with several predefined alert rules:

#### Agent Performance Rules

```javascript
{
  id: 'agent-high-response-time',
  name: 'High Agent Response Time',
  metricType: 'agent_response_time',
  condition: 'greater_than',
  threshold: 5000,
  duration: 300,
  severity: 'high',
}

{
  id: 'agent-high-error-rate',
  name: 'High Error Rate',
  metricType: 'agent_error_rate',
  condition: 'greater_than',
  threshold: 10,
  duration: 300,
  severity: 'critical',
}

{
  id: 'agent-low-completion-rate',
  name: 'Low Task Completion Rate',
  metricType: 'agent_task_completion',
  condition: 'less_than',
  threshold: 70,
  duration: 600,
  severity: 'medium',
}
```

#### Core Web Vitals Rules

```javascript
{
  id: 'cwv-poor-lcp',
  name: 'Poor LCP Score',
  metricType: 'core_web_vitals',
  condition: 'greater_than',
  threshold: 4000,
  duration: 300,
  severity: 'high',
  metadata: { vital: 'lcp' },
}

{
  id: 'cwv-poor-cls',
  name: 'Poor CLS Score',
  metricType: 'core_web_vitals',
  condition: 'greater_than',
  threshold: 0.25,
  duration: 300,
  severity: 'high',
  metadata: { vital: 'cls' },
}

{
  id: 'cwv-poor-fid',
  name: 'Poor FID Score',
  metricType: 'core_web_vitals',
  condition: 'greater_than',
  threshold: 300,
  duration: 300,
  severity: 'high',
  metadata: { vital: 'fid' },
}
```

## Database Configuration

### TimescaleDB Settings

```sql
-- Configure retention policies
SELECT add_retention_policy('agent_metrics', INTERVAL '90 days');
SELECT add_retention_policy('app_metrics', INTERVAL '90 days');
SELECT add_retention_policy('core_web_vitals', INTERVAL '90 days');

-- Configure compression policy
SELECT add_compression_policy('agent_metrics', INTERVAL '7 days');
SELECT add_compression_policy('app_metrics', INTERVAL '7 days');
SELECT add_compression_policy('core_web_vitals', INTERVAL '7 days');

-- Configure continuous aggregate refresh
SELECT set_continuous_aggregate_policy(
  'agent_metrics_hourly',
  start_offset => INTERVAL '1 hour',
  end_offset => INTERVAL '0 minutes',
  schedule_interval => INTERVAL '10 minutes'
);
```

### Index Configuration

```sql
-- Create additional indexes for common queries
CREATE INDEX idx_agent_metrics_composite 
ON agent_metrics (agent_type, timestamp DESC, status);

CREATE INDEX idx_cwv_url_time_score 
ON core_web_vitals (url, timestamp DESC, performance_score);

-- Create partial indexes for active data
CREATE INDEX idx_agent_metrics_recent 
ON agent_metrics (agent_type, timestamp DESC) 
WHERE timestamp > NOW() - INTERVAL '24 hours';
```

## Collector Configuration

### Metrics Storage Settings

Create `collector/src/config/storage.config.ts`:

```typescript
export const storageConfig = {
  // Connection pool settings
  pool: {
    min: 5,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  
  // Batch settings
  batch: {
    enabled: true,
    size: 100,
    timeoutMs: 1000,
  },
  
  // Cache settings
  cache: {
    enabled: true,
    ttlMs: 60000, // 1 minute
    maxSize: 1000,
  },
}
```

### Processor Configuration

Create `collector/src/config/processor.config.ts`:

```typescript
export const processorConfig = {
  // Anomaly detection settings
  anomalyDetection: {
    enabled: true,
    standardDeviationThreshold: 2,
    minDataPoints: 10,
  },
  
  // Moving average settings
  movingAverage: {
    windowSize: 100,
  },
  
  // Performance score calculation
  performanceScore: {
    responseTimeWeight: 0.3,
    errorRateWeight: 0.4,
    completionRateWeight: 0.3,
  },
}
```

## Advanced Configuration

### Custom Metrics

To track custom metrics, extend the types:

```typescript
// types/custom-metrics.ts
export interface CustomMetrics {
  agentType: AgentType;
  timestamp: Date;
  customMetric1: number;
  customMetric2: string;
  // Add your custom fields
}
```

Then send them to the collector:

```typescript
await fetch('http://localhost:3000/api/v1/metrics/custom', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(customMetricsData),
});
```

### Data Export Configuration

Configure regular data exports:

```typescript
// collector/src/config/export.config.ts
export const exportConfig = {
  enabled: true,
  schedule: '0 0 * * *', // Daily at midnight
  
  formats: ['json', 'csv'],
  
  destinations: {
    s3: {
      enabled: false,
      bucket: 'monitoring-exports',
      prefix: 'daily/',
    },
    local: {
      enabled: true,
      path: './exports/',
    },
  },
  
  retention: {
    days: 30,
  },
}
```

### Load Balancing Configuration

For high availability, configure multiple collector instances:

```typescript
export const clusterConfig = {
  mode: 'cluster', // 'single' or 'cluster'
  
  workers: {
    count: 'auto', // or number
  
    // Graceful shutdown
    shutdown: {
      timeoutMs: 5000,
      forceTimeoutMs: 10000,
    },
  },
  
  // Load balancing
  loadBalancer: {
    strategy: 'round-robin', // 'round-robin', 'least-connections'
    healthCheck: {
      interval: 30000,
      timeout: 5000,
    },
  },
}
```

## Testing Configuration

Test your configuration:

```bash
# Test database connection
npm run test:db-connection

# Test collector health
npm run test:collector

# Test alert rules
npm run test:alerts

# Test dashboard connectivity
npm run test:dashboard
```

## Configuration Validation

Validate your configuration before starting:

```typescript
// scripts/validate-config.ts
import { config } from './config/config';

function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!process.env.DB_HOST) {
    errors.push('DB_HOST is required');
  }
  
  if (!process.env.DB_PASSWORD || process.env.DB_PASSWORD === 'your_password') {
    errors.push('DB_PASSWORD must be set and not use default value');
  }
  
  // Add more validation rules
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Run validation
const validation = validateConfig();
if (!validation.valid) {
  console.error('Configuration errors:', validation.errors);
  process.exit(1);
}
```
