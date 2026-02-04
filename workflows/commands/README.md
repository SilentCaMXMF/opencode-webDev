# Structured Workflow Command System

A comprehensive workflow command system for the Frontend Design Agent System, inspired by Buildforce's slash command approach. This system provides structured, traceable, and consistent agent interactions with quality gates, deviation tracking, and evidence collection.

## Features

### Core Capabilities
- **7 Structured Commands**: Research, Plan, Build, Validate, Complete, Handoff, Escalate
- **Context Engineering Integration**: Deep integration with the Context Engineering System
- **Deviation Tracking**: Automatic detection and tracking of workflow deviations
- **Evidence Collection**: Comprehensive evidence gathering for quality validation
- **Quality Gates**: Configurable quality checkpoints with automated validation
- **Agent Handoffs**: Structured handoff protocols between 11 specialized agents
- **Escalation Procedures**: Issue escalation with severity-based routing

### Agent Support
Supports all 11 agent types with role-specific behaviors:
1. **ORCHESTRATOR** - Main coordination and decision making
2. **DESIGN_SYSTEM** - Design system management and UI patterns
3. **COMPONENT_DEVELOPER** - Component creation and development
4. **PERFORMANCE_OPTIMIZER** - Performance optimization and metrics
5. **ACCESSIBILITY** - A11y compliance and testing
6. **CROSS_PLATFORM** - Multi-platform compatibility
7. **TESTING_QA** - Quality assurance and testing
8. **SECURITY** - Security scanning and vulnerability assessment
9. **ANIMATION** - Animation and transitions
10. **I18N** - Internationalization and localization
11. **UX_RESEARCH** - User experience research and testing

## Installation

```bash
cd workflows/commands
npm install
npm run build
```

## Quick Start

```typescript
import { WorkflowCommandDispatcher, WorkflowUtils, ContextSystem } from './src';

// Initialize the system
const contextSystem = new ContextSystem();
const dispatcher = new WorkflowCommandDispatcher(contextSystem);

// Create a standard workflow sequence
const commands = WorkflowUtils.createStandardWorkflowSequence(
  AgentType.COMPONENT_DEVELOPER,
  ['Build a reusable Button component'],
  [{
    type: 'component',
    name: 'Button',
    path: 'src/components/Button'
  }],
  'Button component successfully built and validated',
  ['Component ready for production use']
);

// Execute the workflow
const results = await dispatcher.executeBatch(commands);

// Check results
console.log(`Workflow completed with ${results.filter(r => r.success).length}/${results.length} successful commands`);
```

## Commands Reference

### /workflow.research
Search context and analyze patterns to inform planning.

```typescript
const researchCommand = WorkflowUtils.createResearchCommand(
  AgentType.ORCHESTRATOR,
  'Research React button component patterns',
  {
    contextTypes: ['pattern', 'code_knowledge'],
    agentFilter: [AgentType.DESIGN_SYSTEM, AgentType.COMPONENT_DEVELOPER],
    maxResults: 20
  }
);
```

### /workflow.plan
Create structured specifications with timeline and resource allocation.

```typescript
const planCommand = WorkflowUtils.createPlanCommand(
  AgentType.DESIGN_SYSTEM,
  ['Create reusable button component', 'Ensure accessibility compliance'],
  {
    deliverables: ['Button component', 'Design tokens', 'Documentation'],
    timeline: {
      start: new Date(),
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
      milestones: [
        { name: 'Design Complete', date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) }
      ]
    }
  }
);
```

### /workflow.build
Execute development with deviation tracking and checkpointing.

```typescript
const buildCommand = WorkflowUtils.createBuildCommand(
  AgentType.COMPONENT_DEVELOPER,
  [{
    type: 'component',
    name: 'Button',
    path: 'src/components/Button',
    metadata: { usesStyling: true, usesForms: true }
  }],
  {
    trackDeviations: true,
    checkpointInterval: 300000 // 5 minutes
  }
);
```

### /workflow.validate
Evidence-based validation with configurable quality gates.

