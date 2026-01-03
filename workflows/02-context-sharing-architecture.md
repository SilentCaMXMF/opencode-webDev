# Context Sharing Architecture

**Version:** 1.0.0
**Architecture ID:** CSA-FD-2024-002
**Last Updated:** 2026-01-03

## Table of Contents

- [Overview](#overview)
- [Context Data Structures](#context-data-structures)
- [Context Versioning](#context-versioning)
- [Context Synchronization](#context-synchronization)
- [Context Conflict Resolution](#context-conflict-resolution)
- [Context Caching](#context-caching)
- [Context Access Control](#context-access-control)
- [Context Cleanup](#context-cleanup)
- [Performance Optimization](#performance-optimization)
- [API Reference](#api-reference)

---

## Overview

### Purpose

Provide a unified, efficient, and reliable context management system that enables seamless information sharing across all 11 agents in the Frontend Design Agent System.

### Goals

- **Consistency**: Maintain a single source of truth for project context
- **Performance**: Sub-200ms synchronization latency
- **Reliability**: Zero data loss during context transfers
- **Scalability**: Support 100+ concurrent context operations
- **Security**: Role-based access control for sensitive data
- **Auditability**: Complete history of all context changes

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Context Sharing Layer                     │
└─────────────────────────────────────────────────────────────┘
                              │
    ┌─────────────────────────┼─────────────────────────┐
    │                         │                         │
    ▼                         ▼                         ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Context     │    │  Context     │    │  Context     │
│  Manager     │    │  Versioning  │    │  Conflict    │
│              │    │  System      │    │  Resolver    │
└──────────────┘    └──────────────┘    └──────────────┘
    │                 │                 │
    └─────────────────┼─────────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
    ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Context     │  │  Context     │  │  Context     │
│  Cache       │  │  Synchronizer│  │  Cleanup     │
│              │  │              │  │  Service     │
└──────────────┘  └──────────────┘  └──────────────┘
    │                 │                 │
    └─────────────────┼─────────────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │   Agent Context      │
           │   Interfaces         │
           └──────────────────────┘
```

---

## Context Data Structures

### Core Context Model

```typescript
interface SharedContext {
  // Context Metadata
  meta: ContextMetadata;

  // Project Context
  project: ProjectContext;

  // Domain Contexts
  design: DesignContext;
  code: CodeContext;
  performance: PerformanceContext;
  accessibility: AccessibilityContext;
  testing: TestingContext;
  security: SecurityContext;
  animation: AnimationContext;
  i18n: I18nContext;
  ux: UXContext;

  // Agent-Specific Context
  agents: AgentContexts;
}

interface ContextMetadata {
  context_id: string;                // UUID v4
  version: string;                   // Semantic version
  created_at: string;                // ISO 8601
  created_by: string;                // Agent ID
  modified_at: string;               // ISO 8601
  modified_by: string;               // Agent ID
  checksum: string;                  // SHA-256 hash
  parent_version_id?: string;        // For version history
  tags: string[];                    // Searchable tags
  status: "active" | "archived" | "locked";
}

interface ProjectContext {
  name: string;
  description: string;
  repository: {
    url: string;
    branch: string;
    commit_hash: string;
    commit_message: string;
  };
  tech_stack: {
    frontend: string[];              // React, Vue, etc.
    backend?: string[];
    database?: string[];
    tools: string[];
  };
  team: {
    members: TeamMember[];
    stakeholders: string[];
  };
  timeline: {
    start_date: string;
    target_completion: string;
    milestones: Milestone[];
  };
}

interface DesignContext {
  system: {
    name: string;
    version: string;
    url?: string;                   // Figma, Storybook, etc.
  };

  tokens: {
    colors: ColorTokens;
    typography: TypographyTokens;
    spacing: SpacingTokens;
    sizing: SizingTokens;
    borders: BorderTokens;
    shadows: ShadowTokens;
    transitions: TransitionTokens;
    animations: AnimationTokens;
  };

  components: ComponentSpec[];
  patterns: DesignPattern[];
  layouts: LayoutSpec[];
  themes: ThemeConfig[];
}

interface CodeContext {
  structure: {
    src_dir: string;
    component_dir: string;
    asset_dir: string;
    test_dir: string;
  };

  language: {
    primary: string;                 // TypeScript, JavaScript, etc.
    version: string;
    tsconfig?: any;
  };

  framework: {
    name: string;                   // React, Vue, Angular, etc.
    version: string;
    config: Record<string, any>;
  };

  dependencies: {
    production: Record<string, string>;
    development: Record<string, string>;
    peer: Record<string, string>;
  };

  build: {
    tool: string;                   // Vite, Webpack, etc.
    config: Record<string, any>;
  };
}

interface PerformanceContext {
  budgets: PerformanceBudget;
  metrics: PerformanceMetrics;
  monitoring: PerformanceMonitoring;
  optimizations: OptimizationConfig;
}

interface AccessibilityContext {
  wcag_level: "A" | "AA" | "AAA";
  requirements: AccessibilityRequirement[];
  issues: AccessibilityIssue[];
  standards: AccessibilityStandard[];
  tools: AccessibilityTool[];
}

interface TestingContext {
  framework: string;
  config: TestConfig;
  suites: TestSuite[];
  coverage: CoverageConfig;
  reports: TestReport[];
}

interface SecurityContext {
  requirements: SecurityRequirement[];
  vulnerabilities: VulnerabilityReport[];
  policies: SecurityPolicy[];
  tools: SecurityTool[];
}

interface AnimationContext {
  library?: string;                 // Framer Motion, GSAP, etc.
  configurations: AnimationConfig[];
  timing: AnimationTiming;
  performance: AnimationPerformance;
}

interface I18nContext {
  default_locale: string;
  supported_locales: string[];
  translations: TranslationConfig;
  formatting: FormattingConfig;
  rtl_support: boolean;
}

interface UXContext {
  personas: UserPersona[];
  user_stories: UserStory[];
  research_findings: ResearchFinding[];
  analytics: UserAnalytics;
  feedback: UserFeedback[];
}

interface AgentContexts {
  [agent_id: string]: AgentSpecificContext;
}

interface AgentSpecificContext {
  preferences: Record<string, any>;
  recent_tasks: string[];
  expertise: string[];
  performance_history: PerformanceHistory;
  notes: string[];
}
```

### Specialized Context Types

```typescript
// Design System Context
interface ColorTokens {
  primary: {
    50: string; 100: string; 200: string; 300: string;
    400: string; 500: string; 600: string; 700: string;
    800: string; 900: string;
  };
  secondary: { /* same structure */ };
  neutral: { /* same structure */ };
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

interface TypographyTokens {
  font_family: {
    sans: string[];
    serif: string[];
    mono: string[];
  };
  font_size: {
    xs: string; sm: string; md: string;
    lg: string; xl: string; "2xl": string;
  };
  font_weight: {
    light: number; normal: number; medium: number;
    semibold: number; bold: number;
  };
  line_height: {
    tight: number; normal: number; relaxed: number;
  };
  letter_spacing: {
    tighter: string; tight: string;
    normal: string; wide: string;
  };
}

// Component Specifications
interface ComponentSpec {
  id: string;
  name: string;
  description: string;
  category: string;
  props: ComponentProp[];
  slots?: ComponentSlot[];
  events?: ComponentEvent[];
  variants: ComponentVariant[];
  examples: ComponentExample[];
  accessibility: ComponentA11y;
  performance: ComponentPerf;
}

interface ComponentProp {
  name: string;
  type: string;
  default?: any;
  required: boolean;
  description: string;
  validation?: PropValidation;
}

interface ComponentVariant {
  name: string;
  props: Record<string, any>;
  description: string;
}

// Performance Context
interface PerformanceBudget {
  lcp: number;                      // Largest Contentful Paint (ms)
  fid: number;                      // First Input Delay (ms)
  cls: number;                      // Cumulative Layout Shift
  tti: number;                      // Time to Interactive (ms)
  ttfb: number;                     // Time to First Byte (ms)
  fcp: number;                      // First Contentful Paint (ms)
  tbt: number;                      // Total Blocking Time (ms)
  si: number;                       // Speed Index (ms)
}

interface PerformanceMetrics {
  current: PerformanceBudget;
  historical: HistoricalMetric[];
  targets: PerformanceBudget;
  regressions: Regression[];
}

// Accessibility Context
interface AccessibilityRequirement {
  id: string;
  wcag_criteria: string;            // e.g., "WCAG 2.1 AA"
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed" | "failed";
  test_cases: string[];
}

interface AccessibilityIssue {
  id: string;
  type: string;
  severity: "critical" | "serious" | "moderate" | "minor";
  wcag_criteria: string;
  description: string;
  location: CodeLocation;
  discovered_at: string;
  discovered_by: string;
  status: "open" | "in_progress" | "resolved";
  resolution?: string;
}

interface CodeLocation {
  file: string;
  line: number;
  column: number;
  snippet?: string;
}
```

---

## Context Versioning

### Version Management

```typescript
class ContextVersionManager {
  private versions: Map<string, ContextVersion> = new Map();
  private branches: Map<string, ContextBranch> = new Map();
  private currentBranch: string = "main";

  // Create new version
  async createVersion(
    context: SharedContext,
    author: string,
    message: string
  ): Promise<ContextVersion> {
    const parentVersion = this.getCurrentVersion();

    const version: ContextVersion = {
      version_id: generateUUID(),
      context_id: context.meta.context_id,
      parent_version_id: parentVersion?.version_id,
      version_number: this.generateVersionNumber(),
      created_at: new Date().toISOString(),
      created_by: author,
      message: message,
      changes: this.detectChanges(parentVersion?.context, context),
      checksum: await this.calculateChecksum(context),
      branch: this.currentBranch
    };

    this.versions.set(version.version_id, version);
    await this.persistVersion(version);

    return version;
  }

  // Branch management
  async createBranch(name: string, fromVersion: string): Promise<ContextBranch> {
    const branch: ContextBranch = {
      name,
      created_at: new Date().toISOString(),
      created_by: getCurrentAgentId(),
      base_version_id: fromVersion,
      head_version_id: fromVersion,
      status: "active"
    };

    this.branches.set(name, branch);
    return branch;
  }

  async mergeBranch(
    sourceBranch: string,
    targetBranch: string
  ): Promise<MergeResult> {
    const source = this.branches.get(sourceBranch);
    const target = this.branches.get(targetBranch);

    if (!source || !target) {
      throw new Error("Branch not found");
    }

    // Get contexts
    const sourceContext = await this.loadContext(source.head_version_id);
    const targetContext = await this.loadContext(target.head_version_id);

    // Detect conflicts
    const conflicts = this.detectConflicts(sourceContext, targetContext);

    if (conflicts.length > 0) {
      return {
        success: false,
        conflicts,
        message: "Merge conflicts detected"
      };
    }

    // Merge contexts
    const mergedContext = this.mergeContexts(sourceContext, targetContext);

    // Create merge commit
    const mergeVersion = await this.createVersion(
      mergedContext,
      getCurrentAgentId(),
      `Merge ${sourceBranch} into ${targetBranch}`
    );

    // Update target branch
    target.head_version_id = mergeVersion.version_id;

    return {
      success: true,
      version_id: mergeVersion.version_id,
      message: "Merge successful"
    };
  }

  // Diff detection
  private detectChanges(
    oldContext?: SharedContext,
    newContext?: SharedContext
  ): ContextChange[] {
    if (!oldContext) {
      return [{
        type: "initial",
        path: "/",
        operation: "create",
        description: "Initial context creation"
      }];
    }

    const changes: ContextChange[] = [];
    const diff = this.deepDiff(oldContext, newContext);

    for (const change of diff) {
      changes.push({
        type: "modify",
        path: change.path,
        operation: change.operation,
        old_value: change.oldValue,
        new_value: change.newValue,
        description: this.generateChangeDescription(change)
      });
    }

    return changes;
  }

  // Deep diff algorithm
  private deepDiff(
    obj1: any,
    obj2: any,
    path: string = ""
  ): DiffResult[] {
    const changes: DiffResult[] = [];

    // Get all keys from both objects
    const keys = new Set([
      ...Object.keys(obj1 || {}),
      ...Object.keys(obj2 || {})
    ]);

    for (const key of keys) {
      const currentPath = path ? `${path}.${key}` : key;
      const val1 = obj1?.[key];
      const val2 = obj2?.[key];

      if (val1 === val2) {
        continue;
      }

      if (val1 === undefined) {
        changes.push({
          path: currentPath,
          operation: "add",
          newValue: val2
        });
      } else if (val2 === undefined) {
        changes.push({
          path: currentPath,
          operation: "remove",
          oldValue: val1
        });
      } else if (
        typeof val1 === "object" &&
        typeof val2 === "object" &&
        val1 !== null &&
        val2 !== null
      ) {
        // Recursively diff nested objects
        changes.push(...this.deepDiff(val1, val2, currentPath));
      } else {
        changes.push({
          path: currentPath,
          operation: "replace",
          oldValue: val1,
          newValue: val2
        });
      }
    }

    return changes;
  }

  private generateVersionNumber(): string {
    // Semantic versioning based on branch
    const currentVersion = this.getCurrentVersion();
    if (!currentVersion) {
      return "1.0.0";
    }

    const [major, minor, patch] = currentVersion.version_number.split(".").map(Number);
    return `${major}.${minor}.${patch + 1}`;
  }

  getCurrentVersion(): ContextVersion | undefined {
    const branch = this.branches.get(this.currentBranch);
    if (!branch) return undefined;
    return this.versions.get(branch.head_version_id);
  }

  async loadContext(versionId: string): Promise<SharedContext | undefined> {
    const version = this.versions.get(versionId);
    if (!version) return undefined;

    // Load from storage
    return await this.storage.load(version.context_id, version.version_id);
  }

  private async persistVersion(version: ContextVersion): Promise<void> {
    await this.storage.save(version);
  }

  private async calculateChecksum(context: SharedContext): Promise<string> {
    const serialized = JSON.stringify(context, Object.keys(context).sort());
    const buffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(serialized)
    );
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }
}

interface ContextVersion {
  version_id: string;
  context_id: string;
  version_number: string;
  parent_version_id?: string;
  created_at: string;
  created_by: string;
  message: string;
  changes: ContextChange[];
  checksum: string;
  branch: string;
}

interface ContextBranch {
  name: string;
  created_at: string;
  created_by: string;
  base_version_id: string;
  head_version_id: string;
  status: "active" | "merged" | "archived";
}

interface ContextChange {
  type: "initial" | "modify";
  path: string;
  operation: "create" | "add" | "remove" | "replace";
  old_value?: any;
  new_value?: any;
  description: string;
}

interface DiffResult {
  path: string;
  operation: "add" | "remove" | "replace";
  oldValue?: any;
  newValue?: any;
}

interface MergeResult {
  success: boolean;
  version_id?: string;
  conflicts?: Conflict[];
  message: string;
}
```

---

## Context Synchronization

### Synchronization Manager

```typescript
class ContextSynchronizer {
  private subscriptions: Map<string, ContextSubscription[]> = new Map();
  private syncQueue: SyncQueueItem[] = [];
  private isProcessing: boolean = false;

  // Subscribe to context changes
  subscribe(
    contextId: string,
    agentId: string,
    callback: SyncCallback
  ): string {
    const subscription: ContextSubscription = {
      subscription_id: generateUUID(),
      context_id: contextId,
      agent_id: agentId,
      callback: callback,
      subscribed_at: new Date().toISOString(),
      filters: {}
    };

    if (!this.subscriptions.has(contextId)) {
      this.subscriptions.set(contextId, []);
    }

    this.subscriptions.get(contextId)!.push(subscription);

    return subscription.subscription_id;
  }

  unsubscribe(subscriptionId: string): void {
    for (const [contextId, subs] of this.subscriptions.entries()) {
      const index = subs.findIndex(s => s.subscription_id === subscriptionId);
      if (index !== -1) {
        subs.splice(index, 1);
        if (subs.length === 0) {
          this.subscriptions.delete(contextId);
        }
        break;
      }
    }
  }

  // Broadcast context changes
  async broadcast(
    contextId: string,
    change: ContextChange,
    author: string
  ): Promise<BroadcastResult> {
    const subscriptions = this.subscriptions.get(contextId) || [];

    const results = await Promise.allSettled(
      subscriptions.map(sub => this.notifySubscriber(sub, change, author))
    );

    const successful = results.filter(r => r.status === "fulfilled").length;
    const failed = results.filter(r => r.status === "rejected").length;

    return {
      total_notifications: subscriptions.length,
      successful,
      failed,
      errors: results
        .filter(r => r.status === "rejected")
        .map(r => (r as PromiseRejectedResult).reason)
    };
  }

  private async notifySubscriber(
    subscription: ContextSubscription,
    change: ContextChange,
    author: string
  ): Promise<void> {
    // Check if change passes filters
    if (!this.passesFilters(change, subscription.filters)) {
      return;
    }

    // Call subscriber callback
    await subscription.callback({
      subscription_id: subscription.subscription_id,
      context_id: subscription.context_id,
      change: change,
      author: author,
      timestamp: new Date().toISOString()
    });
  }

  private passesFilters(change: ContextChange, filters: any): boolean {
    // Implement filter logic
    return true;
  }

  // Queue sync operation
  async queueSync(contextId: string, data: any): Promise<string> {
    const item: SyncQueueItem = {
      item_id: generateUUID(),
      context_id: contextId,
      data: data,
      queued_at: new Date().toISOString(),
      status: "queued",
      retry_count: 0
    };

    this.syncQueue.push(item);
    this.processQueue();

    return item.item_id;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.syncQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.syncQueue.length > 0) {
        const item = this.syncQueue.shift()!;

        try {
          await this.processSyncItem(item);
          item.status = "completed";
          item.completed_at = new Date().toISOString();
        } catch (error) {
          item.status = "failed";
          item.error = (error as Error).message;
          item.retry_count++;

          if (item.retry_count < 3) {
            // Retry later
            this.syncQueue.unshift(item);
            await sleep(1000 * item.retry_count);
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async processSyncItem(item: SyncQueueItem): Promise<void> {
    // Apply sync to all subscribed agents
    const subscriptions = this.subscriptions.get(item.context_id) || [];

    await Promise.all(
      subscriptions.map(sub =>
        this.notifySubscriber(
          sub,
          item.data.change,
          item.data.author
        )
      )
    );
  }
}

interface ContextSubscription {
  subscription_id: string;
  context_id: string;
  agent_id: string;
  callback: SyncCallback;
  subscribed_at: string;
  filters: {
    paths?: string[];
    types?: string[];
    agents?: string[];
  };
}

interface SyncCallback {
  (notification: SyncNotification): Promise<void> | void;
}

interface SyncNotification {
  subscription_id: string;
  context_id: string;
  change: ContextChange;
  author: string;
  timestamp: string;
}

interface SyncQueueItem {
  item_id: string;
  context_id: string;
  data: any;
  queued_at: string;
  status: "queued" | "processing" | "completed" | "failed";
  retry_count: number;
  error?: string;
  completed_at?: string;
}

interface BroadcastResult {
  total_notifications: number;
  successful: number;
  failed: number;
  errors: Error[];
}
```

---

## Context Conflict Resolution

### Conflict Detection

```typescript
class ConflictDetector {
  detectConflicts(
    base: SharedContext,
    local: SharedContext,
    remote: SharedContext
  ): Conflict[] {
    const conflicts: Conflict[] = [];

    // Detect conflicts in all context sections
    conflicts.push(...this.detectProjectConflicts(base.project, local.project, remote.project));
    conflicts.push(...this.detectDesignConflicts(base.design, local.design, remote.design));
    conflicts.push(...this.detectCodeConflicts(base.code, local.code, remote.code));
    conflicts.push(...this.detectPerformanceConflicts(base.performance, local.performance, remote.performance));
    conflicts.push(...this.detectAccessibilityConflicts(base.accessibility, local.accessibility, remote.accessibility));

    return conflicts;
  }

  private detectProjectConflicts(
    base: ProjectContext,
    local: ProjectContext,
    remote: ProjectContext
  ): Conflict[] {
    const conflicts: Conflict[] = [];

    // Check for conflicting tech stack changes
    if (
      JSON.stringify(local.tech_stack) !== JSON.stringify(base.tech_stack) &&
      JSON.stringify(remote.tech_stack) !== JSON.stringify(base.tech_stack) &&
      JSON.stringify(local.tech_stack) !== JSON.stringify(remote.tech_stack)
    ) {
      conflicts.push({
        id: generateUUID(),
        type: "tech_stack_conflict",
        severity: "high",
        path: "/project/tech_stack",
        base_value: base.tech_stack,
        local_value: local.tech_stack,
        remote_value: remote.tech_stack,
        description: "Both agents modified the tech stack",
        resolution_strategy: "manual"
      });
    }

    return conflicts;
  }

  private detectDesignConflicts(
    base: DesignContext,
    local: DesignContext,
    remote: DesignContext
  ): Conflict[] {
    const conflicts: Conflict[] = [];

    // Check for conflicting token changes
    const localTokens = this.flattenObject(local.tokens);
    const remoteTokens = this.flattenObject(remote.tokens);
    const baseTokens = this.flattenObject(base.tokens);

    for (const key of new Set([...Object.keys(localTokens), ...Object.keys(remoteTokens)])) {
      const localVal = localTokens[key];
      const remoteVal = remoteTokens[key];
      const baseVal = baseTokens[key];

      if (
        localVal !== undefined &&
        remoteVal !== undefined &&
        localVal !== remoteVal &&
        baseVal !== undefined &&
        localVal !== baseVal &&
        remoteVal !== baseVal
      ) {
        conflicts.push({
          id: generateUUID(),
          type: "token_conflict",
          severity: "medium",
          path: `/design/tokens/${key}`,
          base_value: baseVal,
          local_value: localVal,
          remote_value: remoteVal,
          description: `Token '${key}' has conflicting values`,
          resolution_strategy: "user_choice"
        });
      }
    }

    return conflicts;
  }

  private flattenObject(obj: any, prefix: string = ""): Record<string, any> {
    const result: Record<string, any> = {};

    for (const key in obj) {
      const path = prefix ? `${prefix}.${key}` : key;

      if (typeof obj[key] === "object" && obj[key] !== null) {
        Object.assign(result, this.flattenObject(obj[key], path));
      } else {
        result[path] = obj[key];
      }
    }

    return result;
  }
}

interface Conflict {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  path: string;
  base_value: any;
  local_value: any;
  remote_value: any;
  description: string;
  resolution_strategy: "auto" | "user_choice" | "manual" | "merge";
  auto_resolution?: any;
}
```

### Conflict Resolution

```typescript
class ConflictResolver {
  async resolveConflicts(
    conflicts: Conflict[],
    strategy: ResolutionStrategy
  ): Promise<ResolutionResult> {
    const resolutions: Map<string, any> = new Map();

    for (const conflict of conflicts) {
      let resolution: any;

      switch (conflict.resolution_strategy) {
        case "auto":
          resolution = this.autoResolve(conflict);
          break;

        case "user_choice":
          resolution = await this.promptUserChoice(conflict, strategy);
          break;

        case "manual":
          resolution = await this.manualResolve(conflict);
          break;

        case "merge":
          resolution = this.mergeValues(conflict);
          break;
      }

      resolutions.set(conflict.path, resolution);
    }

    return {
      resolved: true,
      resolutions: Object.fromEntries(resolutions),
      unresolved: []
    };
  }

  private autoResolve(conflict: Conflict): any {
    // Implement auto-resolution logic based on conflict type
    switch (conflict.type) {
      case "token_conflict":
        // Prefer the value with more semantic meaning
        if (conflict.severity === "low") {
          return conflict.local_value;
        }
        break;

      case "tech_stack_conflict":
        // Merge tech stacks
        return this.mergeTechStacks(conflict.base_value, conflict.local_value, conflict.remote_value);
    }

    // Default to base value
    return conflict.base_value;
  }

  private async promptUserChoice(
    conflict: Conflict,
    strategy: ResolutionStrategy
  ): Promise<any> {
    // Prompt user/agent for resolution
    const choices = [
      { value: conflict.local_value, label: "Accept local" },
      { value: conflict.remote_value, label: "Accept remote" },
      { value: conflict.base_value, label: "Accept base" }
    ];

    if (strategy.default_choice) {
      return strategy.default_choice;
    }

    // In production, this would prompt via UI or API
    return conflict.local_value; // Default to local
  }

  private async manualResolve(conflict: Conflict): Promise<any> {
    // Create a manual resolution task
    const resolution = await this.createManualResolutionTask(conflict);
    return resolution.value;
  }

  private mergeValues(conflict: Conflict): any {
    // Attempt to merge values
    if (typeof conflict.local_value === "object" &&
        typeof conflict.remote_value === "object") {
      return {
        ...conflict.base_value,
        ...conflict.local_value,
        ...conflict.remote_value
      };
    }

    // Can't merge, use local
    return conflict.local_value;
  }

  private mergeTechStacks(base: any, local: any, remote: any): any {
    return {
      ...base,
      frontend: [...new Set([...base.frontend, ...local.frontend, ...remote.frontend])],
      tools: [...new Set([...base.tools, ...local.tools, ...remote.tools])]
    };
  }

  private async createManualResolutionTask(conflict: Conflict): Promise<{ value: any }> {
    // Create task for manual resolution
    return { value: conflict.local_value };
  }
}

interface ResolutionStrategy {
  auto_resolve: boolean;
  prefer: "local" | "remote" | "base";
  default_choice?: any;
  timeout_ms?: number;
}

interface ResolutionResult {
  resolved: boolean;
  resolutions: Record<string, any>;
  unresolved: string[];
}
```

---

## Context Caching

### Cache Manager

```typescript
class ContextCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number = 1000;  // Max number of entries
  private maxAge: number = 300000; // 5 minutes

  get(key: string): SharedContext | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // Check if expired
    if (Date.now() - entry.cached_at > this.maxAge) {
      this.cache.delete(key);
      return undefined;
    }

    entry.last_accessed = Date.now();
    entry.hit_count++;

    return entry.value;
  }

  set(key: string, value: SharedContext): void {
    // Evict if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      key,
      value,
      cached_at: Date.now(),
      last_accessed: Date.now(),
      hit_count: 0,
      size: JSON.stringify(value).length
    });
  }

  invalidate(key: string): boolean {
    return this.cache.delete(key);
  }

  invalidatePattern(pattern: string): number {
    let count = 0;
    const regex = new RegExp(pattern);

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): CacheStats {
    return {
      size: this.cache.size,
      max_size: this.maxSize,
      hit_count: Array.from(this.cache.values()).reduce((sum, e) => sum + e.hit_count, 0),
      miss_count: 0,  // Track separately
      total_size_bytes: Array.from(this.cache.values()).reduce((sum, e) => sum + e.size, 0)
    };
  }

  private evictLRU(): void {
    let oldestKey: string | undefined;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.last_accessed < oldestTime) {
        oldestTime = entry.last_accessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}

interface CacheEntry {
  key: string;
  value: SharedContext;
  cached_at: number;
  last_accessed: number;
  hit_count: number;
  size: number;
}

interface CacheStats {
  size: number;
  max_size: number;
  hit_count: number;
  miss_count: number;
  total_size_bytes: number;
}
```

---

## Context Access Control

### Access Control Manager

```typescript
class AccessControlManager {
  private permissions: Map<string, PermissionSet> = new Map();
  private roles: Map<string, Role> = new Map();

  constructor() {
    this.initializeDefaultRoles();
  }

  async checkPermission(
    agentId: string,
    contextId: string,
    action: string,
    path: string
  ): Promise<boolean> {
    const role = await this.getAgentRole(agentId);
    if (!role) return false;

    return role.permissions.some(p =>
      p.contexts.includes(contextId) &&
      p.actions.includes(action) &&
      this.pathMatches(p.path_pattern, path)
    );
  }

  async grantPermission(
    agentId: string,
    permission: Permission
  ): Promise<void> {
    const existing = this.permissions.get(agentId);

    if (existing) {
      existing.permissions.push(permission);
    } else {
      this.permissions.set(agentId, {
        agent_id: agentId,
        permissions: [permission],
        granted_at: new Date().toISOString()
      });
    }
  }

  private async getAgentRole(agentId: string): Promise<Role | undefined> {
    // Map agent IDs to roles
    const roleMapping: Record<string, string> = {
      "FD-ORC-01": "orchestrator",
      "FD-DS-02": "specialist",
      "FD-CD-03": "specialist",
      "FD-PO-04": "specialist",
      "FD-AX-05": "specialist",
      "FD-CP-06": "specialist",
      "FD-TQ-07": "specialist",
      "FD-SC-08": "specialist",
      "FD-AN-09": "specialist",
      "FD-I1-10": "specialist",
      "FD-UR-11": "specialist"
    };

    const roleName = roleMapping[agentId];
    return this.roles.get(roleName);
  }

  private pathMatches(pattern: string, path: string): boolean {
    // Simple wildcard matching
    const regexPattern = pattern
      .replace(/\*/g, ".*")
      .replace(/\?/g, ".");

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  }

  private initializeDefaultRoles(): void {
    // Orchestrator role - full access
    this.roles.set("orchestrator", {
      name: "Orchestrator",
      permissions: [
        {
          contexts: ["*"],
          actions: ["read", "write", "delete", "share", "lock"],
          path_pattern: "*"
        }
      ]
    });

    // Specialist role - limited to their domain
    this.roles.set("specialist", {
      name: "Specialist",
      permissions: [
        {
          contexts: ["*"],
          actions: ["read"],
          path_pattern: "*"
        },
        {
          contexts: ["*"],
          actions: ["write"],
          path_pattern: "/agents/{agent_id}/*"
        }
      ]
    });
  }
}

interface PermissionSet {
  agent_id: string;
  permissions: Permission[];
  granted_at: string;
}

interface Permission {
  contexts: string[];
  actions: string[];
  path_pattern: string;
}

interface Role {
  name: string;
  permissions: Permission[];
}
```

---

## Context Cleanup

### Cleanup Service

```typescript
class ContextCleanupService {
  private cleanupTasks: CleanupTask[] = [];

  // Schedule cleanup task
  scheduleCleanup(task: CleanupTask): void {
    this.cleanupTasks.push(task);

    setTimeout(async () => {
      await this.executeCleanup(task);
    }, task.delay_ms);
  }

  private async executeCleanup(task: CleanupTask): Promise<CleanupResult> {
    const result: CleanupResult = {
      task_id: task.task_id,
      executed_at: new Date().toISOString(),
      success: true,
      deleted_items: [],
      errors: []
    };

    try {
      switch (task.type) {
        case "expired_versions":
          result.deleted_items = await this.cleanupExpiredVersions(task);
          break;

        case "unused_contexts":
          result.deleted_items = await this.cleanupUnusedContexts(task);
          break;

        case "orphaned_subscriptions":
          result.deleted_items = await this.cleanupOrphanedSubscriptions(task);
          break;

        case "cache_clear":
          result.deleted_items = await this.clearCache(task);
          break;
      }
    } catch (error) {
      result.success = false;
      result.errors.push((error as Error).message);
    }

    return result;
  }

  private async cleanupExpiredVersions(task: CleanupTask): Promise<string[]> {
    const deleted: string[] = [];
    const threshold = Date.now() - (task.params?.age_ms || 7 * 24 * 60 * 60 * 1000);

    // Get all versions
    const versions = await this.getAllVersions();

    for (const version of versions) {
      // Check if expired
      const created = new Date(version.created_at).getTime();
      if (created < threshold) {
        // Delete if not the current version
        if (!this.isCurrentVersion(version.version_id)) {
          await this.deleteVersion(version.version_id);
          deleted.push(version.version_id);
        }
      }
    }

    return deleted;
  }

  private async cleanupUnusedContexts(task: CleanupTask): Promise<string[]> {
    const deleted: string[] = [];
    const threshold = Date.now() - (task.params?.age_ms || 30 * 24 * 60 * 60 * 1000);

    const contexts = await this.getAllContexts();

    for (const context of contexts) {
      const lastAccess = new Date(context.meta.modified_at).getTime();
      if (lastAccess < threshold && context.meta.status === "active") {
        // Archive context
        context.meta.status = "archived";
        await this.saveContext(context);
        deleted.push(context.meta.context_id);
      }
    }

    return deleted;
  }

  private async cleanupOrphanedSubscriptions(task: CleanupTask): Promise<string[]> {
    const deleted: string[] = [];

    // Get all subscriptions
    const subscriptions = await this.getAllSubscriptions();

    for (const sub of subscriptions) {
      // Check if context still exists
      const context = await this.getContext(sub.context_id);
      if (!context) {
        await this.removeSubscription(sub.subscription_id);
        deleted.push(sub.subscription_id);
      }
    }

    return deleted;
  }

  private async clearCache(task: CleanupTask): Promise<string[]> {
    const cache = new ContextCache();
    cache.clear();
    return ["cache_cleared"];
  }

  private isCurrentVersion(versionId: string): boolean {
    // Check if version is the head of any branch
    return false;  // Implement
  }

  private async getAllVersions(): Promise<any[]> { return []; }
  private async getAllContexts(): Promise<any[]> { return []; }
  private async deleteVersion(versionId: string): Promise<void> {}
  private async getAllSubscriptions(): Promise<any[]> { return []; }
  private async removeSubscription(subId: string): Promise<void> {}
  private async getContext(contextId: string): Promise<any> { return null; }
  private async saveContext(context: SharedContext): Promise<void> {}
}

interface CleanupTask {
  task_id: string;
  type: "expired_versions" | "unused_contexts" | "orphaned_subscriptions" | "cache_clear";
  delay_ms: number;
  params?: {
    age_ms?: number;
    context_id?: string;
  };
}

interface CleanupResult {
  task_id: string;
  executed_at: string;
  success: boolean;
  deleted_items: string[];
  errors: string[];
}
```

---

## Performance Optimization

### Optimization Strategies

```typescript
class ContextOptimizer {
  // Optimize context for transmission
  optimizeForTransmission(context: SharedContext): OptimizedContext {
    // Remove unnecessary fields
    const optimized = this.stripUnnecessaryFields(context);

    // Compress large objects
    const compressed = this.compressLargeObjects(optimized);

    // Use efficient encoding
    const encoded = this.encode(compressed);

    return {
      optimized_context: encoded,
      original_size: JSON.stringify(context).length,
      optimized_size: JSON.stringify(encoded).length,
      compression_ratio: JSON.stringify(encoded).length / JSON.stringify(context).length
    };
  }

  private stripUnnecessaryFields(context: SharedContext): SharedContext {
    const stripped = JSON.parse(JSON.stringify(context));

    // Remove audit history (for transmission)
    delete stripped.meta;

    // Remove cached data
    if (stripped.agents) {
      for (const agentId in stripped.agents) {
        delete stripped.agents[agentId].performance_history;
      }
    }

    return stripped;
  }

  private compressLargeObjects(context: SharedContext): SharedContext {
    // Compress large arrays and objects
    if (context.design?.tokens) {
      context.design.tokens = this.compressTokens(context.design.tokens);
    }

    if (context.testing?.suites) {
      context.testing.suites = this.compressSuites(context.testing.suites);
    }

    return context;
  }

  private compressTokens(tokens: any): any {
    // Token compression algorithm
    // Group similar values, use references, etc.
    return tokens;  // Implement actual compression
  }

  private compressSuites(suites: any[]): any[] {
    // Test suite compression
    return suites;  // Implement actual compression
  }

  private encode(context: SharedContext): EncodedContext {
    // Use efficient encoding (e.g., protobuf, msgpack)
    return {
      format: "json",
      data: context
    };
  }
}

interface OptimizedContext {
  optimized_context: EncodedContext;
  original_size: number;
  optimized_size: number;
  compression_ratio: number;
}

interface EncodedContext {
  format: "json" | "protobuf" | "msgpack";
  data: any;
}
```

### Performance Metrics

```typescript
interface ContextPerformanceMetrics {
  // Read operations
  read_count: number;
  read_avg_duration_ms: number;
  read_p95_duration_ms: number;
  read_p99_duration_ms: number;

  // Write operations
  write_count: number;
  write_avg_duration_ms: number;
  write_p95_duration_ms: number;
  write_p99_duration_ms: number;

  // Sync operations
  sync_count: number;
  sync_avg_duration_ms: number;
  sync_success_rate: number;

  // Cache
  cache_hit_rate: number;
  cache_miss_count: number;

  // Conflict resolution
  conflict_count: number;
  conflict_resolved: number;
  conflict_avg_resolution_time_ms: number;

  // Memory
  context_count: number;
  version_count: number;
  total_memory_bytes: number;
}
```

---

## API Reference

### Context Manager API

```typescript
class ContextManager {
  // Context lifecycle
  createContext(context: SharedContext): Promise<string>;
  getContext(contextId: string): Promise<SharedContext | undefined>;
  updateContext(contextId: string, updates: any): Promise<SharedContext>;
  deleteContext(contextId: string): Promise<boolean>;

  // Version management
  createVersion(contextId: string, message: string): Promise<ContextVersion>;
  getVersion(versionId: string): Promise<ContextVersion | undefined>;
  rollback(versionId: string): Promise<SharedContext>;

  // Synchronization
  subscribe(contextId: string, callback: SyncCallback): string;
  unsubscribe(subscriptionId: string): void;
  broadcast(contextId: string, change: ContextChange): Promise<BroadcastResult>;

  // Conflict resolution
  detectConflicts(base: SharedContext, local: SharedContext, remote: SharedContext): Conflict[];
  resolveConflicts(conflicts: Conflict[], strategy: ResolutionStrategy): Promise<ResolutionResult>;

  // Caching
  getFromCache(key: string): SharedContext | undefined;
  setInCache(key: string, context: SharedContext): void;
  invalidateCache(key?: string): void;

  // Access control
  checkPermission(agentId: string, contextId: string, action: string, path: string): Promise<boolean>;
  grantPermission(agentId: string, permission: Permission): Promise<void>;

  // Cleanup
  scheduleCleanup(task: CleanupTask): void;

  // Performance
  getMetrics(): ContextPerformanceMetrics;
}
```

### Usage Example

```typescript
// Initialize context manager
const contextManager = new ContextManager();

// Create a new context
const context: SharedContext = {
  meta: {
    context_id: generateUUID(),
    version: "1.0.0",
    created_at: new Date().toISOString(),
    created_by: "FD-ORC-01",
    modified_at: new Date().toISOString(),
    modified_by: "FD-ORC-01",
    checksum: "",
    status: "active",
    tags: []
  },
  project: { /* ... */ },
  design: { /* ... */ },
  // ... other contexts
  agents: {}
};

await contextManager.createContext(context);

// Subscribe to changes
const subscriptionId = contextManager.subscribe(
  context.meta.context_id,
  async (notification) => {
    console.log(`Change detected: ${notification.change.description}`);
    // React to change
  }
);

// Update context
const updates = {
  design: {
    tokens: {
      colors: {
        primary: { 500: "#007bff" }
      }
    }
  }
};

await contextManager.updateContext(context.meta.context_id, updates);

// Unsubscribe when done
contextManager.unsubscribe(subscriptionId);
```

---

## Implementation Checklist

- [ ] Implement SharedContext interface
- [ ] Implement ContextVersionManager
- [ ] Implement ContextSynchronizer
- [ ] Implement ConflictDetector
- [ ] Implement ConflictResolver
- [ ] Implement ContextCache
- [ ] Implement AccessControlManager
- [ ] Implement ContextCleanupService
- [ ] Implement ContextOptimizer
- [ ] Add comprehensive error handling
- [ ] Create unit tests for all components
- [ ] Implement monitoring and metrics
- [ ] Add performance benchmarks
- [ ] Document API endpoints
- [ ] Create integration tests

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-03 | Initial release with complete context sharing architecture |

---

**Related Documents:**
- [Handoff Protocol Specification](./01-handoff-protocol-specification.md)
- [Conflict Resolution Framework](./03-conflict-resolution-framework.md)
- [Implementation Guide](./06-implementation-guide.md)
