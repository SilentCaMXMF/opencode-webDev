# API Reference

This document provides detailed information about the Metrics Collector API endpoints.

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

Currently, the API does not require authentication. For production use, implement authentication using:

- API Keys
- JWT tokens
- OAuth 2.0

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "timestamp": "2024-01-03T12:00:00.000Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": {}
  }
}
```

## Endpoints

### Health Check

Check if the collector is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-03T12:00:00.000Z",
  "version": "1.0.0"
}
```

---

### Agent Metrics

#### Submit Agent Metrics

**Endpoint:** `POST /metrics/agent`

**Request Body:**
```json
{
  "agentType": "component-developer",
  "agentId": "component-developer-1",
  "timestamp": "2024-01-03T12:00:00.000Z",
  "status": "active",
  "metrics": {
    "responseTime": 1200,
    "taskCompletionRate": 95.5,
    "errorRate": 2.3,
    "activeTasks": 3,
    "completedTasks": 47,
    "failedTasks": 1,
    "context7Queries": {
      "count": 5,
      "avgResponseTime": 350,
      "successRate": 98.0
    },
    "toolUsage": {
      "read": 12,
      "write": 5,
      "context7_query-docs": 8
    },
    "coordinationMetrics": {
      "handoffsReceived": 2,
      "handoffsSent": 3,
      "avgHandoffTime": 150
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Agent metrics received"
}
```

#### Get Agent Metrics

**Endpoint:** `GET /metrics`

**Query Parameters:**
- `metricType` (optional): Type of metric to retrieve
  - `agent_response_time`
  - `agent_task_completion`
  - `agent_error_rate`
  - `core_web_vitals`
  - `bundle_size`
- `agentType` (optional): Filter by agent type
- `startTime` (optional): Start timestamp (ISO 8601)
- `endTime` (optional): End timestamp (ISO 8601)
- `aggregation` (optional): Aggregation period (1m, 5m, 15m, 1h, 6h, 24h)

**Example:**
```
GET /metrics?metricType=agent_response_time&agentType=component-developer&startTime=2024-01-01T00:00:00Z&endTime=2024-01-02T00:00:00Z
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "agent_type": "component-developer",
      "agent_id": "component-developer-1",
      "timestamp": "2024-01-03T12:00:00.000Z",
      "response_time": 1200,
      "task_completion_rate": 95.5,
      "error_rate": 2.3
    }
  ]
}
```

#### Get Agent Status

