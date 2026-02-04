/**
 * Test Fixtures for Agent Interaction Testing
 *
 * This file provides mock implementations, test data, and utility functions
 * for testing agent interactions.
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
  Conflict,
  ConflictCategory,
  ConflictSeverity,
  ConflictDomain,
  CollaborativeDecision,
  DecisionType,
  DecisionPriority,
  DecisionDomain as DecisionDomainType,
  MockAgent,
  MockContext7,
  MockTool,
  ToolType,
  AgentStatus,
  PerformanceBudget,
  TestCategory
} from '../src/types';

// ============================================================================
// UUID Generator
// ============================================================================

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate timestamp in ISO 8601 format
 */
export function generateTimestamp(): string {
  return new Date().toISOString();
}

// ============================================================================
// Sample Context Data
// ============================================================================

/**
 * Create a sample shared context
 */
export function createSampleContext(): SharedContext {
  return {
    meta: {
      context_id: generateUUID(),
      version: '1.0.0',
      created_at: generateTimestamp(),
      created_by: AgentType.ORCHESTRATOR,
      modified_at: generateTimestamp(),
      modified_by: AgentType.ORCHESTRATOR,
      checksum: 'abc123',
      tags: ['sample', 'test'],
      status: 'active'
    },
    project: {
      name: 'Test Project',
      description: 'A test project for agent interactions',
      repository: {
        url: 'https://github.com/test/repo',
        branch: 'main',
        commit_hash: 'abc123def456',
        commit_message: 'Initial commit'
      },
      tech_stack: {
        frontend: ['React', 'Next.js', 'TypeScript'],
        backend: ['Node.js', 'Express'],
        database: ['PostgreSQL'],
        tools: ['Vitest', 'ESLint', 'Prettier']
      }
    },
    design: {
      system: {
        name: 'Test Design System',
        version: '1.0.0'
      },
      tokens: {
        colors: {
          primary: { 500: '#007bff' },
          secondary: { 500: '#6c757d' }
        },
        typography: {
          font_family: { sans: ['Inter', 'system-ui'] },
          font_size: { md: '16px', lg: '18px' }
        }
      },
      components: [],
      patterns: []
    },
    code: {
      structure: {
        src_dir: 'src',
        component_dir: 'src/components',
        test_dir: 'tests'
      },
      language: {
        primary: 'TypeScript',
        version: '5.0.0'
      },
      framework: {
        name: 'Next.js',
        version: '14.0.0'
      }
    },
    performance: {
      budgets: {
        lcp: 2500,
        fid: 100,
        cls: 0.1,
        tti: 3000
      },
      metrics: {},
      monitoring: {},
      optimizations: {}
    },
    accessibility: {
      wcag_level: 'AA',
      requirements: [],
      issues: [],
      standards: []
    },
    testing: {
      framework: 'Vitest',
      suites: [],
      coverage: {},
      reports: []
    },
    security: {
      requirements: [],
      vulnerabilities: [],
      policies: []
    },
    animation: {
      library: 'Framer Motion',
      configurations: [],
      timing: {},
      performance: {}
    },
    i18n: {
      default_locale: 'en-US',
      supported_locales: ['en-US', 'es-ES', 'fr-FR'],
      translations: {}
    },
    ux: {
      personas: [],
      user_stories: [],
      research_findings: []
    },
    agents: {}
  };
}

// ============================================================================
// Sample Message Data
// ============================================================================

/**
 * Create a sample agent message
 */
export function createSampleMessage(
  from: AgentType,
  to: AgentType,
  type: MessageType = MessageType.REQUEST
): AgentMessage {
  return {
    message_id: generateUUID(),
    from,
    to,
    type,
    priority: MessagePriority.NORMAL,
    timestamp: generateTimestamp(),
    payload: {
      data: 'Sample payload data'
    }
  };
}

/**
 * Create a handoff message
 */
