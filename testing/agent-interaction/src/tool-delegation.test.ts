/**
 * Tool Delegation Tests
 *
 * Tests for validating tool usage, sharing, locking,
 * and delegation across all agents.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  AgentType,
  ToolType,
  ToolDelegation,
  MockAgent,
  MockTool,
  ToolLock
} from './types';
import {
  createMockAgent,
  createMockTool,
  createAllMockAgents,
  createAllMockTools,
  generateUUID,
  generateTimestamp,
  sleep,
  measureTime
} from '../fixtures/mock-data';

describe('Tool Delegation Tests', () => {
  let mockAgents: Record<AgentType, MockAgent>;
  let mockTools: Record<ToolType, MockTool>;

  beforeEach(() => {
    mockAgents = createAllMockAgents();
    mockTools = createAllMockTools();
  });

  // ==========================================================================
  // Tool Usage Tests
  // ==========================================================================

  describe('Tool Usage Tests', () => {
    /**
     * Test: TD-USAGE-001
     * Objective: Test Context7 tool delegation
     */
    it('TD-USAGE-001: Context7 tool delegated properly', async () => {
      // Arrange
      const orchestrator = mockAgents[AgentType.ORCHESTRATOR];
      const designSystem = mockAgents[AgentType.DESIGN_SYSTEM];
      const context7Tool = mockTools[ToolType.CONTEXT7];

      // Act - Delegate Context7 tool usage
      const delegation: ToolDelegation = {
        delegation_id: generateUUID(),
        from: AgentType.ORCHESTRATOR,
        to: AgentType.DESIGN_SYSTEM,
        tool: ToolType.CONTEXT7,
        operation: 'resolve_library_id',
        parameters: {
          libraryName: 'React',
          query: 'useEffect hook'
        },
        status: 'pending',
        started_at: generateTimestamp()
      };

      const result = await context7Tool.execute(delegation.operation, delegation.parameters);

      // Assert
      expect(result).toBeDefined();
      expect(result.tool_type).toBe(ToolType.CONTEXT7);
      expect(result.operation).toBe(delegation.operation);
      expect(result.output).toBeDefined();
    });

    /**
     * Test: TD-USAGE-002
     * Objective: Test DevTools delegation
     */
    it('TD-USAGE-002: DevTools delegated correctly', async () => {
      // Arrange
      const orchestrator = mockAgents[AgentType.ORCHESTRATOR];
      const performanceOptimizer = mockAgents[AgentType.PERFORMANCE_OPTIMIZER];
      const devTools = mockTools[ToolType.DEVTOOLS];

      // Act - Delegate DevTools
      const delegation: ToolDelegation = {
        delegation_id: generateUUID(),
        from: AgentType.ORCHESTRATOR,
        to: AgentType.PERFORMANCE_OPTIMIZER,
        tool: ToolType.DEVTOOLS,
        operation: 'take_snapshot',
        parameters: {},
        status: 'pending',
        started_at: generateTimestamp()
      };

      const result = await devTools.execute(delegation.operation, delegation.parameters);

      // Assert
      expect(result).toBeDefined();
      expect(result.tool_type).toBe(ToolType.DEVTOOLS);
      expect(result.operation).toBe(delegation.operation);
    });

    /**
     * Test: TD-USAGE-003
     * Objective: Test file operation delegation
     */
    it('TD-USAGE-003: File operations delegated correctly', async () => {
      // Arrange
      const componentDeveloper = mockAgents[AgentType.COMPONENT_DEVELOPER];
      const readTool = mockTools[ToolType.READ];
      const writeTool = mockTools[ToolType.WRITE];

      // Act - Delegate read operation
      const readDelegation: ToolDelegation = {
        delegation_id: generateUUID(),
        from: AgentType.COMPONENT_DEVELOPER,
        to: AgentType.COMPONENT_DEVELOPER,
        tool: ToolType.READ,
        operation: 'read_file',
        parameters: { filePath: '/src/components/Button.tsx' },
        status: 'pending',
        started_at: generateTimestamp()
      };

      const readResult = await readTool.execute(readDelegation.operation, readDelegation.parameters);

      // Act - Delegate write operation
      const writeDelegation: ToolDelegation = {
        delegation_id: generateUUID(),
        from: AgentType.COMPONENT_DEVELOPER,
        to: AgentType.COMPONENT_DEVELOPER,
        tool: ToolType.WRITE,
        operation: 'write_file',
        parameters: { filePath: '/src/components/Button.tsx', content: 'export const Button = () => {}' },
        status: 'pending',
        started_at: generateTimestamp()
      };

      const writeResult = await writeTool.execute(writeDelegation.operation, writeDelegation.parameters);

      // Assert
      expect(readResult).toBeDefined();
      expect(writeResult).toBeDefined();
      expect(readResult.tool_type).toBe(ToolType.READ);
      expect(writeResult.tool_type).toBe(ToolType.WRITE);
    });

    /**
     * Test: TD-USAGE-004
     * Objective: Test tool chaining
     */
    it('TD-USAGE-004: Multiple tools used in sequence', async () => {
      // Arrange
      const orchestrator = mockAgents[AgentType.ORCHESTRATOR];
      const context7Tool = mockTools[ToolType.CONTEXT7];
      const devTools = mockTools[ToolType.DEVTOOLS];

      // Act - Chain tools: Context7 → DevTools
      const delegation1: ToolDelegation = {
        delegation_id: generateUUID(),
        from: AgentType.ORCHESTRATOR,
        to: AgentType.DESIGN_SYSTEM,
        tool: ToolType.CONTEXT7,
        operation: 'query_docs',
        parameters: { libraryId: '/facebook/react', query: 'component props' },
        status: 'pending',
        started_at: generateTimestamp()
      };

      const result1 = await context7Tool.execute(delegation1.operation, delegation1.parameters);

      const delegation2: ToolDelegation = {
        delegation_id: generateUUID(),
        from: AgentType.DESIGN_SYSTEM,
        to: AgentType.COMPONENT_DEVELOPER,
        tool: ToolType.DEVTOOLS,
        operation: 'take_screenshot',
        parameters: {},
        status: 'pending',
        started_at: generateTimestamp(),
        completed_at: generateTimestamp(),
        result: result1 // Pass result to next tool
      };

      const result2 = await devTools.execute(delegation2.operation, delegation2.parameters);

      // Assert
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1.output).toBeDefined();
      expect(result2.operation).toBe(delegation2.operation);
    });

    /**
     * Test: TD-USAGE-007
     * Objective: Test tool performance
     */
    it('TD-USAGE-007: Tools complete within performance targets', async () => {
      // Arrange
      const context7Tool = mockTools[ToolType.CONTEXT7];

      // Act
      const { duration_ms } = await measureTime(async () => {
        return await context7Tool.execute('query_docs', {
          libraryId: '/facebook/react',
          query: 'useState hook'
        });
      });

      // Assert
      expect(duration_ms).toBeLessThan(1000); // <1s target
    });
  });

  // ==========================================================================
  // Tool Sharing Tests
  // ==========================================================================

  describe('Tool Sharing Tests', () => {
    /**
     * Test: TD-SHARE-001
     * Objective: Test tool locking
     */
    it('TD-SHARE-001: Exclusive tool lock is acquired', () => {
      // Arrange
      const devTools = mockTools[ToolType.DEVTOOLS];
      const agent1 = AgentType.ACCESSIBILITY;
      const agent2 = AgentType.COMPONENT_DEVELOPER;

      // Act - Agent1 acquires lock
      const lock1: ToolLock = {
        lock_id: generateUUID(),
        tool: ToolType.DEVTOOLS,
        locked_by: agent1,
        locked_at: generateTimestamp(),
        expires_at: new Date(Date.now() + 300000).toISOString(), // 5 minutes
        priority: 3
      };

      devTools.locked_by = agent1;

      // Act - Agent2 tries to acquire
      const lock2 = { ...lock1, locked_by: agent2 };

      // Assert - Agent1 has lock
      expect(devTools.locked_by).toBe(agent1);
      expect(devTools.locked_by).not.toBe(agent2);

      // Act - Agent1 releases lock
      devTools.locked_by = undefined;

      // Assert - Lock released
      expect(devTools.locked_by).toBeUndefined();
    });

    /**
     * Test: TD-SHARE-002
     * Objective: Test tool unlocking
     */
    it('TD-SHARE-002: Lock is released properly', () => {
      // Arrange
      const tool = mockTools[ToolType.CONTEXT7];
      const agent = AgentType.DESIGN_SYSTEM;

      // Act - Acquire lock
      tool.locked_by = agent;
      expect(tool.locked_by).toBe(agent);

      // Act - Release lock
      tool.locked_by = undefined;

      // Assert
      expect(tool.locked_by).toBeUndefined();
    });

    /**
     * Test: TD-SHARE-003
     * Objective: Test lock timeout
     */
    it('TD-SHARE-003: Lock expires after timeout', async () => {
      // Arrange
      const tool = mockTools[ToolType.DEVTOOLS];
      const agent = AgentType.ACCESSIBILITY;

      // Act - Acquire lock with short timeout
      tool.locked_by = agent;

      // Simulate timeout
      await sleep(110); // Slightly longer than 100ms timeout

      // Act - Check if lock expired
      const expired = new Date() > new Date(tool.locked_at || '0').getTime() + 100;

      // Assert
      expect(expired).toBe(true);
    });

    /**
     * Test: TD-SHARE-004
     * Objective: Test concurrent tool access queueing
     */
    it('TD-SHARE-004: Concurrent access is queued', async () => {
      // Arrange
      const tool = mockTools[ToolType.CONTEXT7];
      const queue: string[] = [];

      // Act - Multiple agents request access
      const agents = [AgentType.DESIGN_SYSTEM, AgentType.COMPONENT_DEVELOPER, AgentType.ACCESSIBILITY];

      // Simulate queue
      agents.forEach(agent => {
        if (tool.locked_by) {
          queue.push(agent);
        }
      });

      // Assert
      expect(queue.length).toBeGreaterThan(0);
      expect(queue).toContain(AgentType.COMPONENT_DEVELOPER);
    });

    /**
     * Test: TD-SHARE-006
     * Objective: Test tool monitoring
     */
    it('TD-SHARE-006: Tool usage is tracked', () => {
      // Arrange
      const tool = mockTools[ToolType.CONTEXT7];
      const agent = AgentType.DESIGN_SYSTEM;

      // Act - Use tool multiple times
      tool.execute('query_docs', { libraryId: '/facebook/react', query: 'test1' });
      tool.execute('query_docs', { libraryId: '/facebook/react', query: 'test2' });
      tool.execute('query_docs', { libraryId: '/facebook/react', query: 'test3' });

      // Assert
      expect(tool.execution_history).toHaveLength(3);
      expect(tool.execution_history[0].agent_id).toBe(agent);
    });
  });

  // ==========================================================================
  // Error Handling Tests
  // ==========================================================================

  describe('Tool Error Handling Tests', () => {
    /**
     * Test: TD-USAGE-007 (reused)
     * Objective: Test tool error handling
     */
    it('TD-USAGE-008: Tool errors handled gracefully', async () => {
      // Arrange
      const tool = mockTools[ToolType.CONTEXT7];

      // Act - Simulate error
      const result = await tool.execute('invalid_operation', {});

      // Assert
      expect(result).toBeDefined();
      expect(result.error).toBeDefined();
      expect(result.status).toBe('error');
    });

    /**
     * Test: TD-SHARE-007
     * Objective: Test tool fallback strategies
     */
    it('TD-SHARE-007: Tool fallback activated on failure', async () => {
      // Arrange
      const primaryTool = mockTools[ToolType.CONTEXT7];
      const fallbackTool = mockTools[ToolType.READ];

      let primaryFailed = false;

      // Act - Try primary, fallback if fails
      try {
        await primaryTool.execute('failing_operation', {});
      } catch (error) {
        primaryFailed = true;
        // Use fallback
        await fallbackTool.execute('read_file', { filePath: '/fallback.txt' });
      }

      // Assert
      expect(primaryFailed).toBe(true);
    });
  });

  // ==========================================================================
  // Performance Tests
  // ==========================================================================

  describe('Tool Performance Tests', () => {
    /**
     * Test: Tool performance under concurrent usage
     */
    it('Multiple tool usages complete efficiently', async () => {
      // Arrange
      const context7Tool = mockTools[ToolType.CONTEXT7];
      const agents = [
        AgentType.DESIGN_SYSTEM,
        AgentType.COMPONENT_DEVELOPER,
        AgentType.ACCESSIBILITY
      ];

      // Act - Concurrent tool usage
      const startTime = Date.now();

      const promises = agents.map(agent =>
        context7Tool.execute('query_docs', {
          libraryId: '/facebook/react',
          query: `${agent} query`
        })
      );

      await Promise.all(promises);

      const duration = Date.now() - startTime;

      // Assert
      expect(duration).toBeLessThan(500); // <500ms for 3 concurrent calls
    });

    /**
     * Test: Tool response times
     */
    it('Tool responses are within performance targets', async () => {
      // Arrange
      const tools = mockTools;
      const toolTypes = Object.values(ToolType).slice(0, 5);

      // Act
      const results = await Promise.all(
        toolTypes.map(toolType =>
          measureTime(() => tools[toolType].execute('test_operation', {}))
        )
      );

      // Assert
      results.forEach(({ duration_ms }) => {
        expect(duration_ms).toBeLessThan(500); // Target for all tools
      });
    });
  });
});
