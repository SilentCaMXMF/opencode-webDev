/**
 * Mock Agent Implementations
 *
 * Provides comprehensive mock implementations for all 11 agents in the
 * Frontend Design Agent System for testing purposes.
 */

import {
  AgentType,
  AgentMessage,
  MessageType,
  MessagePriority,
  Handoff,
  HandoffType,
  HandoffStatus,
  SharedContext,
  MockAgent,
  AgentStatus,
  ToolType,
  CollaborativeDecision,
  Conflict,
  ConflictCategory,
  ConflictSeverity,
  ConflictDomain
} from '../src/types';

import {
  generateUUID,
  generateTimestamp,
  createSampleContext,
  createSampleConflict,
  createSampleDecision,
  sleep,
  measureTime
} from '../fixtures/mock-data';

// ============================================================================
// Base Mock Agent Class
// ============================================================================

/**
 * Base class for mock agents
 */
export abstract class BaseMockAgent implements MockAgent {
  agent_id: AgentType;
  name: string;
  status: AgentStatus;
  capabilities: string[];
  tools: ToolType[];
  message_handler: (message: AgentMessage) => Promise<AgentMessage>;
  message_history: AgentMessage[] = [];
  handoff_history: Handoff[] = [];
  context_history: SharedContext[] = [];
  metrics: {
    messages_sent: number;
    messages_received: number;
    handoffs_initiated: number;
    handoffs_received: number;
    handoffs_completed: number;
    conflicts_resolved: number;
    decisions_participated: number;
    average_response_time: number;
  } = {
    messages_sent: 0,
    messages_received: 0,
    handoffs_initiated: 0,
    handoffs_received: 0,
    handoffs_completed: 0,
    conflicts_resolved: 0,
    decisions_participated: 0,
    average_response_time: 0
  };
  response_times: number[] = [];

  constructor(
    agentId: AgentType,
    name: string,
    capabilities: string[],
    tools: ToolType[]
  ) {
    this.agent_id = agentId;
    this.name = name;
    this.status = AgentStatus.ACTIVE;
    this.capabilities = capabilities;
    this.tools = tools;
    this.message_handler = this.handleMessage.bind(this);
  }

  /**
   * Handle incoming messages
   */
  async handleMessage(message: AgentMessage): Promise<AgentMessage> {
    const startTime = Date.now();

    // Log message
    this.message_history.push(message);
    this.metrics.messages_received++;

    // Simulate processing time
    await sleep(50 + Math.random() * 100);

    let responsePayload: any = {
      original_message_id: message.message_id,
      status: 'processed',
      agent: this.agent_id,
      timestamp: generateTimestamp()
    };

    // Handle different message types
    switch (message.type) {
      case MessageType.HANDOFF:
        responsePayload = await this.handleHandoff(message);
        break;
      case MessageType.CONTEXT_UPDATE:
        responsePayload = await this.handleContextUpdate(message);
        break;
      case MessageType.CONFLICT:
        responsePayload = await this.handleConflict(message);
        break;
      case MessageType.DECISION_REQUEST:
        responsePayload = await this.handleDecisionRequest(message);
        break;
      case MessageType.TOOL_REQUEST:
        responsePayload = await this.handleToolRequest(message);
        break;
      default:
        // Standard message handling
        break;
    }

    const duration = Date.now() - startTime;
    this.response_times.push(duration);
    this.metrics.average_response_time =
      this.response_times.reduce((a, b) => a + b, 0) / this.response_times.length;

    const response: AgentMessage = {
      message_id: generateUUID(),
      from: this.agent_id,
      to: message.from,
      type: MessageType.RESPONSE,
      priority: message.priority,
      timestamp: generateTimestamp(),
      payload: responsePayload,
      correlation_id: message.message_id
    };

    this.metrics.messages_sent++;
    return response;
  }

