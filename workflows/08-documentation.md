# Documentation

**Version:** 1.0.0
**Doc ID:** DOC-FD-2024-008
**Last Updated:** 2026-01-03

## Table of Contents

- [API Reference](#api-reference)
- [Configuration Reference](#configuration-reference)
- [Agent Protocol Reference](#agent-protocol-reference)
- [Error Codes](#error-codes)
- [Monitoring Metrics](#monitoring-metrics)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Glossary](#glossary)

---

## API Reference

### Handoff Protocol API

#### `initiateHandoff()`

Initiates a new handoff to a target agent.

**Signature:**
```typescript
async initiateHandoff(
  targetAgent: string,
  handoff: HandoffMessage
): Promise<HandoffResult>
```

**Parameters:**
- `targetAgent` (string): ID of the target agent
- `handoff` (HandoffMessage): Handoff message data

**Returns:** `Promise<HandoffResult>`

**Example:**
```typescript
const result = await initiateHandoff("FD-DS-02", {
  message_id: generateUUID(),
  protocol_version: "1.0.0",
  timestamp: new Date().toISOString(),
  source_agent: "FD-ORC-01",
  target_agent: "FD-DS-02",
  workflow_id: "WF-001",

  handoff_type: HandoffType.INITIAL,
  task: {
    id: generateUUID(),
    title: "Create Button Component",
    description: "Design and implement button component",
    priority: TaskPriority.HIGH,
    estimated_duration: "PT20M",
    dependencies: [],
    deliverables: ["design-spec", "component-code"]
  },

  context: {},
  previous_work: [],
  metadata: {
    workflow_stage: "design",
    stage_number: 1,
    total_stages: 4,
    retry_count: 0,
    created_at: new Date().toISOString(),
    started_at: new Date().toISOString()
  }
});

console.log("Handoff result:", result);
```

**Error Handling:**
```typescript
try {
  const result = await initiateHandoff("FD-DS-02", handoff);

  if (!result.success) {
    console.error("Handoff failed:", result.error);

    // Handle failure
    if (result.retryable) {
      // Retry logic
      await retryHandoff(handoff);
    }
  }
} catch (error) {
  console.error("Handoff error:", error);

  // Unexpected error
  throw error;
}
```

#### `receiveHandoff()`

Receives and acknowledges a handoff from another agent.

**Signature:**
```typescript
async receiveHandoff(
  handoff: HandoffMessage
): Promise<HandoffAck>
```

**Parameters:**
- `handoff` (HandoffMessage): Handoff message data

**Returns:** `Promise<HandoffAck>`

**Example:**
```typescript
const ack = await receiveHandoff(handoff);

console.log("Handoff status:", ack.status);

if (ack.status === "accepted") {
  // Process handoff
  await processHandoff(handoff);
} else {
  // Handle rejection
  console.error("Handoff rejected:", ack.reason);
}
```

---

### Context Sharing API

#### `getContext()`

Retrieves shared context by ID.

**Signature:**
```typescript
async getContext(
  contextId: string,
  version?: string
): Promise<SharedContext | undefined>
```

**Parameters:**
- `contextId` (string): Context ID
- `version` (string, optional): Specific version to retrieve

**Returns:** `Promise<SharedContext | undefined>`

**Example:**
```typescript
const context = await getContext("ctx-123");

if (context) {
  console.log("Context loaded:", context.meta.context_id);
  console.log("Project:", context.project);
  console.log("Design tokens:", context.design?.tokens);
} else {
  console.error("Context not found");
}
```

#### `updateContext()`

Updates shared context.

**Signature:**
```typescript
async updateContext(
  contextId: string,
  updates: ContextUpdate
): Promise<SharedContext>
```

**Parameters:**
- `contextId` (string): Context ID
- `updates` (ContextUpdate): Updates to apply

**Returns:** `Promise<SharedContext>`

**Example:**
```typescript
const updatedContext = await updateContext("ctx-123", {
  design: {
    tokens: {
      colors: {
        primary: {
          500: "#007bff"
        }
      }
    }
  }
});

console.log("Context updated:", updatedContext);
```

#### `subscribeToContext()`

Subscribes to context changes.

**Signature:**
```typescript
async subscribeToContext(
  contextId: string,
  callback: ContextCallback,
  filters?: ContextFilters
): Promise<string>
```

**Parameters:**
- `contextId` (string): Context ID
- `callback` (ContextCallback): Callback function for changes
- `filters` (ContextFilters, optional): Filter criteria

**Returns:** `Promise<string>` - Subscription ID

**Example:**
```typescript
const subscriptionId = await subscribeToContext(
  "ctx-123",
  async (notification) => {
    console.log("Context changed:", notification.change.description);

    // React to change
    await processContextChange(notification.change);
  },
  {
    paths: ["/design/tokens/*"],
    types: ["modify", "replace"]
  }
);

console.log("Subscribed with ID:", subscriptionId);

// Later, unsubscribe
await unsubscribeFromContext(subscriptionId);
```

---

### Decision Making API

#### `createDecision()`

Creates a new collaborative decision.

**Signature:**
```typescript
async createDecision(
  config: DecisionConfig
): Promise<CollaborativeDecision>
```

**Parameters:**
- `config` (DecisionConfig): Decision configuration

**Returns:** `Promise<CollaborativeDecision>`

**Example:**
```typescript
const decision = await createDecision({
  type: DecisionType.WEIGHTED,
  framework: DecisionFramework.VOTING,
  priority: DecisionPriority.HIGH,
  title: "Select State Management Library",
  description: "Choose the best state management library",
  domain: DecisionDomain.ARCHITECTURE,
  participants: ["FD-CD-03", "FD-PO-04", "FD-TQ-07"],
  initiator: "FD-ORC-01",
  options: [
    {
      title: "Redux Toolkit",
      description: "Official Redux tooling",
      proposed_by: "FD-CD-03",
      supporters: ["FD-CD-03"],
      pros: ["Mature ecosystem", "DevTools"],
      cons: ["Boilerplate"],
      risk_level: "low"
    },
    {
      title: "Zustand",
      description: "Lightweight state management",
      proposed_by: "FD-PO-04",
      supporters: ["FD-PO-04"],
      pros: ["Simple API", "Small bundle"],
      cons: ["Less ecosystem"],
      risk_level: "low"
    }
  ],
  criteria: [
    {
      criteria_id: "performance",
      name: "Performance",
      description: "Runtime performance",
      weight: 0.3,
      importance: "critical"
    },
    {
      criteria_id: "developer_experience",
      name: "Developer Experience",
      description: "Ease of use",
      weight: 0.3,
      importance: "important"
    }
  ],
  deadline: new Date(Date.now() + 60 * 60 * 1000).toISOString()
});

console.log("Decision created:", decision.decision_id);
```

#### `castVote()`

Casts a vote in a decision.

**Signature:**
```typescript
async castVote(
  decisionId: string,
  vote: AgentVote
): Promise<void>
```

**Parameters:**
- `decisionId` (string): Decision ID
- `vote` (AgentVote): Vote data

**Returns:** `Promise<void>`

**Example:**
```typescript
await castVote("decision-123", {
  agent_id: "FD-CD-03",
  option_id: "option-456",
  confidence: 0.85,
  reasoning: "Redux Toolkit provides better developer experience",
  timestamp: new Date().toISOString(),
  criteria_scores: {
    performance: 0.7,
    developer_experience: 0.95,
    ecosystem: 0.9
  }
});

console.log("Vote cast");
```

---

### Tool Delegation API

#### `requestTool()`

Requests access to a tool.

**Signature:**
```typescript
async requestTool(
  toolId: string,
  task: ToolTask
): Promise<ToolResponse>
```

**Parameters:**
- `toolId` (string): Tool ID
- `task` (ToolTask): Task to execute with tool

**Returns:** `Promise<ToolResponse>`

**Example:**
```typescript
const response = await requestTool("lighthouse", {
  type: "performance_audit",
  parameters: {
    url: "https://example.com",
    categories: ["performance", "accessibility", "best-practices"]
  }
});

if (response.granted) {
  console.log("Tool access granted");

  // Use the tool
  const result = await runLighthouseAudit(task.parameters);

  // Release tool when done
  await releaseTool("lighthouse", response.lock_id!);
} else {
  console.error("Tool not available:", response.error);

  if (response.queue_position !== undefined) {
    console.log("Position in queue:", response.queue_position);
    console.log("Estimated wait:", response.estimated_wait_ms, "ms");
  }
}
```

#### `releaseTool()`

Releases tool access.

**Signature:**
```typescript
async releaseTool(
  toolId: string,
  lockId: string
): Promise<boolean>
```

**Parameters:**
- `toolId` (string): Tool ID
- `lockId` (string): Lock ID from request response

**Returns:** `Promise<boolean>`

**Example:**
```typescript
const success = await releaseTool("lighthouse", "lock-789");

if (success) {
  console.log("Tool released successfully");
} else {
  console.error("Failed to release tool");
}
```

---

## Configuration Reference

### Workflow Configuration

```typescript
interface WorkflowConfig {
  // Version
  version: string;

  // Environment
  environment: "development" | "staging" | "production";

  // Agents
  agents: AgentConfigs;

  // Protocols
  protocols: ProtocolConfigs;

  // Monitoring
  monitoring: MonitoringConfig;

  // Context7
  context7: Context7Config;
}
```

**Example Configuration:**

```json
{
  "version": "1.0.0",
  "environment": "development",
  "agents": {
    "orchestrator": {
      "id": "FD-ORC-01",
      "type": "orchestrator",
      "endpoint": "ws://localhost:3000/orchestrator"
    },
    "specialists": {
      "design_system": {
        "id": "FD-DS-02",
        "endpoint": "ws://localhost:3000/design-system"
      }
    }
  },
  "protocols": {
    "handoff": {
      "enabled": true,
      "timeout_ms": 5000,
      "retry_attempts": 3,
      "retry_delay_ms": 1000
    },
    "context_sharing": {
      "enabled": true,
      "sync_interval_ms": 1000,
      "cache_ttl_ms": 300000,
      "max_version_history": 100
    },
    "conflict_resolution": {
      "enabled": true,
      "escalation_timeout_ms": 60000,
      "max_escalation_level": 3
    },
    "collaborative_decision": {
      "enabled": true,
      "decision_timeout_ms": 300000,
      "default_decision_type": "weighted"
    },
    "tool_delegation": {
      "enabled": true,
      "lock_timeout_ms": 300000,
      "max_concurrent_usage": 5
    }
  },
  "monitoring": {
    "enabled": true,
    "endpoint": "http://localhost:3001/metrics",
    "log_level": "info",
    "metrics_collection_interval_ms": 1000
  },
  "context7": {
    "enabled": true,
    "endpoint": "http://localhost:3002/context7",
    "cache_enabled": true,
    "cache_ttl_ms": 3600000
  }
}
```

### Agent Configuration

```typescript
interface AgentConfig {
  // Identification
  id: string;
  type: AgentType;
  name: string;
  version: string;

  // Communication
  endpoint: string;
  heartbeat_interval_ms: number;

  // Protocol configs
  handoff: HandoffConfig;
  contextSharing: ContextSharingConfig;
  collaborativeDecision: DecisionConfig;
  toolDelegation: ToolDelegationConfig;

  // Capabilities
  capabilities: string[];
  allowed_tools: string[];
  blocked_tools?: string[];

  // Resources
  max_concurrent_tasks: number;
  max_tool_locks: number;
  task_timeout_ms: number;
}
```

**Example Agent Configuration:**

```json
{
  "id": "FD-DS-02",
  "type": "specialist",
  "name": "Design System Specialist",
  "version": "1.0.0",
  "endpoint": "ws://localhost:3000/design-system",
  "heartbeat_interval_ms": 30000,
  "handoff": {
    "enabled": true,
    "timeout_ms": 5000,
    "retry_attempts": 3,
    "retry_delay_ms": 1000,
    "max_queue_size": 10
  },
  "contextSharing": {
    "enabled": true,
    "sync_interval_ms": 1000,
    "auto_subscribe": true,
    "context_cache_size": 50
  },
  "collaborativeDecision": {
    "enabled": true,
    "auto_participate": true,
    "vote_timeout_ms": 60000,
    "default_confidence": 0.7
  },
  "toolDelegation": {
    "enabled": true,
    "max_concurrent_locks": 3,
    "lock_timeout_ms": 300000,
    "auto_release_on_task_complete": true
  },
  "capabilities": [
    "design_token_management",
    "component_specification",
    "pattern_library_maintenance"
  ],
  "allowed_tools": [
    "figma-api",
    "storybook",
    "style-dictionary"
  ],
  "max_concurrent_tasks": 5,
  "max_tool_locks": 3,
  "task_timeout_ms": 600000
}
```

---

## Agent Protocol Reference

### Handoff Protocol

#### Protocol Flow

1. **Source Agent** creates handoff message
2. **Source Agent** validates handoff message
3. **Source Agent** sends to Target Agent
4. **Target Agent** receives and validates
5. **Target Agent** sends acknowledgment
6. **Source Agent** waits for confirmation
7. **Target Agent** processes task
8. **Target Agent** sends completion (or next handoff)

#### Message Format

See [Handoff Protocol Specification](./01-handoff-protocol-specification.md) for complete message format.

#### Error Handling

| Error | Description | Recovery |
|-------|-------------|-----------|
| `INVALID_HANDOFF` | Handoff message validation failed | Fix message and retry |
| `DEPENDENCY_NOT_MET` | Task dependencies not complete | Wait for dependencies |
| `AGENT_UNAVAILABLE` | Target agent not available | Queue or use fallback |
| `TIMEOUT` | Handoff timeout | Retry with exponential backoff |
| `CONTEXT_MISMATCH` | Context version mismatch | Sync context and retry |

### Context Sharing Protocol

#### Protocol Flow

1. **Agent** requests context by ID
2. **Context Manager** retrieves current version
3. **Agent** subscribes to changes (optional)
4. **Context Manager** broadcasts changes to subscribers
5. **Agent** processes context change
6. **Agent** updates context (optional)
7. **Context Manager** applies updates
8. **Context Manager** broadcasts to other subscribers

#### Context Versioning

- Every update creates a new version
- Version chain maintained for rollback
- Automatic cleanup of old versions
- Version checksums for integrity

#### Conflict Detection

- Real-time conflict detection during updates
- Automatic conflict resolution when possible
- Manual resolution for complex conflicts
- Conflict logging and learning

### Decision Protocol

#### Decision Types

| Type | Use Case | Voting | Consensus |
|-------|-----------|---------|-----------|
| `CONSENSUS` | Critical decisions | No | Yes |
| `MAJORITY` | Standard decisions | Yes | No |
| `SUPERMAJORITY` | Important decisions | Yes | No |
| `WEIGHTED` | Expertise-based decisions | Yes | No |
| `EXPERT` | Domain-specific decisions | No | No |
| `ORCHESTRATOR` | Final decisions | No | No |

#### Voting Process

1. **Initiator** creates decision with options
2. **Participants** review options and criteria
3. **Participants** cast votes with confidence
4. **System** calculates scores based on weights
5. **System** selects winner based on decision type
6. **System** notifies all participants of outcome
7. **Participants** can request review if dissatisfied

### Tool Delegation Protocol

#### Tool Categories

| Category | Description | Examples |
|-----------|-------------|-----------|
| `EXCLUSIVE` | Only one agent at a time | Figma API, Lighthouse Runner |
| `SHARED` | Multiple agents concurrently | Context7, Monitoring |
| `POOL` | Limited concurrent usage | Build tools, Test runners |
| `AGENT_SPECIFIC` | Only specific agents | Accessibility Scanner, Security Auditor |

#### Request Process

1. **Agent** requests tool with task
2. **Tool Manager** checks availability
3. **Tool Manager** checks agent permissions
4. **Tool Manager** grants or queues request
5. **Agent** receives response with lock ID
6. **Agent** executes task with tool
7. **Agent** releases tool when done
8. **Tool Manager** processes next in queue

#### Lock Management

- Automatic lock expiration
- Lock extension support
- Deadlock detection
- Priority-based queue processing

---

## Error Codes

### Handoff Errors

| Code | Message | Retryable | Action |
|------|---------|-----------|--------|
| `HP-001` | Invalid handoff message | No | Fix message format |
| `HP-002` | Missing required fields | No | Add required fields |
| `HP-003` | Dependency not met | Yes | Wait for dependency |
| `HP-004` | Agent not found | No | Verify agent ID |
| `HP-005` | Agent unavailable | Yes | Retry later |
| `HP-006` | Timeout | Yes | Retry with backoff |
| `HP-007` | Context version mismatch | No | Sync context |
| `HP-008` | Permission denied | No | Check permissions |
| `HP-009` | Queue full | Yes | Wait and retry |
| `HP-010` | Max retries exceeded | No | Escalate |

### Context Errors

| Code | Message | Retryable | Action |
|------|---------|-----------|--------|
| `CTX-001` | Context not found | No | Verify context ID |
| `CTX-002` | Version not found | No | Verify version ID |
| `CTX-003` | Context locked | Yes | Wait and retry |
| `CTX-004` | Version conflict | No | Resolve conflict |
| `CTX-005` | Invalid update | No | Fix update data |
| `CTX-006` | Merge conflict | No | Resolve conflict |
| `CTX-007` | Cache error | Yes | Retry or clear cache |
| `CTX-008` | Subscription failed | Yes | Retry subscription |
| `CTX-009` | Sync timeout | Yes | Retry sync |
| `CTX-010` | Access denied | No | Check permissions |

### Decision Errors

| Code | Message | Retryable | Action |
|------|---------|-----------|--------|
| `DEC-001` | Decision not found | No | Verify decision ID |
| `DEC-002` | Decision closed | No | Create new decision |
| `DEC-003` | Agent not participant | No | Join decision |
| `DEC-004` | Already voted | No | Update vote |
| `DEC-005` | Invalid option | No | Verify option ID |
| `DEC-006` | Decision timeout | No | Initiate arbitration |
| `DEC-007` | Consensus failed | No | Escalate |
| `DEC-008` | Voting error | Yes | Retry vote |
| `DEC-009` | Quorum not met | Yes | Wait for quorum |
| `DEC-010` | Invalid criteria | No | Fix criteria |

### Tool Errors

| Code | Message | Retryable | Action |
|------|---------|-----------|--------|
| `TL-001` | Tool not found | No | Verify tool ID |
| `TL-002` | Tool unavailable | Yes | Wait or use fallback |
| `TL-003` | Tool offline | Yes | Wait for availability |
| `TL-004` | Permission denied | No | Check permissions |
| `TL-005` | Tool in use | Yes | Wait in queue |
| `TL-006` | Lock not found | No | Verify lock ID |
| `TL-007` | Lock expired | Yes | Request new lock |
| `TL-008` | Tool error | Maybe | Check error details |
| `TL-009` | Deadlock detected | Yes | Wait for resolution |
| `TL-010` | Queue timeout | Yes | Escalate |

---

## Monitoring Metrics

### Handoff Metrics

| Metric | Type | Description | Target |
|--------|------|-------------|--------|
| `handoff_total` | Counter | Total handoffs initiated | - |
| `handoff_success_rate` | Gauge | Percentage of successful handoffs | > 95% |
| `handoff_duration_avg` | Histogram | Average handoff duration | < 500ms |
| `handoff_duration_p95` | Histogram | 95th percentile duration | < 1000ms |
| `handoff_retry_rate` | Gauge | Percentage of retries | < 5% |
| `handoff_queue_depth` | Gauge | Current queue depth | < 10 |

### Context Metrics

| Metric | Type | Description | Target |
|--------|------|-------------|--------|
| `context_total` | Counter | Total context operations | - |
| `context_sync_duration` | Histogram | Context sync duration | < 200ms |
| `context_cache_hit_rate` | Gauge | Cache hit rate | > 80% |
| `context_conflict_rate` | Gauge | Conflict rate | < 1% |
| `context_version_count` | Gauge | Total versions in history | < 1000 |
| `context_active_subscriptions` | Gauge | Active subscriptions | - |

### Decision Metrics

| Metric | Type | Description | Target |
|--------|------|-------------|--------|
| `decision_total` | Counter | Total decisions | - |
| `decision_duration_avg` | Histogram | Average decision time | < 10s |
| `decision_consensus_rate` | Gauge | Consensus achievement rate | > 70% |
| `decision_satisfaction` | Gauge | Average satisfaction score | > 8/10 |
| `decision_active` | Gauge | Active decisions | - |
| `decision_timeout_rate` | Gauge | Timeout rate | < 1% |

### Tool Metrics

| Metric | Type | Description | Target |
|--------|------|-------------|--------|
| `tool_request_total` | Counter | Total tool requests | - |
| `tool_grant_rate` | Gauge | Grant rate | > 90% |
| `tool_wait_time_avg` | Histogram | Average wait time | < 5s |
| `tool_usage_duration` | Histogram | Tool usage duration | - |
| `tool_queue_depth` | Gauge | Queue depth per tool | < 5 |
| `tool_error_rate` | Gauge | Error rate | < 1% |

---

## Best Practices

### Handoff Best Practices

1. **Always validate handoff messages before sending**
   ```typescript
   const validation = await validateHandoff(handoff);
   if (!validation.valid) {
     throw new Error(validation.error);
   }
   ```

2. **Include complete context in handoffs**
   - Don't assume recipient has all information
   - Include all relevant design tokens, specs, and requirements

3. **Set appropriate timeout values**
   ```typescript
   const timeout = estimateTaskDuration(handoff.task) * 2;  // 2x buffer
   ```

4. **Handle acknowledgments properly**
   ```typescript
   if (ack.status === "rejected") {
     // Handle rejection gracefully
     await handleHandoffRejection(ack);
   }
   ```

5. **Use appropriate handoff types**
   - `INITIAL` for first agent in workflow
   - `SEQUENTIAL` for standard progression
   - `PARALLEL_START/JOIN` for parallel execution
   - `COMPLETION` for final results

### Context Management Best Practices

1. **Subscribe to context changes when needed**
   ```typescript
   const subId = await subscribeToContext(contextId, callback);
   // Don't forget to unsubscribe
   await unsubscribeFromContext(subId);
   ```

2. **Use context versioning for rollback**
   ```typescript
   const version = await createVersion(contextId, "Update tokens");
   // If something goes wrong:
   await rollback(version.parent_version_id!);
   ```

3. **Minimize context size for performance**
   - Only include necessary fields
   - Use compression for large contexts
   - Cache frequently accessed context

4. **Handle context conflicts gracefully**
   ```typescript
   try {
     await updateContext(contextId, updates);
   } catch (conflict) {
     const resolution = await resolveConflict(conflict);
     await updateContext(contextId, resolution);
   }
   ```

5. **Use context filters when subscribing**
   ```typescript
   await subscribeToContext(contextId, callback, {
     paths: ["/design/tokens/*"],
     types: ["modify"]
   });
   ```

### Decision Making Best Practices

1. **Provide clear and detailed options**
   ```typescript
   options: [
     {
       title: "Clear title",
       description: "Detailed description",
       pros: ["Clear benefit 1", "Clear benefit 2"],
       cons: ["Clear drawback 1"],
       risk_level: "low"
     }
   ]
   ```

2. **Use appropriate decision types**
   - `CONSENSUS` for critical decisions
   - `WEIGHTED` for expertise-based decisions
   - `MAJORITY` for standard decisions

3. **Provide confidence and reasoning with votes**
   ```typescript
   vote: {
     agent_id: "agent-id",
     option_id: "option-id",
     confidence: 0.85,
     reasoning: "Detailed reasoning",
     criteria_scores: { ... }
   }
   ```

4. **Respect decision timeouts**
   - Vote before timeout
   - Handle timeout gracefully
   - Request extension if needed

5. **Provide feedback on decisions**
   ```typescript
   await provideFeedback(decisionId, {
     satisfaction: 8,
     quality: 9,
     comments: "Decision process was smooth"
   });
   ```

### Tool Usage Best Practices

1. **Always release tools when done**
   ```typescript
   try {
     const result = await useTool(toolId, task);
     return result;
   } finally {
     await releaseTool(toolId, lockId);
   }
   ```

2. **Handle tool unavailability gracefully**
   ```typescript
   if (!response.granted) {
     if (response.queue_position !== undefined) {
       // Wait in queue
       return await waitForToolAvailability(toolId);
     } else {
       // Use fallback
       return await useFallbackTool(task);
     }
   }
   ```

3. **Use appropriate timeout for tools**
   ```typescript
   const timeout = Math.max(
     task.estimated_duration * 2,
     300000  // Minimum 5 minutes
   );
   ```

4. **Monitor tool performance**
   ```typescript
   const start = Date.now();
   const result = await executeTool(task);
   const duration = Date.now() - start;

   await recordToolMetrics(toolId, { duration, success: true });
   ```

5. **Use fallback tools when available**
   ```typescript
   try {
     return await usePrimaryTool(toolId, task);
   } catch (error) {
     return await useFallbackTool(toolId, task);
   }
   ```

### Performance Best Practices

1. **Optimize handoff messages**
   - Compress large contexts
   - Use efficient serialization
   - Remove unnecessary fields

2. **Use caching effectively**
   ```typescript
   const cached = await getFromCache(cacheKey);
   if (cached) {
     return cached;
   }

   const result = await compute();
   await setInCache(cacheKey, result);
   return result;
   ```

3. **Batch operations when possible**
   ```typescript
   // Instead of multiple small updates:
   await updateContext(contextId, {
     design: { tokens: { colors: { /* ... */ } } }
   });
   ```

4. **Use async operations properly**
   ```typescript
   // Parallel independent operations
   const [context, tools] = await Promise.all([
     getContext(contextId),
     getToolStatus(toolId)
   ]);
   ```

5. **Monitor and optimize bottlenecks**
   - Track operation durations
   - Identify slow paths
   - Optimize or cache

---

## Troubleshooting

### Common Issues

#### Issue: Handoffs Failing

**Symptoms:**
- High handoff failure rate
- Timeout errors
- Agent unavailable messages

**Diagnosis:**
```typescript
// Check handoff metrics
const metrics = getHandoffMetrics();
console.log("Success rate:", metrics.success_rate);
console.log("Avg duration:", metrics.avg_duration);
console.log("Queue depth:", metrics.queue_depth);
```

**Solutions:**
1. **Increase timeout values**
2. **Check agent availability**
3. **Reduce handoff message size**
4. **Implement retry logic**
5. **Check network connectivity**

#### Issue: Context Sync Failures

**Symptoms:**
- Stale context data
- Sync timeout errors
- Version conflicts

**Diagnosis:**
```typescript
// Check context metrics
const metrics = getContextMetrics();
console.log("Sync duration:", metrics.sync_duration);
console.log("Conflict rate:", metrics.conflict_rate);
console.log("Cache hit rate:", metrics.cache_hit_rate);
```

**Solutions:**
1. **Increase sync interval**
2. **Optimize context size**
3. **Enable conflict resolution**
4. **Clear context cache**
5. **Check Context7 connectivity**

#### Issue: Decision Timeouts

**Symptoms:**
- Decisions timing out
- Low participation rate
- Consensus not reached

**Diagnosis:**
```typescript
// Check decision metrics
const metrics = getDecisionMetrics();
console.log("Avg duration:", metrics.avg_duration);
console.log("Timeout rate:", metrics.timeout_rate);
console.log("Consensus rate:", metrics.consensus_rate);
```

**Solutions:**
1. **Increase timeout values**
2. **Use simpler decision types**
3. **Send reminders to participants**
4. **Reduce criteria complexity**
5. **Enable auto-escalation**

#### Issue: Tool Unavailability

**Symptoms:**
- Tools frequently unavailable
- Long queue wait times
- Tool lock errors

**Diagnosis:**
```typescript
// Check tool metrics
const metrics = getToolMetrics();
console.log("Grant rate:", metrics.grant_rate);
console.log("Wait time:", metrics.avg_wait_time);
console.log("Queue depth:", metrics.queue_depth);
```

**Solutions:**
1. **Increase concurrent limit**
2. **Optimize tool usage duration**
3. **Implement better scheduling**
4. **Use fallback tools**
5. **Increase lock timeout**

### Debugging

#### Enable Debug Logging

```typescript
// In agent config
{
  "monitoring": {
    "log_level": "debug"
  }
}

// In code
logger.debug("Handoff details:", handoff);
logger.debug("Context update:", updates);
```

#### Trace Workflow Execution

```typescript
// Enable tracing
const tracer = new WorkflowTracer();
tracer.enable();

// Execute workflow
await executeWorkflow(workflow);

// Get trace
const trace = tracer.getTrace();
console.log("Workflow trace:", trace);
```

#### Monitor Agent Health

```typescript
// Get agent health status
const health = await agent.getHealthStatus();

console.log("Status:", health.status);
console.log("Uptime:", health.uptime_percentage);
console.log("Active tasks:", health.active_tasks);

if (health.status === "unhealthy") {
  // Investigate issues
  await diagnoseAgentIssues(agentId);
}
```

---

## Glossary

### Terms

- **Agent**: An autonomous software component in the Frontend Design Agent System
- **Handoff**: The process of transferring task responsibility between agents
- **Context**: Shared information about project, design, code, etc.
- **Decision**: A collaborative process to reach a conclusion
- **Tool**: External resource or service used by agents
- **Orchestrator**: Central agent that coordinates all other agents
- **Specialist**: Agent with domain-specific expertise
- **Protocol**: Standardized set of rules for communication
- **Workflow**: Multi-step process involving multiple agents
- **Conflict**: Situation where agents have differing opinions or data
- **Consensus**: Agreement among all participants
- **Lock**: Exclusive access to a tool or resource
- **Version**: Specific state of context at a point in time
- **Subscription**: Request to receive context changes
- **Metric**: Quantitative measure of system behavior
- **Error**: Condition preventing successful operation
- **Retry**: Attempt to repeat a failed operation
- **Fallback**: Alternative method when primary fails

### Agent IDs

| ID | Name | Type |
|----|------|------|
| `FD-ORC-01` | Frontend Design Orchestrator | Orchestrator |
| `FD-DS-02` | Design System Specialist | Specialist |
| `FD-CD-03` | Component Developer Specialist | Specialist |
| `FD-PO-04` | Performance Optimizer Specialist | Specialist |
| `FD-AX-05` | Accessibility Specialist | Specialist |
| `FD-CP-06` | Cross-Platform Specialist | Specialist |
| `FD-TQ-07` | Testing & QA Specialist | Specialist |
| `FD-SC-08` | Security Specialist | Specialist |
| `FD-AN-09` | Animation Specialist | Specialist |
| `FD-I1-10` | Internationalization Specialist | Specialist |
| `FD-UR-11` | UX Research Specialist | Specialist |

### Protocol IDs

| Protocol | Document | Version |
|----------|-----------|---------|
| Handoff Protocol | 01-handoff-protocol-specification.md | 1.0.0 |
| Context Sharing | 02-context-sharing-architecture.md | 1.0.0 |
| Conflict Resolution | 03-conflict-resolution-framework.md | 1.0.0 |
| Collaborative Decision | 04-collaborative-decision-protocols.md | 1.0.0 |
| Tool Delegation | 05-tool-delegation-standards.md | 1.0.0 |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-03 | Initial release with complete documentation |

---

**Related Documents:**
- [Workflow System Overview](./00-workflow-system-overview.md)
- [Handoff Protocol Specification](./01-handoff-protocol-specification.md)
- [Context Sharing Architecture](./02-context-sharing-architecture.md)
- [Conflict Resolution Framework](./03-conflict-resolution-framework.md)
- [Collaborative Decision Protocols](./04-collaborative-decision-protocols.md)
- [Tool Delegation Standards](./05-tool-delegation-standards.md)
- [Implementation Guide](./06-implementation-guide.md)
- [Workflow Templates](./07-workflow-templates.md)
