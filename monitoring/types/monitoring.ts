/**
 * Agent Type Definition
 * Represents one of the 11 agents in the Frontend Design Agent System
 */
export enum AgentType {
  ORCHESTRATOR = 'orchestrator',
  DESIGN_SYSTEM = 'design-system',
  COMPONENT_DEVELOPER = 'component-developer',
  PERFORMANCE_OPTIMIZER = 'performance-optimizer',
  ACCESSIBILITY = 'accessibility',
  CROSS_PLATFORM = 'cross-platform',
  TESTING_QA = 'testing-qa',
  SECURITY = 'security',
  ANIMATION = 'animation',
  I18N = 'i18n',
  UX_RESEARCH = 'ux-research'
}

/**
 * Agent Status
 */
export enum AgentStatus {
  ACTIVE = 'active',
  IDLE = 'idle',
  ERROR = 'error',
  PROCESSING = 'processing',
  OFFLINE = 'offline'
}

/**
 * Performance Metric Types
 */
export enum MetricType {
  // Agent Metrics
  AGENT_RESPONSE_TIME = 'agent_response_time',
  AGENT_TASK_COMPLETION = 'agent_task_completion',
  AGENT_ERROR_RATE = 'agent_error_rate',
  AGENT_CONTEXT7_QUERY = 'agent_context7_query',
  AGENT_TOOL_USAGE = 'agent_tool_usage',
  AGENT_COORDINATION = 'agent_coordination',

  // Context Engineering Metrics (ROADMAP Phase 1)
  CONTEXT_HIT_RATE = 'context_hit_rate',
  CONTEXT_SEARCH_LATENCY = 'context_search_latency',
  CONTEXT_CONFIDENCE_SCORE = 'context_confidence_score',
  CONTEXT_CORRUPTION = 'context_corruption',
  CONTEXT_REPOSITORY_SIZE = 'context_repository_size',

  // Workflow Metrics (ROADMAP Phase 1)
  WORKFLOW_EXECUTION = 'workflow_execution',
  WORKFLOW_STAGE_TRANSITION = 'workflow_stage_transition',
  QUALITY_GATE_COMPLIANCE = 'quality_gate_compliance',
  EVIDENCE_COLLECTION = 'evidence_collection',
  WORKFLOW_DEVIATION = 'workflow_deviation',
  HANDOFF_LATENCY = 'handoff_latency',
  ESCALATION_RATE = 'escalation_rate',

  // Provider Adapter Metrics (ROADMAP Phase 3)
  PROVIDER_REQUESTS = 'provider_requests',
  PROVIDER_RESPONSE_TIME = 'provider_response_time',
  PROVIDER_ERROR_RATE = 'provider_error_rate',
  MODEL_SELECTION = 'model_selection',
  MODEL_MIGRATION = 'model_migration',
  PROVIDER_AVAILABILITY = 'provider_availability',

  // Evidence-Based Delivery Metrics (ROADMAP Phase 3)
  EVIDENCE_ARTIFACTS = 'evidence_artifacts',
  EVIDENCE_VALIDATION = 'evidence_validation',
  COMPLIANCE_SCORE = 'compliance_score',
  QUALITY_GATE_PASS_RATE = 'quality_gate_pass_rate',
  AUTO_APPROVAL_RATE = 'auto_approval_rate',

  // Application Metrics
  CORE_WEB_VITALS = 'core_web_vitals',
  JAVASCRIPT_PERFORMANCE = 'javascript_performance',
  BUNDLE_SIZE = 'bundle_size',
  API_RESPONSE_TIME = 'api_response_time',
  RENDERING_PERFORMANCE = 'rendering_performance',
  MEMORY_USAGE = 'memory_usage',

  // System Metrics
  SYSTEM_HEALTH = 'system_health',
  DATABASE_PERFORMANCE = 'database_performance',
  CACHE_PERFORMANCE = 'cache_performance'
}