  /**
   * Handle handoff messages
   */
  protected async handleHandoff(message: AgentMessage): Promise<any> {
    this.metrics.handoffs_received++;

    const handoff: Handoff = {
      handoff_id: generateUUID(),
      from: message.from,
      to: this.agent_id,
      type: message.payload.handoff_type || HandoffType.TASK_DELEGATION,
      status: HandoffStatus.RECEIVED,
      task_id: message.payload.task_id || generateUUID(),
      context_id: message.payload.context_id || generateUUID(),
      payload: message.payload,
      initiated_at: message.timestamp,
      received_at: generateTimestamp(),
      completed_at: generateTimestamp(),
      timeout_ms: 30000,
      attempts: 1,
      max_attempts: 3,
      acknowledgment: {
        received_at: generateTimestamp(),
        accepted: true
      }
    };

    this.handoff_history.push(handoff);
    this.metrics.handoffs_completed++;

    return {
      handoff_id: handoff.handoff_id,
      status: 'accepted',
      task_acknowledged: true
    };
  }

  /**
   * Handle context update messages
   */
  protected async handleContextUpdate(message: AgentMessage): Promise<any> {
    if (message.payload.context) {
      this.context_history.push(message.payload.context);
    }

    return {
      status: 'updated',
      context_id: message.payload.context?.meta?.context_id
    };
  }

  /**
   * Handle conflict messages
   */
  protected async handleConflict(message: AgentMessage): Promise<any> {
    this.metrics.conflicts_resolved++;

    return {
      status: 'acknowledged',
      conflict_id: message.payload.conflict_id,
      resolution: 'accepted'
    };
  }

  /**
   * Handle decision request messages
   */
  protected async handleDecisionRequest(message: AgentMessage): Promise<any> {
    this.metrics.decisions_participated++;

    return {
      status: 'participating',
      decision_id: message.payload.decision_id,
      vote: this.generateVote(message)
    };
  }

  /**
   * Handle tool request messages
   */
  protected async handleToolRequest(message: AgentMessage): Promise<any> {
    const toolType = message.payload.tool_type;

    if (!this.tools.includes(toolType)) {
      throw new Error(`Tool ${toolType} not available for ${this.agent_id}`);
    }

    return {
      status: 'executed',
      tool_type: toolType,
      result: `Tool execution result from ${this.agent_id}`
    };
  }

  /**
   * Generate vote for decision (to be overridden by subclasses)
   */
  protected generateVote(message: AgentMessage): any {
    return {
      option_id: message.payload.options?.[0]?.option_id,
      confidence: 0.8,
      rationale: `Vote from ${this.name}`
    };
  }

  /**
   * Get metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      message_count: this.message_history.length,
      handoff_count: this.handoff_history.length,
      context_count: this.context_history.length
    };
  }

  /**
   * Reset metrics and history
   */
  reset() {
    this.message_history = [];
    this.handoff_history = [];
    this.context_history = [];
    this.response_times = [];
    this.metrics = {
      messages_sent: 0,
      messages_received: 0,
      handoffs_initiated: 0,
      handoffs_received: 0,
      handoffs_completed: 0,
      conflicts_resolved: 0,
      decisions_participated: 0,
      average_response_time: 0
    };
  }
}

// ============================================================================
// Orchestrator Mock Agent
// ============================================================================

export class MockOrchestrator extends BaseMockAgent {
  active_tasks: Map<string, any> = new Map();
  agent_assignments: Map<string, AgentType[]> = new Map();

  constructor() {
    super(
      AgentType.ORCHESTRATOR,
      'Frontend Design Orchestrator',
      [
        'task_delegation',
        'coordination',
        'conflict_resolution',
        'decision_making',
        'quality_enforcement'
      ],
      [ToolType.READ, ToolType.WRITE, ToolType.CONTEXT7]
    );
  }

  protected async handleHandoff(message: AgentMessage): Promise<any> {
    // Orchestrator delegates tasks to specialists
    const taskId = message.payload.task_id || generateUUID();
    const targetAgent = this.determineBestAgent(message.payload.task_type);

    this.active_tasks.set(taskId, {
      task_id: taskId,
      task_type: message.payload.task_type,
      assigned_agent: targetAgent,
      status: 'delegated',
      created_at: generateTimestamp()
    });

    const assignments = this.agent_assignments.get(targetAgent) || [];
    assignments.push(taskId);
    this.agent_assignments.set(targetAgent, assignments);

    this.metrics.handoffs_initiated++;

    return {
      task_id: taskId,
      delegated_to: targetAgent,
      status: 'delegated'
    };
  }

