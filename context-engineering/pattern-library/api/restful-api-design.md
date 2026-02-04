# RESTful API Design Pattern

**Category**: API Pattern  
**Complexity**: Medium  
**Reusability**: High  
**Agents**: ORCHESTRATOR, SECURITY, PERFORMANCE_OPTIMIZER  

## Description

A standardized pattern for designing RESTful APIs that support our Frontend Design Agent System with proper error handling, security, performance optimization, and agent communication.

## API Design Principles

### 1. Resource-Oriented Design
- Use nouns for resources, not verbs
- Use HTTP methods correctly (GET, POST, PUT, DELETE, PATCH)
- Plural nouns for collections
- Nested resources for relationships

### 2. Consistent Response Format
- Standardized success and error responses
- Consistent pagination
- Meta information for additional context
- Versioning support

### 3. Security First
- Authentication and authorization
- Rate limiting
- Input validation
- CORS configuration
- Security headers

### 4. Performance Optimized
- Pagination for large datasets
- Caching strategies
- Compression
- Selective field loading

## API Structure

### Base URL Structure
```
https://api.frontend-agents.com/v1/
```

### Resource Patterns

#### Collections
```
GET    /api/v1/agents           # List all agents
POST   /api/v1/agents           # Create new agent
GET    /api/v1/agents/{id}      # Get specific agent
PUT    /api/v1/agents/{id}      # Update agent
DELETE /api/v1/agents/{id}      # Delete agent
```

#### Nested Resources
```
GET    /api/v1/agents/{id}/metrics      # Get agent metrics
POST   /api/v1/agents/{id}/tasks        # Create task for agent
GET    /api/v1/agents/{id}/tasks        # List agent tasks
```

## Response Formats

### Success Response
```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    pagination?: PaginationMeta;
    version: string;
    timestamp: string;
    requestId: string;
  };
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Example response
{
  "success": true,
  "data": [
    {
      "id": "agent-123",
      "type": "DESIGN_SYSTEM",
      "status": "active",
      "metrics": {
        "responseTime": 150,
        "taskCompletion": 95
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    },
    "version": "1.0.0",
    "timestamp": "2026-02-04T10:30:00Z",
    "requestId": "req-abc123"
  }
}
```

### Error Response
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    field?: string;
  };
  meta: {
    version: string;
    timestamp: string;
    requestId: string;
  };
}

// Example error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid agent type provided",
    "details": {
      "allowedTypes": ["DESIGN_SYSTEM", "COMPONENT_DEVELOPER", "ORCHESTRATOR"],
      "providedType": "INVALID_AGENT"
    },
    "field": "type"
  },
  "meta": {
    "version": "1.0.0",
    "timestamp": "2026-02-04T10:30:00Z",
    "requestId": "req-def456"
  }
}
```

## Error Codes

### HTTP Status Codes
- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `204 No Content` - Successful request, no content returned
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict
- `422 Unprocessable Entity` - Validation failed
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Application Error Codes
```typescript
enum ErrorCodes {
  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Resource Errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // System Errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT'
}
```

## Agent Communication API

### Agent Registration
```typescript
POST /api/v1/agents/register
Content-Type: application/json
Authorization: Bearer <token>

{
  "type": "COMPONENT_DEVELOPER",
  "version": "1.0.0",
  "capabilities": ["react", "typescript", "testing"],
  "configuration": {
    "maxConcurrentTasks": 5,
    "timeout": 30000
  }
}

// Response
{
  "success": true,
  "data": {
    "agentId": "agent-abc123",
    "status": "registered",
    "apiKey": "key-def456",
    "expiresAt": "2026-03-04T10:30:00Z"
  }
}
```

### Task Assignment
```typescript
POST /api/v1/agents/{agentId}/tasks
Content-Type: application/json
Authorization: Bearer <token>

{
  "type": "component_development",
  "priority": "high",
  "payload": {
    "specification": {
      "name": "Button",
      "variants": ["primary", "secondary"],
      "requirements": ["accessibility", "performance"]
    },
    "deadline": "2026-02-05T18:00:00Z"
  },
  "context": {
    "project": "frontend-design-system",
    "relatedAgents": ["DESIGN_SYSTEM", "TESTING_QA"]
  }
}
```

### Agent Handoff
```typescript
POST /api/v1/agents/handoff
Content-Type: application/json
Authorization: Bearer <token>

