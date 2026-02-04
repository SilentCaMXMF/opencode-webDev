/**
 * Agent Interaction Testing Types and Interfaces
 *
 * This file defines all types and interfaces for the agent interaction testing suite.
 */

// ============================================================================
// Agent Types
// ============================================================================

/**
 * The 11 agents in the Frontend Design Agent System
 */
export enum AgentType {
  ORCHESTRATOR = 'FD-ORC-01',
  DESIGN_SYSTEM = 'FD-DS-02',
  COMPONENT_DEVELOPER = 'FD-CD-03',
  PERFORMANCE_OPTIMIZER = 'FD-PO-04',
  ACCESSIBILITY = 'FD-AX-05',
  CROSS_PLATFORM = 'FD-CP-06',
  TESTING_QA = 'FD-TQ-07',
  SECURITY = 'FD-SC-08',
  ANIMATION = 'FD-AN-09',
  I18N = 'FD-I1-10',
  UX_RESEARCH = 'FD-UR-11'
}

/**
 * All agent types as array for iteration
 */
export const ALL_AGENTS: AgentType[] = [
  AgentType.ORCHESTRATOR,
  AgentType.DESIGN_SYSTEM,
  AgentType.COMPONENT_DEVELOPER,
  AgentType.PERFORMANCE_OPTIMIZER,
  AgentType.ACCESSIBILITY,
  AgentType.CROSS_PLATFORM,
  AgentType.TESTING_QA,
  AgentType.SECURITY,
  AgentType.ANIMATION,
  AgentType.I18N,
  AgentType.UX_RESEARCH
];

/**
 * Agent display names
 */
export const AGENT_NAMES: Record<AgentType, string> = {
  [AgentType.ORCHESTRATOR]: 'Frontend Design Orchestrator',
  [AgentType.DESIGN_SYSTEM]: 'Design System Specialist',
  [AgentType.COMPONENT_DEVELOPER]: 'Component Developer',
  [AgentType.PERFORMANCE_OPTIMIZER]: 'Performance Optimizer',
  [AgentType.ACCESSIBILITY]: 'Accessibility Specialist',
  [AgentType.CROSS_PLATFORM]: 'Cross-Platform Specialist',
  [AgentType.TESTING_QA]: 'Testing & QA Specialist',
  [AgentType.SECURITY]: 'Security Specialist',
  [AgentType.ANIMATION]: 'Animation Specialist',
  [AgentType.I18N]: 'I18n Specialist',
  [AgentType.UX_RESEARCH]: 'UX Research Specialist'
};

// ============================================================================
// Agent Status
// ============================================================================

export enum AgentStatus {
  ACTIVE = 'active',
  IDLE = 'idle',
  PROCESSING = 'processing',
  ERROR = 'error',
  OFFLINE = 'offline'
}

// ============================================================================
// Message Types
// ============================================================================

export enum MessageType {
  HANDOFF = 'handoff',
  REQUEST = 'request',
  RESPONSE = 'response',
  NOTIFICATION = 'notification',
  ERROR = 'error',
  ACKNOWLEDGMENT = 'acknowledgment',
  STATUS_UPDATE = 'status_update',
  CONTEXT_UPDATE = 'context_update'
}

export enum MessagePriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4
}

// ============================================================================
// Message Interface
// ============================================================================

export interface AgentMessage {
  message_id: string;
  from: AgentType;
  to: AgentType | AgentType[];
  type: MessageType;
  priority: MessagePriority;
  timestamp: string;
  payload: any;
  attachments?: MessageAttachment[];
  context?: any;
  correlation_id?: string;
  reply_to?: string;
  ttl?: number;
}

export interface MessageAttachment {
  attachment_id: string;
  type: 'file' | 'data' | 'reference';
  name: string;
  content: any;
  size_bytes?: number;
  mime_type?: string;
}

// ============================================================================
// Handoff Types
// ============================================================================

export enum HandoffType {
  TASK_DELEGATION = 'task_delegation',
  CONTEXT_TRANSFER = 'context_transfer',
  STATUS_REPORT = 'status_report',
  REQUEST_FOR_INFORMATION = 'request_for_information',
  COMPLETION_NOTIFICATION = 'completion_notification',
  ERROR_NOTIFICATION = 'error_notification'
}

export enum HandoffStatus {
  INITIATED = 'initiated',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  TIMEOUT = 'timeout',
  CANCELLED = 'cancelled'
}