  private determineBestAgent(taskType: string): AgentType {
    const taskAgentMap: Record<string, AgentType> = {
      'design_system': AgentType.DESIGN_SYSTEM,
      'component': AgentType.COMPONENT_DEVELOPER,
      'performance': AgentType.PERFORMANCE_OPTIMIZER,
      'accessibility': AgentType.ACCESSIBILITY,
      'cross_platform': AgentType.CROSS_PLATFORM,
      'testing': AgentType.TESTING_QA,
      'security': AgentType.SECURITY,
      'animation': AgentType.ANIMATION,
      'i18n': AgentType.I18N,
      'ux_research': AgentType.UX_RESEARCH
    };

    return taskAgentMap[taskType] || AgentType.COMPONENT_DEVELOPER;
  }

  protected generateVote(message: AgentMessage): any {
    // Orchestrator has higher weight in decisions
    return {
      option_id: message.payload.options?.[0]?.option_id,
      confidence: 0.95,
      weight: 2.0,
      rationale: 'Orchestrator final decision'
    };
  }
}

// ============================================================================
// Design System Specialist Mock Agent
// ============================================================================

export class MockDesignSystem extends BaseMockAgent {
  design_tokens: Map<string, any> = new Map();
  component_specs: any[] = [];

  constructor() {
    super(
      AgentType.DESIGN_SYSTEM,
      'Design System Specialist',
      [
        'design_token_management',
        'component_specification',
        'pattern_library',
        'visual_consistency'
      ],
      [ToolType.READ, ToolType.WRITE, ToolType.CONTEXT7]
    );
  }

  protected async handleHandoff(message: AgentMessage): Promise<any> {
    this.metrics.handoffs_received++;

    const token = {
      token_id: generateUUID(),
      name: message.payload.token_name || 'primary-color',
      value: message.payload.token_value || '#007bff',
      category: message.payload.category || 'color',
      created_at: generateTimestamp()
    };

    this.design_tokens.set(token.token_id, token);

    return {
      status: 'token_created',
      token_id: token.token_id,
      token: token
    };
  }

  protected generateVote(message: AgentMessage): any {
    return {
      option_id: message.payload.options?.find(
        (opt: any) => opt.title.toLowerCase().includes('design system')
      )?.option_id,
      confidence: 0.9,
      rationale: 'Design system consistency'
    };
  }
}

// ============================================================================
// Component Developer Mock Agent
// ============================================================================

export class MockComponentDeveloper extends BaseMockAgent {
  components: any[] = [];

  constructor() {
    super(
      AgentType.COMPONENT_DEVELOPER,
      'Component Developer',
      [
        'component_implementation',
        'code_generation',
        'testing',
        'documentation'
      ],
      [ToolType.READ, ToolType.WRITE, ToolType.EDIT, ToolType.CONTEXT7]
    );
  }

  protected async handleHandoff(message: AgentMessage): Promise<any> {
    this.metrics.handoffs_received++;

    const component = {
      component_id: generateUUID(),
      name: message.payload.component_name || 'Button',
      props: message.payload.props || {},
      code: `// Component code for ${message.payload.component_name || 'Button'}`,
      created_at: generateTimestamp()
    };

    this.components.push(component);

    return {
      status: 'component_created',
      component_id: component.component_id,
      component: component
    };
  }

  protected generateVote(message: AgentMessage): any {
    return {
      option_id: message.payload.options?.find(
        (opt: any) => opt.title.toLowerCase().includes('component')
      )?.option_id,
      confidence: 0.85,
      rationale: 'Implementation feasibility'
    };
  }
}

// ============================================================================
// Performance Optimizer Mock Agent
// ============================================================================

export class MockPerformanceOptimizer extends BaseMockAgent {
  performance_metrics: Map<string, any> = new Map();
  optimizations: any[] = [];

  constructor() {
    super(
      AgentType.PERFORMANCE_OPTIMIZER,
      'Performance Optimizer',
      [
        'performance_analysis',
        'optimization_strategies',
        'monitoring',
        'budget_management'
      ],
      [ToolType.READ, ToolType.CONTEXT7]
    );
  }

