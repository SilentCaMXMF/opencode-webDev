# AGENTS.md - Frontend Design Agent System

This document contains guidelines and commands for agentic coding agents working in this repository.

## Repository Overview

This is a comprehensive Frontend Design Agent System consisting of:
- **Orchestrator Agent** - Main coordination system
- **10 Specialist Agents** - Design, Component Development, Performance, Accessibility, Cross-Platform, Testing/QA, Security, Animation, I18n, UX Research
- **Performance Monitoring System** - Real-time metrics and dashboards
- **Testing Infrastructure** - Comprehensive test suite with agent interaction validation
- **Context7 Orchestration Layer** - Shared context management

## Build Commands

### Root Level Commands
```bash
# Install all dependencies across packages
npm install

# Start all services (collector + dashboard)
npm run start

# Start development mode
npm run dev
```

### Monitoring System
```bash
# Start metrics collector
npm run collector:start

# Start collector in dev mode
npm run collector:dev

# Start dashboard (Next.js)
cd dashboard && npm run dev

# Build dashboard
npm run dashboard:build

# Database operations
npm run db:migrate    # Run migrations
npm run db:seed       # Seed sample data
npm run db:reset      # Reset database
```

### Testing Infrastructure
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:agent-communication
npm run test:context-sharing
npm run test:conflict-resolution
npm run test:decision-framework
npm run test:tool-delegation
npm run test:integration
npm run test:performance
npm run test:load-stress

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# UI testing
npm run test:ui
```

### Dashboard (Next.js)
```bash
cd dashboard

# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Lint
npm run lint
```

## Running Single Tests

### Vitest (Unit/Integration Tests)
```bash
# Run single test file
npx vitest run src/agent-communication.test.ts

# Run with watch mode
npx vitest src/agent-communication.test.ts

# Run specific test within file
npx vitest run -t "should handle handoff protocol"
```

### Component Testing
```bash
# From workflows directory
cd workflows/vitest

# Run specific component tests
npx vitest run components/Button.test.tsx
```

## Code Style Guidelines

### TypeScript Configuration
- **Target**: ES2022 (monitoring) / ES2020 (testing)
- **Module**: CommonJS (monitoring) / ESNext (testing)
- **Strict Mode**: Enabled
- **Declaration Maps**: Enabled
- **Source Maps**: Enabled

### Import Style
```typescript
// External libraries first
import express from 'express';
import { WebSocket } from 'ws';
import React from 'react';

