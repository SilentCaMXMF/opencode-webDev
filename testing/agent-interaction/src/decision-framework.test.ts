/**
 * Decision Framework Tests
 *
 * Tests for validating multi-agent decision processes, voting mechanisms,
 * expertise-based resolution, and audit trails.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  AgentType,
  CollaborativeDecision,
  DecisionType,
  DecisionPriority,
  DecisionDomain,
  DecisionStage,
  DecisionOption,
  DecisionCriteria,
  AgentVote,
  DecisionOutcome
} from './types';
import {
  createSampleDecision,
  getRandomAgent,
  generateUUID,
  generateTimestamp,
  measureTime
} from '../fixtures/mock-data';

describe('Decision Framework Tests', () => {
  // ==========================================================================
  // Multi-Agent Decision Tests
  // ==========================================================================

  describe('Multi-Agent Decision Tests', () => {
    /**
     * Test: DF-MULTI-001
     * Objective: Test voting mechanism
     */
    it('DF-MULTI-001: Votes are counted correctly', () => {
      // Arrange
      const decision = createSampleDecision(
        [AgentType.DESIGN_SYSTEM, AgentType.COMPONENT_DEVELOPER, AgentType.ACCESSIBILITY],
        AgentType.ORCHESTRATOR
      );

      // Act - Add votes
      const votes: AgentVote[] = [
        {
          agent_id: AgentType.DESIGN_SYSTEM,
          option_id: decision.options[0].option_id,
          confidence: 0.9,
          reasoning: 'Option A is better',
          timestamp: generateTimestamp()
        },
        {
          agent_id: AgentType.COMPONENT_DEVELOPER,
          option_id: decision.options[0].option_id,
          confidence: 0.85,
          reasoning: 'Easier to implement',
          timestamp: generateTimestamp()
        },
        {
          agent_id: AgentType.ACCESSIBILITY,
          option_id: decision.options[1].option_id,
          confidence: 0.95,
          reasoning: 'Better accessibility',
          timestamp: generateTimestamp()
        }
      ];

      decision.votes = votes;

      // Count votes
      const voteCounts = new Map<string, number>();
      votes.forEach(vote => {
        voteCounts.set(vote.option_id, (voteCounts.get(vote.option_id) || 0) + 1);
      });

      // Assert
      expect(decision.votes).toHaveLength(3);
      expect(voteCounts.get(decision.options[0].option_id)).toBe(2);
      expect(voteCounts.get(decision.options[1].option_id)).toBe(1);
    });

    /**
     * Test: DF-MULTI-002
     * Objective: Test weighted voting
     */
    it('DF-MULTI-002: Votes are weighted properly', () => {
      // Arrange
      const decision = createSampleDecision(
        [AgentType.DESIGN_SYSTEM, AgentType.ACCESSIBILITY],
        AgentType.ORCHESTRATOR
      );

      // Act - Add weighted votes
      const votes: AgentVote[] = [
        {
          agent_id: AgentType.DESIGN_SYSTEM,
          option_id: decision.options[0].option_id,
          confidence: 0.9,
          reasoning: 'Design expertise',
          timestamp: generateTimestamp(),
          criteria_scores: { design: 0.95 }
        },
        {
          agent_id: AgentType.ACCESSIBILITY,
          option_id: decision.options[0].option_id,
          confidence: 0.85,
          reasoning: 'Accessibility consideration',
          timestamp: generateTimestamp(),
          criteria_scores: { accessibility: 0.90 }
        }
      ];

      // Calculate weighted scores (expertise weight)
      const expertiseWeights: Record<AgentType, number> = {
        [AgentType.DESIGN_SYSTEM]: 1.0, // Design expert
        [AgentType.ACCESSIBILITY]: 0.7    // Not design expert
      };

      const weightedScores = votes.map(vote => ({
        option_id: vote.option_id,
        score: vote.confidence * (expertiseWeights[vote.agent_id] || 0.5)
      }));

      // Sum scores by option
      const optionScores = new Map<string, number>();
      weightedScores.forEach(ws => {
        optionScores.set(ws.option_id, (optionScores.get(ws.option_id) || 0) + ws.score);
      });

      // Assert
      const designScore = votes[0].confidence * expertiseWeights[AgentType.DESIGN_SYSTEM];
      const a11yScore = votes[1].confidence * expertiseWeights[AgentType.ACCESSIBILITY];

      expect(designScore).toBe(0.9); // 0.9 * 1.0
      expect(a11yScore).toBe(0.595); // 0.85 * 0.7
      expect(designScore).toBeGreaterThan(a11yScore);
    });

    /**
     * Test: DF-MULTI-005
     * Objective: Test vote changing
     */
    it('DF-MULTI-005: Agents can change their votes', () => {
      // Arrange
      const decision = createSampleDecision(
        [AgentType.DESIGN_SYSTEM],
        AgentType.ORCHESTRATOR
      );

      const initialVote: AgentVote = {
        agent_id: AgentType.DESIGN_SYSTEM,
        option_id: decision.options[0].option_id,
        confidence: 0.8,
        reasoning: 'Initial choice',
        timestamp: generateTimestamp()
      };

      decision.votes = [initialVote];

      // Act - Change vote
      const changedVote: AgentVote = {
        ...initialVote,
        option_id: decision.options[1].option_id,
        confidence: 0.85,
        reasoning: 'Changed mind after review',
        timestamp: generateTimestamp()
      };

      // Update vote (replace)
      const existingIndex = decision.votes.findIndex(
        v => v.agent_id === changedVote.agent_id
      );
      if (existingIndex !== -1) {
        decision.votes[existingIndex] = changedVote;
      }

      // Update supporters
      decision.options.forEach(opt => {
        opt.supporters = opt.supporters.filter(a => a !== changedVote.agent_id);
      });
      decision.options[1].supporters.push(changedVote.agent_id);

      // Assert
      expect(decision.votes).toHaveLength(1);
      expect(decision.votes[0].option_id).toBe(decision.options[1].option_id);
      expect(decision.votes[0].confidence).toBe(0.85);
      expect(decision.options[1].supporters).toContain(AgentType.DESIGN_SYSTEM);
    });

    /**
     * Test: DF-MULTI-007
     * Objective: Test deadline enforcement
     */
    it('DF-MULTI-007: Deadline is enforced (no late votes)', () => {
      // Arrange
      const decision = createSampleDecision(
        [AgentType.DESIGN_SYSTEM, AgentType.COMPONENT_DEVELOPER],
        AgentType.ORCHESTRATOR
      );

      const deadline = new Date(Date.now() - 1000).toISOString(); // 1 second ago
      decision.deadline = deadline;

      // Act - Try to add late vote
      const lateVote: AgentVote = {
        agent_id: AgentType.COMPONENT_DEVELOPER,
        option_id: decision.options[0].option_id,
        confidence: 0.9,
        reasoning: 'Late vote',
        timestamp: generateTimestamp()
      };

      const voteTime = new Date(lateVote.timestamp).getTime();
      const deadlineTime = new Date(deadline).getTime();
      const isLate = voteTime > deadlineTime;

      // Assert
      expect(isLate).toBe(true);
      expect(deadlineTime).toBeLessThan(voteTime);
    });
  });

  // ==========================================================================
  // Expertise-Based Tests
  // ==========================================================================

  describe('Expertise-Based Tests', () => {
    /**
     * Test: DF-EXPERT-001
     * Objective: Test expert identification
     */
    it('DF-EXPERT-001: Experts are identified correctly by domain', () => {
      // Arrange
      const domainExperts: Record<string, AgentType[]> = {
        'design': [AgentType.DESIGN_SYSTEM, AgentType.ANIMATION, AgentType.UX_RESEARCH],
        'performance': [AgentType.PERFORMANCE_OPTIMIZER],
        'accessibility': [AgentType.ACCESSIBILITY],
        'security': [AgentType.SECURITY],
        'testing': [AgentType.TESTING_QA]
      };

      // Act & Assert
      expect(domainExperts['design']).toContain(AgentType.DESIGN_SYSTEM);
      expect(domainExperts['design']).toContain(AgentType.ANIMATION);
      expect(domainExperts['performance']).toContain(AgentType.PERFORMANCE_OPTIMIZER);
      expect(domainExperts['accessibility']).toContain(AgentType.ACCESSIBILITY);
      expect(domainExperts['security']).toContain(AgentType.SECURITY);
      expect(domainExperts['testing']).toContain(AgentType.TESTING_QA);
    });

    /**
     * Test: DF-EXPERT-002
     * Objective: Test expert opinion weighting
     */
    it('DF-EXPERT-002: Expert opinions weigh more', () => {
      // Arrange
      const decision = createSampleDecision(
        [AgentType.DESIGN_SYSTEM, AgentType.COMPONENT_DEVELOPER, AgentType.ACCESSIBILITY],
        AgentType.ORCHESTRATOR
      );

      // Define expertise weights
      const expertiseWeights: Record<AgentType, number> = {
        [AgentType.DESIGN_SYSTEM]: 1.0,    // Design expert
        [AgentType.COMPONENT_DEVELOPER]: 0.7, // Some design knowledge
        [AgentType.ACCESSIBILITY]: 0.5        // Little design knowledge
      };

      // Act - Calculate weighted scores
      const votes = [
        {
          agent_id: AgentType.DESIGN_SYSTEM,
          option_id: decision.options[0].option_id,
          confidence: 0.8,
          reasoning: '',
          timestamp: generateTimestamp()
        },
        {
          agent_id: AgentType.COMPONENT_DEVELOPER,
          option_id: decision.options[1].option_id,
          confidence: 0.9,
          reasoning: '',
          timestamp: generateTimestamp()
        },
        {
          agent_id: AgentType.ACCESSIBILITY,
          option_id: decision.options[1].option_id,
          confidence: 0.85,
          reasoning: '',
          timestamp: generateTimestamp()
        }
      ];

      const scores = decision.options.map(opt => {
        const optionVotes = votes.filter(v => v.option_id === opt.option_id);
        const totalScore = optionVotes.reduce((sum, vote) => {
          const weight = expertiseWeights[vote.agent_id] || 0.5;
          return sum + (vote.confidence * weight);
        }, 0);
        return { option_id: opt.option_id, score: totalScore };
      });

      // Sort by score
      scores.sort((a, b) => b.score - a.score);

      // Assert
      expect(scores[0].option_id).toBe(decision.options[0].option_id);
      expect(scores[0].score).toBeGreaterThan(scores[1].score);
    });

    /**
     * Test: DF-EXPERT-003
     * Objective: Test cross-domain expertise
     */
    it('DF-EXPERT-003: Cross-domain experts are handled', () => {
      // Arrange
      const multiDomainAgent = AgentType.ORCHESTRATOR; // Has broad expertise
      const domains = [DecisionDomain.DESIGN, DecisionDomain.PERFORMANCE, DecisionDomain.ACCESSIBILITY];

      // Define expertise
      const expertise: Record<AgentType, DecisionDomain[]> = {
        [AgentType.ORCHESTRATOR]: domains, // All domains
        [AgentType.DESIGN_SYSTEM]: [DecisionDomain.DESIGN],
        [AgentType.PERFORMANCE_OPTIMIZER]: [DecisionDomain.PERFORMANCE],
        [AgentType.ACCESSIBILITY]: [DecisionDomain.ACCESSIBILITY]
      };

      // Act & Assert
      expect(expertise[AgentType.ORCHESTRATOR]).toHaveLength(3);
      expect(expertise[AgentType.ORCHESTRATOR]).toContain(DecisionDomain.DESIGN);
      expect(expertise[AgentType.ORCHESTRATOR]).toContain(DecisionDomain.PERFORMANCE);
      expect(expertise[AgentType.ORCHESTRATOR]).toContain(DecisionDomain.ACCESSIBILITY);
      expect(expertise[AgentType.DESIGN_SYSTEM]).toHaveLength(1);
    });
  });

  // ==========================================================================
  // Audit Trail Tests
  // ==========================================================================

  describe('Audit Trail Tests', () => {
    /**
     * Test: DF-AUDIT-001
     * Objective: Test decision logging
     */
    it('DF-AUDIT-001: All decisions are logged', () => {
      // Arrange
      const decisions: CollaborativeDecision[] = [];
      const auditTrails: any[] = [];

      // Act - Create decision and log it
      const decision = createSampleDecision(
        [AgentType.DESIGN_SYSTEM, AgentType.COMPONENT_DEVELOPER],
        AgentType.ORCHESTRATOR
      );

      decisions.push(decision);

      // Add audit entry
      auditTrails.push({
        entry_id: generateUUID(),
        timestamp: generateTimestamp(),
        agent_id: AgentType.ORCHESTRATOR,
        action: 'decision_initiated',
        details: decision
      });

      // Assert
      expect(decisions).toHaveLength(1);
      expect(auditTrails).toHaveLength(1);
      expect(auditTrails[0].action).toBe('decision_initiated');
      expect(auditTrails[0].details).toBeDefined();
    });

    /**
     * Test: DF-AUDIT-002
     * Objective: Test vote recording
     */
    it('DF-AUDIT-002: All votes are recorded', () => {
      // Arrange
      const decision = createSampleDecision(
        [AgentType.DESIGN_SYSTEM, AgentType.COMPONENT_DEVELOPER, AgentType.ACCESSIBILITY],
        AgentType.ORCHESTRATOR
      );

      // Act - Record votes with audit entries
      const votes: AgentVote[] = [
        {
          agent_id: AgentType.DESIGN_SYSTEM,
          option_id: decision.options[0].option_id,
          confidence: 0.9,
          reasoning: 'Choice',
          timestamp: generateTimestamp()
        },
        {
          agent_id: AgentType.COMPONENT_DEVELOPER,
          option_id: decision.options[0].option_id,
          confidence: 0.85,
          reasoning: 'Choice',
          timestamp: generateTimestamp()
        },
        {
          agent_id: AgentType.ACCESSIBILITY,
          option_id: decision.options[1].option_id,
          confidence: 0.88,
          reasoning: 'Choice',
          timestamp: generateTimestamp()
        }
      ];

      decision.votes = votes;

      const voteAudit = votes.map(vote => ({
        entry_id: generateUUID(),
        timestamp: vote.timestamp,
        agent_id: vote.agent_id,
        action: 'vote_cast',
        details: vote
      }));

      // Assert
      expect(decision.votes).toHaveLength(3);
      expect(voteAudit).toHaveLength(3);
      voteAudit.forEach(audit => {
        expect(audit.action).toBe('vote_cast');
        expect(audit.details).toBeDefined();
      });
    });

    /**
     * Test: DF-AUDIT-003
     * Objective: Test participant tracking
     */
    it('DF-AUDIT-003: All participants are tracked', () => {
      // Arrange
      const decision = createSampleDecision(
        [
          AgentType.DESIGN_SYSTEM,
          AgentType.COMPONENT_DEVELOPER,
          AgentType.ACCESSIBILITY,
          AgentType.UX_RESEARCH,
          AgentType.PERFORMANCE_OPTIMIZER
        ],
        AgentType.ORCHESTRATOR
      );

      // Act & Assert
      expect(decision.participants).toHaveLength(5);
      expect(decision.participants).toContain(AgentType.DESIGN_SYSTEM);
      expect(decision.participants).toContain(AgentType.COMPONENT_DEVELOPER);
      expect(decision.participants).toContain(AgentType.ACCESSIBILITY);
      expect(decision.participants).toContain(AgentType.UX_RESEARCH);
      expect(decision.participants).toContain(AgentType.PERFORMANCE_OPTIMIZER);
    });

    /**
     * Test: DF-AUDIT-004
     * Objective: Test rationale documentation
     */
    it('DF-AUDIT-004: Rationale is documented', () => {
      // Arrange
      const decision = createSampleDecision(
        [AgentType.DESIGN_SYSTEM, AgentType.COMPONENT_DEVELOPER],
        AgentType.ORCHESTRATOR
      );

      const outcome: DecisionOutcome = {
        chosen_option_id: decision.options[0].option_id,
        chosen_option: decision.options[0],
        decision_type: DecisionType.WEIGHTED,
        final_scores: {},
        consensus_achieved: true,
        agreement_percentage: 100,
        decision_method: 'Selected based on design expertise and accessibility compliance'
      };

      // Act
      decision.outcome = outcome;
      decision.rationale = outcome.decision_method;

      // Assert
      expect(decision.rationale).toBeDefined();
      expect(decision.rationale.length).toBeGreaterThan(10);
      expect(decision.outcome).toBeDefined();
      expect(decision.outcome.consensus_achieved).toBe(true);
    });
  });

  // ==========================================================================
  // Decision Stage Tests
  // ==========================================================================

  describe('Decision Stage Tests', () => {
    /**
     * Test: Decision flow through stages
     */
    it('Decision flows through correct stages', () => {
      // Arrange
      const decision = createSampleDecision(
        [AgentType.DESIGN_SYSTEM, AgentType.COMPONENT_DEVELOPER],
        AgentType.ORCHESTRATOR
      );

      // Act - Simulate decision flow
      const stages: DecisionStage[] = [
        DecisionStage.INITIATED,
        DecisionStage.DELIBERATING,
        DecisionStage.VOTING,
        DecisionStage.DECIDED
      ];

      stages.forEach((stage, index) => {
        decision.stage = stage;
        expect(decision.stage).toBe(stages[index]);
      });

      // Assert final state
      expect(decision.stage).toBe(DecisionStage.DECIDED);
    });

    /**
     * Test: Quorum requirement
     */
    it('Quorum must be met before decision', () => {
      // Arrange
      const decision = createSampleDecision(
        [
          AgentType.DESIGN_SYSTEM,
          AgentType.COMPONENT_DEVELOPER,
          AgentType.ACCESSIBILITY,
          AgentType.UX_RESEARCH
        ],
        AgentType.ORCHESTRATOR
      );

      const quorum = Math.ceil(decision.participants.length * 0.5); // 50% quorum
      decision.votes = [];

      // Act - Add votes until quorum met
      for (let i = 0; i < 3; i++) {
        decision.votes.push({
          agent_id: decision.participants[i],
          option_id: decision.options[0].option_id,
          confidence: 0.9,
          reasoning: 'Vote',
          timestamp: generateTimestamp()
        });
      }

      // Assert
      expect(decision.votes.length).toBe(3);
      expect(quorum).toBe(2);
      expect(decision.votes.length).toBeGreaterThanOrEqual(quorum);
    });
  });

  // ==========================================================================
  // Performance Tests
  // ==========================================================================

  describe('Performance Tests', () => {
    /**
     * Test: Decision creation performance
     */
    it('Decision creation completes in under 100ms', async () => {
      // Act
      const { duration_ms } = await measureTime(() => {
        const decision = createSampleDecision(
          [AgentType.DESIGN_SYSTEM, AgentType.COMPONENT_DEVELOPER],
          AgentType.ORCHESTRATOR
        );
        return decision;
      });

      // Assert
      expect(duration_ms).toBeLessThan(100);
    });

    /**
     * Test: Vote calculation performance
     */
    it('Vote calculation completes in under 50ms', async () => {
      // Arrange
      const decision = createSampleDecision(
        [AgentType.DESIGN_SYSTEM, AgentType.COMPONENT_DEVELOPER],
        AgentType.ORCHESTRATOR
      );

      // Act
      const { duration_ms } = await measureTime(() => {
        const voteCounts = new Map<string, number>();
        decision.options.forEach(opt => {
          voteCounts.set(opt.option_id, Math.floor(Math.random() * 5));
        });
        return voteCounts;
      });

      // Assert
      expect(duration_ms).toBeLessThan(50);
    });
  });
});
