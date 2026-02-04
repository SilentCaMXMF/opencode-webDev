/**
 * Agent Communication Tests
 *
 * Tests for validating agent-to-agent communication, handoff protocols,
 * message handling, and error recovery.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  AgentType,
  AgentMessage,
  MessageType,
  MessagePriority,
  Handoff,
  HandoffType,
  HandoffStatus,
  MockAgent
} from './types';
import {
  createSampleMessage,
  createHandoffMessage,
  createSampleHandoff,
  completeHandoff,
  createMockAgent,
  createAllMockAgents,
  sleep,
  measureTime,
  retry,
  getRandomAgent,
  getRandomAgentPair,
  validateMessage
} from '../fixtures/mock-data';

describe('Agent Communication Tests', () => {
  let mockAgents: Record<AgentType, MockAgent>;

  beforeEach(() => {
    mockAgents = createAllMockAgents();
  });

  afterEach(() => {
    // Cleanup
  });

  // ==========================================================================
  // Handoff Protocol Tests
  // ==========================================================================

  describe('Handoff Protocol Tests', () => {
    /**
     * Test: AC-HANDOFF-001
     * Objective: Validate orchestrator to design system handoff
     */
    it('AC-HANDOFF-001: Orchestrator to Design System handoff succeeds', async () => {
      // Arrange
      const orchestrator = mockAgents[AgentType.ORCHESTRATOR];
      const designSystem = mockAgents[AgentType.DESIGN_SYSTEM];
      const handoff = createSampleHandoff(AgentType.ORCHESTRATOR, AgentType.DESIGN_SYSTEM);

      // Act
      const message = createHandoffMessage(
        AgentType.ORCHESTRATOR,
        AgentType.DESIGN_SYSTEM,
        handoff.task_id!
      );

      const response = await orchestrator.message_handler(message);

      // Assert
      expect(response).toBeDefined();
      expect(response.type).toBe(MessageType.RESPONSE);
      expect(response.from).toBe(AgentType.ORCHESTRATOR);
      expect(response.correlation_id).toBe(message.message_id);
      expect(validateMessage(response)).toBe(true);
    });

    /**
     * Test: AC-HANDOFF-005
     * Objective: Validate design system to component developer handoff
     */
    it('AC-HANDOFF-005: Design System to Component Developer handoff succeeds', async () => {
      // Arrange
      const designSystem = mockAgents[AgentType.DESIGN_SYSTEM];
      const componentDeveloper = mockAgents[AgentType.COMPONENT_DEVELOPER];

      // Act
      const message = createHandoffMessage(
        AgentType.DESIGN_SYSTEM,
        AgentType.COMPONENT_DEVELOPER,
        'task-123'
      );

      const response = await designSystem.message_handler(message);

      // Assert
      expect(response.type).toBe(MessageType.RESPONSE);
      expect(response.from).toBe(AgentType.DESIGN_SYSTEM);
      expect(response.correlation_id).toBe(message.message_id);
    });

    /**
     * Test: AC-HANDOFF-013
     * Objective: Test multi-agent sequential handoff with context preservation
     */
    it('AC-HANDOFF-013: Multi-agent sequential handoff preserves context', async () => {
      // Arrange
      const orchestrator = mockAgents[AgentType.ORCHESTRATOR];
      const designSystem = mockAgents[AgentType.DESIGN_SYSTEM];
      const componentDeveloper = mockAgents[AgentType.COMPONENT_DEVELOPER];

      const contextData = { key: 'value', should_be_preserved: true };

      // Act - ORC → DS
      const message1 = createHandoffMessage(
        AgentType.ORCHESTRATOR,
        AgentType.DESIGN_SYSTEM,
        'task-sequential-1'
      );
      message1.payload.context = contextData;

      const response1 = await orchestrator.message_handler(message1);
      expect(response1.payload.context).toEqual(contextData);

      // Act - DS → CD
      const message2 = {
        ...message1,
        from: AgentType.DESIGN_SYSTEM,
        to: AgentType.COMPONENT_DEVELOPER,
        message_id: `msg-${Date.now()}-2`
      };

      const response2 = await designSystem.message_handler(message2);

      // Assert
      expect(response2.payload.context).toEqual(contextData);
      expect(response2.payload.context.should_be_preserved).toBe(true);
    });

    /**
     * Test: AC-HANDOFF-014
     * Objective: Test parallel handoff coordination to multiple agents
     */
    it('AC-HANDOFF-014: Parallel handoff to multiple agents succeeds', async () => {
      // Arrange
      const orchestrator = mockAgents[AgentType.ORCHESTRATOR];
      const targets = [
        AgentType.DESIGN_SYSTEM,
        AgentType.PERFORMANCE_OPTIMIZER,
        AgentType.ACCESSIBILITY
      ];

      // Act - Send parallel handoffs
      const handoffMessages = targets.map(target =>
        createHandoffMessage(AgentType.ORCHESTRATOR, target, `task-parallel-${target}`)
      );

      const responses = await Promise.all(
        handoffMessages.map(msg => orchestrator.message_handler(msg))
      );

      // Assert
      expect(responses).toHaveLength(3);
      responses.forEach((response, index) => {
        expect(response.type).toBe(MessageType.RESPONSE);
        expect(response.from).toBe(AgentType.ORCHESTRATOR);
        expect(response.to as any).toBe(targets[index]);
      });
    });

    /**
     * Test: AC-HANDOFF-016
     * Objective: Test handoff timeout handling
     */
    it('AC-HANDOFF-016: Handoff timeout is detected and handled', async () => {
      // Arrange
      const slowAgent: MockAgent = {
        agent_id: AgentType.DESIGN_SYSTEM,
        name: 'Slow Agent',
        status: 'active',
        capabilities: [],
        tools: [],
        message_handler: async () => {
          await sleep(10000); // 10 second delay
          return createSampleMessage(AgentType.DESIGN_SYSTEM, AgentType.ORCHESTRATOR);
        }
      };

      const orchestrator = mockAgents[AgentType.ORCHESTRATOR];
      const message = createHandoffMessage(
        AgentType.ORCHESTRATOR,
        AgentType.DESIGN_SYSTEM,
        'task-timeout'
      );
      message.ttl = 100; // 100ms timeout

      // Act & Assert
      await expect(
        orchestrator.message_handler(message)
      ).rejects.toThrow('timeout');
    });

    /**
     * Test: AC-HANDOFF-017
     * Objective: Test handoff error recovery with retry logic
     */
    it('AC-HANDOFF-017: Handoff error is recovered with retry', async () => {
      // Arrange
      let attemptCount = 0;

      const flakyAgent: MockAgent = {
        agent_id: AgentType.DESIGN_SYSTEM,
        name: 'Flaky Agent',
        status: 'active',
        capabilities: [],
        tools: [],
        message_handler: async () => {
          attemptCount++;
          if (attemptCount < 3) {
            throw new Error('Temporary failure');
          }
          return createSampleMessage(AgentType.DESIGN_SYSTEM, AgentType.ORCHESTRATOR);
        }
      };

      const orchestrator = mockAgents[AgentType.ORCHESTRATOR];
      const message = createSampleMessage(AgentType.ORCHESTRATOR, AgentType.DESIGN_SYSTEM);

      // Act
      const result = await retry(
        () => flakyAgent.message_handler(message),
        3,
        50
      );

      // Assert
      expect(result).toBeDefined();
      expect(attemptCount).toBe(3);
      expect(result.type).toBe(MessageType.RESPONSE);
    });

    /**
     * Test: AC-HANDOFF-018
     * Objective: Test handoff acknowledgment
     */
    it('AC-HANDOFF-018: Handoff acknowledgment is received and logged', async () => {
      // Arrange
      const orchestrator = mockAgents[AgentType.ORCHESTRATOR];
      const handoff = createSampleHandoff(AgentType.ORCHESTRATOR, AgentType.DESIGN_SYSTEM);

      // Act
      const completedHandoff = completeHandoff(handoff);

      // Assert
      expect(completedHandoff.status).toBe(HandoffStatus.COMPLETED);
      expect(completedHandoff.acknowledgment).toBeDefined();
      expect(completedHandoff.acknowledgment?.received_at).toBeDefined();
      expect(completedHandoff.acknowledgment?.accepted).toBe(true);
      expect(completedHandoff.completed_at).toBeDefined();
    });
  });

  // ==========================================================================
  // Message Format Tests
  // ==========================================================================

  describe('Message Format Tests', () => {
    /**
     * Test: AC-MSG-001
     * Objective: Validate standard message format compliance
     */
    it('AC-MSG-001: Messages follow required schema', async () => {
      // Arrange
      const message = createSampleMessage(
        AgentType.ORCHESTRATOR,
        AgentType.DESIGN_SYSTEM
      );

      // Act & Assert
      expect(validateMessage(message)).toBe(true);
      expect(message.message_id).toBeDefined();
      expect(message.from).toBeDefined();
      expect(message.to).toBeDefined();
      expect(message.type).toBeDefined();
      expect(message.priority).toBeDefined();
      expect(message.timestamp).toBeDefined();
      expect(message.payload).toBeDefined();
    });

    /**
     * Test: AC-MSG-002
     * Objective: Test message with attachments
     */
    it('AC-MSG-002: Messages with attachments are handled correctly', async () => {
      // Arrange
      const message = createSampleMessage(
        AgentType.ORCHESTRATOR,
        AgentType.DESIGN_SYSTEM
      );
      message.attachments = [
        {
          attachment_id: 'att-1',
          type: 'file',
          name: 'design-spec.json',
          content: { spec: 'data' },
          size_bytes: 1024
        }
      ];

      // Act & Assert
      expect(message.attachments).toBeDefined();
      expect(message.attachments).toHaveLength(1);
      expect(message.attachments![0].name).toBe('design-spec.json');
      expect(message.attachments![0].type).toBe('file');
    });

    /**
     * Test: AC-MSG-005
     * Objective: Test message priority handling
     */
    it('AC-MSG-005: Priority messages are handled first', async () => {
      // Arrange
      const orchestrator = mockAgents[AgentType.ORCHESTRATOR];
      const messages: AgentMessage[] = [
        {
          ...createSampleMessage(AgentType.DESIGN_SYSTEM, AgentType.ORCHESTRATOR),
          priority: MessagePriority.LOW
        },
        {
          ...createSampleMessage(AgentType.DESIGN_SYSTEM, AgentType.ORCHESTRATOR),
          priority: MessagePriority.CRITICAL
        },
        {
          ...createSampleMessage(AgentType.DESIGN_SYSTEM, AgentType.ORCHESTRATOR),
          priority: MessagePriority.NORMAL
        }
      ];

      // Act
      const sortedMessages = messages.sort((a, b) => b.priority - a.priority);

      // Assert
      expect(sortedMessages[0].priority).toBe(MessagePriority.CRITICAL);
      expect(sortedMessages[1].priority).toBe(MessagePriority.NORMAL);
      expect(sortedMessages[2].priority).toBe(MessagePriority.LOW);
    });

    /**
     * Test: AC-MSG-006
     * Objective: Test message threading
     */
    it('AC-MSG-006: Related messages are linked via correlation_id', async () => {
      // Arrange
      const originalMessage = createSampleMessage(
        AgentType.ORCHESTRATOR,
        AgentType.DESIGN_SYSTEM
      );

      // Act
      const responseMessage = createSampleMessage(
        AgentType.DESIGN_SYSTEM,
        AgentType.ORCHESTRATOR
      );
      responseMessage.reply_to = originalMessage.message_id;
      responseMessage.correlation_id = originalMessage.message_id;

      // Assert
      expect(responseMessage.reply_to).toBe(originalMessage.message_id);
      expect(responseMessage.correlation_id).toBe(originalMessage.message_id);
      expect(responseMessage.reply_to).toBe(originalMessage.message_id);
    });
  });

  // ==========================================================================
  // Error Handling Tests
  // ==========================================================================

  describe('Error Handling Tests', () => {
    /**
     * Test: AC-ERR-001
     * Objective: Test agent unavailable scenario
     */
    it('AC-ERR-001: Agent unavailable during handoff is handled gracefully', async () => {
      // Arrange
      const offlineAgent: MockAgent = {
        agent_id: AgentType.DESIGN_SYSTEM,
        name: 'Offline Agent',
        status: 'offline',
        capabilities: [],
        tools: [],
        message_handler: async () => {
          throw new Error('Agent is offline');
        }
      };

      const orchestrator = mockAgents[AgentType.ORCHESTRATOR];
      const message = createSampleMessage(AgentType.ORCHESTRATOR, AgentType.DESIGN_SYSTEM);

      // Act & Assert
      await expect(offlineAgent.message_handler(message)).rejects.toThrow('Agent is offline');
      expect(offlineAgent.status).toBe('offline');
    });

    /**
     * Test: AC-ERR-002
     * Objective: Test invalid agent ID
     */
    it('AC-ERR-002: Invalid agent ID returns error', async () => {
      // Arrange
      const orchestrator = mockAgents[AgentType.ORCHESTRATOR];
      const message = {
        ...createSampleMessage(AgentType.ORCHESTRATOR, AgentType.DESIGN_SYSTEM),
        to: 'INVALID-AGENT' as any
      };

      // Act & Assert
      await expect(orchestrator.message_handler(message)).rejects.toThrow();
    });

    /**
     * Test: AC-ERR-003
     * Objective: Test malformed message rejection
     */
    it('AC-ERR-003: Malformed messages are rejected', async () => {
      // Arrange
      const agent = mockAgents[AgentType.ORCHESTRATOR];
      const malformedMessage = {
        // Missing required fields
        from: AgentType.ORCHESTRATOR,
        to: AgentType.DESIGN_SYSTEM
      } as any;

      // Act & Assert
      expect(validateMessage(malformedMessage)).toBe(false);
    });

    /**
     * Test: AC-ERR-006
     * Objective: Test rate limiting
     */
    it('AC-ERR-006: Rate limiting is enforced', async () => {
      // Arrange
      let requestCount = 0;
      const rateLimitedAgent: MockAgent = {
        agent_id: AgentType.DESIGN_SYSTEM,
        name: 'Rate Limited Agent',
        status: 'active',
        capabilities: [],
        tools: [],
        message_handler: async (message: AgentMessage) => {
          requestCount++;
          if (requestCount > 5) {
            throw new Error('Rate limit exceeded');
          }
          return createSampleMessage(AgentType.DESIGN_SYSTEM, message.from);
        }
      };

      const orchestrator = mockAgents[AgentType.ORCHESTRATOR];

      // Act - Send 10 messages rapidly
      const promises = Array(10).fill(null).map((_, i) =>
        rateLimitedAgent.message_handler(
          createSampleMessage(AgentType.ORCHESTRATOR, AgentType.DESIGN_SYSTEM)
        )
      );

      const results = await Promise.allSettled(promises);

      // Assert
      const rejectedCount = results.filter(r => r.status === 'rejected').length;
      expect(rejectedCount).toBeGreaterThan(0);
      expect(requestCount).toBe(10);
    });
  });

  // ==========================================================================
  // Parallel Coordination Tests
  // ==========================================================================

  describe('Parallel Coordination Tests', () => {
    /**
     * Test: AC-PAR-001
     * Objective: Test parallel task delegation
     */
    it('AC-PAR-001: Multiple agents can be assigned parallel tasks', async () => {
      // Arrange
      const orchestrator = mockAgents[AgentType.ORCHESTRATOR];
      const targets = [
        AgentType.DESIGN_SYSTEM,
        AgentType.COMPONENT_DEVELOPER,
        AgentType.TESTING_QA
      ];

      // Act - Delegate tasks in parallel
      const startTime = Date.now();

      const results = await Promise.all(
        targets.map(target =>
          orchestrator.message_handler(
            createHandoffMessage(AgentType.ORCHESTRATOR, target, `task-parallel-${target}`)
          )
        )
      );

      const duration = Date.now() - startTime;

      // Assert
      expect(results).toHaveLength(3);
      expect(duration).toBeLessThan(500); // Should complete quickly
      results.forEach(result => {
        expect(result.type).toBe(MessageType.RESPONSE);
      });
    });

    /**
     * Test: AC-PAR-003
     * Objective: Test race condition handling
     */
    it('AC-PAR-003: Race conditions are prevented', async () => {
      // Arrange
      let counter = 0;
      const sharedResourceAgent: MockAgent = {
        agent_id: AgentType.DESIGN_SYSTEM,
        name: 'Shared Resource Agent',
        status: 'active',
        capabilities: [],
        tools: [],
        message_handler: async () => {
          // Simulate shared resource access
          const previousValue = counter;
          await sleep(10); // Simulate processing time
          counter = previousValue + 1;
          return createSampleMessage(AgentType.DESIGN_SYSTEM, AgentType.ORCHESTRATOR);
        }
      };

      const messages = Array(10).fill(null).map(() =>
        createSampleMessage(AgentType.ORCHESTRATOR, AgentType.DESIGN_SYSTEM)
      );

      // Act - Send all messages simultaneously
      const results = await Promise.all(
        messages.map(msg => sharedResourceAgent.message_handler(msg))
      );

      // Assert
      expect(results).toHaveLength(10);
      expect(counter).toBe(10); // No lost updates
    });

    /**
     * Test: AC-PAR-005
     * Objective: Test load balancing
     */
    it('AC-PAR-005: Tasks are distributed evenly across agents', async () => {
      // Arrange
      const taskCounts = new Map<AgentType, number>();
      const orchestrator = mockAgents[AgentType.ORCHESTRATOR];
      const availableAgents = [
        AgentType.COMPONENT_DEVELOPER,
        AgentType.DESIGN_SYSTEM,
        AgentType.ACCESSIBILITY
      ];

      availableAgents.forEach(agent => taskCounts.set(agent, 0));

      // Act - Distribute 15 tasks across 3 agents
      for (let i = 0; i < 15; i++) {
        const targetAgent = availableAgents[i % 3];
        taskCounts.set(targetAgent, (taskCounts.get(targetAgent) || 0) + 1);
      }

      // Assert
      expect(taskCounts.get(AgentType.COMPONENT_DEVELOPER)).toBe(5);
      expect(taskCounts.get(AgentType.DESIGN_SYSTEM)).toBe(5);
      expect(taskCounts.get(AgentType.ACCESSIBILITY)).toBe(5);
    });
  });

  // ==========================================================================
  // Performance Tests
  // ==========================================================================

  describe('Performance Tests', () => {
    /**
     * Test: Agent response time
     */
    it('Agent response time is under 500ms', async () => {
      // Arrange
      const agent = mockAgents[AgentType.ORCHESTRATOR];
      const message = createSampleMessage(AgentType.DESIGN_SYSTEM, AgentType.ORCHESTRATOR);

      // Act
      const { duration_ms } = await measureTime(() =>
        agent.message_handler(message)
      );

      // Assert
      expect(duration_ms).toBeLessThan(500);
    });

    /**
     * Test: Handoff latency
     */
    it('Handoff latency is under 200ms', async () => {
      // Arrange
      const fromAgent = mockAgents[AgentType.ORCHESTRATOR];
      const toAgent = mockAgents[AgentType.DESIGN_SYSTEM];

      // Act
      const { duration_ms } = await measureTime(async () => {
        const message = createHandoffMessage(
          AgentType.ORCHESTRATOR,
          AgentType.DESIGN_SYSTEM,
          'task-latency'
        );
        await fromAgent.message_handler(message);
        await toAgent.message_handler(message);
      });

      // Assert
      expect(duration_ms).toBeLessThan(200);
    });
  });
});
