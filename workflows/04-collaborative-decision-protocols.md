# Collaborative Decision Protocols

**Version:** 1.0.0
**Protocol ID:** CDP-FD-2024-004
**Last Updated:** 2026-01-03

## Table of Contents

- [Overview](#overview)
- [Decision Frameworks](#decision-frameworks)
- [Consensus Protocols](#consensus-protocols)
- [Weighted Voting](#weighted-voting)
- [Expert-Based Decision](#expert-based-decision)
- [Performance-Based Authority](#performance-based-authority)
- [Decision Audit Trails](#decision-audit-trails)
- [Feedback Learning](#feedback-learning)
- [Implementation Examples](#implementation-examples)

---

## Overview

### Purpose

Establish robust protocols for collaborative decision-making across the 11-agent Frontend Design Agent System, ensuring fair, transparent, and efficient multi-agent decisions.

### Goals

- **Transparency**: Complete visibility into decision-making process
- **Fairness**: Equal consideration of all agent perspectives
- **Efficiency**: Timely decisions with minimal overhead
- **Quality**: High-quality decisions through collective intelligence
- **Accountability**: Clear ownership and auditability of decisions
- **Learning**: Continuous improvement from decision outcomes

### Decision Types

```
┌─────────────────────────────────────────────────────────┐
│              Type 1: Consensus Decisions                │
│            (All agents must agree)                      │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│            Type 2: Majority Vote Decisions             │
│         (>50% agreement required)                      │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│          Type 3: Expert-Driven Decisions               │
│       (Domain experts make the decision)                │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│        Type 4: Orchestrator Final Decision             │
│      (Orchestrator decides after input)                │
└─────────────────────────────────────────────────────────┘
```

---

## Decision Frameworks

### Decision Structure

```typescript
interface CollaborativeDecision {
  // Identification
  decision_id: string;                // UUID v4
  decision_type: DecisionType;
  framework: DecisionFramework;
  priority: DecisionPriority;

  // Decision Context
  title: string;
  description: string;
  domain: DecisionDomain;
  task_id?: string;
  workflow_id?: string;
  context_id?: string;

  // Participants
  participants: string[];             // Agent IDs involved
  initiator: string;                  // Agent that initiated the decision
  required_participants?: string[];   // Agents that must participate

  // Decision Options
  options: DecisionOption[];
  criteria: DecisionCriteria[];

  // Process
  stage: DecisionStage;
  started_at: string;
  deadline?: string;
  votes: AgentVote[];
  consensus_score?: number;           // 0-1

  // Outcome
  outcome?: DecisionOutcome;
  completed_at?: string;
  rationale?: string;

  // Audit
  audit_trail: DecisionAuditEntry[];
  feedback?: DecisionFeedback;
}

enum DecisionType {
  CONSENSUS = "consensus",            // All must agree
  MAJORITY = "majority",              // >50% must agree
  SUPERMAJORITY = "supermajority",    // >66% must agree
  UNANIMOUS = "unanimous",            // 100% must agree
  EXPERT = "expert",                  // Domain expert decides
  ORCHESTRATOR = "orchestrator",      // Orchestrator decides
  WEIGHTED = "weighted"               // Weighted voting
}

enum DecisionFramework {
  CONSENSUS_BUILDING = "consensus_building",
  DELIBERATIVE = "deliberative",
  VOTING = "voting",
  DELEGATED = "delegated",
  HIERARCHICAL = "hierarchical"
}

enum DecisionPriority {
  CRITICAL = "critical",              // Immediate decision required
  HIGH = "high",                      // Decision needed soon
  MEDIUM = "medium",                    // Standard priority
  LOW = "low"                         // Can be deferred
}

enum DecisionDomain {
  ARCHITECTURE = "architecture",
  DESIGN = "design",
  PERFORMANCE = "performance",
  ACCESSIBILITY = "accessibility",
  SECURITY = "security",
  TESTING = "testing",
  DEPLOYMENT = "deployment",
  RESOURCE = "resource",
  SCHEDULING = "scheduling"
}

enum DecisionStage {
  INITIATED = "initiated",
  DELIBERATING = "deliberating",
  VOTING = "voting",
  CONSENSUS_BUILDING = "consensus_building",
  DECIDED = "decided",
  IMPLEMENTED = "implemented",
  REVIEWED = "reviewed"
}

interface DecisionOption {
  option_id: string;
  title: string;
  description: string;
  proposed_by: string;
  supporters: string[];               // Agents supporting this option
  pros: string[];
  cons: string[];
  estimated_cost?: string;
  estimated_time?: string;
  risk_level: "low" | "medium" | "high";
  attachments?: DecisionAttachment[];
}

interface DecisionCriteria {
  criteria_id: string;
  name: string;
  description: string;
  weight: number;                      // 0-1
  metric?: string;                     // Measurable metric
  threshold?: number;                 // Target threshold
  importance: "critical" | "important" | "nice_to_have";
}

interface AgentVote {
  agent_id: string;
  option_id: string;
  confidence: number;                  // 0-1
  reasoning: string;
  timestamp: string;
  criteria_scores?: Record<string, number>;  // Per-criteria scores
}

interface DecisionOutcome {
  chosen_option_id: string;
  chosen_option: DecisionOption;
  decision_type: DecisionType;
  final_scores: Record<string, number>;  // Option ID -> score
  consensus_achieved: boolean;
  agreement_percentage: number;        // 0-100
  decision_method: string;
}

interface DecisionAuditEntry {
  entry_id: string;
  timestamp: string;
  agent_id: string;
  action: string;
  details: any;
  previous_state?: any;
  new_state?: any;
}

interface DecisionFeedback {
  collected_at: string;
  satisfaction_score: number;        // 0-10
  quality_score: number;              // 0-10
  speed_score: number;                // 0-10
  agent_feedback: Record<string, AgentFeedback>;
  lessons_learned: string[];
  improvements: string[];
}

interface AgentFeedback {
  agent_id: string;
  satisfied: boolean;
  rating: number;
  comments: string;
  would_repeat: boolean;
}

interface DecisionAttachment {
  attachment_id: string;
  type: "file" | "link" | "data";
  name: string;
  content: any;
  size_bytes?: number;
}
```

### Decision Manager

```typescript
class DecisionManager {
  private decisions: Map<string, CollaborativeDecision> = new Map();
  private votingRules: Map<DecisionType, VotingRule> = new Map();

  constructor() {
    this.initializeVotingRules();
  }

  // Create new decision
  async createDecision(
    config: DecisionConfig
  ): Promise<CollaborativeDecision> {
    const decision: CollaborativeDecision = {
      decision_id: generateUUID(),
      decision_type: config.type,
      framework: config.framework,
      priority: config.priority,
      title: config.title,
      description: config.description,
      domain: config.domain,
      task_id: config.task_id,
      workflow_id: config.workflow_id,
      participants: config.participants,
      initiator: config.initiator,
      options: config.options,
      criteria: config.criteria,
      stage: DecisionStage.INITIATED,
      started_at: new Date().toISOString(),
      deadline: config.deadline,
      votes: [],
      audit_trail: [{
        entry_id: generateUUID(),
        timestamp: new Date().toISOString(),
        agent_id: config.initiator,
        action: "decision_initiated",
        details: config
      }]
    };

    this.decisions.set(decision.decision_id, decision);

    // Notify participants
    await this.notifyParticipants(decision);

    return decision;
  }

  // Add option to decision
  async addOption(
    decisionId: string,
    option: Omit<DecisionOption, "option_id">,
    agentId: string
  ): Promise<DecisionOption> {
    const decision = this.getDecision(decisionId);
    if (!decision) {
      throw new Error(`Decision ${decisionId} not found`);
    }

    // Verify agent can add option
    if (!decision.participants.includes(agentId)) {
      throw new Error(`Agent ${agentId} is not a participant`);
    }

    const newOption: DecisionOption = {
      ...option,
      option_id: generateUUID(),
      supporters: [agentId]
    };

    decision.options.push(newOption);

    // Audit
    this.audit(decision, agentId, "option_added", { option: newOption });

    // Notify participants
    await this.notifyParticipants(decision);

    return newOption;
  }

  // Cast vote
  async castVote(
    decisionId: string,
    vote: Omit<AgentVote, "timestamp">
  ): Promise<void> {
    const decision = this.getDecision(decisionId);
    if (!decision) {
      throw new Error(`Decision ${decisionId} not found`);
    }

    // Verify agent is participant
    if (!decision.participants.includes(vote.agent_id)) {
      throw new Error(`Agent ${vote.agent_id} is not a participant`);
    }

    // Verify option exists
    const option = decision.options.find(o => o.option_id === vote.option_id);
    if (!option) {
      throw new Error(`Option ${vote.option_id} not found`);
    }

    // Check if agent already voted
    const existingVoteIndex = decision.votes.findIndex(v => v.agent_id === vote.agent_id);
    const newVote: AgentVote = {
      ...vote,
      timestamp: new Date().toISOString()
    };

    if (existingVoteIndex !== -1) {
      // Update existing vote
      decision.votes[existingVoteIndex] = newVote;

      // Update supporters
      decision.options.forEach(o => {
        o.supporters = o.supporters.filter(a => a !== vote.agent_id);
      });
      option.supporters.push(vote.agent_id);
    } else {
      // Add new vote
      decision.votes.push(newVote);
      option.supporters.push(vote.agent_id);
    }

    // Update stage if all votes cast
    if (this.allVotesCast(decision)) {
      decision.stage = DecisionStage.VOTING;
    }

    // Audit
    this.audit(decision, vote.agent_id, "vote_cast", { vote: newVote });

    // Check if decision can be made
    if (this.canMakeDecision(decision)) {
      await this.makeDecision(decisionId);
    }

    // Notify participants
    await this.notifyParticipants(decision);
  }

  // Make decision
  async makeDecision(decisionId: string): Promise<DecisionOutcome> {
    const decision = this.getDecision(decisionId);
    if (!decision) {
      throw new Error(`Decision ${decisionId} not found`);
    }

    const votingRule = this.votingRules.get(decision.decision_type);

    if (!votingRule) {
      throw new Error(`No voting rule for type ${decision.decision_type}`);
    }

    // Calculate scores
    const scores = await this.calculateScores(decision);

    // Apply voting rule
    const outcome = await votingRule.apply(decision, scores);

    decision.outcome = outcome;
    decision.completed_at = new Date().toISOString();
    decision.stage = DecisionStage.DECIDED;
    decision.rationale = outcome.decision_method;

    // Audit
    this.audit(decision, "system", "decision_made", { outcome });

    // Notify participants
    await this.notifyParticipants(decision);

    return outcome;
  }

  // Calculate option scores
  private async calculateScores(
    decision: CollaborativeDecision
  ): Promise<Record<string, number>> {
    const scores: Record<string, number> = {};

    for (const option of decision.options) {
      let score = 0;

      // Get votes for this option
      const optionVotes = decision.votes.filter(v => v.option_id === option.option_id);

      for (const vote of optionVotes) {
        // Weight vote by agent's domain expertise
        const expertiseWeight = await this.getExpertiseWeight(
          vote.agent_id,
          decision.domain
        );

        // Weight vote by confidence
        const confidenceWeight = vote.confidence;

        score += expertiseWeight * confidenceWeight;
      }

      scores[option.option_id] = score;
    }

    return scores;
  }

  // Get expertise weight for agent in domain
  private async getExpertiseWeight(
    agentId: string,
    domain: DecisionDomain
  ): Promise<number> {
    // Domain expertise mapping
    const expertiseMap: Record<string, Record<string, number>> = {
      "architecture": {
        "FD-ORC-01": 1.0,  // Orchestrator has highest authority
        "FD-CD-03": 0.8,   // Component Developer
        "FD-DS-02": 0.7    // Design System
      },
      "design": {
        "FD-DS-02": 1.0,
        "FD-AN-09": 0.8,
        "FD-UR-11": 0.7
      },
      "performance": {
        "FD-PO-04": 1.0,
        "FD-CD-03": 0.7,
        "FD-TQ-07": 0.6
      },
      "accessibility": {
        "FD-AX-05": 1.0,
        "FD-DS-02": 0.7,
        "FD-UR-11": 0.6
      },
      "security": {
        "FD-SC-08": 1.0,
        "FD-TQ-07": 0.7
      },
      "testing": {
        "FD-TQ-07": 1.0,
        "FD-PO-04": 0.6
      },
      "deployment": {
        "FD-ORC-01": 1.0,
        "FD-TQ-07": 0.8
      },
      "resource": {
        "FD-ORC-01": 1.0,
        "FD-PO-04": 0.7
      },
      "scheduling": {
        "FD-ORC-01": 1.0
      }
    };

    return expertiseMap[domain]?.[agentId] || 0.5;
  }

  // Check if all votes have been cast
  private allVotesCast(decision: CollaborativeDecision): boolean {
    return decision.votes.length === decision.participants.length;
  }

  // Check if decision can be made
  private canMakeDecision(decision: CollaborativeDecision): boolean {
    // Check if all participants have voted
    if (decision.votes.length < decision.participants.length) {
      return false;
    }

    // Check if deadline passed (if set)
    if (decision.deadline) {
      const deadline = new Date(decision.deadline).getTime();
      const now = Date.now();

      if (now < deadline) {
        // Not yet at deadline, check for early termination
        return this.checkEarlyTermination(decision);
      }
    }

    return true;
  }

  // Check for early termination (e.g., consensus reached)
  private checkEarlyTermination(decision: CollaborativeDecision): boolean {
    // Count votes for each option
    const voteCounts: Record<string, number> = {};

    for (const vote of decision.votes) {
      voteCounts[vote.option_id] = (voteCounts[vote.option_id] || 0) + 1;
    }

    // Check if any option has unanimous support
    for (const [optionId, count] of Object.entries(voteCounts)) {
      if (count === decision.participants.length) {
        return true;
      }
    }

    return false;
  }

  // Get decision
  getDecision(decisionId: string): CollaborativeDecision | undefined {
    return this.decisions.get(decisionId);
  }

  // Get all decisions
  getAllDecisions(): CollaborativeDecision[] {
    return Array.from(this.decisions.values());
  }

  // Get decisions by status
  getDecisionsByStage(stage: DecisionStage): CollaborativeDecision[] {
    return this.getAllDecisions().filter(d => d.stage === stage);
  }

  // Notify participants
  private async notifyParticipants(decision: CollaborativeDecision): Promise<void> {
    // Implementation would send notifications to all participants
    Monitoring.logMetric("decision_notification", {
      decision_id: decision.decision_id,
      stage: decision.stage,
      participants: decision.participants.length
    });
  }

  // Audit entry
  private audit(
    decision: CollaborativeDecision,
    agentId: string,
    action: string,
    details: any
  ): void {
    decision.audit_trail.push({
      entry_id: generateUUID(),
      timestamp: new Date().toISOString(),
      agent_id: agentId,
      action,
      details
    });
  }

  // Initialize voting rules
  private initializeVotingRules(): void {
    this.votingRules.set(DecisionType.CONSENSUS, new ConsensusVotingRule());
    this.votingRules.set(DecisionType.MAJORITY, new MajorityVotingRule());
    this.votingRules.set(DecisionType.SUPERMAJORITY, new SupermajorityVotingRule());
    this.votingRules.set(DecisionType.UNANIMOUS, new UnanimousVotingRule());
    this.votingRules.set(DecisionType.EXPERT, new ExpertVotingRule());
    this.votingRules.set(DecisionType.ORCHESTRATOR, new OrchestratorVotingRule());
    this.votingRules.set(DecisionType.WEIGHTED, new WeightedVotingRule());
  }
}

interface DecisionConfig {
  type: DecisionType;
  framework: DecisionFramework;
  priority: DecisionPriority;
  title: string;
  description: string;
  domain: DecisionDomain;
  task_id?: string;
  workflow_id?: string;
  participants: string[];
  initiator: string;
  required_participants?: string[];
  options: Omit<DecisionOption, "option_id">[];
  criteria: DecisionCriteria[];
  deadline?: string;
}

interface VotingRule {
  apply(decision: CollaborativeDecision, scores: Record<string, number>): Promise<DecisionOutcome>;
}
```

---

## Consensus Protocols

### Consensus Builder

```typescript
class ConsensusBuilder {
  async buildConsensus(decision: CollaborativeDecision): Promise<ConsensusResult> {
    const participants = decision.participants;
    const options = decision.options;

    // Stage 1: Information Sharing
    await this.shareInformation(decision);

    // Stage 2: Discussion
    await this.facilitateDiscussion(decision);

    // Stage 3: Proposal Generation
    const proposals = await this.generateProposals(decision);

    // Stage 4: Feedback and Refinement
    const refinedProposals = await this.refineProposals(decision, proposals);

    // Stage 5: Consensus Check
    const consensus = await this.checkConsensus(decision, refinedProposals);

    if (consensus.achieved) {
      return {
        achieved: true,
        proposal: consensus.proposal,
        time_ms: consensus.time_ms
      };
    }

    // Stage 6: Compromise
    const compromise = await this.buildCompromise(decision, refinedProposals);

    if (compromise) {
      return {
        achieved: true,
        proposal: compromise,
        time_ms: compromise.time_ms,
        type: "compromise"
      };
    }

    // Stage 7: Fallback to voting
    return {
      achieved: false,
      fallback_to: "voting",
      proposals: refinedProposals
    };
  }

  private async shareInformation(decision: CollaborativeDecision): Promise<void> {
    // Share all relevant information with participants
    for (const participant of decision.participants) {
      await this.sendToAgent(participant, {
        type: "information_sharing",
        decision_id: decision.decision_id,
        options: decision.options,
        criteria: decision.criteria,
        domain: decision.domain
      });
    }
  }

  private async facilitateDiscussion(decision: CollaborativeDecision): Promise<DiscussionResult> {
    const contributions: DiscussionContribution[] = [];

    for (const participant of decision.participants) {
      const contribution = await this.requestContribution(participant, decision);
      contributions.push(contribution);
    }

    // Share contributions with all participants
    for (const participant of decision.participants) {
      await this.sendToAgent(participant, {
        type: "discussion_update",
        decision_id: decision.decision_id,
        contributions
      });
    }

    return {
      contributions,
      common_themes: this.identifyCommonThemes(contributions),
      disagreements: this.identifyDisagreements(contributions)
    };
  }

  private async generateProposals(
    decision: CollaborativeDecision
  ): Promise<ConsensusProposal[]> {
    const proposals: ConsensusProposal[] = [];

    for (const option of decision.options) {
      const supporters = option.supporters;
      const opponents = decision.participants.filter(p => !supporters.includes(p));

      // Create proposal
      const proposal: ConsensusProposal = {
        proposal_id: generateUUID(),
        based_on_option_id: option.option_id,
        title: option.title,
        description: option.description,
        supporters,
        opponents,
        rationale: option.pros.join(" "),
        modifications: []
      };

      proposals.push(proposal);
    }

    return proposals;
  }

  private async refineProposals(
    decision: CollaborativeDecision,
    proposals: ConsensusProposal[]
  ): Promise<ConsensusProposal[]> {
    const refined: ConsensusProposal[] = [];

    for (const proposal of proposals) {
      // Get feedback from all participants
      const feedback = await this.gatherFeedback(decision, proposal);

      // Apply modifications
      const modifications = await this.generateModifications(proposal, feedback);

      const refinedProposal: ConsensusProposal = {
        ...proposal,
        modifications
      };

      // Check if opponents now support
      const newSupporters = feedback.filter(f => f.supports).map(f => f.agent_id);
      refinedProposal.supporters = [...proposal.supporters, ...newSupporters];
      refinedProposal.opponents = refinedProposal.opponents.filter(
        o => !newSupporters.includes(o)
      );

      refined.push(refinedProposal);
    }

    return refined;
  }

  private async checkConsensus(
    decision: CollaborativeDecision,
    proposals: ConsensusProposal[]
  ): Promise<ConsensusCheckResult> {
    const startTime = Date.now();

    for (const proposal of proposals) {
      // Check if all participants support
      if (proposal.opponents.length === 0) {
        return {
          achieved: true,
          proposal,
          time_ms: Date.now() - startTime
        };
      }
    }

    return {
      achieved: false,
      time_ms: Date.now() - startTime
    };
  }

  private async buildCompromise(
    decision: CollaborativeDecision,
    proposals: ConsensusProposal[]
  ): Promise<CompromiseProposal | null> {
    // Find elements common to all proposals
    const commonElements = this.findCommonElements(proposals);

    // Create compromise proposal
    const compromise: CompromiseProposal = {
      proposal_id: generateUUID(),
      title: "Compromise Proposal",
      description: "Elements from multiple proposals combined",
      elements: commonElements,
      rationale: "Combined best elements from all proposals",
      time_ms: 0
    };

    // Get acceptance from all participants
    const acceptance = await this.seekCompromiseAcceptance(decision, compromise);

    if (this.hasConsensus(acceptance)) {
      compromise.time_ms = 0;  // Would track actual time
      return compromise;
    }

    return null;
  }

  private findCommonElements(proposals: ConsensusProposal[]): any[] {
    // Find common themes and elements
    const elements: any[] = [];

    // This is a simplified implementation
    // In practice, would analyze proposals for commonalities

    return elements;
  }

  private async seekCompromiseAcceptance(
    decision: CollaborativeDecision,
    compromise: CompromiseProposal
  ): Promise<Record<string, boolean>> {
    const acceptance: Record<string, boolean> = {};

    for (const participant of decision.participants) {
      const response = await this.requestAcceptance(participant, compromise);
      acceptance[participant] = response.accepts;
    }

    return acceptance;
  }

  private hasConsensus(acceptance: Record<string, boolean>): boolean {
    return Object.values(acceptance).every(a => a === true);
  }

  private async sendToAgent(agentId: string, message: any): Promise<void> {
    // Implementation would send message to agent
  }

  private async requestContribution(
    agentId: string,
    decision: CollaborativeDecision
  ): Promise<DiscussionContribution> {
    // Implementation would request contribution from agent
    return {
      agent_id: agentId,
      position: "",
      reasoning: "",
      suggestions: []
    };
  }

  private async gatherFeedback(
    decision: CollaborativeDecision,
    proposal: ConsensusProposal
  ): Promise<ProposalFeedback[]> {
    const feedback: ProposalFeedback[] = [];

    for (const participant of decision.participants) {
      const response = await this.requestFeedback(participant, proposal);
      feedback.push(response);
    }

    return feedback;
  }

  private async generateModifications(
    proposal: ConsensusProposal,
    feedback: ProposalFeedback[]
  ): Promise<any[]> {
    const modifications: any[] = [];

    // Generate modifications based on feedback
    for (const fb of feedback) {
      if (fb.suggestions && fb.suggestions.length > 0) {
        modifications.push(...fb.suggestions);
      }
    }

    return modifications;
  }

  private async requestFeedback(
    agentId: string,
    proposal: ConsensusProposal
  ): Promise<ProposalFeedback> {
    // Implementation would request feedback from agent
    return {
      agent_id: agentId,
      supports: false,
      suggestions: []
    };
  }

  private async requestAcceptance(
    agentId: string,
    compromise: CompromiseProposal
  ): Promise<{ accepts: boolean }> {
    // Implementation would request acceptance from agent
    return {
      accepts: Math.random() > 0.2  // 80% acceptance rate
    };
  }

  private identifyCommonThemes(contributions: DiscussionContribution[]): string[] {
    // Identify common themes in contributions
    return [];
  }

  private identifyDisagreements(contributions: DiscussionContribution[]): string[] {
    // Identify points of disagreement
    return [];
  }
}

interface ConsensusResult {
  achieved: boolean;
  proposal?: ConsensusProposal | CompromiseProposal;
  type?: "unanimous" | "compromise";
  time_ms?: number;
  fallback_to?: string;
  proposals?: ConsensusProposal[];
}

interface DiscussionResult {
  contributions: DiscussionContribution[];
  common_themes: string[];
  disagreements: string[];
}

interface DiscussionContribution {
  agent_id: string;
  position: string;
  reasoning: string;
  suggestions: string[];
}

interface ConsensusProposal {
  proposal_id: string;
  based_on_option_id: string;
  title: string;
  description: string;
  supporters: string[];
  opponents: string[];
  rationale: string;
  modifications: any[];
}

interface ProposalFeedback {
  agent_id: string;
  supports: boolean;
  suggestions: any[];
}

interface CompromiseProposal {
  proposal_id: string;
  title: string;
  description: string;
  elements: any[];
  rationale: string;
  time_ms: number;
}

interface ConsensusCheckResult {
  achieved: boolean;
  proposal?: ConsensusProposal;
  time_ms: number;
}
```

### Consensus Voting Rule

```typescript
class ConsensusVotingRule implements VotingRule {
  async apply(
    decision: CollaborativeDecision,
    scores: Record<string, number>
  ): Promise<DecisionOutcome> {
    const consensusBuilder = new ConsensusBuilder();
    const result = await consensusBuilder.buildConsensus(decision);

    if (result.achieved && result.proposal) {
      const chosenOption = this.findOptionForProposal(decision, result.proposal);

      return {
        chosen_option_id: result.proposal.proposal_id,
        chosen_option: chosenOption!,
        decision_type: decision.decision_type,
        final_scores: scores,
        consensus_achieved: true,
        agreement_percentage: 100,
        decision_method: result.type === "compromise"
          ? "Compromise consensus achieved"
          : "Unanimous consensus achieved"
      };
    }

    // Fallback to majority voting
    const majorityRule = new MajorityVotingRule();
    return await majorityRule.apply(decision, scores);
  }

  private findOptionForProposal(
    decision: CollaborativeDecision,
    proposal: ConsensusProposal | CompromiseProposal
  ): DecisionOption | undefined {
    if ("based_on_option_id" in proposal) {
      return decision.options.find(o => o.option_id === proposal.based_on_option_id);
    }

    return undefined;
  }
}
```

---

## Weighted Voting

### Weighted Voting Implementation

```typescript
class WeightedVotingRule implements VotingRule {
  async apply(
    decision: CollaborativeDecision,
    scores: Record<string, number>
  ): Promise<DecisionOutcome> {
    // Calculate weights for each agent
    const weights = await this.calculateWeights(decision);

    // Calculate weighted scores
    const weightedScores: Record<string, number> = {};

    for (const option of decision.options) {
      let score = 0;

      for (const vote of decision.votes) {
        if (vote.option_id === option.option_id) {
          const agentWeight = weights[vote.agent_id];
          score += agentWeight * vote.confidence;
        }
      }

      weightedScores[option.option_id] = score;
    }

    // Select option with highest score
    const winnerId = this.selectWinner(weightedScores);
    const winner = decision.options.find(o => o.option_id === winnerId)!;

    // Calculate agreement percentage
    const agreementPercentage = this.calculateAgreement(decision, winnerId);

    return {
      chosen_option_id: winnerId,
      chosen_option: winner,
      decision_type: decision.decision_type,
      final_scores: weightedScores,
      consensus_achieved: agreementPercentage === 100,
      agreement_percentage: agreementPercentage,
      decision_method: "Weighted voting based on expertise and confidence"
    };
  }

  private async calculateWeights(
    decision: CollaborativeDecision
  ): Promise<Record<string, number>> {
    const weights: Record<string, number> = {};

    for (const participant of decision.participants) {
      // Base weight
      let weight = 1.0;

      // Expertise weight
      const expertiseWeight = await this.getExpertiseWeight(participant, decision.domain);
      weight *= expertiseWeight;

      // Historical performance weight
      const performanceWeight = await this.getPerformanceWeight(participant);
      weight *= performanceWeight;

      // Priority weight
      const priorityWeight = await this.getPriorityWeight(participant, decision);
      weight *= priorityWeight;

      weights[participant] = weight;
    }

    // Normalize weights to sum to 1
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    for (const agentId in weights) {
      weights[agentId] /= totalWeight;
    }

    return weights;
  }

  private async getExpertiseWeight(
    agentId: string,
    domain: DecisionDomain
  ): Promise<number> {
    // Domain to expertise mapping
    const expertiseMap: Record<string, Record<string, number>> = {
      "architecture": {
        "FD-ORC-01": 1.0,
        "FD-CD-03": 0.8,
        "FD-DS-02": 0.7
      },
      "design": {
        "FD-DS-02": 1.0,
        "FD-AN-09": 0.8,
        "FD-UR-11": 0.7
      },
      "performance": {
        "FD-PO-04": 1.0,
        "FD-CD-03": 0.7
      },
      "accessibility": {
        "FD-AX-05": 1.0,
        "FD-DS-02": 0.7
      },
      "security": {
        "FD-SC-08": 1.0
      },
      "testing": {
        "FD-TQ-07": 1.0
      }
    };

    return expertiseMap[domain]?.[agentId] || 0.5;
  }

  private async getPerformanceWeight(agentId: string): Promise<number> {
    // Get historical performance data for agent
    const performanceHistory = await this.getPerformanceHistory(agentId);

    if (performanceHistory.length === 0) {
      return 1.0;  // No history, default weight
    }

    // Calculate success rate
    const successfulDecisions = performanceHistory.filter(p => p.outcome === "successful").length;
    const successRate = successfulDecisions / performanceHistory.length;

    // Map success rate to weight (0.5 to 1.5)
    return 0.5 + successRate;
  }

  private async getPriorityWeight(
    agentId: string,
    decision: CollaborativeDecision
  ): Promise<number> {
    // Check if agent is required participant
    if (decision.required_participants?.includes(agentId)) {
      return 1.2;  // 20% boost
    }

    return 1.0;
  }

  private selectWinner(scores: Record<string, number>): string {
    let maxScore = -1;
    let winner = "";

    for (const [optionId, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        winner = optionId;
      }
    }

    return winner;
  }

  private calculateAgreement(
    decision: CollaborativeDecision,
    winnerId: string
  ): number {
    const winnerVotes = decision.votes.filter(v => v.option_id === winnerId);
    const agreement = (winnerVotes.length / decision.participants.length) * 100;

    return Math.round(agreement * 100) / 100;
  }

  private async getPerformanceHistory(agentId: string): Promise<any[]> {
    // Get performance history for agent
    return [];
  }
}
```

---

## Expert-Based Decision

### Expert Voting Rule

```typescript
class ExpertVotingRule implements VotingRule {
  async apply(
    decision: CollaborativeDecision,
    scores: Record<string, number>
  ): Promise<DecisionOutcome> {
    // Identify domain experts
    const experts = await this.identifyExperts(decision);

    if (experts.length === 0) {
      // Fallback to weighted voting
      const weightedRule = new WeightedVotingRule();
      return await weightedRule.apply(decision, scores);
    }

    // Get expert votes
    const expertVotes = decision.votes.filter(v => experts.includes(v.agent_id));

    // Calculate expert scores
    const expertScores: Record<string, number> = {};

    for (const option of decision.options) {
      let score = 0;

      for (const vote of expertVotes) {
        if (vote.option_id === option.option_id) {
          score += vote.confidence;
        }
      }

      expertScores[option.option_id] = score;
    }

    // Select winner based on expert votes
    const winnerId = this.selectWinner(expertScores);
    const winner = decision.options.find(o => o.option_id === winnerId)!;

    // Calculate expert agreement
    const expertAgreement = this.calculateAgreement(decision, winnerId, experts);

    return {
      chosen_option_id: winnerId,
      chosen_option: winner,
      decision_type: decision.decision_type,
      final_scores: expertScores,
      consensus_achieved: expertAgreement === 100,
      agreement_percentage: expertAgreement,
      decision_method: `Expert-based decision by ${experts.join(", ")}`
    };
  }

  private async identifyExperts(
    decision: CollaborativeDecision
  ): Promise<string[]> {
    const experts: string[] = [];

    // Domain expertise mapping
    const domainExperts: Record<string, string[]> = {
      "architecture": ["FD-ORC-01", "FD-CD-03", "FD-DS-02"],
      "design": ["FD-DS-02", "FD-AN-09", "FD-UR-11"],
      "performance": ["FD-PO-04"],
      "accessibility": ["FD-AX-05"],
      "security": ["FD-SC-08"],
      "testing": ["FD-TQ-07"],
      "deployment": ["FD-ORC-01", "FD-TQ-07"],
      "resource": ["FD-ORC-01"],
      "scheduling": ["FD-ORC-01"]
    };

    const potentialExperts = domainExperts[decision.domain] || [];

    // Filter experts who are participants
    for (const expert of potentialExperts) {
      if (decision.participants.includes(expert)) {
        experts.push(expert);
      }
    }

    return experts;
  }

  private selectWinner(scores: Record<string, number>): string {
    let maxScore = -1;
    let winner = "";

    for (const [optionId, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        winner = optionId;
      }
    }

    return winner;
  }

  private calculateAgreement(
    decision: CollaborativeDecision,
    winnerId: string,
    experts: string[]
  ): number {
    const expertVotes = decision.votes.filter(v =>
      experts.includes(v.agent_id) && v.option_id === winnerId
    );

    const agreement = (expertVotes.length / experts.length) * 100;

    return Math.round(agreement * 100) / 100;
  }
}
```

---

## Performance-Based Authority

### Authority Adjustment System

```typescript
class AuthorityAdjustmentSystem {
  private authorityScores: Map<string, number> = new Map();

  constructor() {
    this.initializeAuthorityScores();
  }

  // Adjust authority based on performance
  async adjustAuthority(feedback: DecisionFeedback): Promise<void> {
    for (const [agentId, agentFeedback] of Object.entries(feedback.agent_feedback)) {
      let currentScore = this.authorityScores.get(agentId) || 1.0;

      // Adjust based on satisfaction
      if (agentFeedback.satisfied) {
        currentScore *= 1.05;  // 5% increase
      } else {
        currentScore *= 0.95;  // 5% decrease
      }

      // Clamp to reasonable range
      currentScore = Math.max(0.5, Math.min(2.0, currentScore));

      this.authorityScores.set(agentId, currentScore);
    }
  }

  // Get authority score for agent
  getAuthorityScore(agentId: string): number {
    return this.authorityScores.get(agentId) || 1.0;
  }

  // Get weighted authority score including domain expertise
  async getWeightedAuthority(
    agentId: string,
    domain: DecisionDomain
  ): Promise<number> {
    const baseAuthority = this.getAuthorityScore(agentId);
    const expertise = await this.getExpertiseWeight(agentId, domain);

    return baseAuthority * expertise;
  }

  private async getExpertiseWeight(
    agentId: string,
    domain: DecisionDomain
  ): Promise<number> {
    // Expertise mapping (simplified)
    const expertiseMap: Record<string, Record<string, number>> = {
      "design": { "FD-DS-02": 1.0 },
      "performance": { "FD-PO-04": 1.0 },
      "accessibility": { "FD-AX-05": 1.0 },
      "security": { "FD-SC-08": 1.0 },
      "testing": { "FD-TQ-07": 1.0 }
    };

    return expertiseMap[domain]?.[agentId] || 0.7;
  }

  private initializeAuthorityScores(): void {
    // Initialize all agents with base score of 1.0
    const agents = [
      "FD-ORC-01", "FD-DS-02", "FD-CD-03", "FD-PO-04", "FD-AX-05",
      "FD-CP-06", "FD-TQ-07", "FD-SC-08", "FD-AN-09", "FD-I1-10", "FD-UR-11"
    ];

    for (const agent of agents) {
      this.authorityScores.set(agent, 1.0);
    }
  }
}
```

---

## Decision Audit Trails

### Audit System

```typescript
class DecisionAuditSystem {
  private auditTrails: Map<string, DecisionAuditEntry[]> = new Map();

  // Add audit entry
  addAuditEntry(
    decisionId: string,
    entry: Omit<DecisionAuditEntry, "entry_id" | "timestamp">
  ): DecisionAuditEntry {
    const auditEntry: DecisionAuditEntry = {
      entry_id: generateUUID(),
      timestamp: new Date().toISOString(),
      ...entry
    };

    if (!this.auditTrails.has(decisionId)) {
      this.auditTrails.set(decisionId, []);
    }

    this.auditTrails.get(decisionId)!.push(auditEntry);

    return auditEntry;
  }

  // Get audit trail for decision
  getAuditTrail(decisionId: string): DecisionAuditEntry[] {
    return this.auditTrails.get(decisionId) || [];
  }

  // Get audit trail summary
  getAuditSummary(decisionId: string): AuditSummary {
    const entries = this.getAuditTrail(decisionId);

    const actions: Record<string, number> = {};
    const participants: Set<string> = new Set();
    let startTime = "";
    let endTime = "";

    for (const entry of entries) {
      actions[entry.action] = (actions[entry.action] || 0) + 1;
      participants.add(entry.agent_id);

      if (!startTime || entry.timestamp < startTime) {
        startTime = entry.timestamp;
      }

      if (!endTime || entry.timestamp > endTime) {
        endTime = entry.timestamp;
      }
    }

    return {
      decision_id: decisionId,
      total_entries: entries.length,
      actions,
      participants: Array.from(participants),
      duration_ms: startTime && endTime
        ? new Date(endTime).getTime() - new Date(startTime).getTime()
        : 0,
      start_time: startTime,
      end_time: endTime
    };
  }

  // Generate audit report
  generateAuditReport(decisionId: string): AuditReport {
    const entries = this.getAuditTrail(decisionId);
    const summary = this.getAuditSummary(decisionId);

    const timeline = entries.map(entry => ({
      time: entry.timestamp,
      agent: entry.agent_id,
      action: entry.action,
      details: entry.details
    }));

    return {
      decision_id: decisionId,
      summary,
      timeline,
      analysis: this.analyzeAuditTrail(entries)
    };
  }

  private analyzeAuditTrail(entries: DecisionAuditEntry[]): AuditAnalysis {
    // Analyze patterns in audit trail
    const analysis: AuditAnalysis = {
      bottlenecks: [],
      collaboration_score: 0,
      participation_balance: {}
    };

    // Calculate participation balance
    const participation: Record<string, number> = {};
    for (const entry of entries) {
      participation[entry.agent_id] = (participation[entry.agent_id] || 0) + 1;
    }

    const maxParticipation = Math.max(...Object.values(participation));
    for (const [agentId, count] of Object.entries(participation)) {
      analysis.participation_balance[agentId] = count / maxParticipation;
    }

    // Calculate collaboration score (0-1)
    const uniqueParticipants = Object.keys(participation).length;
    const totalEntries = entries.length;
    analysis.collaboration_score = uniqueParticipants / totalEntries;

    // Identify bottlenecks
    const timeBetweenActions: number[] = [];
    for (let i = 1; i < entries.length; i++) {
      const prev = new Date(entries[i - 1].timestamp).getTime();
      const curr = new Date(entries[i].timestamp).getTime();
      timeBetweenActions.push(curr - prev);
    }

    const avgTime = timeBetweenActions.reduce((sum, t) => sum + t, 0) / timeBetweenActions.length;
    const threshold = avgTime * 2;

    for (let i = 1; i < entries.length; i++) {
      const prev = new Date(entries[i - 1].timestamp).getTime();
      const curr = new Date(entries[i].timestamp).getTime();
      const gap = curr - prev;

      if (gap > threshold) {
        analysis.bottlenecks.push({
          between: entries[i - 1].action,
          and: entries[i].action,
          duration_ms: gap
        });
      }
    }

    return analysis;
  }
}

interface AuditSummary {
  decision_id: string;
  total_entries: number;
  actions: Record<string, number>;
  participants: string[];
  duration_ms: number;
  start_time: string;
  end_time: string;
}

interface AuditReport {
  decision_id: string;
  summary: AuditSummary;
  timeline: AuditTimelineEntry[];
  analysis: AuditAnalysis;
}

interface AuditTimelineEntry {
  time: string;
  agent: string;
  action: string;
  details: any;
}

interface AuditAnalysis {
  bottlenecks: Bottleneck[];
  collaboration_score: number;
  participation_balance: Record<string, number>;
}

interface Bottleneck {
  between: string;
  and: string;
  duration_ms: number;
}
```

---

## Feedback Learning

### Feedback Collection System

```typescript
class FeedbackCollectionSystem {
  private feedbackStore: Map<string, DecisionFeedback> = new Map();

  // Collect feedback for decision
  async collectFeedback(decision: CollaborativeDecision): Promise<DecisionFeedback> {
    const feedback: DecisionFeedback = {
      collected_at: new Date().toISOString(),
      satisfaction_score: 0,
      quality_score: 0,
      speed_score: 0,
      agent_feedback: {},
      lessons_learned: [],
      improvements: []
    };

    // Collect feedback from all participants
    for (const participant of decision.participants) {
      const agentFeedback = await this.requestAgentFeedback(participant, decision);
      feedback.agent_feedback[participant] = agentFeedback;

      feedback.satisfaction_score += agentFeedback.rating;
    }

    // Calculate average scores
    const participantCount = decision.participants.length;
    feedback.satisfaction_score /= participantCount;

    // Collect lessons learned
    feedback.lessons_learned = await this.collectLessonsLearned(decision);

    // Collect improvement suggestions
    feedback.improvements = await this.collectImprovements(decision);

    // Store feedback
    this.feedbackStore.set(decision.decision_id, feedback);

    return feedback;
  }

  // Analyze feedback for insights
  async analyzeFeedback(decision: CollaborativeDecision): Promise<FeedbackInsights> {
    const feedback = this.feedbackStore.get(decision.decision_id);

    if (!feedback) {
      throw new Error(`No feedback found for decision ${decision.decision_id}`);
    }

    const insights: FeedbackInsights = {
      overall_satisfaction: feedback.satisfaction_score,
      satisfied_agents: [],
      dissatisfied_agents: [],
      common_issues: [],
      improvement_areas: []
    };

    // Categorize agents by satisfaction
    for (const [agentId, agentFeedback] of Object.entries(feedback.agent_feedback)) {
      if (agentFeedback.satisfied) {
        insights.satisfied_agents.push(agentId);
      } else {
        insights.dissatisfied_agents.push(agentId);
      }
    }

    // Identify common issues
    const allComments = Object.values(feedback.agent_feedback)
      .map(f => f.comments)
      .filter(c => c && c.length > 0);

    insights.common_issues = this.identifyCommonIssues(allComments);

    // Identify improvement areas
    insights.improvement_areas = feedback.improvements;

    return insights;
  }

  // Apply feedback to improve decision-making
  async applyFeedback(feedback: DecisionFeedback): Promise<void> {
    // Adjust authority scores based on feedback
    const authoritySystem = new AuthorityAdjustmentSystem();
    await authoritySystem.adjustAuthority(feedback);

    // Update decision patterns
    await this.updateDecisionPatterns(feedback);

    // Store for future reference
    await this.archiveFeedback(feedback);
  }

  private async requestAgentFeedback(
    agentId: string,
    decision: CollaborativeDecision
  ): Promise<AgentFeedback> {
    // Implementation would request feedback from agent
    return {
      agent_id: agentId,
      satisfied: Math.random() > 0.2,  // 80% satisfaction rate
      rating: Math.floor(Math.random() * 5) + 6,  // 6-10 rating
      comments: "Decision process was smooth",
      would_repeat: true
    };
  }

  private async collectLessonsLearned(
    decision: CollaborativeDecision
  ): Promise<string[]> {
    // Collect lessons learned from decision
    return [
      "Early consensus building is effective",
      "Domain expertise weighting improves outcomes"
    ];
  }

  private async collectImprovements(
    decision: CollaborativeDecision
  ): Promise<string[]> {
    // Collect improvement suggestions
    return [
      "Consider adding more discussion time",
      "Provide more context up front"
    ];
  }

  private identifyCommonIssues(comments: string[]): string[] {
    // Identify common themes in comments
    return [];
  }

  private async updateDecisionPatterns(feedback: DecisionFeedback): Promise<void> {
    // Update decision-making patterns based on feedback
  }

  private async archiveFeedback(feedback: DecisionFeedback): Promise<void> {
    // Archive feedback for future reference
  }
}

interface FeedbackInsights {
  overall_satisfaction: number;
  satisfied_agents: string[];
  dissatisfied_agents: string[];
  common_issues: string[];
  improvement_areas: string[];
}
```

---

## Implementation Examples

### Example 1: Design System Decision

```typescript
// Create a design system decision
const decisionConfig: DecisionConfig = {
  type: DecisionType.WEIGHTED,
  framework: DecisionFramework.VOTING,
  priority: DecisionPriority.HIGH,
  title: "Select Button Component Design",
  description: "Choose the best design for the button component",
  domain: DecisionDomain.DESIGN,
  participants: ["FD-DS-02", "FD-CD-03", "FD-AX-05", "FD-UR-11"],
  initiator: "FD-ORC-01",
  options: [
    {
      title: "Option A: Material Design",
      description: "Material Design inspired button with ripple effect",
      proposed_by: "FD-DS-02",
      supporters: ["FD-DS-02"],
      pros: ["Familiar to users", "Well-documented", "Accessible out of box"],
      cons: ["Can be overused", "Not unique"],
      risk_level: "low"
    },
    {
      title: "Option B: Custom Design",
      description: "Custom button design with unique styling",
      proposed_by: "FD-UR-11",
      supporters: ["FD-UR-11"],
      pros: ["Unique branding", "Flexible", "Custom animations"],
      cons: ["Less familiar", "More development effort"],
      risk_level: "medium"
    }
  ],
  criteria: [
    {
      criteria_id: "accessibility",
      name: "Accessibility",
      description: "WCAG compliance and ease of use",
      weight: 0.3,
      importance: "critical"
    },
    {
      criteria_id: "performance",
      name: "Performance",
      description: "Rendering performance and bundle size",
      weight: 0.25,
      importance: "important"
    },
    {
      criteria_id: "maintainability",
      name: "Maintainability",
      description: "Ease of maintenance and updates",
      weight: 0.25,
      importance: "important"
    },
    {
      criteria_id: "branding",
      name: "Brand Consistency",
      description: "Alignment with brand guidelines",
      weight: 0.2,
      importance: "nice_to_have"
    }
  ],
  deadline: new Date(Date.now() + 60 * 60 * 1000).toISOString()  // 1 hour
};

// Create decision
const manager = new DecisionManager();
const decision = await manager.createDecision(decisionConfig);

// Cast votes
await manager.castVote(decision.decision_id, {
  agent_id: "FD-DS-02",
  option_id: decision.options[0].option_id,
  confidence: 0.9,
  reasoning: "Material Design provides excellent accessibility",
  criteria_scores: {
    accessibility: 0.95,
    performance: 0.8,
    maintainability: 0.85,
    branding: 0.7
  }
});

await manager.castVote(decision.decision_id, {
  agent_id: "FD-UR-11",
  option_id: decision.options[1].option_id,
  confidence: 0.85,
  reasoning: "Custom design better aligns with our brand",
  criteria_scores: {
    accessibility: 0.75,
    performance: 0.7,
    maintainability: 0.65,
    branding: 0.95
  }
});

await manager.castVote(decision.decision_id, {
  agent_id: "FD-AX-05",
  option_id: decision.options[0].option_id,
  confidence: 0.95,
  reasoning: "Material Design has better accessibility support",
  criteria_scores: {
    accessibility: 0.98,
    performance: 0.8,
    maintainability: 0.8,
    branding: 0.6
  }
});

await manager.castVote(decision.decision_id, {
  agent_id: "FD-CD-03",
  option_id: decision.options[0].option_id,
  confidence: 0.8,
  reasoning: "Material Design is easier to implement",
  criteria_scores: {
    accessibility: 0.8,
    performance: 0.85,
    maintainability: 0.9,
    branding: 0.7
  }
});

// Get outcome
const outcome = await manager.makeDecision(decision.decision_id);

console.log("Decision outcome:", outcome);
console.log("Chosen option:", outcome.chosen_option.title);
console.log("Agreement:", outcome.agreement_percentage + "%");
```

### Example 2: Consensus-Based Architecture Decision

```typescript
// Create a consensus-based decision
const consensusDecisionConfig: DecisionConfig = {
  type: DecisionType.CONSENSUS,
  framework: DecisionFramework.CONSENSUS_BUILDING,
  priority: DecisionPriority.CRITICAL,
  title: "Select State Management Library",
  description: "Choose the best state management library for the project",
  domain: DecisionDomain.ARCHITECTURE,
  participants: ["FD-ORC-01", "FD-CD-03", "FD-PO-04", "FD-TQ-07"],
  initiator: "FD-ORC-01",
  options: [
    {
      title: "Redux Toolkit",
      description: "Official Redux tooling with simplified API",
      proposed_by: "FD-CD-03",
      supporters: ["FD-CD-03"],
      pros: ["Mature ecosystem", "DevTools support", "Middleware support"],
      cons: ["Boilerplate", "Learning curve"],
      risk_level: "low"
    },
    {
      title: "Zustand",
      description: "Lightweight state management with simple API",
      proposed_by: "FD-PO-04",
      supporters: ["FD-PO-04"],
      pros: ["Simple API", "Small bundle size", "Fast"],
      cons: ["Less ecosystem", "Fewer features"],
      risk_level: "low"
    },
    {
      title: "Jotai",
      description: "Atomic state management inspired by Recoil",
      proposed_by: "FD-TQ-07",
      supporters: ["FD-TQ-07"],
      pros: ["Atomic approach", "TypeScript support", "Tree-shakeable"],
      cons: ["Newer", "Less documentation"],
      risk_level: "medium"
    }
  ],
  criteria: [
    {
      criteria_id: "performance",
      name: "Performance",
      description: "Runtime performance and bundle size",
      weight: 0.3,
      importance: "critical"
    },
    {
      criteria_id: "developer_experience",
      name: "Developer Experience",
      description: "Ease of use and development speed",
      weight: 0.3,
      importance: "important"
    },
    {
      criteria_id: "ecosystem",
      name: "Ecosystem",
      description: "Community support and available tools",
      weight: 0.25,
      importance: "important"
    },
    {
      criteria_id: "scalability",
      name: "Scalability",
      description: "Ability to scale with project complexity",
      weight: 0.15,
      importance: "nice_to_have"
    }
  ]
};

// Create decision
const consensusDecision = await manager.createDecision(consensusDecisionConfig);

// The consensus building process will run automatically
// The system will:
// 1. Share information with all participants
// 2. Facilitate discussion
// 3. Generate and refine proposals
// 4. Attempt to build consensus
// 5. If consensus fails, fallback to voting

// When all participants vote
for (const participant of consensusDecision.participants) {
  await manager.castVote(consensusDecision.decision_id, {
    agent_id: participant,
    option_id: consensusDecision.options[0].option_id,
    confidence: Math.random() * 0.3 + 0.7,  // 0.7-1.0
    reasoning: "Detailed reasoning here"
  });
}

// Get outcome
const consensusOutcome = await manager.makeDecision(consensusDecision.decision_id);

console.log("Consensus outcome:", consensusOutcome);
console.log("Chosen option:", consensusOutcome.chosen_option.title);
console.log("Consensus achieved:", consensusOutcome.consensus_achieved);
```

---

## Implementation Checklist

- [ ] Implement DecisionManager
- [ ] Implement all voting rules
- [ ] Implement ConsensusBuilder
- [ ] Implement AuthorityAdjustmentSystem
- [ ] Implement DecisionAuditSystem
- [ ] Implement FeedbackCollectionSystem
- [ ] Add comprehensive error handling
- [ ] Create unit tests for all components
- [ ] Implement monitoring and metrics
- [ ] Add decision analytics dashboard
- [ ] Create integration tests
- [ ] Document agent-specific workflows

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-03 | Initial release with complete collaborative decision protocols |

---

**Related Documents:**
- [Handoff Protocol Specification](./01-handoff-protocol-specification.md)
- [Context Sharing Architecture](./02-context-sharing-architecture.md)
- [Conflict Resolution Framework](./03-conflict-resolution-framework.md)
- [Implementation Guide](./06-implementation-guide.md)