```typescript
const validateCommand = WorkflowUtils.createValidateCommand(
  AgentType.TESTING_QA,
  ['src/components/Button'],
  {
    validationTypes: ['functional', 'accessibility', 'security'],
    qualityGates: ['code_quality_gate', 'accessibility_gate'],
    autoApproveThreshold: 0.9
  }
);
```

### /workflow.complete
Generate artifacts and cleanup workflow resources.

```typescript
const completeCommand = WorkflowUtils.createCompleteCommand(
  AgentType.ORCHESTRATOR,
  ['src/components/Button', 'docs/Button.md'],
  'Button component workflow completed successfully',
  ['Component ready for production', 'Documentation complete'],
  {
    nextSteps: ['Deploy to staging environment', 'Update component library'],
    cleanup: true,
    archive: true
  }
);
```

### /workflow.handoff
Agent coordination with context preservation.

```typescript
const handoffCommand = WorkflowUtils.createHandoffCommand(
  AgentType.COMPONENT_DEVELOPER,
  AgentType.ACCESSIBILITY,
  ['src/components/Button'],
  'Review button component for a11y compliance and provide recommendations',
  {
    context: ['button-design-decisions', 'accessibility-requirements'],
    priority: 'high',
    expectedDuration: 45 // minutes
  }
);
```

### /workflow.escalate
Issue escalation with severity-based routing.

```typescript
const escalateCommand = WorkflowUtils.createEscalateCommand(
  AgentType.COMPONENT_DEVELOPER,
  'Critical accessibility violation detected in button component',
  'critical',
  {
    escalateTo: AgentType.ACCESSIBILITY,
    blockWorkflow: true,
    suggestedResolution: 'Review ARIA attributes and keyboard navigation'
  }
);
```

## Quality Gates

Quality gates provide automated validation at key checkpoints:

### Code Quality Gate
- Code coverage >= 80%
- ESLint errors = 0
- TypeScript errors = 0

### Performance Gate
- Lighthouse performance >= 90
- Bundle size <= 250KB

### Accessibility Gate
- a11y score >= 95
- WCAG AA compliance

### Security Gate
- No high-severity vulnerabilities
- Secure coding practices

## Deviation Tracking

The system automatically detects and categorizes deviations:

### Severity Levels
- **Minor**: Small deviations that don't impact functionality
- **Major**: Significant deviations that may impact quality
- **Critical**: Serious issues that must be resolved before proceeding

### Deviation Types
- Timeline deviations from planned schedules
- Quality deviations from expected standards
- Resource deviations from allocated resources
- Specification deviations from requirements

## Evidence Collection

Comprehensive evidence is collected throughout workflows:

### Evidence Types
- **code_review**: Manual and automated code reviews
- **test_result**: Unit test and integration test results
- **performance_metric**: Performance measurements and benchmarks
- **security_scan**: Security vulnerability scans
- **accessibility_audit**: A11y compliance audits
- **automated_check**: Automated validation checks
- **manual_verification**: Human-verified results

## API Reference

### WorkflowCommandDispatcher

```typescript
class WorkflowCommandDispatcher {
  constructor(contextSystem: ContextSystem);
  
  async executeCommand(command: AnyWorkflowCommand): Promise<CommandResult>;
  async executeBatch(commands: AnyWorkflowCommand[]): Promise<CommandResult[]>;
  async getWorkflowStatus(workflowId: string): Promise<WorkflowContext | null>;
  async listActiveWorkflows(): Promise<string[]>;
  async pauseWorkflow(workflowId: string): Promise<void>;
  async resumeWorkflow(workflowId: string): Promise<void>;
  async cancelWorkflow(workflowId: string): Promise<void>;
  async retryCommand(workflowId: string, commandId: string): Promise<CommandResult>;
  async getWorkflowMetrics(workflowId: string): Promise<WorkflowMetrics>;
}
```

### WorkflowUtils