export function createHandoffMessage(
  from: AgentType,
  to: AgentType,
  task_id: string
): AgentMessage {
  return {
    message_id: generateUUID(),
    from,
    to,
    type: MessageType.HANDOFF,
    priority: MessagePriority.HIGH,
    timestamp: generateTimestamp(),
    payload: {
      handoff_type: HandoffType.TASK_DELEGATION,
      task_id,
      task_details: {
        description: 'Sample task',
        priority: 'high',
        deadline: generateTimestamp()
      }
    }
  };
}

// ============================================================================
// Sample Handoff Data
// ============================================================================

/**
 * Create a sample handoff
 */
export function createSampleHandoff(
  from: AgentType,
  to: AgentType
): Handoff {
  return {
    handoff_id: generateUUID(),
    from,
    to,
    type: HandoffType.TASK_DELEGATION,
    status: HandoffStatus.INITIATED,
    task_id: generateUUID(),
    context_id: generateUUID(),
    payload: {
      task_description: 'Sample task',
      requirements: ['req1', 'req2']
    },
    initiated_at: generateTimestamp(),
    timeout_ms: 30000,
    attempts: 0,
    max_attempts: 3
  };
}

/**
 * Complete a handoff
 */
export function completeHandoff(handoff: Handoff): Handoff {
  return {
    ...handoff,
    status: HandoffStatus.COMPLETED,
    completed_at: generateTimestamp(),
    attempts: handoff.attempts + 1,
    acknowledgment: {
      received_at: generateTimestamp(),
      accepted: true
    }
  };
}

// ============================================================================
// Sample Conflict Data
// ============================================================================

/**
 * Create a sample conflict
 */
export function createSampleConflict(
  agents: AgentType[],
  domain: ConflictDomain
): Conflict {
  return {
    conflict_id: generateUUID(),
    type: ConflictCategory.CONTEXT_CONFLICT,
    severity: ConflictSeverity.MEDIUM,
    domain,
    agents_involved: agents,
    initiator: agents[0],
    title: `Conflict between ${agents[0]} and ${agents[1]}`,
    description: 'Conflicting values detected',
    conflicting_positions: agents.map(agent => ({
      agent_id: agent,
      position: `Position from ${agent}`,
      reasoning: `Reasoning from ${agent}`,
      confidence: 0.8,
      priority: 5
    })),
    detected_at: generateTimestamp(),
    status: 'detected'
  };
}

/**
 * Create a design token conflict
 */
export function createTokenConflict(
  agent1: AgentType,
  agent2: AgentType
): Conflict {
  return {
    conflict_id: generateUUID(),
    type: ConflictCategory.CONTEXT_CONFLICT,
    severity: ConflictSeverity.MEDIUM,
    domain: ConflictDomain.DESIGN,
    agents_involved: [agent1, agent2],
    initiator: agent1,
    title: 'Design token conflict',
    description: 'Conflicting values for primary color',
    conflicting_positions: [
      {
        agent_id: agent1,
        position: '#007bff',
        reasoning: 'Standard blue color',
        confidence: 0.9,
        priority: 7
      },
      {
        agent_id: agent2,
        position: '#0056b3',
        reasoning: 'Darker blue for better contrast',
        confidence: 0.85,
        priority: 7
      }
    ],
    detected_at: generateTimestamp(),
    status: 'detected'
  };
}

// ============================================================================
// Sample Decision Data
// ============================================================================

/**
 * Create a sample collaborative decision
 */
export function createSampleDecision(
  participants: AgentType[],
  initiator: AgentType
): CollaborativeDecision {
  return {
    decision_id: generateUUID(),
    decision_type: DecisionType.WEIGHTED,
    priority: DecisionPriority.HIGH,
    title: 'Select button component design',
    description: 'Choose between Material Design and Custom Design',
    domain: DecisionDomainType.DESIGN,
    participants,
    initiator,
    options: [
      {
        option_id: generateUUID(),
        title: 'Option A: Material Design',
        description: 'Material Design inspired button',
        proposed_by: AgentType.DESIGN_SYSTEM,
        supporters: [AgentType.DESIGN_SYSTEM],
        pros: ['Familiar to users', 'Well-documented'],
        cons: ['Can be overused'],
        risk_level: 'low'
      },
      {
        option_id: generateUUID(),
        title: 'Option B: Custom Design',
        description: 'Custom button design',
        proposed_by: AgentType.UX_RESEARCH,
        supporters: [AgentType.UX_RESEARCH],
        pros: ['Unique branding'],
        cons: ['Less familiar'],
        risk_level: 'medium'
      }
    ],
    criteria: [
      {
        criteria_id: 'accessibility',
        name: 'Accessibility',
        description: 'WCAG compliance',
        weight: 0.3,
        importance: 'critical'
      },
      {
        criteria_id: 'performance',
        name: 'Performance',
        description: 'Rendering performance',
        weight: 0.25,
        importance: 'important'
      }
    ],
    votes: [],
    stage: 'initiated',
    started_at: generateTimestamp()
  };
}