export interface Handoff {
  handoff_id: string;
  from: AgentType;
  to: AgentType;
  type: HandoffType;
  status: HandoffStatus;
  task_id?: string;
  context_id?: string;
  payload: any;
  initiated_at: string;
  completed_at?: string;
  timeout_ms: number;
  attempts: number;
  max_attempts: number;
  error?: string;
  acknowledgment?: HandoffAcknowledgment;
}

export interface HandoffAcknowledgment {
  received_at: string;
  accepted: boolean;
  reason?: string;
  estimated_completion_time?: string;
}

// ============================================================================
// Context Types
// ============================================================================

export interface SharedContext {
  meta: ContextMetadata;
  project: ProjectContext;
  design: DesignContext;
  code: CodeContext;
  performance: PerformanceContext;
  accessibility: AccessibilityContext;
  testing: TestingContext;
  security: SecurityContext;
  animation: AnimationContext;
  i18n: I18nContext;
  ux: UXContext;
  agents: AgentContexts;
}

export interface ContextMetadata {
  context_id: string;
  version: string;
  created_at: string;
  created_by: string;
  modified_at: string;
  modified_by: string;
  checksum: string;
  parent_version_id?: string;
  tags: string[];
  status: 'active' | 'archived' | 'locked';
}

export interface ProjectContext {
  name: string;
  description: string;
  repository: {
    url: string;
    branch: string;
    commit_hash: string;
    commit_message: string;
  };
  tech_stack: {
    frontend: string[];
    backend?: string[];
    database?: string[];
    tools: string[];
  };
}

export interface DesignContext {
  system: {
    name: string;
    version: string;
    url?: string;
  };
  tokens: {
    colors: any;
    typography: any;
    spacing: any;
    sizing: any;
    borders: any;
    shadows: any;
    transitions: any;
    animations: any;
  };
  components: any[];
  patterns: any[];
}

export interface PerformanceContext {
  budgets: PerformanceBudget;
  metrics: any;
  monitoring: any;
  optimizations: any;
}

export interface PerformanceBudget {
  lcp: number;  // Largest Contentful Paint (ms)
  fid: number;  // First Input Delay (ms)
  cls: number;  // Cumulative Layout Shift
  tti: number;  // Time to Interactive (ms)
}

export interface AccessibilityContext {
  wcag_level: 'A' | 'AA' | 'AAA';
  requirements: any[];
  issues: any[];
  standards: any[];
}

export interface CodeContext {
  structure: {
    src_dir: string;
    component_dir: string;
    test_dir: string;
  };
  language: {
    primary: string;
    version: string;
  };
  framework: {
    name: string;
    version: string;
  };
}

export interface TestingContext {
  framework: string;
  suites: any[];
  coverage: any;
  reports: any[];
}

export interface SecurityContext {
  requirements: any[];
  vulnerabilities: any[];
  policies: any[];
}

export interface AnimationContext {
  library?: string;
  configurations: any[];
  timing: any;
  performance: any;
}

export interface I18nContext {
  default_locale: string;
  supported_locales: string[];
  translations: any;
}

export interface UXContext {
  personas: any[];
  user_stories: any[];
  research_findings: any[];
}

export interface AgentContexts {
  [agent_id: string]: AgentSpecificContext;
}

export interface AgentSpecificContext {
  preferences: Record<string, any>;
  recent_tasks: string[];
  expertise: string[];
  performance_history: any;
  notes: string[];
}

// ============================================================================
// Conflict Types
// ============================================================================

export enum ConflictCategory {
  RECOMMENDATION_CONFLICT = 'recommendation_conflict',
  CONTEXT_CONFLICT = 'context_conflict',
  DECISION_CONFLICT = 'decision_conflict',
  RESOURCE_CONFLICT = 'resource_confFLICT'
}

export enum ConflictSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ConflictDomain {
  DESIGN = 'design',
  PERFORMANCE = 'performance',
  ACCESSIBILITY = 'accessibility',
  SECURITY = 'security',
  TESTING = 'testing',
  ANIMATION = 'animation',
  I18N = 'i18n',
  UX = 'ux',
  CROSS_PLATFORM = 'cross_platform',
  ARCHITECTURE = 'architecture'
}

