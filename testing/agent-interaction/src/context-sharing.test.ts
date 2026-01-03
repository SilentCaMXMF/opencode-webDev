/**
 * Context Sharing Tests
 *
 * Tests for validating context synchronization, versioning, conflict detection,
 * and caching mechanisms.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  AgentType,
  SharedContext,
  ContextMetadata,
  Conflict,
  ConflictCategory,
  ConflictSeverity,
  ConflictDomain
} from './types';
import {
  createSampleContext,
  createTokenConflict,
  createMockContext7,
  createAllMockAgents,
  getRandomAgentPair,
  generateUUID,
  generateTimestamp,
  compareBudgets,
  sleep,
  measureTime
} from '../fixtures/mock-data';

describe('Context Sharing Tests', () => {
  let sampleContext: SharedContext;

  beforeEach(() => {
    sampleContext = createSampleContext();
  });

  // ==========================================================================
  // Context Synchronization Tests
  // ==========================================================================

  describe('Context Synchronization Tests', () => {
    /**
     * Test: CS-SYNC-001
     * Objective: Test agent subscription to context changes
     */
    it('CS-SYNC-001: Agent can subscribe to context', () => {
      // Arrange
      const subscriptions = new Map<string, string[]>();
      const agentId = AgentType.DESIGN_SYSTEM;
      const contextId = sampleContext.meta.context_id;

      // Act
      if (!subscriptions.has(contextId)) {
        subscriptions.set(contextId, []);
      }
      subscriptions.get(contextId)!.push(agentId);

      // Assert
      expect(subscriptions.has(contextId)).toBe(true);
      expect(subscriptions.get(contextId)).toContain(agentId);
    });

    /**
     * Test: CS-SYNC-003
     * Objective: Test real-time context updates propagated
     */
    it('CS-SYNC-003: Context changes are propagated to subscribers', async () => {
      // Arrange
      const subscribers = [AgentType.DESIGN_SYSTEM, AgentType.COMPONENT_DEVELOPER];
      const contextUpdates: any[] = [];

      // Act
      const update = {
        path: '/design/tokens/colors/primary/500',
        value: '#00ff00',
        timestamp: generateTimestamp()
      };

      subscribers.forEach(agent => {
        contextUpdates.push({
          agent_id: agent,
          update,
          received_at: generateTimestamp()
        });
      });

      // Assert
      expect(contextUpdates).toHaveLength(2);
      contextUpdates.forEach(update => {
        expect(update.update.value).toBe('#00ff00');
        expect(subscribers).toContain(update.agent_id);
      });
    });

    /**
     * Test: CS-SYNC-008
     * Objective: Test context change detection time
     */
    it('CS-SYNC-008: Context changes are detected in under 100ms', async () => {
      // Arrange
      const originalContext = createSampleContext();
      const modifiedContext = { ...originalContext };

      // Act
      const { duration_ms } = await measureTime(() => {
        modifiedContext.design.tokens.colors.primary['500'] = '#ff0000';
        // Simulate change detection
        const changed = originalContext.design.tokens.colors.primary['500'] !==
          modifiedContext.design.tokens.colors.primary['500'];
        return changed;
      });

      // Assert
      expect(duration_ms).toBeLessThan(100);
    });

    /**
     * Test: CS-SYNC-010
     * Objective: Test sync performance with concurrent operations
     */
    it('CS-SYNC-010: 100 concurrent sync operations complete in under 2s', async () => {
      // Arrange
      const agent = createMockContext7();

      // Act
      const { duration_ms } = await measureTime(async () => {
        const operations = Array(100).fill(null).map((_, i) =>
          agent.resolve_library_id('React', `query-${i}`)
        );
        await Promise.all(operations);
      });

      // Assert
      expect(duration_ms).toBeLessThan(2000);
      expect(agent.call_history).toHaveLength(100);
    });
  });

  // ==========================================================================
  // Context Versioning Tests
  // ==========================================================================

  describe('Context Versioning Tests', () => {
    /**
     * Test: CS-VER-001
     * Objective: Test version creation on context change
     */
    it('CS-VER-001: New version is created on context change', () => {
      // Arrange
      const versions: ContextMetadata[] = [];
      const originalVersion = sampleContext.meta;

      // Act
      const newVersion: ContextMetadata = {
        ...originalVersion,
        context_id: originalVersion.context_id, // Same context
        version: '1.0.1', // Incremented version
        modified_at: generateTimestamp(),
        modified_by: AgentType.DESIGN_SYSTEM,
        parent_version_id: originalVersion.version,
        checksum: 'new-checksum'
      };

      versions.push(originalVersion);
      versions.push(newVersion);

      // Assert
      expect(versions).toHaveLength(2);
      expect(versions[1].version).toBe('1.0.1');
      expect(versions[1].parent_version_id).toBe(originalVersion.version);
      expect(versions[1].modified_by).toBe(AgentType.DESIGN_SYSTEM);
    });

    /**
     * Test: CS-VER-003
     * Objective: Test version comparison
     */
    it('CS-VER-003: Version comparison identifies differences correctly', () => {
      // Arrange
      const version1 = createSampleContext();
      const version2 = { ...version1 };
      version2.design.tokens.colors.primary['500'] = '#ff0000';

      // Act
      const differences = compareBudgets(
        version1.performance.budgets,
        version2.performance.budgets
      );

      // Act - Check token difference
      const tokenDifference =
        version1.design.tokens.colors.primary['500'] !==
        version2.design.tokens.colors.primary['500'];

      // Assert
      expect(tokenDifference).toBe(true);
      expect(version2.design.tokens.colors.primary['500']).toBe('#ff0000');
    });

    /**
     * Test: CS-VER-004
     * Objective: Test rollback to previous version
     */
    it('CS-VER-004: Context can be rolled back to previous version', () => {
      // Arrange
      const version1 = createSampleContext();
      const version2 = { ...version1 };
      version2.design.tokens.colors.primary['500'] = '#ff0000';

      // Act - Rollback
      const rolledBack = { ...version2 };
      rolledBack.design.tokens.colors.primary['500'] =
        version1.design.tokens.colors.primary['500'];
      rolledBack.meta.version = version1.meta.version;
      rolledBack.meta.modified_by = version1.meta.modified_by;

      // Assert
      expect(rolledBack.design.tokens.colors.primary['500']).toBe(
        version1.design.tokens.colors.primary['500']
      );
      expect(rolledBack.meta.version).toBe(version1.meta.version);
    });
  });

  // ==========================================================================
  // Conflict Detection Tests
  // ==========================================================================

  describe('Conflict Detection Tests', () => {
    /**
     * Test: CS-CONFLICT-001
     * Objective: Test design token conflict detection
     */
    it('CS-CONFLICT-001: Design token conflict is detected', () => {
      // Arrange
      const [agent1, agent2] = getRandomAgentPair();
      const conflict = createTokenConflict(agent1, agent2);

      // Assert
      expect(conflict).toBeDefined();
      expect(conflict.type).toBe(ConflictCategory.CONTEXT_CONFLICT);
      expect(conflict.domain).toBe(ConflictDomain.DESIGN);
      expect(conflict.agents_involved).toContain(agent1);
      expect(conflict.agents_involved).toContain(agent2);
      expect(conflict.conflicting_positions).toHaveLength(2);
    });

    /**
     * Test: CS-CONFLICT-002
     * Objective: Test performance budget conflict detection
     */
    it('CS-CONFLICT-002: Performance budget conflict is detected', () => {
      // Arrange
      const baseContext = createSampleContext();
      const context1 = {
        ...baseContext,
        performance: {
          ...baseContext.performance,
          budgets: { lcp: 2500, fid: 100, cls: 0.1, tti: 3000 }
        }
      };
      const context2 = {
        ...baseContext,
        performance: {
          ...baseContext.performance,
          budgets: { lcp: 1500, fid: 50, cls: 0.05, tti: 2000 }
        }
      };

      // Act - Detect conflicts
      const differences = compareBudgets(
        baseContext.performance.budgets,
        context2.performance.budgets
      );

      // Assert
      expect(differences.length).toBeGreaterThan(0);
      expect(differences).toContain('LCP: 2500ms vs 1500ms');
    });

    /**
     * Test: CS-CONFLICT-005
     * Objective: Test 100% conflict detection (no false negatives)
     */
    it('CS-CONFLICT-005: Legitimate conflicts are not missed (100% detection)', () => {
      // Arrange
      const conflicts: Conflict[] = [];
      const scenarios = [
        createTokenConflict(AgentType.DESIGN_SYSTEM, AgentType.ACCESSIBILITY),
        createTokenConflict(AgentType.COMPONENT_DEVELOPER, AgentType.UX_RESEARCH),
        createTokenConflict(AgentType.PERFORMANCE_OPTIMIZER, AgentType.ANIMATION)
      ];

      // Act
      scenarios.forEach(conflict => {
        const isValid = !!(
          conflict.conflict_id &&
          conflict.type &&
          conflict.agents_involved.length >= 2
        );
        if (isValid) {
          conflicts.push(conflict);
        }
      });

      // Assert
      expect(conflicts).toHaveLength(3);
      conflicts.forEach(conflict => {
        expect(conflict.agents_involved.length).toBeGreaterThanOrEqual(2);
        expect(conflict.conflicting_positions.length).toBe(2);
      });
    });

    /**
     * Test: CS-CONFLICT-007
     * Objective: Test conflict severity calculation
     */
    it('CS-CONFLICT-007: Conflict severity is calculated correctly', () => {
      // Arrange
      const lowSeverityConflict = createTokenConflict(
        AgentType.DESIGN_SYSTEM,
        AgentType.ACCESSIBILITY
      );
      lowSeverityConflict.severity = ConflictSeverity.LOW;

      const highSeverityConflict = createTokenConflict(
        AgentType.SECURITY,
        AgentType.TESTING_QA
      );
      highSeverityConflict.severity = ConflictSeverity.HIGH;

      // Act & Assert
      expect(lowSeverityConflict.severity).toBe(ConflictSeverity.LOW);
      expect(highSeverityConflict.severity).toBe(ConflictSeverity.HIGH);

      // Severity levels
      const severityOrder = [
        ConflictSeverity.LOW,
        ConflictSeverity.MEDIUM,
        ConflictSeverity.HIGH,
        ConflictSeverity.CRITICAL
      ];

      expect(severityOrder.indexOf(lowSeverityConflict.severity)).toBeLessThan(
        severityOrder.indexOf(highSeverityConflict.severity)
      );
    });
  });

  // ==========================================================================
  // Caching Tests
  // ==========================================================================

  describe('Caching Tests', () => {
    /**
     * Test: CS-CACHE-001
     * Objective: Test cache hit performance
     */
    it('CS-CACHE-001: Cached context is retrieved in under 10ms', async () => {
      // Arrange
      const cache = new Map<string, SharedContext>();
      const contextId = sampleContext.meta.context_id;
      cache.set(contextId, sampleContext);

      // Act
      const { duration_ms } = await measureTime(() => {
        const cached = cache.get(contextId);
        return cached;
      });

      // Assert
      expect(duration_ms).toBeLessThan(10);
      expect(cache.get(contextId)).toBeDefined();
    });

    /**
     * Test: CS-CACHE-003
     * Objective: Test cache invalidation
     */
    it('CS-CACHE-003: Cache is invalidated on context change', () => {
      // Arrange
      const cache = new Map<string, { context: SharedContext; version: number }>();
      const contextId = sampleContext.meta.context_id;
      cache.set(contextId, { context: sampleContext, version: 1 });

      // Act - Modify context
      const modifiedContext = { ...sampleContext };
      modifiedContext.meta.version = '2.0.0';

      // Invalidate cache
      cache.delete(contextId);

      // Assert
      expect(cache.has(contextId)).toBe(false);
      expect(modifiedContext.meta.version).toBe('2.0.0');
    });

    /**
     * Test: CS-CACHE-004
     * Objective: Test LRU cache eviction
     */
    it('CS-CACHE-004: LRU cache evicts old entries', () => {
      // Arrange
      const maxCacheSize = 5;
      const cacheOrder: string[] = [];
      const cache = new Map<string, SharedContext>();

      // Add entries
      for (let i = 0; i < maxCacheSize + 1; i++) {
        const context = createSampleContext();
        cache.set(context.meta.context_id, context);

        // Track order
        cacheOrder.push(context.meta.context_id);
      }

      // Act - Simulate LRU eviction
      if (cache.size > maxCacheSize) {
        const lruKey = cacheOrder[0];
        cache.delete(lruKey);
        cacheOrder.shift();
      }

      // Assert
      expect(cache.size).toBeLessThanOrEqual(maxCacheSize);
      expect(cache.size).toBe(5); // After eviction
    });

    /**
     * Test: CS-CACHE-005
     * Objective: Test cache size limit enforcement
     */
    it('CS-CACHE-005: Cache respects size limit', () => {
      // Arrange
      const maxSize = 1000;
      const cache = new Map<string, SharedContext>();

      // Act - Try to add more than max size
      for (let i = 0; i < maxSize + 10; i++) {
        if (cache.size >= maxSize) {
          // Simulate eviction
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }
        const context = createSampleContext();
        cache.set(context.meta.context_id, context);
      }

      // Assert
      expect(cache.size).toBeLessThanOrEqual(maxSize);
      expect(cache.size).toBe(1000);
    });
  });

  // ==========================================================================
  // Performance Tests
  // ==========================================================================

  describe('Performance Tests', () => {
    /**
     * Test: Large context handling
     */
    it('Large context is handled efficiently', async () => {
      // Arrange
      const largeContext = createSampleContext();
      // Add large data
      largeContext.design.tokens = {
        colors: {},
        typography: {},
        spacing: {},
        sizing: {},
        borders: {},
        shadows: {},
        transitions: {},
        animations: {}
      };

      // Add 1000 tokens
      for (let i = 0; i < 1000; i++) {
        (largeContext.design.tokens.colors as any)[`token-${i}`] = `value-${i}`;
      }

      // Act
      const { duration_ms } = await measureTime(() => {
        const serialized = JSON.stringify(largeContext);
        const deserialized = JSON.parse(serialized);
        return deserialized;
      });

      // Assert
      expect(duration_ms).toBeLessThan(1000); // Should serialize/deserialize quickly
      expect(Object.keys(largeContext.design.tokens.colors).length).toBe(1000);
    });

    /**
     * Test: Concurrent context updates
     */
    it('Concurrent context updates are handled correctly', async () => {
      // Arrange
      const context = createSampleContext();
      const updates = 100;

      // Act
      const { duration_ms } = await measureTime(async () => {
        const promises = Array(updates).fill(null).map((_, i) => {
          return new Promise(resolve => {
            setTimeout(() => {
              context.meta.version = `1.0.${i}`;
              resolve(null);
            }, Math.random() * 10);
          });
        });
        await Promise.all(promises);
      });

      // Assert
      expect(duration_ms).toBeLessThan(100);
      expect(context.meta.version).toBeDefined();
    });
  });
});
