import { z } from 'zod';
import { AnyWorkflowCommand, WorkflowCommand } from '@types/workflow';

// Command validation schemas
export const CommandValidator = {
  // Validate command structure
  validateCommand: (command: unknown): AnyWorkflowCommand => {
    return AnyWorkflowCommandSchema.parse(command);
  },

  // Validate command parameters based on type
  validateParameters: (command: unknown, commandType: string) => {
    switch (commandType) {
      case 'workflow.research':
        return ResearchCommandSchema.omit({ id: true, timestamp: true, status: true }).parse(command);
      case 'workflow.plan':
        return PlanCommandSchema.omit({ id: true, timestamp: true, status: true }).parse(command);
      case 'workflow.build':
        return BuildCommandSchema.omit({ id: true, timestamp: true, status: true }).parse(command);
      case 'workflow.validate':
        return ValidateCommandSchema.omit({ id: true, timestamp: true, status: true }).parse(command);
      case 'workflow.complete':
        return CompleteCommandSchema.omit({ id: true, timestamp: true, status: true }).parse(command);
      case 'workflow.handoff':
        return HandoffCommandSchema.omit({ id: true, timestamp: true, status: true }).parse(command);
      case 'workflow.escalate':
        return EscalateCommandSchema.omit({ id: true, timestamp: true, status: true }).parse(command);
      default:
        throw new Error(`Unknown command type: ${commandType}`);
    }
  },

  // Validate command sequence
  validateCommandSequence: (commands: WorkflowCommand[]): boolean => {
    const validSequence = [
      'workflow.research',
      'workflow.plan',
      'workflow.build',
      'workflow.validate',
      'workflow.complete'
    ];

    const commandSequence = commands.map(cmd => cmd.command);
    
    // Allow handoffs and escalations at any point
    const filteredSequence = commandSequence.filter(
      cmd => !['workflow.handoff', 'workflow.escalate'].includes(cmd)
    );

    // Check if the filtered sequence follows the expected order
    for (let i = 0; i < filteredSequence.length - 1; i++) {
      const currentIndex = validSequence.indexOf(filteredSequence[i]);
      const nextIndex = validSequence.indexOf(filteredSequence[i + 1]);
      
      if (currentIndex === -1 || nextIndex === -1 || currentIndex > nextIndex) {
        return false;
      }
    }

    return true;
  }
};

// Quality gate validation
export const QualityGateValidator = {
  validateQualityGate: (gate: unknown) => {
    return QualityGateSchema.parse(gate);
  },

  checkQualityGateThreshold: (
    metric: number, 
    threshold: number, 
    operator: string
  ): boolean => {
    switch (operator) {
      case '>':
        return metric > threshold;
      case '<':
        return metric < threshold;
      case '>=':
        return metric >= threshold;
      case '<=':
        return metric <= threshold;
      case '==':
        return metric === threshold;
      default:
        throw new Error(`Invalid operator: ${operator}`);
    }
  },

  calculateQualityScore: (
    criteria: Array<{ metric: string; threshold: number; operator: string; weight: number }>,
    metrics: Record<string, number>
  ): { score: number; passed: boolean; details: Record<string, boolean> } => {
    let totalWeight = 0;
    let weightedScore = 0;
    const details: Record<string, boolean> = {};

    for (const criterion of criteria) {
      const metric = metrics[criterion.metric];
      if (metric === undefined) {
        throw new Error(`Missing metric: ${criterion.metric}`);
      }

      const passed = QualityGateValidator.checkQualityGateThreshold(
        metric,
        criterion.threshold,
        criterion.operator
      );

      details[criterion.metric] = passed;
      totalWeight += criterion.weight;
      weightedScore += passed ? criterion.weight : 0;
    }

    const score = totalWeight > 0 ? weightedScore / totalWeight : 0;
    const passed = score >= 0.8; // 80% threshold for passing

    return { score, passed, details };
  }
};

// Evidence validation
export const EvidenceValidator = {
  validateEvidence: (evidence: unknown) => {
    return EvidenceSchema.parse(evidence);
  },

  validateEvidenceConfidence: (confidence: number): boolean => {
    return confidence >= 0 && confidence <= 1;
  },

  validateEvidenceForQualityGate: (
    evidence: Array<Evidence>,
    requiredTypes: Array<EvidenceType>
  ): boolean => {
    const evidenceTypes = new Set(evidence.map(e => e.type));
    return requiredTypes.every(type => evidenceTypes.has(type));
  }
};

// Deviation validation
export const DeviationValidator = {
  validateDeviation: (deviation: unknown) => {
    return DeviationSchema.parse(deviation);
  },

  assessDeviationSeverity: (
    expected: string,
    actual: string,
    stage: WorkflowStage
  ): 'minor' | 'major' | 'critical' => {
    // Simple heuristic for deviation severity assessment
    const criticalStages = ['build', 'validate'];
    const isStageCritical = criticalStages.includes(stage);
    
    // Check for common critical deviations
    const criticalKeywords = ['security', 'accessibility', 'performance', 'data loss'];
    const hasCriticalIssue = criticalKeywords.some(keyword => 
      actual.toLowerCase().includes(keyword) || 
      expected.toLowerCase().includes(keyword)
    );

    if (hasCriticalIssue && isStageCritical) {
      return 'critical';
    }

    if (isStageCritical || hasCriticalIssue) {
      return 'major';
    }

    return 'minor';
  }
};

// Import schemas and types
import {
  AnyWorkflowCommandSchema,
  ResearchCommandSchema,
  PlanCommandSchema,
  BuildCommandSchema,
  ValidateCommandSchema,
  CompleteCommandSchema,
  HandoffCommandSchema,
  EscalateCommandSchema,
  WorkflowCommand,
  QualityGateSchema,
  EvidenceSchema,
  DeviationSchema,
  EvidenceType,
  Evidence,
  QualityGate,
  WorkflowStage
} from '@types/workflow';