export interface Conflict {
  conflict_id: string;
  type: ConflictCategory;
  severity: ConflictSeverity;
  domain: ConflictDomain;
  agents_involved: AgentType[];
  initiator: AgentType;
  title: string;
  description: string;
  conflicting_positions: ConflictPosition[];
  context_id?: string;
  task_id?: string;
  detected_at: string;
  status: ConflictStatus;
  resolution?: ConflictResolution;
}

export enum ConflictStatus {
  DETECTED = 'detected',
  ANALYZING = 'analyzing',
  RESOLVING = 'resolving',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
  DISMISSED = 'dismissed'
}

export interface ConflictPosition {
  agent_id: AgentType;
  position: string;
  reasoning: string;
  confidence: number;  // 0-1
  priority: number;  // 1-10
  evidence?: any[];
}

export interface ConflictResolution {
  resolution_id: string;
  conflict_id: string;
  strategy: string;
  resolved_at: string;
  resolved_by: string;
  resolution: string;
  rationale: string;
  outcome: ResolutionOutcome;
}

export interface ResolutionOutcome {
  status: 'accepted' | 'rejected' | 'compromise';
  winner?: AgentType;
  compromise?: any;
  consensus?: boolean;
  agent_acceptance: Record<AgentType, boolean>;
}

// ============================================================================
// Decision Types
// ============================================================================

export enum DecisionType {
  CONSENSUS = 'consensus',
  MAJORITY = 'majority',
  SUPERMAJORITY = 'supermajority',
  UNANIMOUS = 'unanimous',
  EXPERT = 'expert',
  ORCHESTRATOR = 'orchestrator',
  WEIGHTED = 'weighted'
}

export enum DecisionPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum DecisionDomain {
  ARCHITECTURE = 'architecture',
  DESIGN = 'design',
  PERFORMANCE = 'performance',
  ACCESSIBILITY = 'accessibility',
  SECURITY = 'security',
  TESTING = 'testing',
  DEPLOYMENT = 'deployment',
  RESOURCE = 'resource',
  SCHEDULING = 'scheduling'
}

export interface CollaborativeDecision {
  decision_id: string;
  decision_type: DecisionType;
  priority: DecisionPriority;
  title: string;
  description: string;
  domain: DecisionDomain;
  participants: AgentType[];
  initiator: AgentType;
  options: DecisionOption[];
  criteria: DecisionCriteria[];
  votes: AgentVote[];
  stage: DecisionStage;
  started_at: string;
  deadline?: string;
  outcome?: DecisionOutcome;
  completed_at?: string;
  rationale?: string;
  audit_trail: DecisionAuditEntry[];
}

export enum DecisionStage {
  INITIATED = 'initiated',
  DELIBERATING = 'deliberating',
  VOTING = 'voting',
  CONSENSUS_BUILDING = 'consensus_building',
  DECIDED = 'decided',
  IMPLEMENTED = 'implemented',
  REVIEWED = 'reviewed'
}

export interface DecisionOption {
  option_id: string;
  title: string;
  description: string;
  proposed_by: AgentType;
  supporters: AgentType[];
  pros: string[];
  cons: string[];
  estimated_cost?: string;
  estimated_time?: string;
  risk_level: 'low' | 'medium' | 'high';
}

export interface DecisionCriteria {
  criteria_id: string;
  name: string;
  description: string;
  weight: number;  // 0-1
  importance: 'critical' | 'important' | 'nice_to_have';
}

export interface AgentVote {
  agent_id: AgentType;
  option_id: string;
  confidence: number;  // 0-1
  reasoning: string;
  timestamp: string;
  criteria_scores?: Record<string, number>;
}

// ============================================================================
// Tool Delegation Types
// ============================================================================

export enum ToolType {
  CONTEXT7 = 'context7',
  READ = 'read',
  WRITE = 'write',
  EDIT = 'edit',
  GLOB = 'glob',
  GREP = 'grep',
  DEVTOOLS = 'devtools',
  TASK = 'task'
}

export interface ToolDelegation {
  delegation_id: string;
  from: AgentType;
  to: AgentType;
  tool: ToolType;
  operation: string;
  parameters: any;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  result?: any;
  error?: string;
}

export interface ToolLock {
  lock_id: string;
  tool: ToolType;
  locked_by: AgentType;
  locked_at: string;
  expires_at: string;
  priority: MessagePriority;
}

// ============================================================================
// Test Types
// ============================================================================