// Internal modules with path aliases
import { AgentTracker } from '@integration/agent-tracker';
import { AgentType } from '@types/monitoring';
import { CollectorService } from '@collector/src/collector';
```

### Path Aliases (Monitoring)
```typescript
@types/*           -> types/*
@collector/*       -> collector/src/*
@alerting/*        -> alerting/src/*
@integration/*     -> integration/*
@database/*        -> database/*
```

### Path Aliases (Testing)
```typescript
@/*                -> src/*
@fixtures/*        -> fixtures/*
@reports/*         -> reports/*
```

## Naming Conventions

### Files and Folders
- **Kebab-case**: `agent-tracker.ts`, `performance-hook.ts`
- **Test files**: `*.test.ts`, `*.spec.ts`
- **Config files**: `*.config.ts`, `*.config.js`
- **Types**: `types.ts`, `monitoring.ts`

### Variables and Functions
```typescript
// camelCase for variables and functions
const agentTracker = new AgentTracker();
const responseTime = getResponseTime();

// Descriptive names
const context7QueryPerformance = measureContext7Query();
const isAgentHandoffSuccessful = await checkHandoffStatus();
```

### Classes and Interfaces
```typescript
// PascalCase for classes and interfaces
class AgentTracker {}
interface AgentMetrics {}
enum AgentType {}
```

### Constants
```typescript
// UPPER_SNAKE_CASE for constants
const DEFAULT_TIMEOUT = 5000;
const MAX_RETRY_ATTEMPTS = 3;
const AGENT_RESPONSE_THRESHOLD = 1000;
```

## Code Formatting

### General Rules
- **Indentation**: 2 spaces
- **Max Line Length**: 80 characters
- **Trailing Commas**: Enabled for multiline
- **Semicolons**: Required

### Function Declarations
```typescript
// Use arrow functions for callbacks and anonymous functions
const processMetric = (metric: MetricData): void => {
  // Implementation
};

// Use function declarations for named functions
function validateAgentMetrics(metrics: AgentMetrics): boolean {
  return metrics.responseTime < AGENT_RESPONSE_THRESHOLD;
}
```

### Object and Array Patterns
```typescript
// Destructuring for cleaner code
const { responseTime, errorRate, taskCompletion } = agentMetrics;

// Array methods over loops
const activeAgents = agents.filter(agent => agent.status === AgentStatus.ACTIVE);
const agentNames = agents.map(agent => agent.name);
```

## Type Safety

### Strict TypeScript Rules
- No implicit `any` types
- Always provide return types for public functions
- Use union types for state management
- Prefer `interface` over `type` for object shapes

### Type Definitions
```typescript
// Prefer interfaces for object shapes
interface AgentMetrics {
  responseTime: number;
  errorRate: number;
  taskCompletion: number;
  lastUpdated: Date;
}

// Use types for unions, computed types, and primitives
type AgentStatus = 'active' | 'idle' | 'error' | 'offline';
type MetricValue = string | number | boolean;
```

### Generics
```typescript
// Generic interfaces for reusable components
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
}

class MetricsRepository<T extends MetricData> implements Repository<T> {
  // Implementation
}
```

## Error Handling

### Error Patterns
```typescript
// Custom error classes
class AgentError extends Error {
  constructor(
    message: string,
    public readonly agentType: AgentType,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

// Proper error handling with try-catch
async function executeAgentTask<T>(
  agentType: AgentType,
  task: AgentTask<T>
): Promise<AgentResult<T>> {
  try {
    const result = await agent.execute(task);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof AgentError) {
      logger.error('Agent execution failed', { agentType, error: error.message });
      return { success: false, error: error.message };
    }
    throw new AgentError(
      `Unexpected error in ${agentType}`,
      agentType,
      error instanceof Error ? error : new Error(String(error))
    );
  }
}
```

### Async Error Handling
```typescript
// Always handle promises properly
async function collectMetrics(agentId: string): Promise<AgentMetrics | null> {
  try {
    const response = await fetch(`/api/v1/metrics/agent/${agentId}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    logger.error('Failed to collect metrics', { agentId, error });
    return null;
  }
}
```

## Testing Patterns

### Test Structure
```typescript
// Describe-It pattern with clear test names
describe('Agent Communication', () => {
  beforeEach(() => {
    // Setup common test state
  });

  afterEach(() => {
    // Cleanup after each test
  });

  it('should handle handoff protocol correctly', async () => {
    // Arrange
    const fromAgent = AgentType.DESIGN_SYSTEM;
    const toAgent = AgentType.COMPONENT_DEVELOPER;
    
    // Act
    const result = await performHandoff(fromAgent, toAgent, mockContext);
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.handoffTime).toBeLessThan(HANDOFF_THRESHOLD);
  });
});
```

### Mock Patterns
```typescript
// Use consistent mock objects
const mockAgentMetrics: AgentMetrics = {
  responseTime: 150,
  errorRate: 2,
  taskCompletion: 95,
  lastUpdated: new Date()
};

// Mock external dependencies
jest.mock('@integration/agent-tracker');
jest.mocked(AgentTracker).mockImplementation(() => ({
  reportMetrics: jest.fn().mockResolvedValue(true),
  getMetrics: jest.fn().mockResolvedValue(mockAgentMetrics)
}));
```

## Performance Considerations

### Database Operations
- Use connection pooling
- Implement proper indexing
- Batch operations when possible
- Use transactions for related operations

### API Design
- Implement proper caching
- Use pagination for large datasets
- Include timeout configurations
- Implement rate limiting

### Memory Management
- Clean up event listeners
- Dispose of database connections
- Clear intervals and timeouts
- Monitor for memory leaks

## Security Guidelines

### Data Handling
- Never log sensitive information
- Validate all inputs with Zod schemas
- Use parameterized queries for database operations
- Implement proper authentication/authorization

### Environment Configuration
- Use environment variables for secrets
- Never commit `.env` files
- Validate required environment variables on startup
- Use secure defaults for configurations

## Agent-Specific Guidelines

### Agent Types
This system supports 11 distinct agent types:
1. **ORCHESTRATOR** - Main coordination
2. **DESIGN_SYSTEM** - Design system management
3. **COMPONENT_DEVELOPER** - Component creation
4. **PERFORMANCE_OPTIMIZER** - Performance optimization
5. **ACCESSIBILITY** - A11y compliance
6. **CROSS_PLATFORM** - Multi-platform support
7. **TESTING_QA** - Quality assurance
8. **SECURITY** - Security scanning
9. **ANIMATION** - Animation and transitions
10. **I18N** - Internationalization
11. **UX_RESEARCH** - User experience

### Agent Communication
- Use standardized message formats
- Implement proper handoff protocols
- Include context in all agent interactions
- Handle timeouts and retries gracefully

### Context Management
- Share context through Context7 orchestration layer
- Maintain context versioning
- Implement proper conflict resolution
- Cache frequently accessed context data

## Quality Gates

### Code Coverage
- **Critical Code**: 90% minimum
- **Overall Code**: 80% minimum
- **File-level**: Enforced per file

### Performance Thresholds
- **Agent Response Time**: < 500ms
- **Handoff Latency**: < 200ms
- **Context Sync Time**: < 100ms
- **Task Completion Rate**: > 95%

### Security Requirements
- **High Severity Vulnerabilities**: 0
- **Medium Severity**: < 5
- **Dependencies**: Up-to-date (no >2 year old critical deps)

## Monitoring and Alerting

### Key Metrics
- Agent performance metrics
- Core Web Vitals (LCP, FID, CLS)
- System health indicators
- Error rates and patterns

### Alert Thresholds
- Response time > 5000ms
- Error rate > 10%
- Task completion < 70%
- Lighthouse scores < 90

---

## Development Workflow

1. **Setup**: Run `npm install` and setup database
2. **Development**: Use `npm run dev` for hot reloading
3. **Testing**: Run tests before committing changes
4. **Linting**: Use project linting rules (see above)
5. **Type Checking**: Run `npm run type-check` to ensure type safety
6. **Documentation**: Update this file when adding new patterns

## Tools and Integrations

### Required Tools
- Node.js 18+
- TypeScript 5.3+
- Docker (for database)
- Git

### IDE Integration
- TypeScript language server
- ESLint integration
- Prettier formatting (if configured)
- Git hooks for pre-commit checks

### External Services
- TimescaleDB for metrics storage
- Redis for caching (optional)
- Email/Slack for notifications
- Docker for containerization

---

## Context Engineering and Workflow Monitoring Integration

### Overview
The monitoring system has been extended to include comprehensive tracking of the Context Engineering System and Workflow Commands. This integration provides real-time visibility into context search performance, workflow execution efficiency, quality gate compliance, and evidence collection.

### New Metric Types

#### Context Engineering Metrics
- **CONTEXT_HIT_RATE**: Percentage of successful context searches that return relevant results
- **CONTEXT_SEARCH_LATENCY**: Time taken to execute context searches
- **CONTEXT_CONFIDENCE_SCORE**: Average confidence score of returned context entries
- **CONTEXT_CORRUPTION**: Failed context queries indicating potential data corruption
- **CONTEXT_REPOSITORY_SIZE**: Size and health of the context repository

#### Workflow Metrics
- **WORKFLOW_EXECUTION**: Overall workflow execution success and timing
- **WORKFLOW_STAGE_TRANSITION**: Movement between workflow stages
- **QUALITY_GATE_COMPLIANCE**: Pass/fail rates for quality gates
- **EVIDENCE_COLLECTION**: Collection and validation of evidence
- **WORKFLOW_DEVIATION**: Tracking of deviations from expected workflow paths
- **HANDOFF_LATENCY**: Time taken for agent handoffs
- **ESCALATION_RATE**: Frequency and severity of workflow escalations

### New Database Tables

```sql
-- Context Engineering Tables
context_metrics              -- Context search performance
quality_gate_metrics         -- Quality gate execution results
evidence_metrics            -- Evidence collection statistics

-- Workflow Tables  
workflow_metrics            -- Workflow execution tracking
handoff_metrics             -- Agent handoff performance
escalation_metrics          -- Escalation tracking and resolution
```

### New API Endpoints

#### Context Metrics
```bash
POST /api/v1/metrics/context          # Store context metrics
GET  /api/v1/metrics/context          # Query context metrics
GET  /api/v1/analytics/context-performance  # Performance summary
```

#### Workflow Metrics
```bash
POST /api/v1/metrics/workflow         # Store workflow metrics
GET  /api/v1/metrics/workflow         # Query workflow metrics
POST /api/v1/metrics/quality-gate     # Store quality gate metrics
GET  /api/v1/metrics/quality-gate     # Query quality gate metrics
POST /api/v1/metrics/evidence         # Store evidence metrics
POST /api/v1/metrics/handoff          # Store handoff metrics
POST /api/v1/metrics/escalation       # Store escalation metrics
```

#### Analytics
```bash
GET /api/v1/analytics/workflow-summary      # Workflow performance by stage
GET /api/v1/analytics/quality-gate-compliance  # Quality gate compliance rates
```

### New Dashboard Components

#### Context Performance Panel
- Real-time context hit rates per agent
- Search latency monitoring
- Context repository health indicators
- Recent context query history with success/failure tracking

#### Workflow Tracker
- Workflow stage progression visualization
- Agent-specific performance metrics
- Deviation tracking and alerting
- Handoff latency monitoring

#### Quality Gate Status
- Quality gate pass rates by stage
- Evidence collection completeness
- Auto-approval rates
- Compliance trend analysis

### Alert Integration

#### New Alert Types
- `CONTEXT_CORRUPTION`: Critical alerts for context system failures
- `CONTEXT_HIT_RATE_LOW`: Warnings for suboptimal context search performance
- `WORKFLOW_FAILURE`: Alerts for workflow execution failures
- `QUALITY_GATE_FAILURE`: Critical alerts for quality gate failures
- `HANDOFF_DELAY`: Warnings for delayed agent handoffs
- `ESCALATION_SPIKE`: Alerts for unusual escalation patterns

#### Default Alert Thresholds
```typescript
// Context Engineering
Context Hit Rate < 70% (Medium Severity)
Context Search Latency > 1000ms (High Severity)
Any Context Corruption (Critical Severity)

// Workflow Management
Any Workflow Failure (High Severity)
Workflow Deviations > 5 (Medium Severity)
Any Quality Gate Failure (High Severity)
Handoff Delay > 5000ms (Medium Severity)
Any Escalation (High Severity)
```

### Performance Monitoring KPIs

#### Context Engineering KPIs
- **Target Hit Rate**: >85% (Current baseline ~70%)
- **Target Search Latency**: <500ms
- **Target Confidence Score**: >0.8
- **Success Rate**: >95%

#### Workflow KPIs
- **Task Completion Rate**: >95%
- **Quality Gate Pass Rate**: >90%
- **Handoff Latency**: <200ms
- **Deviation Rate**: <10%
- **Escalation Rate**: <5%

### Usage Examples

#### Sending Context Metrics
```typescript
const contextMetrics: ContextMetrics = {
  id: 'ctx-123',
  agentType: AgentType.COMPONENT_DEVELOPER,
  agentId: 'cd-001',
  timestamp: new Date(),
  query: 'React component patterns',
  executionTime: 150,
  hitRate: 85.5,
  contextCount: 12,
  avgConfidence: 0.87,
  topContextType: 'pattern',
  searchLatency: 120,
  success: true,
  contextEntries: [...]
}

fetch('http://localhost:3000/api/v1/metrics/context', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(contextMetrics)
})
```

#### Sending Workflow Metrics
```typescript
const workflowMetrics: WorkflowMetrics = {
  id: 'wf-456',
  workflowId: 'workflow-789',
  agentType: AgentType.DESIGN_SYSTEM,
  agentId: 'ds-002',
  stage: 'build',
  timestamp: new Date(),
  command: 'workflow.build',
  executionTime: 2500,
  success: true,
  status: 'completed',
  contextHitRate: 92.0,
  evidenceCount: 8,
  qualityGateStatus: 'passed',
  deviationsCount: 0,
  metadata: { artifacts: ['comp-123', 'comp-456'] }
}

fetch('http://localhost:3000/api/v1/metrics/workflow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(workflowMetrics)
})
```

### Integration Benefits

1. **Real-time Visibility**: Immediate insight into context and workflow performance
2. **Proactive Alerting**: Early detection of issues before they impact productivity
3. **Performance Optimization**: Data-driven optimization of context search and workflow execution
4. **Quality Assurance**: Continuous monitoring of quality gate compliance
5. **Historical Analysis**: Trend analysis for long-term improvements

### Implementation Notes

- **Backward Compatibility**: All existing monitoring functionality remains unchanged
- **Performance Impact**: Minimal overhead with efficient TimescaleDB storage
- **Scalability**: Designed to handle high-volume context and workflow metrics
- **Real-time Updates**: WebSocket integration for live dashboard updates
- **Data Retention**: 90-day retention policy aligns with existing metrics

---

**Last Updated**: February 2026
**System Version**: 2.0.0 (Context Engineering Integration)
**Maintainer**: Frontend Design Agent System
## AI Agent Development Roadmap

Strategic roadmap established for enhancing our 11-agent Frontend Design Agent System based on comprehensive research into production-tested frameworks.

### Key Research Findings:
- **Context Engineering**: Critical for eliminating agent "amnesia"
- **Structured Workflows**: Buildforce shows 14x velocity improvement
- **Role Specialization**: SAFe methodology proves effectiveness
- **Evidence-Based Quality**: Essential for production systems

### Four-Phase Implementation Plan:
1. **Phase 1 (Q1 2026)**: Context engineering + structured commands
2. **Phase 2 (Q2 2026)**: Enhanced agent roles + three-layer architecture  
3. **Phase 3 (Q3 2026)**: Multi-provider support + evidence system
4. **Phase 4 (Q4 2026)**: Pattern discovery + adaptive behavior

### Success Metrics:
- Context Hit Rate: >85% (vs current ~30%)
- Development Speed: 3x improvement
- Agent Velocity: 2x improvement
- Quality Gate Pass Rate: >95%

### Priority:
Start with Phase 1 (context engineering + structured workflow commands) for immediate 2-3x productivity gains.

Full roadmap documented in ROADMAP.md