// ============================================================================
// Mock Agent Factory
// ============================================================================

/**
 * Create a mock agent
 */
export function createMockAgent(agentId: AgentType): MockAgent {
  const agentNames: Record<AgentType, string> = {
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

  return {
    agent_id: agentId,
    name: agentNames[agentId],
    status: AgentStatus.ACTIVE,
    capabilities: ['handoff', 'context_sharing', 'decision_making'],
    tools: [ToolType.READ, ToolType.WRITE, ToolType.CONTEXT7],
    message_handler: async (message: AgentMessage): Promise<AgentMessage> => {
      // Check for timeout
      if (message.ttl && message.ttl < 100) {
        await sleep(10);
        throw new Error('timeout');
      }

      // Check for invalid agent ID
      if (message.to === 'INVALID-AGENT' as any) {
        throw new Error('Invalid agent ID');
      }

      // Check for malformed message
      if (!message.type || !message.priority || !message.timestamp || !message.payload) {
        throw new Error('Malformed message');
      }

      // Simulate message processing
      await new Promise(resolve => setTimeout(resolve, 50));

      // Preserve payload from incoming message
      const responsePayload: any = {
        original_message_id: message.message_id,
        status: 'processed'
      };

      // Include context if present in message
      if (message.payload && message.payload.context) {
        responsePayload.context = message.payload.context;
      }

      // Return proper response with array for targets
      return {
        message_id: generateUUID(),
        from: agentId,
        to: message.to,
        type: MessageType.RESPONSE,
        priority: message.priority,
        timestamp: generateTimestamp(),
        payload: responsePayload,
        correlation_id: message.message_id
      };
    }
  };
}

/**
 * Create all mock agents
 */
export function createAllMockAgents(): Record<AgentType, MockAgent> {
  const agents: Record<AgentType, MockAgent> = {} as any;

  Object.values(AgentType).forEach(agentId => {
    agents[agentId] = createMockAgent(agentId);
  });

  return agents;
}

// ============================================================================
// Mock Context7 Implementation
// ============================================================================

/**
 * Create a mock Context7
 */
export function createMockContext7(): MockContext7 {
  const mockContext7: MockContext7 = {
    call_history: [],

    async resolve_library_id(libraryName: string, query: string): Promise<string> {
      const startTime = Date.now();

      // Simulate Context7 resolution
      await new Promise(resolve => setTimeout(resolve, 100));

      const libraryIds: Record<string, string> = {
        'React': '/facebook/react',
        'Next.js': '/vercel/next.js',
        'TypeScript': '/microsoft/typescript',
        'Tailwind CSS': '/tailwindlabs/tailwindcss'
      };

      const result = libraryIds[libraryName] || `/library/${libraryName.toLowerCase()}`;
      const duration = Date.now() - startTime;

      mockContext7.call_history.push({
        timestamp: generateTimestamp(),
        method: 'resolve_library_id',
        params: { libraryName, query },
        result,
        duration_ms: duration
      });

      return result;
    },

    async query_docs(libraryId: string, query: string): Promise<any> {
      const startTime = Date.now();

      // Simulate Context7 query
      await new Promise(resolve => setTimeout(resolve, 150));

      const result = {
        library_id: libraryId,
        query: query,
        documentation: `Documentation for ${query}`,
        code_examples: [`// Example code for ${query}`]
      };
      const duration = Date.now() - startTime;

      mockContext7.call_history.push({
        timestamp: generateTimestamp(),
        method: 'query_docs',
        params: { libraryId, query },
        result,
        duration_ms: duration
      });

      return result;
    }
  };

  return mockContext7;
}

// ============================================================================
// Mock Tool Factory
// ============================================================================

/**
 * Create a mock tool
 */
export function createMockTool(toolType: ToolType): MockTool {
  return {
    tool_type: toolType,
    execution_history: [],
    locked_by: undefined,
    execute: async (operation: string, parameters: any): Promise<any> => {
      const startTime = Date.now();

      // Simulate tool execution
      await new Promise(resolve => setTimeout(resolve, 50));

      const result = {
        tool_type: toolType,
        operation,
        parameters,
        status: 'success',
        output: `Result from ${toolType} - ${operation}`
      };
      const duration = Date.now() - startTime;

      return result;
    }
  };
}

/**
 * Create all mock tools
 */
export function createAllMockTools(): Record<ToolType, MockTool> {
  const tools: Record<ToolType, MockTool> = {} as any;

  Object.values(ToolType).forEach(toolType => {
    tools[toolType] = createMockTool(toolType);
  });

  return tools;
}

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Wait for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Measure execution time of a function
 */
export async function measureTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration_ms: number }> {
  const startTime = Date.now();
  const result = await fn();
  const duration = Date.now() - startTime;
  return { result, duration_ms: duration };
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 100
): Promise<T> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      await sleep(delay);
    }
  }

  throw new Error('Max retry attempts exceeded');
}