**Endpoint:** `GET /agents/status`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "agentType": "orchestrator",
      "status": "active",
      "lastSeen": "2024-01-03T12:00:00.000Z",
      "avgResponseTime": 850
    },
    {
      "agentType": "component-developer",
      "status": "active",
      "lastSeen": "2024-01-03T11:59:30.000Z",
      "avgResponseTime": 1200
    }
  ]
}
```

---

### Application Metrics

#### Submit Application Metrics

**Endpoint:** `POST /metrics/app`

**Request Body:**
```json
{
  "timestamp": "2024-01-03T12:00:00.000Z",
  "sessionId": "session-123",
  "url": "https://example.com/dashboard",
  "metrics": {
    "javascript": {
      "executionTime": 250,
      "parsingTime": 50,
      "compilationTime": 30,
      "mainThreadBlocking": 20
    },
    "bundle": {
      "totalSize": 1048576,
      "gzippedSize": 314572,
      "chunkCount": 5,
      "largestChunk": 524288
    },
    "rendering": {
      "firstPaint": 800,
      "domContentLoaded": 1200,
      "loadComplete": 1500,
      "fps": 60
    },
    "memory": {
      "used": 52428800,
      "limit": 536870912,
      "jsHeapSize": 41943040
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "App metrics received"
}
```

---

### Core Web Vitals

#### Submit Core Web Vitals

**Endpoint:** `POST /metrics/core-web-vitals`

**Request Body:**
```json
{
  "timestamp": "2024-01-03T12:00:00.000Z",
  "url": "https://example.com/dashboard",
  "sessionId": "session-123",
  "metrics": {
    "lcp": 2500,
    "fid": 80,
    "cls": 0.05,
    "fcp": 1200,
    "tti": 3000
  },
  "performanceScore": 95
}
```

**Response:**
```json
{
  "success": true,
  "message": "Core Web Vitals received"
}
```

---

### System Health

#### Get System Health

**Endpoint:** `GET /system/health`

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-03T12:00:00.000Z",
    "status": "healthy",
    "components": {
      "database": {
        "status": "healthy",
        "responseTime": 45,
        "connections": 5
      },
      "cache": {
        "status": "healthy",
        "hitRate": 85.5,
        "memoryUsage": 0.6
      },
      "collector": {
        "status": "healthy",
        "uptime": 86400,
        "metricsReceived": 125000
      },
      "dashboard": {
        "status": "healthy",
        "uptime": 86400,
        "activeConnections": 15
      }
    },
    "agents": [
      {
        "type": "orchestrator",
        "status": "active",
        "lastSeen": "2024-01-03T12:00:00.000Z",
        "responseTime": 850
      }
    ]
  }
}
```

---

### Alerts

#### Get Alert Rules

**Endpoint:** `GET /alerts/rules`

**Query Parameters:**
- `enabled` (optional): Filter by enabled status (true/false)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "rule-1",
      "name": "High Response Time",
      "enabled": true,
      "metricType": "agent_response_time",
      "agentType": null,
      "condition": "greater_than",
      "threshold": 5000,
      "duration": 300,
      "severity": "high",
      "notificationChannels": ["email", "slack"],
      "metadata": {},
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Create Alert Rule

**Endpoint:** `POST /alerts/rules`

**Request Body:**
```json
{
  "id": "custom-rule-1",
  "name": "Custom Alert Rule",
  "enabled": true,
  "metricType": "agent_response_time",
  "agentType": "component-developer",
  "condition": "greater_than",
  "threshold": 3000,
  "duration": 300,
  "severity": "medium",
  "notificationChannels": ["email"],
  "metadata": {
    "description": "Custom description"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Alert rule created",
  "data": {
    "id": "custom-rule-1"
  }
}
```

#### Update Alert Rule

**Endpoint:** `PUT /alerts/rules/:ruleId`

**Request Body:** Same as create rule

**Response:**
```json
{
  "success": true,
  "message": "Alert rule updated"
}
```

#### Delete Alert Rule

**Endpoint:** `DELETE /alerts/rules/:ruleId`

**Response:**
```json
{
  "success": true,
  "message": "Alert rule deleted"
}
```

#### Get Active Alerts

**Endpoint:** `GET /alerts/active`

**Query Parameters:**
- `severity` (optional): Filter by severity level
- `acknowledged` (optional): Filter by acknowledgment status
- `limit` (optional): Maximum number of alerts to return

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "alert-123",
      "type": "agent_anomaly",
      "severity": "high",
      "title": "High Response Time",
      "message": "Agent: component-developer | Current: 5500 | Threshold: 5000",
      "timestamp": "2024-01-03T12:00:00.000Z",
      "agentType": "component-developer",
      "metricType": "agent_response_time",
      "currentValue": 5500,
      "threshold": 5000,
      "acknowledged": false,
      "resolved": false
    }
  ]
}
```

#### Acknowledge Alert

**Endpoint:** `POST /alerts/:alertId/acknowledge`

**Request Body:**
```json
{
  "acknowledgedBy": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Alert acknowledged"
}
```

#### Resolve Alert

**Endpoint:** `POST /alerts/:alertId/resolve`

**Response:**
```json
{
  "success": true,
  "message": "Alert resolved"
}
```

---

### Data Export

#### Export Metrics

**Endpoint:** `GET /export`

**Query Parameters:**
- `metricType`: Type of metric to export
- `startTime`: Start timestamp
- `endTime`: End timestamp
- `format`: Export format (json, csv)
- `agentType` (optional): Filter by agent type

**Example:**
```
GET /export?metricType=agent_response_time&startTime=2024-01-01T00:00:00Z&endTime=2024-01-02T00:00:00Z&format=csv
```

**Response:**
Content-Type depends on format parameter.

For JSON:
```json
{
  "success": true,
  "data": [...]
}
```

For CSV:
```
timestamp,agent_type,response_time,error_rate
2024-01-01T00:00:00Z,component-developer,1200,2.3
2024-01-01T00:01:00Z,component-developer,1150,1.8
```

---

### WebSocket API

Connect to real-time metrics updates:

```javascript
const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
  console.log('Connected to monitoring WebSocket');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  switch (message.type) {
    case 'agent_metrics':
      console.log('New agent metrics:', message.data);
      break;
    case 'app_metrics':
      console.log('New app metrics:', message.data);
      break;
    case 'core_web_vitals':
      console.log('New Core Web Vitals:', message.data);
      break;
    case 'alert':
      console.log('New alert:', message.data);
      break;
    case 'initial_data':
      console.log('Initial data loaded:', message.data);
      break;
  }
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket connection closed');
};
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `NOT_FOUND` | Resource not found |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Internal server error |
| `DATABASE_ERROR` | Database operation failed |

---

## Rate Limiting

- Default: 100 requests per minute per IP
- Can be configured via environment variable

---

## CORS

Configure allowed origins via environment variable:

```bash
ALLOWED_ORIGINS=http://localhost:3001,https://yourdomain.com
```

---

## SDK

### JavaScript/TypeScript

```typescript
import { MonitoringClient } from '@opencode/monitoring-sdk';

const client = new MonitoringClient('http://localhost:3000');

// Submit metrics
await client.submitAgentMetrics({
  agentType: 'component-developer',
  agentId: 'component-developer-1',
  // ... other fields
});

// Query metrics
const metrics = await client.queryMetrics({
  metricType: 'agent_response_time',
  agentType: 'component-developer'
});
```

---

## Examples

### Complete Agent Integration Example

```typescript
import { AgentTracker } from '@integration/agent-tracker';
import { AgentType } from '@types/monitoring';

// Initialize tracker
const tracker = new AgentTracker(
  AgentType.COMPONENT_DEVELOPER,
  'component-developer-1',
  'http://localhost:3000'
);

// Start tracking a task
tracker.startTask('create-component');

try {
  // Do work
  await createComponent();
  const duration = tracker.endTask('create-component', 'completed');
  
  // Report periodic metrics
  await tracker.reportMetrics({
    responseTime: duration,
    taskCompletionRate: 95,
    errorRate: 2,
    activeTasks: 1,
    completedTasks: 10,
    failedTasks: 0
  });
} catch (error) {
  tracker.endTask('create-component', 'failed', error.message);
}
```

### Core Web Vitals Collection Example

```typescript
import { PerformanceCollector } from '@integration/performance-hook';

const collector = new PerformanceCollector('session-123');

// Initialize (must be called in browser)
await collector.initialize();

// Get current metrics
const metrics = collector.getMetrics();
const score = collector.getPerformanceScore();

console.log('Performance Score:', score);
```
