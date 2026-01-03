# Tool Delegation Standards

**Version:** 1.0.0
**Standard ID:** TDS-FD-2024-005
**Last Updated:** 2026-01-03

## Table of Contents

- [Overview](#overview)
- [Tool Usage Protocols](#tool-usage-protocols)
- [Tool Sharing & Locking](#tool-sharing--locking)
- [Tool Usage Optimization](#tool-usage-optimization)
- [Tool Performance Monitoring](#tool-performance-monitoring)
- [Tool Error Handling](#tool-error-handling)
- [Tool Fallback Strategies](#tool-fallback-strategies)
- [Tool Catalog](#tool-catalog)
- [Integration Examples](#integration-examples)

---

## Overview

### Purpose

Establish standardized protocols for tool usage, sharing, optimization, and monitoring across the 11-agent Frontend Design Agent System to ensure efficient, reliable, and conflict-free tool access.

### Goals

- **Efficiency**: Optimize tool usage and minimize wait times
- **Reliability**: Ensure tools are available when needed
- **Fairness**: Equitable access to shared resources
- **Performance**: Monitor and optimize tool performance
- **Resilience**: Graceful handling of tool failures
- **Auditability**: Complete tracking of tool usage

### Tool Categories

```
┌─────────────────────────────────────────────────────────┐
│            Category 1: Exclusive Tools                  │
│         (Only one agent can use at a time)              │
│         • Figma API, Lighthouse Runner                   │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│         Category 2: Shared Tools                         │
│         (Multiple agents can use concurrently)           │
│         • Context7, Monitoring System                    │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│         Category 3: Pool Tools                           │
│         (Limited concurrent usage)                       │
│         • Build Tools, Test Runners                      │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│         Category 4: Agent-Specific Tools                 │
│         (Only available to specific agents)              │
│         • Accessibility Scanner, Security Auditor         │
└─────────────────────────────────────────────────────────┘
```

---

## Tool Usage Protocols

### Tool Request System

```typescript
interface ToolRequest {
  request_id: string;                 // UUID v4
  agent_id: string;                  // Agent ID requesting tool
  tool_id: string;                   // Tool identifier
  task_id: string;                   // Task ID requiring tool
  priority: ToolPriority;
  estimated_duration_ms: number;
  timestamp: string;                 // ISO 8601
  parameters: ToolParameters;
  callback_url?: string;              // For async results
}

enum ToolPriority {
  CRITICAL = "critical",              // Blocks critical path
  HIGH = "high",                      // Important but not blocking
  MEDIUM = "medium",                    // Standard priority
  LOW = "low"                         // Can be deferred
}

interface ToolParameters {
  [key: string]: any;
  // Tool-specific parameters
}

interface ToolResponse {
  request_id: string;
  tool_id: string;
  status: ToolStatus;
  granted: boolean;
  start_time?: string;
  expires_at?: string;
  lock_id?: string;                  // For exclusive tools
  queue_position?: number;            // Position in queue
  estimated_wait_ms?: number;
  error?: ToolError;
}

enum ToolStatus {
  AVAILABLE = "available",
  IN_USE = "in_use",
  LOCKED = "locked",
  OFFLINE = "offline",
  MAINTENANCE = "maintenance",
  ERROR = "error"
}

interface ToolError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
}
```

### Tool Manager

```typescript
class ToolManager {
  private tools: Map<string, Tool> = new Map();
  private locks: Map<string, ToolLock> = new Map();
  private queues: Map<string, ToolRequest[]> = new Map();
  private usageStats: Map<string, ToolUsageStats> = new Map();

  constructor() {
    this.initializeTools();
  }

  // Request tool usage
  async requestTool(request: ToolRequest): Promise<ToolResponse> {
    const tool = this.tools.get(request.tool_id);

    if (!tool) {
      return {
        request_id: request.request_id,
        tool_id: request.tool_id,
        status: ToolStatus.ERROR,
        granted: false,
        error: {
          code: "TOOL_NOT_FOUND",
          message: `Tool ${request.tool_id} not found`,
          retryable: false
        }
      };
    }

    // Check if tool is available
    if (tool.status !== ToolStatus.AVAILABLE) {
      return this.handleUnavailableTool(tool, request);
    }

    // Check agent permissions
    if (!await this.checkPermission(request.agent_id, tool)) {
      return {
        request_id: request.request_id,
        tool_id: request.tool_id,
        status: tool.status,
        granted: false,
        error: {
          code: "PERMISSION_DENIED",
          message: `Agent ${request.agent_id} does not have permission to use ${tool.tool_id}`,
          retryable: false
        }
      };
    }

    // Grant tool access
    return await this.grantTool(tool, request);
  }

  // Release tool
  async releaseTool(
    agentId: string,
    toolId: string,
    lockId: string
  ): Promise<boolean> {
    const tool = this.tools.get(toolId);

    if (!tool) {
      return false;
    }

    const lock = this.locks.get(lockId);

    if (!lock || lock.agent_id !== agentId) {
      return false;
    }

    // Release lock
    this.locks.delete(lockId);
    tool.current_usage--;
    tool.total_usage_count++;

    // Update tool status
    if (tool.current_usage < tool.concurrent_limit) {
      tool.status = ToolStatus.AVAILABLE;
    }

    // Process next in queue
    await this.processQueue(toolId);

    // Log usage
    await this.logUsage(lock);

    return true;
  }

  // Extend tool lock
  async extendLock(
    agentId: string,
    toolId: string,
    lockId: string,
    additionalDurationMs: number
  ): Promise<boolean> {
    const lock = this.locks.get(lockId);

    if (!lock || lock.agent_id !== agentId) {
      return false;
    }

    lock.expires_at = new Date(
      new Date(lock.expires_at).getTime() + additionalDurationMs
    ).toISOString();

    return true;
  }

  // Get tool status
  getToolStatus(toolId: string): ToolStatus {
    const tool = this.tools.get(toolId);
    return tool?.status || ToolStatus.ERROR;
  }

  // Get all tool statuses
  getAllToolStatuses(): Record<string, ToolStatus> {
    const statuses: Record<string, ToolStatus> = {};

    for (const [toolId, tool] of this.tools.entries()) {
      statuses[toolId] = tool.status;
    }

    return statuses;
  }

  // Get tool usage statistics
  getToolUsageStats(toolId: string): ToolUsageStats | undefined {
    return this.usageStats.get(toolId);
  }

  // Handle unavailable tool
  private async handleUnavailableTool(
    tool: Tool,
    request: ToolRequest
  ): Promise<ToolResponse> {
    // Add to queue
    const queue = this.queues.get(tool.tool_id) || [];
    queue.push(request);
    this.queues.set(tool.tool_id, queue);

    // Calculate estimated wait time
    const estimatedWaitMs = this.calculateEstimatedWait(tool, queue);

    return {
      request_id: request.request_id,
      tool_id: tool.tool_id,
      status: tool.status,
      granted: false,
      queue_position: queue.length,
      estimated_wait_ms: estimatedWaitMs
    };
  }

  // Grant tool access
  private async grantTool(
    tool: Tool,
    request: ToolRequest
  ): Promise<ToolResponse> {
    const lockId = generateUUID();
    const expiresAt = new Date(
      Date.now() + request.estimated_duration_ms + 60000  // + 1 min buffer
    ).toISOString();

    // Create lock
    const lock: ToolLock = {
      lock_id: lockId,
      tool_id: tool.tool_id,
      agent_id: request.agent_id,
      task_id: request.task_id,
      granted_at: new Date().toISOString(),
      expires_at: expiresAt,
      priority: request.priority,
      extended_count: 0
    };

    this.locks.set(lockId, lock);

    // Update tool state
    tool.current_usage++;

    if (tool.current_usage >= tool.concurrent_limit) {
      tool.status = tool.category === ToolCategory.EXCLUSIVE
        ? ToolStatus.LOCKED
        : ToolStatus.IN_USE;
    }

    // Start expiration check
    this.scheduleLockExpiration(lock);

    return {
      request_id: request.request_id,
      tool_id: tool.tool_id,
      status: tool.status,
      granted: true,
      start_time: new Date().toISOString(),
      expires_at: expiresAt,
      lock_id: lockId
    };
  }

  // Process tool queue
  private async processQueue(toolId: string): Promise<void> {
    const queue = this.queues.get(toolId);

    if (!queue || queue.length === 0) {
      return;
    }

    const tool = this.tools.get(toolId);

    if (!tool || tool.status !== ToolStatus.AVAILABLE) {
      return;
    }

    // Sort queue by priority
    queue.sort((a, b) => {
      const priorityOrder = {
        [ToolPriority.CRITICAL]: 0,
        [ToolPriority.HIGH]: 1,
        [ToolPriority.MEDIUM]: 2,
        [ToolPriority.LOW]: 3
      };

      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Process as many as possible
    const slotsAvailable = tool.concurrent_limit - tool.current_usage;
    const toProcess = queue.splice(0, slotsAvailable);

    for (const request of toProcess) {
      await this.grantTool(tool, request);
    }

    this.queues.set(toolId, queue);
  }

  // Calculate estimated wait time
  private calculateEstimatedWait(
    tool: Tool,
    queue: ToolRequest[]
  ): number {
    // Simple calculation based on average duration
    const stats = this.usageStats.get(tool.tool_id);

    if (!stats || stats.usage_history.length === 0) {
      return 60000;  // Default to 1 minute
    }

    const avgDuration = stats.usage_history.reduce(
      (sum, h) => sum + h.duration_ms,
      0
    ) / stats.usage_history.length;

    // Consider concurrent limit
    const processingSlots = Math.ceil(queue.length / tool.concurrent_limit);

    return avgDuration * processingSlots;
  }

  // Schedule lock expiration
  private scheduleLockExpiration(lock: ToolLock): void {
    const expiresAt = new Date(lock.expires_at).getTime();
    const now = Date.now();
    const delay = Math.max(0, expiresAt - now);

    setTimeout(async () => {
      await this.handleExpiredLock(lock);
    }, delay);
  }

  // Handle expired lock
  private async handleExpiredLock(lock: ToolLock): void {
    const currentLock = this.locks.get(lock.lock_id);

    if (!currentLock) {
      return;  // Already released
    }

    // Release tool
    await this.releaseTool(lock.agent_id, lock.tool_id, lock.lock_id);

    // Log expiration
    Monitoring.logMetric("tool_lock_expired", {
      tool_id: lock.tool_id,
      agent_id: lock.agent_id,
      lock_id: lock.lock_id
    });
  }

  // Check agent permissions
  private async checkPermission(
    agentId: string,
    tool: Tool
  ): Promise<boolean> {
    // Check if tool is agent-specific
    if (tool.allowed_agents && tool.allowed_agents.length > 0) {
      return tool.allowed_agents.includes(agentId);
    }

    // Check if agent is blocked
    if (tool.blocked_agents && tool.blocked_agents.includes(agentId)) {
      return false;
    }

    return true;
  }

  // Log usage
  private async logUsage(lock: ToolLock): Promise<void> {
    const now = Date.now();
    const grantedAt = new Date(lock.granted_at).getTime();
    const duration = now - grantedAt;

    const stats = this.usageStats.get(lock.tool_id) || this.createStats(lock.tool_id);

    stats.usage_history.push({
      agent_id: lock.agent_id,
      started_at: lock.granted_at,
      duration_ms: duration,
      priority: lock.priority
    });

    // Keep only last 1000 entries
    if (stats.usage_history.length > 1000) {
      stats.usage_history = stats.usage_history.slice(-1000);
    }

    // Update metrics
    stats.total_usage_time_ms += duration;
    stats.usage_count++;

    this.usageStats.set(lock.tool_id, stats);

    // Log to monitoring
    Monitoring.logMetric("tool_usage", {
      tool_id: lock.tool_id,
      agent_id: lock.agent_id,
      duration_ms: duration,
      priority: lock.priority
    });
  }

  private createStats(toolId: string): ToolUsageStats {
    return {
      tool_id: toolId,
      usage_count: 0,
      total_usage_time_ms: 0,
      avg_usage_time_ms: 0,
      usage_history: []
    };
  }

  private initializeTools(): void {
    // Initialize all tools
    // See Tool Catalog section
  }
}

interface Tool {
  tool_id: string;
  name: string;
  description: string;
  category: ToolCategory;
  status: ToolStatus;
  current_usage: number;
  concurrent_limit: number;
  total_usage_count: number;
  allowed_agents?: string[];
  blocked_agents?: string[];
  parameters_schema?: any;
  health_check?: HealthCheck;
}

enum ToolCategory {
  EXCLUSIVE = "exclusive",            // Only one agent at a time
  SHARED = "shared",                  // Multiple agents concurrently
  POOL = "pool",                      // Limited concurrent usage
  AGENT_SPECIFIC = "agent_specific"   // Specific agents only
}

interface ToolLock {
  lock_id: string;
  tool_id: string;
  agent_id: string;
  task_id: string;
  granted_at: string;
  expires_at: string;
  priority: ToolPriority;
  extended_count: number;
}

interface HealthCheck {
  endpoint: string;
  interval_ms: number;
  timeout_ms: number;
  threshold: number;
}

interface ToolUsageStats {
  tool_id: string;
  usage_count: number;
  total_usage_time_ms: number;
  avg_usage_time_ms: number;
  usage_history: ToolUsageEntry[];
}

interface ToolUsageEntry {
  agent_id: string;
  started_at: string;
  duration_ms: number;
  priority: ToolPriority;
}
```

---

## Tool Sharing & Locking

### Lock Management

```typescript
class LockManager {
  private locks: Map<string, ToolLock> = new Map();
  private lockHierarchies: Map<string, string[]> = new Map();  // parent -> children

  // Acquire lock
  async acquireLock(
    toolId: string,
    agentId: string,
    taskId: string,
    options?: LockOptions
  ): Promise<LockResult> {
    const lockId = generateUUID();
    const lock: ToolLock = {
      lock_id: lockId,
      tool_id: toolId,
      agent_id: agentId,
      task_id: taskId,
      granted_at: new Date().toISOString(),
      expires_at: options?.expires_at || this.calculateExpiry(options?.duration_ms),
      priority: options?.priority || ToolPriority.MEDIUM,
      extended_count: 0,
      metadata: options?.metadata
    };

    this.locks.set(lockId, lock);

    return {
      success: true,
      lock_id: lockId,
      expires_at: lock.expires_at
    };
  }

  // Acquire lock with retry
  async acquireLockWithRetry(
    toolId: string,
    agentId: string,
    taskId: string,
    options?: LockOptions & { max_retries?: number; retry_delay_ms?: number }
  ): Promise<LockResult> {
    const maxRetries = options?.max_retries || 3;
    const retryDelay = options?.retry_delay_ms || 1000;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.acquireLock(toolId, agentId, taskId, options);
      } catch (error) {
        if (attempt === maxRetries - 1) {
          throw error;
        }

        await sleep(retryDelay * (attempt + 1));
      }
    }

    throw new Error("Failed to acquire lock after retries");
  }

  // Try acquire lock (non-blocking)
  async tryAcquireLock(
    toolId: string,
    agentId: string,
    taskId: string,
    options?: LockOptions
  ): Promise<LockResult> {
    try {
      // Check if lock already exists for this tool
      const existingLock = this.findLockForTool(toolId);

      if (existingLock && !this.isLockExpired(existingLock)) {
        return {
          success: false,
          error: "Tool is locked"
        };
      }

      return await this.acquireLock(toolId, agentId, taskId, options);
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  // Release lock
  async releaseLock(lockId: string): Promise<boolean> {
    const lock = this.locks.get(lockId);

    if (!lock) {
      return false;
    }

    this.locks.delete(lockId);

    // Release child locks
    const childLocks = this.lockHierarchies.get(lockId) || [];
    for (const childLockId of childLocks) {
      await this.releaseLock(childLockId);
    }

    this.lockHierarchies.delete(lockId);

    return true;
  }

  // Extend lock
  async extendLock(
    lockId: string,
    additionalDurationMs: number
  ): Promise<boolean> {
    const lock = this.locks.get(lockId);

    if (!lock) {
      return false;
    }

    const currentExpiry = new Date(lock.expires_at).getTime();
    const newExpiry = currentExpiry + additionalDurationMs;

    lock.expires_at = new Date(newExpiry).toISOString();
    lock.extended_count++;

    return true;
  }

  // Check lock status
  getLockStatus(lockId: string): LockStatus | undefined {
    const lock = this.locks.get(lockId);

    if (!lock) {
      return undefined;
    }

    return {
      lock_id: lock.lock_id,
      tool_id: lock.tool_id,
      agent_id: lock.agent_id,
      granted_at: lock.granted_at,
      expires_at: lock.expires_at,
      is_expired: this.isLockExpired(lock),
      extended_count: lock.extended_count
    };
  }

  // Find lock for tool
  private findLockForTool(toolId: string): ToolLock | undefined {
    for (const lock of this.locks.values()) {
      if (lock.tool_id === toolId && !this.isLockExpired(lock)) {
        return lock;
      }
    }

    return undefined;
  }

  // Check if lock is expired
  private isLockExpired(lock: ToolLock): boolean {
    const expiry = new Date(lock.expires_at).getTime();
    return Date.now() > expiry;
  }

  // Calculate expiry time
  private calculateExpiry(durationMs?: number): string {
    const duration = durationMs || 300000;  // Default 5 minutes
    return new Date(Date.now() + duration).toISOString();
  }
}

interface LockOptions {
  duration_ms?: number;
  expires_at?: string;
  priority?: ToolPriority;
  metadata?: any;
}

interface LockResult {
  success: boolean;
  lock_id?: string;
  expires_at?: string;
  error?: string;
}

interface LockStatus {
  lock_id: string;
  tool_id: string;
  agent_id: string;
  granted_at: string;
  expires_at: string;
  is_expired: boolean;
  extended_count: number;
}
```

### Deadlock Detection and Resolution

```typescript
class DeadlockDetector {
  private waitGraph: Map<string, string[]> = new Map();  // agent -> [tools waiting for]
  private lockGraph: Map<string, string> = new Map();   // tool -> agent holding

  // Register wait
  registerWait(agentId: string, toolId: string): void {
    if (!this.waitGraph.has(agentId)) {
      this.waitGraph.set(agentId, []);
    }

    this.waitGraph.get(agentId)!.push(toolId);
  }

  // Register lock
  registerLock(agentId: string, toolId: string): void {
    this.lockGraph.set(toolId, agentId);

    // Remove from wait graph
    const waiting = this.waitGraph.get(agentId) || [];
    const index = waiting.indexOf(toolId);

    if (index !== -1) {
      waiting.splice(index, 1);
    }
  }

  // Detect deadlock
  detectDeadlock(): DeadlockInfo | null {
    // Build agent dependency graph
    const agentDeps: Map<string, string[]> = new Map();

    for (const [agentId, waitingTools] of this.waitGraph.entries()) {
      agentDeps.set(agentId, []);

      for (const toolId of waitingTools) {
        const holdingAgent = this.lockGraph.get(toolId);

        if (holdingAgent && holdingAgent !== agentId) {
          agentDeps.get(agentId)!.push(holdingAgent);
        }
      }
    }

    // Detect cycle
    const cycle = this.detectCycle(agentDeps);

    if (cycle.length > 0) {
      return {
        detected: true,
        cycle: cycle,
        involved_agents: cycle,
        involved_tools: this.getInvolvedTools(cycle)
      };
    }

    return null;
  }

  // Detect cycle in graph
  private detectCycle(graph: Map<string, string[]>): string[] {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];

    const dfs = (agentId: string): boolean => {
      visited.add(agentId);
      recursionStack.add(agentId);
      path.push(agentId);

      const deps = graph.get(agentId) || [];

      for (const dep of deps) {
        if (!visited.has(dep)) {
          if (dfs(dep)) {
            return true;
          }
        } else if (recursionStack.has(dep)) {
          // Found cycle
          const cycleStart = path.indexOf(dep);
          return path.slice(cycleStart).concat(dep);
        }
      }

      path.pop();
      recursionStack.delete(agentId);
      return false;
    };

    for (const agentId of graph.keys()) {
      if (!visited.has(agentId)) {
        const result = dfs(agentId);

        if (typeof result === 'object' && result.length > 0) {
          return result;
        }
      }
    }

    return [];
  }

  // Get tools involved in deadlock
  private getInvolvedTools(agents: string[]): string[] {
    const tools: string[] = [];

    for (const agentId of agents) {
      const waitingTools = this.waitGraph.get(agentId) || [];
      tools.push(...waitingTools);

      for (const [toolId, holdingAgent] of this.lockGraph.entries()) {
        if (holdingAgent === agentId) {
          tools.push(toolId);
        }
      }
    }

    return [...new Set(tools)];
  }

  // Clear registration
  clearRegistrations(): void {
    this.waitGraph.clear();
    this.lockGraph.clear();
  }
}

interface DeadlockInfo {
  detected: boolean;
  cycle: string[];
  involved_agents: string[];
  involved_tools: string[];
}
```

---

## Tool Usage Optimization

### Usage Optimizer

```typescript
class ToolUsageOptimizer {
  private usagePatterns: Map<string, UsagePattern> = new Map();
  private recommendations: Map<string, OptimizationRecommendation[]> = new Map();

  // Analyze usage patterns
  async analyzeUsage(toolId: string, stats: ToolUsageStats): Promise<UsagePattern> {
    const history = stats.usage_history;

    // Analyze frequency
    const frequency = this.calculateFrequency(history);

    // Analyze duration
    const durationStats = this.calculateDurationStats(history);

    // Analyze peaks
    const peaks = this.identifyPeaks(history);

    // Analyze agents
    const agentUsage = this.analyzeAgentUsage(history);

    const pattern: UsagePattern = {
      tool_id: toolId,
      frequency,
      avg_duration_ms: durationStats.avg,
      p95_duration_ms: durationStats.p95,
      p99_duration_ms: durationStats.p99,
      peak_hours: peaks.hours,
      peak_agents: peaks.agents,
      top_users: agentUsage.top_users,
      usage_trend: this.calculateTrend(history),
      last_analyzed: new Date().toISOString()
    };

    this.usagePatterns.set(toolId, pattern);

    return pattern;
  }

  // Generate optimization recommendations
  async generateRecommendations(
    toolId: string,
    pattern: UsagePattern
  ): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];

    // Check if concurrent limit should be increased
    if (pattern.frequency.high && pattern.p95_duration_ms < 10000) {
      recommendations.push({
        type: "increase_capacity",
        priority: "medium",
        description: "Consider increasing concurrent limit due to high usage frequency",
        suggested_action: "Increase concurrent_limit to 3",
        estimated_improvement: "30% reduction in wait time"
      });
    }

    // Check if caching would help
    if (pattern.frequency.high && pattern.p95_duration_ms > 5000) {
      recommendations.push({
        type: "implement_cache",
        priority: "high",
        description: "Tool has high usage with long duration, caching would help",
        suggested_action: "Implement result caching for common requests",
        estimated_improvement: "50% reduction in response time"
      });
    }

    // Check for pre-warming
    if (pattern.frequency.high && pattern.peak_hours.length > 0) {
      recommendations.push({
        type: "pre_warm",
        priority: "medium",
        description: "Pre-warm tool before peak usage hours",
        suggested_action: `Pre-warm at ${pattern.peak_hours[0]}:00`,
        estimated_improvement: "20% reduction in initial latency"
      });
    }

    // Check for batching
    if (pattern.frequency.high && pattern.avg_duration_ms < 1000) {
      recommendations.push({
        type: "enable_batching",
        priority: "low",
        description: "Enable batch processing for high-frequency tool",
        suggested_action: "Implement batch API for multiple requests",
        estimated_improvement: "40% improvement in throughput"
      });
    }

    this.recommendations.set(toolId, recommendations);

    return recommendations;
  }

  // Optimize tool scheduling
  optimizeScheduling(
    toolId: string,
    requests: ToolRequest[]
  ): ToolRequest[] {
    const pattern = this.usagePatterns.get(toolId);

    if (!pattern) {
      return requests;
    }

    // Sort by priority
    requests.sort((a, b) => {
      const priorityOrder = {
        [ToolPriority.CRITICAL]: 0,
        [ToolPriority.HIGH]: 1,
        [ToolPriority.MEDIUM]: 2,
        [ToolPriority.LOW]: 3
      };

      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Group by agent to reduce context switching
    requests.sort((a, b) => a.agent_id.localeCompare(b.agent_id));

    return requests;
  }

  private calculateFrequency(history: ToolUsageEntry[]): FrequencyStats {
    const now = Date.now();
    const last24h = history.filter(h =>
      now - new Date(h.started_at).getTime() < 24 * 60 * 60 * 1000
    );

    const lastHour = last24h.filter(h =>
      now - new Date(h.started_at).getTime() < 60 * 60 * 1000
    );

    return {
      per_hour: lastHour.length,
      per_day: last24h.length,
      high: lastHour.length > 10
    };
  }

  private calculateDurationStats(history: ToolUsageEntry[]): DurationStats {
    const durations = history.map(h => h.duration_ms).sort((a, b) => a - b);

    const sum = durations.reduce((s, d) => s + d, 0);
    const avg = sum / durations.length;

    const p95Index = Math.floor(durations.length * 0.95);
    const p99Index = Math.floor(durations.length * 0.99);

    return {
      avg,
      min: durations[0],
      max: durations[durations.length - 1],
      p95: durations[p95Index],
      p99: durations[p99Index]
    };
  }

  private identifyPeaks(history: ToolUsageEntry[]): PeakAnalysis {
    const hourCounts: Record<number, number> = {};

    for (const entry of history) {
      const hour = new Date(entry.started_at).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }

    const sortedHours = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    const agentCounts: Record<string, number> = {};

    for (const entry of history) {
      agentCounts[entry.agent_id] = (agentCounts[entry.agent_id] || 0) + 1;
    }

    const sortedAgents = Object.entries(agentCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([agent]) => agent);

    return {
      hours: sortedHours,
      agents: sortedAgents
    };
  }

  private analyzeAgentUsage(history: ToolUsageEntry[]): AgentUsageAnalysis {
    const agentUsage: Record<string, { count: number; totalDuration: number }> = {};

    for (const entry of history) {
      if (!agentUsage[entry.agent_id]) {
        agentUsage[entry.agent_id] = { count: 0, totalDuration: 0 };
      }

      agentUsage[entry.agent_id].count++;
      agentUsage[entry.agent_id].totalDuration += entry.duration_ms;
    }

    const topUsers = Object.entries(agentUsage)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)
      .map(([agentId, data]) => ({
        agent_id: agentId,
        usage_count: data.count,
        avg_duration_ms: data.totalDuration / data.count
      }));

    return { top_users: topUsers };
  }

  private calculateTrend(history: ToolUsageEntry[]): "increasing" | "decreasing" | "stable" {
    if (history.length < 10) {
      return "stable";
    }

    // Split history in half and compare
    const half = Math.floor(history.length / 2);
    const firstHalf = history.slice(0, half);
    const secondHalf = history.slice(half);

    const firstAvgDuration = firstHalf.reduce((sum, h) => sum + h.duration_ms, 0) / firstHalf.length;
    const secondAvgDuration = secondHalf.reduce((sum, h) => sum + h.duration_ms, 0) / secondHalf.length;

    const change = (secondAvgDuration - firstAvgDuration) / firstAvgDuration;

    if (change > 0.1) {
      return "increasing";
    } else if (change < -0.1) {
      return "decreasing";
    }

    return "stable";
  }
}

interface UsagePattern {
  tool_id: string;
  frequency: FrequencyStats;
  avg_duration_ms: number;
  p95_duration_ms: number;
  p99_duration_ms: number;
  peak_hours: number[];
  peak_agents: string[];
  top_users: AgentUsage[];
  usage_trend: "increasing" | "decreasing" | "stable";
  last_analyzed: string;
}

interface FrequencyStats {
  per_hour: number;
  per_day: number;
  high: boolean;
}

interface DurationStats {
  avg: number;
  min: number;
  max: number;
  p95: number;
  p99: number;
}

interface PeakAnalysis {
  hours: number[];
  agents: string[];
}

interface AgentUsageAnalysis {
  top_users: AgentUsage[];
}

interface AgentUsage {
  agent_id: string;
  usage_count: number;
  avg_duration_ms: number;
}

interface OptimizationRecommendation {
  type: string;
  priority: "low" | "medium" | "high";
  description: string;
  suggested_action: string;
  estimated_improvement: string;
}
```

---

## Tool Performance Monitoring

### Performance Monitor

```typescript
class ToolPerformanceMonitor {
  private metrics: Map<string, ToolMetrics> = new Map();
  private alerts: Map<string, ToolAlert[]> = new Map();

  // Record metric
  recordMetric(toolId: string, metric: ToolMetric): void {
    if (!this.metrics.has(toolId)) {
      this.metrics.set(toolId, {
        tool_id: toolId,
        calls: [],
        errors: [],
        avg_response_time_ms: 0,
        error_rate: 0,
        uptime_percentage: 100,
        last_updated: new Date().toISOString()
      });
    }

    const toolMetrics = this.metrics.get(toolId)!;

    if (metric.type === "call") {
      toolMetrics.calls.push({
        timestamp: metric.timestamp,
        duration_ms: metric.duration_ms!,
        agent_id: metric.agent_id!,
        success: metric.success!
      });

      // Keep only last 1000 calls
      if (toolMetrics.calls.length > 1000) {
        toolMetrics.calls = toolMetrics.calls.slice(-1000);
      }
    } else if (metric.type === "error") {
      toolMetrics.errors.push({
        timestamp: metric.timestamp,
        error_code: metric.error_code!,
        error_message: metric.error_message!
      });

      // Keep only last 100 errors
      if (toolMetrics.errors.length > 100) {
        toolMetrics.errors = toolMetrics.errors.slice(-100);
      }
    }

    // Recalculate aggregated metrics
    this.recalculateMetrics(toolId);

    // Check for alerts
    this.checkAlerts(toolId);

    // Send to monitoring system
    Monitoring.logMetric("tool_performance", {
      tool_id: toolId,
      ...metric
    });
  }

  // Get metrics for tool
  getMetrics(toolId: string): ToolMetrics | undefined {
    return this.metrics.get(toolId);
  }

  // Get all metrics
  getAllMetrics(): ToolMetrics[] {
    return Array.from(this.metrics.values());
  }

  // Get health status
  getHealthStatus(toolId: string): HealthStatus {
    const metrics = this.metrics.get(toolId);

    if (!metrics) {
      return {
        tool_id: toolId,
        status: "unknown",
        uptime: 0,
        avg_response_time_ms: 0,
        error_rate: 0
      };
    }

    const successCalls = metrics.calls.filter(c => c.success).length;
    const uptime = metrics.calls.length > 0
      ? (successCalls / metrics.calls.length) * 100
      : 100;

    const status = uptime > 99.9 ? "healthy"
      : uptime > 95 ? "degraded"
      : "unhealthy";

    return {
      tool_id: toolId,
      status,
      uptime,
      avg_response_time_ms: metrics.avg_response_time_ms,
      error_rate: metrics.error_rate
    };
  }

  // Get all health statuses
  getAllHealthStatuses(): Record<string, HealthStatus> {
    const statuses: Record<string, HealthStatus> = {};

    for (const [toolId] of this.metrics.entries()) {
      statuses[toolId] = this.getHealthStatus(toolId);
    }

    return statuses;
  }

  // Set alert threshold
  setAlertThreshold(
    toolId: string,
    threshold: AlertThreshold
  ): void {
    if (!this.alerts.has(toolId)) {
      this.alerts.set(toolId, []);
    }
  }

  // Get alerts for tool
  getAlerts(toolId: string): ToolAlert[] {
    return this.alerts.get(toolId) || [];
  }

  // Recalculate aggregated metrics
  private recalculateMetrics(toolId: string): void {
    const metrics = this.metrics.get(toolId);

    if (!metrics) return;

    if (metrics.calls.length > 0) {
      const totalTime = metrics.calls.reduce((sum, c) => sum + c.duration_ms, 0);
      metrics.avg_response_time_ms = totalTime / metrics.calls.length;

      const errors = metrics.calls.filter(c => !c.success).length;
      metrics.error_rate = (errors / metrics.calls.length) * 100;
    }

    metrics.last_updated = new Date().toISOString();
  }

  // Check for alerts
  private checkAlerts(toolId: string): void {
    const metrics = this.metrics.get(toolId);

    if (!metrics) return;

    const alerts = this.alerts.get(toolId) || [];

    // Check error rate
    if (metrics.error_rate > 5) {
      const alert: ToolAlert = {
        alert_id: generateUUID(),
        tool_id: toolId,
        type: "high_error_rate",
        severity: "critical",
        message: `Error rate exceeds 5%: ${metrics.error_rate.toFixed(2)}%`,
        timestamp: new Date().toISOString(),
        value: metrics.error_rate
      };

      alerts.push(alert);
    }

    // Check response time
    if (metrics.avg_response_time_ms > 10000) {
      const alert: ToolAlert = {
        alert_id: generateUUID(),
        tool_id: toolId,
        type: "slow_response",
        severity: "warning",
        message: `Average response time exceeds 10s: ${metrics.avg_response_time_ms.toFixed(0)}ms`,
        timestamp: new Date().toISOString(),
        value: metrics.avg_response_time_ms
      };

      alerts.push(alert);
    }

    this.alerts.set(toolId, alerts);
  }
}

interface ToolMetrics {
  tool_id: string;
  calls: ToolCall[];
  errors: ToolError[];
  avg_response_time_ms: number;
  error_rate: number;
  uptime_percentage: number;
  last_updated: string;
}

interface ToolMetric {
  timestamp: string;
  type: "call" | "error";
  duration_ms?: number;
  agent_id?: string;
  success?: boolean;
  error_code?: string;
  error_message?: string;
}

interface ToolCall {
  timestamp: string;
  duration_ms: number;
  agent_id: string;
  success: boolean;
}

interface ToolError {
  timestamp: string;
  error_code: string;
  error_message: string;
}

interface HealthStatus {
  tool_id: string;
  status: "healthy" | "degraded" | "unhealthy" | "unknown";
  uptime: number;
  avg_response_time_ms: number;
  error_rate: number;
}

interface AlertThreshold {
  metric: string;
  operator: ">" | "<" | "=" | ">=" | "<=";
  value: number;
  severity: "warning" | "critical";
}

interface ToolAlert {
  alert_id: string;
  tool_id: string;
  type: string;
  severity: "warning" | "critical";
  message: string;
  timestamp: string;
  value: number;
}
```

---

## Tool Error Handling

### Error Handler

```typescript
class ToolErrorHandler {
  private errorHandlers: Map<string, ErrorHandler> = new Map();
  private errorHistory: Map<string, ToolError[]> = new Map();

  // Handle tool error
  async handleError(
    toolId: string,
    error: Error,
    context: ErrorContext
  ): Promise<ErrorHandlingResult> {
    // Record error
    await this.recordError(toolId, error, context);

    // Get error handler
    const handler = this.errorHandlers.get(toolId);

    if (!handler) {
      return this.defaultErrorHandler(error, context);
    }

    // Execute handler
    try {
      const result = await handler.handle(error, context);

      return result;
    } catch (handlerError) {
      return {
        handled: false,
        action: "handler_failed",
        message: `Error handler failed: ${handlerError.message}`,
        should_retry: false
      };
    }
  }

  // Register error handler
  registerErrorHandler(toolId: string, handler: ErrorHandler): void {
    this.errorHandlers.set(toolId, handler);
  }

  // Record error
  private async recordError(
    toolId: string,
    error: Error,
    context: ErrorContext
  ): Promise<void> {
    const toolError: ToolError = {
      timestamp: new Date().toISOString(),
      error_code: error.name,
      error_message: error.message,
      stack_trace: error.stack,
      context
    };

    if (!this.errorHistory.has(toolId)) {
      this.errorHistory.set(toolId, []);
    }

    const history = this.errorHistory.get(toolId)!;
    history.push(toolError);

    // Keep only last 100 errors
    if (history.length > 100) {
      history.shift();
    }

    // Log to monitoring
    Monitoring.logError("tool_error", {
      tool_id: toolId,
      error_code: error.name,
      error_message: error.message,
      agent_id: context.agent_id,
      task_id: context.task_id
    });
  }

  // Default error handler
  private defaultErrorHandler(
    error: Error,
    context: ErrorContext
  ): ErrorHandlingResult {
    // Analyze error type
    const errorType = this.classifyError(error);

    switch (errorType) {
      case "timeout":
        return {
          handled: true,
          action: "retry_with_backoff",
          message: "Tool timeout, will retry with exponential backoff",
          should_retry: true,
          retry_delay_ms: 5000
        };

      case "network":
        return {
          handled: true,
          action: "retry_with_backoff",
          message: "Network error, will retry with exponential backoff",
          should_retry: true,
          retry_delay_ms: 2000
        };

      case "permission":
        return {
          handled: true,
          action: "fail",
          message: "Permission denied, cannot retry",
          should_retry: false
        };

      case "resource":
        return {
          handled: true,
          action: "wait_and_retry",
          message: "Resource limit reached, will wait and retry",
          should_retry: true,
          retry_delay_ms: 10000
        };

      case "unknown":
      default:
        return {
          handled: false,
          action: "escalate",
          message: `Unknown error: ${error.message}`,
          should_retry: false
        };
    }
  }

  // Classify error type
  private classifyError(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes("timeout")) {
      return "timeout";
    }

    if (message.includes("network") || message.includes("connection")) {
      return "network";
    }

    if (message.includes("permission") || message.includes("unauthorized")) {
      return "permission";
    }

    if (message.includes("resource") || message.includes("limit")) {
      return "resource";
    }

    return "unknown";
  }
}

interface ErrorHandler {
  handle(error: Error, context: ErrorContext): Promise<ErrorHandlingResult>;
}

interface ErrorContext {
  tool_id: string;
  agent_id: string;
  task_id: string;
  parameters: any;
  attempt_count: number;
}

interface ErrorHandlingResult {
  handled: boolean;
  action: string;
  message: string;
  should_retry: boolean;
  retry_delay_ms?: number;
  fallback_tool?: string;
}
```

---

## Tool Fallback Strategies

### Fallback Manager

```typescript
class FallbackManager {
  private fallbackChains: Map<string, FallbackChain> = new Map();
  private toolStatus: Map<string, ToolStatus> = new Map();

  // Execute tool with fallback
  async executeWithFallback(
    toolId: string,
    agentId: string,
    task: ToolTask,
    options?: FallbackOptions
  ): Promise<FallbackResult> {
    const chain = this.fallbackChains.get(toolId);

    if (!chain) {
      // No fallback chain, just execute
      return {
        tool_id: toolId,
        success: false,
        result: null,
        error: "No fallback chain configured"
      };
    }

    // Execute primary tool
    let result = await this.executeTool(chain.primary_tool, agentId, task);

    // If success, return
    if (result.success) {
      return {
        tool_id: chain.primary_tool,
        success: true,
        result: result.data,
        used_fallback: false
      };
    }

    // Try fallbacks
    for (const fallbackTool of chain.fallbacks) {
      // Check if fallback is allowed
      if (options?.allowed_fallbacks && !options.allowed_fallbacks.includes(fallbackTool)) {
        continue;
      }

      // Check if fallback is available
      const status = this.toolStatus.get(fallbackTool);
      if (status === ToolStatus.OFFLINE || status === ToolStatus.ERROR) {
        continue;
      }

      // Execute fallback
      result = await this.executeTool(fallbackTool, agentId, task);

      if (result.success) {
        return {
          tool_id: fallbackTool,
          success: true,
          result: result.data,
          used_fallback: true,
          original_tool: chain.primary_tool
        };
      }
    }

    // All fallbacks failed
    return {
      tool_id: chain.primary_tool,
      success: false,
      result: null,
      error: "All tools in fallback chain failed",
      used_fallback: false
    };
  }

  // Register fallback chain
  registerFallbackChain(chain: FallbackChain): void {
    this.fallbackChains.set(chain.primary_tool, chain);
  }

  // Update tool status
  updateToolStatus(toolId: string, status: ToolStatus): void {
    this.toolStatus.set(toolId, status);
  }

  // Get fallback chain for tool
  getFallbackChain(toolId: string): FallbackChain | undefined {
    return this.fallbackChains.get(toolId);
  }

  // Execute tool
  private async executeTool(
    toolId: string,
    agentId: string,
    task: ToolTask
  ): Promise<ToolExecutionResult> {
    // Implementation would execute the tool
    return {
      tool_id,
      success: true,
      data: null
    };
  }
}

interface FallbackChain {
  primary_tool: string;
  fallbacks: string[];
  priority: "speed" | "quality" | "cost";
  fallback_conditions: FallbackCondition[];
}

interface FallbackCondition {
  tool_status: ToolStatus[];
  error_types: string[];
  max_retries?: number;
}

interface FallbackOptions {
  allowed_fallbacks?: string[];
  max_fallbacks?: number;
  timeout_ms?: number;
}

interface FallbackResult {
  tool_id: string;
  success: boolean;
  result: any;
  error?: string;
  used_fallback: boolean;
  original_tool?: string;
}

interface ToolTask {
  type: string;
  parameters: any;
}

interface ToolExecutionResult {
  tool_id: string;
  success: boolean;
  data: any;
  error?: string;
}
```

---

## Tool Catalog

### Standard Tools

```typescript
const TOOL_CATALOG: Tool[] = [
  // Design System Tools
  {
    tool_id: "figma-api",
    name: "Figma API",
    description: "Access Figma designs and components",
    category: ToolCategory.EXCLUSIVE,
    status: ToolStatus.AVAILABLE,
    current_usage: 0,
    concurrent_limit: 1,
    total_usage_count: 0,
    allowed_agents: ["FD-DS-02", "FD-UR-11"]
  },
  {
    tool_id: "storybook",
    name: "Storybook",
    description: "Develop and test UI components in isolation",
    category: ToolCategory.SHARED,
    status: ToolStatus.AVAILABLE,
    current_usage: 0,
    concurrent_limit: 5,
    total_usage_count: 0
  },

  // Performance Tools
  {
    tool_id: "lighthouse",
    name: "Lighthouse",
    description: "Run performance, accessibility, and SEO audits",
    category: ToolCategory.POOL,
    status: ToolStatus.AVAILABLE,
    current_usage: 0,
    concurrent_limit: 3,
    total_usage_count: 0
  },
  {
    tool_id: "webpagetest",
    name: "WebPageTest",
    description: "Detailed web performance testing",
    category: ToolCategory.EXCLUSIVE,
    status: ToolStatus.AVAILABLE,
    current_usage: 0,
    concurrent_limit: 1,
    total_usage_count: 0
  },

  // Accessibility Tools
  {
    tool_id: "axe-core",
    name: "Axe Core",
    description: "Accessibility testing engine",
    category: ToolCategory.SHARED,
    status: ToolStatus.AVAILABLE,
    current_usage: 0,
    concurrent_limit: 10,
    total_usage_count: 0,
    allowed_agents: ["FD-AX-05", "FD-DS-02", "FD-CD-03"]
  },
  {
    tool_id: "wave",
    name: "WAVE",
    description: "Web accessibility evaluation tool",
    category: ToolCategory.SHARED,
    status: ToolStatus.AVAILABLE,
    current_usage: 0,
    concurrent_limit: 5,
    total_usage_count: 0
  },

  // Testing Tools
  {
    tool_id: "jest",
    name: "Jest",
    description: "JavaScript testing framework",
    category: ToolCategory.POOL,
    status: ToolStatus.AVAILABLE,
    current_usage: 0,
    concurrent_limit: 5,
    total_usage_count: 0
  },
  {
    tool_id: "cypress",
    name: "Cypress",
    description: "End-to-end testing framework",
    category: ToolCategory.EXCLUSIVE,
    status: ToolStatus.AVAILABLE,
    current_usage: 0,
    concurrent_limit: 1,
    total_usage_count: 0
  },

  // Security Tools
  {
    tool_id: "snyk",
    name: "Snyk",
    description: "Security vulnerability scanner",
    category: ToolCategory.SHARED,
    status: ToolStatus.AVAILABLE,
    current_usage: 0,
    concurrent_limit: 5,
    total_usage_count: 0,
    allowed_agents: ["FD-SC-08", "FD-CD-03"]
  },
  {
    tool_id: "owasp-zap",
    name: "OWASP ZAP",
    description: "Web application security scanner",
    category: ToolCategory.EXCLUSIVE,
    status: ToolStatus.AVAILABLE,
    current_usage: 0,
    concurrent_limit: 1,
    total_usage_count: 0,
    allowed_agents: ["FD-SC-08"]
  },

  // Animation Tools
  {
    tool_id: "framer-motion",
    name: "Framer Motion",
    description: "React animation library",
    category: ToolCategory.SHARED,
    status: ToolStatus.AVAILABLE,
    current_usage: 0,
    concurrent_limit: 10,
    total_usage_count: 0,
    allowed_agents: ["FD-AN-09", "FD-CD-03"]
  },

  // Build Tools
  {
    tool_id: "vite",
    name: "Vite",
    description: "Next generation frontend build tool",
    category: ToolCategory.POOL,
    status: ToolStatus.AVAILABLE,
    current_usage: 0,
    concurrent_limit: 3,
    total_usage_count: 0
  },
  {
    tool_id: "webpack",
    name: "Webpack",
    description: "Module bundler for JavaScript",
    category: ToolCategory.POOL,
    status: ToolStatus.AVAILABLE,
    current_usage: 0,
    concurrent_limit: 3,
    total_usage_count: 0
  },

  // System Tools
  {
    tool_id: "context7",
    name: "Context7",
    description: "Documentation and knowledge management",
    category: ToolCategory.SHARED,
    status: ToolStatus.AVAILABLE,
    current_usage: 0,
    concurrent_limit: 50,
    total_usage_count: 0
  },
  {
    tool_id: "monitoring",
    name: "Monitoring System",
    description: "Performance monitoring and analytics",
    category: ToolCategory.SHARED,
    status: ToolStatus.AVAILABLE,
    current_usage: 0,
    concurrent_limit: 20,
    total_usage_count: 0
  }
];
```

---

## Implementation Checklist

- [ ] Implement ToolManager
- [ ] Implement LockManager
- [ ] Implement DeadlockDetector
- [ ] Implement ToolUsageOptimizer
- [ ] Implement ToolPerformanceMonitor
- [ ] Implement ToolErrorHandler
- [ ] Implement FallbackManager
- [ ] Add comprehensive error handling
- [ ] Create unit tests for all components
- [ ] Implement monitoring and metrics
- [ ] Add tool usage dashboard
- [ ] Create integration tests
- [ ] Document tool-specific workflows

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-03 | Initial release with complete tool delegation standards |

---

**Related Documents:**
- [Handoff Protocol Specification](./01-handoff-protocol-specification.md)
- [Context Sharing Architecture](./02-context-sharing-architecture.md)
- [Implementation Guide](./06-implementation-guide.md)