/**
 * Wait for a condition to be true
 */
export async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();

  while (true) {
    const result = await condition();
    if (result) {
      return;
    }

    if (Date.now() - startTime > timeout) {
      throw new Error(`Condition not met within ${timeout}ms`);
    }

    await sleep(interval);
  }
}

/**
 * Generate random data for testing
 */
export function generateRandomData(size: number = 1000): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < size; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Generate random agent from the list
 */
export function getRandomAgent(): AgentType {
  const agents = Object.values(AgentType);
  return agents[Math.floor(Math.random() * agents.length)];
}

/**
 * Get two different random agents
 */
export function getRandomAgentPair(): [AgentType, AgentType] {
  const agents = Object.values(AgentType);
  const shuffled = [...agents].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

/**
 * Validate message structure
 */
export function validateMessage(message: AgentMessage): boolean {
  return !!(
    message.message_id &&
    message.from &&
    message.to &&
    message.type &&
    message.priority &&
    message.timestamp &&
    message.payload
  );
}

/**
 * Compare performance budgets
 */
export function compareBudgets(
  budget1: PerformanceBudget,
  budget2: PerformanceBudget
): string[] {
  const differences: string[] = [];

  if (budget1.lcp !== budget2.lcp) {
    differences.push(`LCP: ${budget1.lcp}ms vs ${budget2.lcp}ms`);
  }
  if (budget1.fid !== budget2.fid) {
    differences.push(`FID: ${budget1.fid}ms vs ${budget2.fid}ms`);
  }
  if (budget1.cls !== budget2.cls) {
    differences.push(`CLS: ${budget1.cls} vs ${budget2.cls}`);
  }
  if (budget1.tti !== budget2.tti) {
    differences.push(`TTI: ${budget1.tti}ms vs ${budget2.tti}ms`);
  }

  return differences;
}

// ============================================================================
// Export all
// ============================================================================

export default {
  generateUUID,
  generateTimestamp,
  createSampleContext,
  createSampleMessage,
  createHandoffMessage,
  createSampleHandoff,
  completeHandoff,
  createSampleConflict,
  createTokenConflict,
  createSampleDecision,
  createMockAgent,
  createAllMockAgents,
  createMockContext7,
  createMockTool,
  createAllMockTools,
  sleep,
  measureTime,
  retry,
  waitForCondition,
  generateRandomData,
  getRandomAgent,
  getRandomAgentPair,
  validateMessage,
  compareBudgets
};