```typescript
class WorkflowUtils {
  // Command creation
  static createResearchCommand(agent, query, options?): AnyWorkflowCommand;
  static createPlanCommand(agent, requirements, options?): AnyWorkflowCommand;
  static createBuildCommand(agent, artifacts, options?): AnyWorkflowCommand;
  static createValidateCommand(agent, targetArtifacts, options?): AnyWorkflowCommand;
  static createCompleteCommand(agent, artifacts, summary, outcomes, options?): AnyWorkflowCommand;
  static createHandoffCommand(agent, toAgent, artifacts, instructions, options?): AnyWorkflowCommand;
  static createEscalateCommand(agent, issue, severity, options?): AnyWorkflowCommand;
  
  // Workflow utilities
  static createStandardWorkflowSequence(agent, requirements, artifacts, summary, outcomes, options?): AnyWorkflowCommand[];
  static validateCommandSequence(commands): ValidationResult;
  static analyzeCommandResults(results): AnalysisResult;
  static getAgentCapabilities(agent): AgentCapabilities;
  static createDefaultTimeline(): Timeline;
  static generateWorkflowSummary(commands, results?): string;
}
```

## Integration Examples

### Custom Agent Implementation

```typescript
import { WorkflowCommandDispatcher, WorkflowUtils } from './src';

class CustomAgent {
  private dispatcher: WorkflowCommandDispatcher;
  
  constructor(contextSystem: ContextSystem) {
    this.dispatcher = new WorkflowCommandDispatcher(contextSystem);
  }

  async processFeatureRequest(description: string): Promise<void> {
    // Research phase
    const research = WorkflowUtils.createResearchCommand(
      AgentType.ORCHESTRATOR,
      `Research feature: ${description}`
    );
    
    const researchResult = await this.dispatcher.executeCommand(research);
    
    if (researchResult.success) {
      // Continue with planning...
      const plan = WorkflowUtils.createPlanCommand(
        AgentType.DESIGN_SYSTEM,
        researchResult.result.summary.requirements
      );
      
      await this.dispatcher.executeCommand(plan);
    }
  }
}
```

### Quality Gate Integration

```typescript
// Custom quality gate for your organization
const customQualityGate = {
  id: 'company_standards',
  name: 'Company Standards Gate',
  stage: 'validate',
  criteria: [
    { metric: 'code_coverage', threshold: 85, operator: '>=', weight: 2 },
    { metric: 'documentation_coverage', threshold: 90, operator: '>=', weight: 1 },
    { metric: 'peer_review_approved', threshold: 1, operator: '>=', weight: 2 }
  ],
  requiredEvidenceTypes: ['code_review', 'automated_check'],
  autoApprove: false,
  timeoutMs: 600000 // 10 minutes
};
```

## Configuration

### Environment Variables

```bash
# Context System Configuration
CONTEXT_SYSTEM_URL=http://localhost:3000
CONTEXT_SYSTEM_TIMEOUT=30000

# Workflow Configuration
WORKFLOW_DEFAULT_TIMEOUT=600000
WORKFLOW_MAX_CONCURRENT=5
WORKFLOW_EVIDENCE_RETENTION_DAYS=30

# Quality Gate Configuration
QUALITY_GATE_AUTO_APPROVE=false
QUALITY_GATE_TIMEOUT=300000
```

### TypeScript Configuration

The system includes comprehensive TypeScript definitions for all commands, results, and configuration options. See `src/types/workflow.ts` for complete type definitions.

## Testing

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

## Contributing

1. Follow the established code style (2 spaces, TypeScript strict mode)
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure all quality gates pass before submitting

## Architecture

The workflow system is built with a modular architecture:

```
src/
├── commands/           # Individual command handlers
│   ├── research.ts     # Research command implementation
│   ├── plan.ts         # Planning command implementation
│   ├── build.ts        # Build command implementation
│   ├── validate.ts     # Validation command implementation
│   ├── complete.ts     # Completion command implementation
│   ├── handoff.ts      # Handoff command implementation
│   └── escalate.ts     # Escalation command implementation
├── types/              # TypeScript type definitions
├── validators/         # Command and result validation
├── utils/              # Utility functions
├── dispatcher.ts       # Main command dispatcher
└── index.ts           # Public API exports
```

## License

MIT License - see LICENSE file for details.