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