  protected async handleHandoff(message: AgentMessage): Promise<any> {
    this.metrics.handoffs_received++;

    const metric = {
      metric_id: generateUUID(),
      name: message.payload.metric_name || 'LCP',
      value: message.payload.value || 2500,
      threshold: message.payload.threshold || 2500,
      status: message.payload.value > message.payload.threshold ? 'needs_optimization' : 'acceptable',
      measured_at: generateTimestamp()
    };

    this.performance_metrics.set(metric.metric_id, metric);

    return {
      status: 'metric_measured',
      metric_id: metric.metric_id,
      metric: metric
    };
  }

  protected generateVote(message: AgentMessage): any {
    return {
      option_id: message.payload.options?.find(
        (opt: any) => opt.title.toLowerCase().includes('performance') ||
                     opt.pros?.some((p: string) => p.toLowerCase().includes('fast'))
      )?.option_id,
      confidence: 0.88,
      rationale: 'Performance impact'
    };
  }
}

// ============================================================================
// Accessibility Specialist Mock Agent
// ============================================================================

export class MockAccessibility extends BaseMockAgent {
  accessibility_issues: any[] = [];
  wcag_standards: string[] = ['WCAG 2.1 AA'];

  constructor() {
    super(
      AgentType.ACCESSIBILITY,
      'Accessibility Specialist',
      [
        'a11y_audit',
        'wcag_compliance',
        'screen_reader_support',
        'keyboard_navigation'
      ],
      [ToolType.READ, ToolType.CONTEXT7]
    );
  }

  protected async handleHandoff(message: AgentMessage): Promise<any> {
    this.metrics.handoffs_received++;

    const issue = {
      issue_id: generateUUID(),
      element: message.payload.element || 'button',
      wcag_criterion: message.payload.wcag_criterion || '1.1.1',
      severity: message.payload.severity || 'medium',
      description: message.payload.description || 'Missing alt text',
      resolved: false,
      reported_at: generateTimestamp()
    };

    this.accessibility_issues.push(issue);

    return {
      status: 'issue_reported',
      issue_id: issue.issue_id,
      issue: issue
    };
  }

  protected generateVote(message: AgentMessage): any {
    return {
      option_id: message.payload.options?.find(
        (opt: any) => opt.pros?.some((p: string) => p.toLowerCase().includes('accessibility'))
      )?.option_id,
      confidence: 0.92,
      rationale: 'WCAG compliance'
    };
  }
}

// ============================================================================
// Cross-Platform Specialist Mock Agent
// ============================================================================

export class MockCrossPlatform extends BaseMockAgent {
  platform_configs: Map<string, any> = new Map();
  supported_platforms: string[] = ['desktop', 'mobile', 'tablet'];

  constructor() {
    super(
      AgentType.CROSS_PLATFORM,
      'Cross-Platform Specialist',
      [
        'responsive_design',
        'platform_optimization',
        'browser_compatibility',
        'device_testing'
      ],
      [ToolType.READ, ToolType.CONTEXT7]
    );
  }

  protected async handleHandoff(message: AgentMessage): Promise<any> {
    this.metrics.handoffs_received++;

    const config = {
      config_id: generateUUID(),
      platform: message.payload.platform || 'mobile',
      breakpoints: message.payload.breakpoints || { sm: 640, md: 768, lg: 1024 },
      optimizations: message.payload.optimizations || [],
      created_at: generateTimestamp()
    };

    this.platform_configs.set(config.config_id, config);

    return {
      status: 'config_created',
      config_id: config.config_id,
      config: config
    };
  }

  protected generateVote(message: AgentMessage): any {
    return {
      option_id: message.payload.options?.find(
        (opt: any) => opt.pros?.some((p: string) => p.toLowerCase().includes('cross-platform') ||
                                     p.toLowerCase().includes('responsive'))
      )?.option_id,
      confidence: 0.87,
      rationale: 'Cross-platform compatibility'
    };
  }
}

// ============================================================================
// Testing & QA Specialist Mock Agent
// ============================================================================

export class MockTestingQA extends BaseMockAgent {
  test_suites: any[] = [];
  test_results: Map<string, any> = new Map();

  constructor() {
    super(
      AgentType.TESTING_QA,
      'Testing & QA Specialist',
      [
        'test_planning',
        'test_automation',
        'coverage_analysis',
        'quality_metrics'
      ],
      [ToolType.READ, ToolType.WRITE, ToolType.CONTEXT7]
    );
  }