{
  "fromAgent": "DESIGN_SYSTEM",
  "toAgent": "COMPONENT_DEVELOPER",
  "taskId": "task-789",
  "context": {
    "componentSpec": {...},
    "designTokens": [...],
    "requirements": [...]
  },
  "handoffData": {
    "completedWork": "Design specifications created",
    "deliverables": ["figma-design", "design-tokens"],
    "nextSteps": ["Implement component", "Add accessibility"]
  }
}
```

## Performance Optimization

### Pagination
```typescript
// Query parameters
GET /api/v1/agents?page=2&limit=20&sort=name&order=asc

// Response includes pagination meta
{
  "success": true,
  "data": [...],
  "meta": {
    "pagination": {
      "page": 2,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": true
    }
  }
}
```

### Field Selection
```typescript
// Select specific fields
GET /api/v1/agents?fields=id,type,status,metrics.responseTime

// Exclude fields
GET /api/v1/agents?exclude=configuration,apiKey
```

### Filtering
```typescript
// Filter by status
GET /api/v1/agents?status=active

// Multiple filters
GET /api/v1/agents?status=active&type=DESIGN_SYSTEM&metrics.responseTime<500

// Date range filtering
GET /api/v1/tasks?createdAt>=2026-02-01&createdAt<=2026-02-04
```

### Search
```typescript
// Full-text search
GET /api/v1/agents?q=react&searchFields=capabilities,name,description

// Fuzzy search
GET /api/v1/agents?q=react&fuzzy=true&threshold=0.8
```

## Security Implementation

### Authentication
```typescript
// JWT-based authentication
interface AuthToken {
  sub: string; // agent ID
  iat: number; // issued at
  exp: number; // expires at
  scope: string[]; // permissions
  agentType: string;
}

// Headers
Authorization: Bearer <jwt_token>
X-Agent-ID: agent-123
X-Agent-Version: 1.0.0
```

### Rate Limiting
```typescript
// Rate limiting by agent
const rateLimits = {
  'DESIGN_SYSTEM': { requests: 1000, window: '1h' },
  'COMPONENT_DEVELOPER': { requests: 2000, window: '1h' },
  'PERFORMANCE_OPTIMIZER': { requests: 1500, window: '1h' }
};

// Response headers for rate limiting
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1643970000
```

### Input Validation
```typescript
// Request validation schema
import { z } from 'zod';

const CreateAgentSchema = z.object({
  type: z.enum(['DESIGN_SYSTEM', 'COMPONENT_DEVELOPER', 'ORCHESTRATOR']),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  capabilities: z.array(z.string()).min(1),
  configuration: z.object({
    maxConcurrentTasks: z.number().min(1).max(10),
    timeout: z.number().min(1000).max(300000)
  }).optional()
});
```

## Implementation Example

### Express.js Implementation
```typescript
import express from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP'
    }
  }
});

app.use('/api/v1/', limiter);

// Agent registration endpoint
app.post('/api/v1/agents/register', async (req, res) => {
  try {
    const validatedData = CreateAgentSchema.parse(req.body);
    
    // Create agent
    const agent = await AgentService.create(validatedData);
    
    // Generate API key
    const apiKey = await AuthService.generateApiKey(agent.id);
    
    res.status(201).json({
      success: true,
      data: {
        agentId: agent.id,
        status: 'registered',
        apiKey: apiKey.key,
        expiresAt: apiKey.expiresAt
      },
      meta: {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        requestId: req.id
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.errors
        }
      });
    }
    
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    });
  }
});
```

## Testing Strategy

### API Testing
```typescript
// Test examples
describe('Agent API', () => {
  test('should register new agent', async () => {
    const response = await request(app)
      .post('/api/v1/agents/register')
      .send({
        type: 'COMPONENT_DEVELOPER',
        version: '1.0.0',
        capabilities: ['react', 'typescript']
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.agentId).toBeDefined();
    expect(response.body.data.apiKey).toBeDefined();
  });

  test('should validate agent type', async () => {
    const response = await request(app)
      .post('/api/v1/agents/register')
      .send({
        type: 'INVALID_TYPE',
        version: '1.0.0',
        capabilities: []
      })
      .expect(422);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
```

## Monitoring & Analytics

### API Metrics
- Request/response times
- Error rates by endpoint
- Agent activity patterns
- Resource usage
- Authentication failures

### Logging Format
```typescript
interface APILog {
  timestamp: string;
  requestId: string;
  method: string;
  endpoint: string;
  agentId?: string;
  agentType?: string;
  statusCode: number;
  responseTime: number;
  userAgent?: string;
  ip?: string;
  error?: string;
}
```

This API pattern provides a robust foundation for agent communication, ensuring security, performance, and maintainability while supporting the complex interactions required by our 11-agent Frontend Design Agent System.