/**
 * Core Web Vitals Types
 */
export enum CoreWebVital {
  LCP = 'lcp', // Largest Contentful Paint
  FID = 'fid', // First Input Delay
  CLS = 'cls', // Cumulative Layout Shift
  FCP = 'fcp', // First Contentful Paint
  TTI = 'tti'  // Time to Interactive
}

/**
 * Agent Performance Metrics
 */
export interface AgentMetrics {
  agentType: AgentType;
  agentId: string;
  timestamp: Date;
  status: AgentStatus;
  metrics: {
    responseTime: number; // milliseconds
    taskCompletionRate: number; // percentage
    errorRate: number; // percentage
    activeTasks: number;
    completedTasks: number;
    failedTasks: number;
    context7Queries: {
      count: number;
      avgResponseTime: number;
      successRate: number;
    };
    toolUsage: Record<string, number>;
    coordinationMetrics: {
      handoffsReceived: number;
      handoffsSent: number;
      avgHandoffTime: number;
    };
    // Context Engineering Metrics (ROADMAP Phase 1)
    contextMetrics: {
      hitRate: number; // percentage
      searchLatency: number; // milliseconds
      confidenceScore: number; // 0-1
      relevantContexts: number;
      contextQualityScore: number; // 0-1
    };
    // Workflow Metrics (ROADMAP Phase 1)
    workflowMetrics: {
      currentStage: string;
      stageProgress: number; // 0-1
      evidenceCollected: number;
      qualityGatesPassed: number;
      deviationsCount: number;
      avgExecutionTime: number; // milliseconds
    };
    
    // Provider Adapter Metrics (ROADMAP Phase 3)
    providerMetrics: {
      providerId: string;
      tier: string;
      requestsTotal: number;
      avgResponseTime: number;
      successRate: number;
      errorRate: number;
      tokensUsed: number;
    };
    
    // Evidence-Based Delivery Metrics (ROADMAP Phase 3)
    evidenceMetrics: {
      artifactsCollected: number;
      validationScore: number;
      complianceScore: number;
      qualityGatePassRate: number;
      autoApprovalRate: number;
    };
  };
}

/**
 * Core Web Vitals Data
 */
export interface CoreWebVitalsData {
  timestamp: Date;
  url: string;
  sessionId: string;
  metrics: {
    lcp?: number; // < 2.5s good
    fid?: number; // < 100ms good
    cls?: number; // < 0.1 good
    fcp?: number;
    tti?: number;
  };
  performanceScore: number; // 0-100
}

/**
 * Application Performance Metrics
 */
export interface AppMetrics {
  timestamp: Date;
  sessionId: string;
  url: string;
  metrics: {
    javascript: {
      executionTime: number;
      parsingTime: number;
      compilationTime: number;
      mainThreadBlocking: number;
    };
    bundle: {
      totalSize: number;
      gzippedSize: number;
      chunkCount: number;
      largestChunk: number;
    };
    rendering: {
      firstPaint: number;
      domContentLoaded: number;
      loadComplete: number;
      fps: number;
    };
    memory: {
      used: number;
      limit: number;
      jsHeapSize: number;
    };
  };
}

/**
 * Alert Types
 */
export enum AlertSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

export enum AlertType {
  PERFORMANCE_THRESHOLD = 'performance_threshold',
  AGENT_ANOMALY = 'agent_anomaly',
  SYSTEM_HEALTH = 'system_health',
  CORE_WEB_VITALS = 'core_web_vitals',
  ERROR_RATE = 'error_rate',
  // Context Engineering Alerts (ROADMAP Phase 1)
  CONTEXT_CORRUPTION = 'context_corruption',
  CONTEXT_HIT_RATE_LOW = 'context_hit_rate_low',
  // Workflow Alerts (ROADMAP Phase 1)
  WORKFLOW_FAILURE = 'workflow_failure',
  QUALITY_GATE_FAILURE = 'quality_gate_failure',
  HANDOFF_DELAY = 'handoff_delay',
  ESCALATION_SPIKE = 'escalation_spike',