export enum TestCategory {
  AGENT_COMMUNICATION = 'agent_communication',
  CONTEXT_SHARING = 'context_sharing',
  CONFLICT_RESOLUTION = 'conflict_resolution',
  DECISION_FRAMEWORK = 'decision_framework',
  TOOL_DELEGATION = 'tool_delegation',
  INTEGRATION = 'integration',
  PERFORMANCE = 'performance',
  LOAD_STRESS = 'load_stress'
}

export enum TestPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export interface TestCase {
  test_id: string;
  name: string;
  category: TestCategory;
  priority: TestPriority;
  description: string;
  agents_involved: AgentType[];
  preconditions: string[];
  steps: TestStep[];
  expected_results: ExpectedResult[];
  success_criteria: string[];
  dependencies: string[];
  tags: string[];
  estimated_duration_ms: number;
}

export interface TestStep {
  step_number: number;
  description: string;
  action: string;
  expected_result: string;
  duration_ms?: number;
}

export interface ExpectedResult {
  result_id: string;
  description: string;
  metric?: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'matches';
  value: any;
  tolerance?: number;
}

// ============================================================================
// Test Result Types
// ============================================================================

export enum TestStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  ERROR = 'error',
  IN_PROGRESS = 'in_progress',
  NOT_RUN = 'not_run'
}

export interface TestResult {
  test_id: string;
  status: TestStatus;
  started_at: string;
  completed_at: string;
  duration_ms: number;
  actual_results: Record<string, any>;
  passed_criteria: string[];
  failed_criteria: string[];
  error_message?: string;
  stack_trace?: string;
  screenshots?: string[];
  logs: TestLog[];
  metadata: TestMetadata;
}

export interface TestLog {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: any;
}

export interface TestMetadata {
  test_runner: string;
  runner_version: string;
  environment: string;
  node_version: string;
  git_commit: string;
  git_branch: string;
  parallel: boolean;
  retry_count: number;
}

// ============================================================================
// Performance Types
// ============================================================================

export interface PerformanceMetrics {
  agent_id: AgentType;
  timestamp: string;
  metrics: {
    response_time: number;  // milliseconds
    task_completion_rate: number;  // percentage
    error_rate: number;  // percentage
    active_tasks: number;
    completed_tasks: number;
    failed_tasks: number;
    context7_queries: {
      count: number;
      avg_response_time: number;
      success_rate: number;
    };
    tool_usage: Record<string, number>;
    coordination_metrics: {
      handoffs_received: number;
      handoffs_sent: number;
      avg_handoff_time: number;
    };
  };
}

export interface PerformanceTarget {
  metric: string;
  target_value: number;
  operator: 'less_than' | 'greater_than' | 'equals';
  unit: string;
  priority: TestPriority;
}

export const PERFORMANCE_TARGETS: PerformanceTarget[] = [
  { metric: 'avg_response_time', target_value: 500, operator: 'less_than', unit: 'ms', priority: TestPriority.HIGH },
  { metric: 'handoff_latency', target_value: 200, operator: 'less_than', unit: 'ms', priority: TestPriority.HIGH },
  { metric: 'context_sync_time', target_value: 100, operator: 'less_than', unit: 'ms', priority: TestPriority.HIGH },
  { metric: 'decision_time', target_value: 5000, operator: 'less_than', unit: 'ms', priority: TestPriority.MEDIUM },
  { metric: 'tool_execution_time', target_value: 1000, operator: 'less_than', unit: 'ms', priority: TestPriority.MEDIUM },
  { metric: 'task_completion_rate', target_value: 95, operator: 'greater_than', unit: '%', priority: TestPriority.HIGH },
  { metric: 'error_rate', target_value: 5, operator: 'less_than', unit: '%', priority: TestPriority.HIGH }
];

// ============================================================================
// Coverage Types
// ============================================================================

export interface CoverageReport {
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  skipped_tests: number;
  pass_rate: number;
  coverage_percentage: number;
  lines_covered: number;
  lines_total: number;
  functions_covered: number;
  functions_total: number;
  branches_covered: number;
  branches_total: number;
  statements_covered: number;
  statements_total: number;
  by_agent: Record<AgentType, AgentCoverage>;
  by_category: Record<TestCategory, CategoryCoverage>;
}

export interface AgentCoverage {
  agent_id: AgentType;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  pass_rate: number;
  coverage_percentage: number;
}

export interface CategoryCoverage {
  category: TestCategory;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  pass_rate: number;
}

// ============================================================================
// Integration Types
// ============================================================================