  protected async handleHandoff(message: AgentMessage): Promise<any> {
    this.metrics.handoffs_received++;

    const suite = {
      suite_id: generateUUID(),
      name: message.payload.suite_name || 'Component Tests',
      tests: message.payload.tests || [],
      coverage: message.payload.coverage || 0,
      status: 'created',
      created_at: generateTimestamp()
    };

    this.test_suites.push(suite);

    return {
      status: 'suite_created',
      suite_id: suite.suite_id,
      suite: suite
    };
  }

  protected generateVote(message: AgentMessage): any {
    return {
      option_id: message.payload.options?.find(
        (opt: any) => opt.pros?.some((p: string) => p.toLowerCase().includes('test') ||
                                     p.toLowerCase().includes('quality'))
      )?.option_id,
      confidence: 0.86,
      rationale: 'Test coverage and quality'
    };
  }
}

// ============================================================================
// Security Specialist Mock Agent
// ============================================================================

export class MockSecurity extends BaseMockAgent {
  security_issues: any[] = [];
  security_policies: Map<string, any> = new Map();

  constructor() {
    super(
      AgentType.SECURITY,
      'Security Specialist',
      [
        'security_audit',
        'vulnerability_scanning',
        'policy_enforcement',
        'secure_coding'
      ],
      [ToolType.READ, ToolType.CONTEXT7]
    );
  }

  protected async handleHandoff(message: AgentMessage): Promise<any> {
    this.metrics.handoffs_received++;

    const issue = {
      issue_id: generateUUID(),
      type: message.payload.type || 'XSS',
      severity: message.payload.severity || 'high',
      description: message.payload.description || 'Potential XSS vulnerability',
      recommendation: message.payload.recommendation || 'Sanitize user input',
      resolved: false,
      reported_at: generateTimestamp()
    };

    this.security_issues.push(issue);

    return {
      status: 'issue_reported',
      issue_id: issue.issue_id,
      issue: issue
    };
  }

  protected generateVote(message: AgentMessage): any {
    return {
      option_id: message.payload.options?.find(
        (opt: any) => opt.pros?.some((p: string) => p.toLowerCase().includes('security') ||
                                     p.toLowerCase().includes('secure'))
      )?.option_id,
      confidence: 0.94,
      rationale: 'Security considerations'
    };
  }
}

// ============================================================================
// Animation Specialist Mock Agent
// ============================================================================

export class MockAnimation extends BaseMockAgent {
  animations: any[] = [];
  animation_libraries: string[] = ['Framer Motion', 'GSAP'];

  constructor() {
    super(
      AgentType.ANIMATION,
      'Animation Specialist',
      [
        'animation_design',
        'motion_graphics',
        'performance_optimization',
        'user_experience'
      ],
      [ToolType.READ, ToolType.CONTEXT7]
    );
  }

  protected async handleHandoff(message: AgentMessage): Promise<any> {
    this.metrics.handoffs_received++;

    const animation = {
      animation_id: generateUUID(),
      name: message.payload.animation_name || 'fade-in',
      duration: message.payload.duration || 300,
      easing: message.payload.easing || 'ease-in-out',
      library: message.payload.library || 'Framer Motion',
      created_at: generateTimestamp()
    };

    this.animations.push(animation);

    return {
      status: 'animation_created',
      animation_id: animation.animation_id,
      animation: animation
    };
  }

  protected generateVote(message: AgentMessage): any {
    return {
      option_id: message.payload.options?.find(
        (opt: any) => opt.pros?.some((p: string) => p.toLowerCase().includes('animation') ||
                                     p.toLowerCase().includes('motion'))
      )?.option_id,
      confidence: 0.83,
      rationale: 'Animation quality and performance'
    };
  }
}

// ============================================================================
// I18n Specialist Mock Agent
// ============================================================================

export class MockI18n extends BaseMockAgent {
  locales: Map<string, any> = new Map();
  translations: Map<string, Map<string, string>> = new Map();

  constructor() {
    super(
      AgentType.I18N,
      'I18n Specialist',
      [
        'internationalization',
        'localization',
        'locale_management',
        'rtl_support'
      ],
      [ToolType.READ, ToolType.WRITE, ToolType.CONTEXT7]
    );
  }