  // Provider Adapter Alerts (ROADMAP Phase 3)
  PROVIDER_ERROR = 'provider_error',
  MODEL_MIGRATION_FAILED = 'model_migration_failed',
  PROVIDER_DEGRADATION = 'provider_degradation',

  // Evidence-Based Delivery Alerts (ROADMAP Phase 3)
  EVIDENCE_COLLECTION_FAILED = 'evidence_collection_failed',
  COMPLIANCE_VIOLATION = 'compliance_violation',
  QUALITY_GATE_BLOCKED = 'quality_gate_blocked',
  CUSTOM = 'custom'
}

/**
 * Alert Definition
 */
export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: Date;
  agentType?: AgentType;
  metricType: MetricType;
  currentValue: number;
  threshold: number;
  metadata?: Record<string, any>;
  acknowledged: boolean;
  resolved: boolean;
  resolvedAt?: Date;
}

/**
 * Alert Rule
 */
export interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  metricType: MetricType;
  agentType?: AgentType;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  threshold: number;
  duration: number; // seconds
  severity: AlertSeverity;
  notificationChannels: string[];
  metadata?: Record<string, any>;
}

/**
 * System Health Status
 */
export interface SystemHealth {
  timestamp: Date;
  status: 'healthy' | 'degraded' | 'unhealthy';
  components: {
    database: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      responseTime: number;
      connections: number;
    };
    cache: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      hitRate: number;
      memoryUsage: number;
    };
    collector: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      uptime: number;
      metricsReceived: number;
    };
    dashboard: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      uptime: number;
      activeConnections: number;
    };
  };
  agents: Array<{
    type: AgentType;
    status: AgentStatus;
    lastSeen: Date;
    responseTime: number;
  }>;
}

/**
 * Historical Data Aggregation
 */
export interface AggregatedMetrics {
  period: '1m' | '5m' | '15m' | '1h' | '6h' | '24h' | '7d' | '30d';
  metricType: MetricType;
  agentType?: AgentType;
  startTime: Date;
  endTime: Date;
  data: {
    timestamps: Date[];
    values: number[];
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  };
}

/**
 * Agent Task Tracking
 */