export enum IntegrationType {
  CONTEXT7 = 'context7',
  MONITORING = 'monitoring',
  CI_CD = 'ci_cd',
  COLLABORATION = 'collaboration',
  STORAGE = 'storage',
  AUTHENTICATION = 'authentication'
}

export interface IntegrationTest {
  test_id: string;
  integration_type: IntegrationType;
  name: string;
  description: string;
  endpoint?: string;
  method?: string;
  request_data?: any;
  expected_response: any;
  status_code?: number;
  timeout_ms: number;
  retry_count: number;
}

export interface IntegrationTestResult {
  test_id: string;
  status: TestStatus;
  request_time_ms: number;
  response_status_code?: number;
  response_body?: any;
  error_message?: string;
  validation_errors: string[];
}

// ============================================================================
// Mock Types
// ============================================================================

export interface MockAgent {
  agent_id: AgentType;
  name: string;
  status: AgentStatus;
  capabilities: string[];
  message_handler: (message: AgentMessage) => Promise<AgentMessage>;
  tools: ToolType[];
}

export interface MockContext7 {
  resolve_library_id: (libraryName: string, query: string) => Promise<string>;
  query_docs: (libraryId: string, query: string) => Promise<any>;
  call_history: Context7Call[];
}

export interface Context7Call {
  timestamp: string;
  method: 'resolve_library_id' | 'query_docs';
  params: any;
  result?: any;
  error?: string;
  duration_ms: number;
}

export interface MockTool {
  tool_type: ToolType;
  execute: (operation: string, parameters: any) => Promise<any>;
  execution_history: ToolExecution[];
  locked_by?: AgentType;
}

export interface ToolExecution {
  timestamp: string;
  agent_id: AgentType;
  operation: string;
  parameters: any;
  result?: any;
  error?: string;
  duration_ms: number;
}

// ============================================================================
// Report Types
// ============================================================================

export interface TestReport {
  report_id: string;
  generated_at: string;
  test_suite: string;
  version: string;
  total_tests: number;
  total_passed: number;
  total_failed: number;
  total_skipped: number;
  pass_rate: number;
  duration_ms: number;
  coverage: CoverageReport;
  test_results: TestResult[];
  performance_metrics: PerformanceMetrics[];
  issues: TestIssue[];
  recommendations: string[];
}

export interface TestIssue {
  issue_id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'bug' | 'performance' | 'integration' | 'documentation';
  title: string;
  description: string;
  affected_tests: string[];
  affected_agents: AgentType[];
  reproduction_steps: string[];
  priority: TestPriority;
  status: 'open' | 'in_progress' | 'resolved' | 'verified';
}

export interface RemediationPlan {
  plan_id: string;
  created_at: string;
  created_by: string;
  issues: TestIssue[];
  tasks: RemediationTask[];
  timeline: RemediationTimeline;
  resources: Resource[];
  estimated_cost?: string;
  estimated_duration: string;
}

export interface RemediationTask {
  task_id: string;
  issue_id: string;
  description: string;
  assigned_to: string;
  priority: TestPriority;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  estimated_hours: number;
  actual_hours?: number;
  dependencies: string[];
}

export interface RemediationTimeline {
  start_date: string;
  milestones: Milestone[];
  end_date: string;
}

export interface Milestone {
  milestone_id: string;
  name: string;
  target_date: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
}

export interface Resource {
  resource_id: string;
  type: 'personnel' | 'tool' | 'infrastructure';
  name: string;
  allocation: string;
  availability: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type UUID = string;
export type ISO8601Timestamp = string;

export interface PaginationOptions {
  page: number;
  page_size: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface FilterOptions {
  agent_id?: AgentType;
  status?: TestStatus;
  category?: TestCategory;
  priority?: TestPriority;
  from_date?: string;
  to_date?: string;
}

export interface SearchOptions {
  query: string;
  fields?: string[];
  fuzzy?: boolean;
}

// ============================================================================
// Export all
// ============================================================================

export default {
  AgentType,
  AgentStatus,
  MessageType,
  MessagePriority,
  HandoffType,
  HandoffStatus,
  ConflictCategory,
  ConflictSeverity,
  ConflictDomain,
  DecisionType,
  DecisionPriority,
  DecisionDomain,
  DecisionStage,
  ToolType,
  TestCategory,
  TestPriority,
  TestStatus,
  IntegrationType
};