  protected async handleHandoff(message: AgentMessage): Promise<any> {
    this.metrics.handoffs_received++;

    const locale = {
      locale_id: generateUUID(),
      code: message.payload.locale_code || 'en-US',
      name: message.payload.locale_name || 'English (United States)',
      rtl: message.payload.rtl || false,
      created_at: generateTimestamp()
    };

    this.locales.set(locale.locale_id, locale);

    return {
      status: 'locale_created',
      locale_id: locale.locale_id,
      locale: locale
    };
  }

  protected generateVote(message: AgentMessage): any {
    return {
      option_id: message.payload.options?.find(
        (opt: any) => opt.pros?.some((p: string) => p.toLowerCase().includes('i18n') ||
                                     p.toLowerCase().includes('internationalization'))
      )?.option_id,
      confidence: 0.89,
      rationale: 'Internationalization support'
    };
  }
}

// ============================================================================
// UX Research Specialist Mock Agent
// ============================================================================

export class MockUXResearch extends BaseMockAgent {
  user_research: any[] = [];
  personas: any[] = [];
  user_stories: any[] = [];

  constructor() {
    super(
      AgentType.UX_RESEARCH,
      'UX Research Specialist',
      [
        'user_research',
        'persona_development',
        'usability_testing',
        'design_thinking'
      ],
      [ToolType.READ, ToolType.CONTEXT7]
    );
  }

  protected async handleHandoff(message: AgentMessage): Promise<any> {
    this.metrics.handoffs_received++;

    const research = {
      research_id: generateUUID(),
      title: message.payload.title || 'User Interview',
      findings: message.payload.findings || [],
      participants: message.payload.participants || 5,
      date: generateTimestamp()
    };

    this.user_research.push(research);

    return {
      status: 'research_completed',
      research_id: research.research_id,
      research: research
    };
  }

  protected generateVote(message: AgentMessage): any {
    return {
      option_id: message.payload.options?.find(
        (opt: any) => opt.pros?.some((p: string) => p.toLowerCase().includes('user') ||
                                     p.toLowerCase().includes('ux'))
      )?.option_id,
      confidence: 0.91,
      rationale: 'User experience and usability'
    };
  }
}

// ============================================================================
// Agent Factory
// ============================================================================

/**
 * Factory function to create mock agents
 */
export function createMockAgent(agentType: AgentType): BaseMockAgent {
  switch (agentType) {
    case AgentType.ORCHESTRATOR:
      return new MockOrchestrator();
    case AgentType.DESIGN_SYSTEM:
      return new MockDesignSystem();
    case AgentType.COMPONENT_DEVELOPER:
      return new MockComponentDeveloper();
    case AgentType.PERFORMANCE_OPTIMIZER:
      return new MockPerformanceOptimizer();
    case AgentType.ACCESSIBILITY:
      return new MockAccessibility();
    case AgentType.CROSS_PLATFORM:
      return new MockCrossPlatform();
    case AgentType.TESTING_QA:
      return new MockTestingQA();
    case AgentType.SECURITY:
      return new MockSecurity();
    case AgentType.ANIMATION:
      return new MockAnimation();
    case AgentType.I18N:
      return new MockI18n();
    case AgentType.UX_RESEARCH:
      return new MockUXResearch();
    default:
      throw new Error(`Unknown agent type: ${agentType}`);
  }
}

/**
 * Create all 11 mock agents
 */
export function createAllMockAgents(): Record<AgentType, BaseMockAgent> {
  const agents: Record<AgentType, BaseMockAgent> = {} as any;

  Object.values(AgentType).forEach(agentType => {
    agents[agentType] = createMockAgent(agentType);
  });

  return agents;
}

// ============================================================================
// Export all
// ============================================================================

export default {
  BaseMockAgent,
  MockOrchestrator,
  MockDesignSystem,
  MockComponentDeveloper,
  MockPerformanceOptimizer,
  MockAccessibility,
  MockCrossPlatform,
  MockTestingQA,
  MockSecurity,
  MockAnimation,
  MockI18n,
  MockUXResearch,
  createMockAgent,
  createAllMockAgents
};