export interface AgentTask {
  id: string;
  agentType: AgentType;
  agentId: string;
  taskType: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Context7 Query Tracking
 */
export interface Context7Query {
  id: string;
  agentType: AgentType;
  agentId: string;
  timestamp: Date;
  library: string;
  query: string;
  responseTime: number;
  success: boolean;
  error?: string;
  tokensReturned: number;
}

/**
 * Context Engineering Metrics (ROADMAP Phase 1)
 */
export interface ContextMetrics {
  id: string;
  agentType: AgentType;
  agentId: string;
  timestamp: Date;
  query: string;
  executionTime: number; // milliseconds
  hitRate: number; // percentage
  contextCount: number;
  avgConfidence: number; // 0-1
  topContextType: string;
  searchLatency: number; // milliseconds
  success: boolean;
  error?: string;
  contextEntries: Array<{
    id: string;
    type: string;
    confidence: number;
    relevanceScore: number;
  }>;
}

/**
 * Workflow Execution Metrics (ROADMAP Phase 1)
 */
export interface WorkflowMetrics {
  id: string;
  workflowId: string;
  agentType: AgentType;
  agentId: string;
  stage: string;
  timestamp: Date;
  command: string;
  executionTime: number; // milliseconds
  success: boolean;
  status: string;
  contextHitRate: number; // percentage
  evidenceCount: number;
  qualityGateStatus: 'passed' | 'failed' | 'pending';
  deviationsCount: number;
  handoffLatency?: number; // milliseconds
  metadata: Record<string, any>;
}

/**
 * Quality Gate Metrics (ROADMAP Phase 1)
 */
export interface QualityGateMetrics {
  id: string;
  workflowId: string;
  stage: string;
  qualityGateId: string;
  agentType: AgentType;
  timestamp: Date;
  status: 'passed' | 'failed' | 'pending';
  score: number; // 0-1
  criteriaCount: number;
  criteriaPassed: number;
  evidenceTypes: string[];
  executionTime: number; // milliseconds
  autoApproved: boolean;
  deviations: Array<{
    criteria: string;
    expected: number;
    actual: number;
    severity: string;
  }>;
}

/**
 * Evidence Collection Metrics (ROADMAP Phase 1)
 */
export interface EvidenceMetrics {
  id: string;
  workflowId: string;
  stage: string;
  agentType: AgentType;
  timestamp: Date;
  evidenceType: string;
  confidence: number; // 0-1
  artifacts: string[];
  collectionTime: number; // milliseconds
  autoGenerated: boolean;
  validated: boolean;
  qualityScore: number; // 0-1
}

/**
 * Handoff Metrics (ROADMAP Phase 1)
 */
export interface HandoffMetrics {
  id: string;
  workflowId: string;
  fromAgent: AgentType;
  toAgent: AgentType;
  timestamp: Date;
  contextSize: number;
  artifactCount: number;
  latency: number; // milliseconds
  success: boolean;
  acknowledged: boolean;
  accepted: boolean;
  qualityPreservation: number; // 0-1
}

/**
 * Escalation Metrics (ROADMAP Phase 1)
 */
export interface EscalationMetrics {
  id: string;
  workflowId: string;
  stage: string;
  agentType: AgentType;
  timestamp: Date;
  severity: string;
  issue: string;
  resolutionTime?: number; // milliseconds
  resolved: boolean;
  impact: string;
  preventable: boolean;
}

/**
 * Provider Adapter Metrics (ROADMAP Phase 3)
 */
export interface ProviderAdapterMetrics {
  id: string;
  providerId: string;
  tier: string;
  timestamp: Date;
  
  // Usage
  requestsTotal: number;
  requestsSuccess: number;
  requestsFailed: number;
  
  // Performance
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  
  // Resources
  tokensUsed: number;
  tokensGenerated: number;
  
  // Errors
  errorCount: number;
  errorTypes: Record<string, number>;
  
  // Quality
  successRate: number;
  availability: number; // percentage
  
  // Model selection
  selections: number;
  migrations: number;
  migrationsFailed: number;
}

/**
 * Evidence-Based Delivery Metrics (ROADMAP Phase 3)
 */
export interface EvidenceDeliveryMetrics {
  id: string;
  workflowId: string;
  timestamp: Date;
  
  // Evidence collection
  artifactsCollected: number;
  artifactsRequired: number;
  collectionSuccessRate: number;
  avgCollectionTime: number;
  
  // Validation
  validationsPassed: number;
  validationsFailed: number;
  avgValidationScore: number;
  
  // Compliance
  complianceScore: number;
  criteriaSatisfied: number;
  criteriaFailed: number;
  
  // Quality gates
  qualityGatesPassed: number;
  qualityGatesFailed: number;
  autoApprovalRate: number;
  
  // By type
  byType: Record<string, {
    collected: number;
    validated: number;
    avgScore: number;
  }>;
}

/**
 * Dashboard Configuration
 */
export interface DashboardConfig {
  refreshInterval: number;
  retentionPeriod: number;
  alertingEnabled: boolean;
  notificationChannels: {
    email: {
      enabled: boolean;
      recipients: string[];
    };
    slack: {
      enabled: boolean;
      webhookUrl: string;
    };
  };
  thresholds: {
    responseTime: {
      warning: number;
      critical: number;
    };
    errorRate: {
      warning: number;
      critical: number;
    };
    coreWebVitals: {
      lcp: { good: number; needsImprovement: number };
      fid: { good: number; needsImprovement: number };
      cls: { good: number; needsImprovement: number };
    };
  };
}
