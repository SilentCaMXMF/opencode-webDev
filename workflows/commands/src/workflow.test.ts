import { describe, it, expect, beforeEach } from 'vitest';
import { WorkflowCommandDispatcher } from '../src/dispatcher';
import { ContextSystem } from '../../../context-engineering/dist/core/context-system';
import { WorkflowUtils } from '../src/utils/workflow-utils';
import { AgentType } from '../src/types/workflow';

describe('WorkflowCommandDispatcher', () => {
  let dispatcher: WorkflowCommandDispatcher;
  let contextSystem: ContextSystem;

  beforeEach(() => {
    contextSystem = new ContextSystem();
    dispatcher = new WorkflowCommandDispatcher(contextSystem);
  });

  describe('Command Execution', () => {
    it('should execute a single research command', async () => {
      const command = WorkflowUtils.createResearchCommand(
        AgentType.ORCHESTRATOR,
        'Test workflow research'
      );

      const result = await dispatcher.executeCommand(command);

      expect(result.success).toBe(true);
      expect(result.stage).toBe('research');
      expect(result.agent).toBe(AgentType.ORCHESTRATOR);
      expect(result.nextStage).toBe('plan');
    });

    it('should execute a complete workflow sequence', async () => {
      const commands = WorkflowUtils.createStandardWorkflowSequence(
        AgentType.COMPONENT_DEVELOPER,
        ['Build a button component'],
        [{
          type: 'component',
          name: 'Button',
          path: 'src/components/Button'
        }],
        'Button component completed',
        ['Component ready for use']
      );

      const results = await dispatcher.executeBatch(commands);

      expect(results).toHaveLength(5);
      expect(results[0].success).toBe(true); // research
      expect(results[1].success).toBe(true); // plan
      expect(results[2].success).toBe(true); // build
      expect(results[3].success).toBe(true); // validate
      expect(results[4].success).toBe(true); // complete
    });

    it('should handle escalation at any stage', async () => {
      const researchCommand = WorkflowUtils.createResearchCommand(
        AgentType.COMPONENT_DEVELOPER,
        'Initial research'
      );

      const escalateCommand = WorkflowUtils.createEscalateCommand(
        AgentType.COMPONENT_DEVELOPER,
        'Critical blocking issue found',
        'critical',
        {
          escalateTo: AgentType.ORCHESTRATOR
        }
      );

      // Execute research first
      await dispatcher.executeCommand(researchCommand);
      
      // Then escalate
      const result = await dispatcher.executeCommand(escalateCommand);

      expect(result.success).toBe(true);
      expect(result.stage).toBe('escalate');
      expect(result.agent).toBe(AgentType.COMPONENT_DEVELOPER);
    });

    it('should handle handoff between agents', async () => {
      const handoffCommand = WorkflowUtils.createHandoffCommand(
        AgentType.COMPONENT_DEVELOPER,
        AgentType.DESIGN_SYSTEM,
        ['src/components/Button'],
        'Review button design and provide feedback'
      );

      const result = await dispatcher.executeCommand(handoffCommand);

      expect(result.success).toBe(true);
      expect(result.stage).toBe('handoff');
      expect(result.agent).toBe(AgentType.COMPONENT_DEVELOPER);
      expect(result.result.handoff.toAgent).toBe(AgentType.DESIGN_SYSTEM);
    });

    it('should reject invalid command sequences', async () => {
      // Try to execute build without research first
      const buildCommand = WorkflowUtils.createBuildCommand(
        AgentType.COMPONENT_DEVELOPER,
        [{ type: 'component', name: 'Button' }]
      );

      await expect(dispatcher.executeCommand(buildCommand)).rejects.toThrow(
        'Invalid command sequence'
      );
    });
  });

  describe('Workflow Management', () => {
    it('should track workflow status', async () => {
      const command = WorkflowUtils.createResearchCommand(
        AgentType.ORCHESTRATOR,
        'Test workflow'
      );

      await dispatcher.executeCommand(command);
      const status = await dispatcher.getWorkflowStatus(command.metadata?.workflowId || '');

      expect(status).toBeTruthy();
      expect(status?.status).toBe('in_progress');
      expect(status?.currentStage).toBe('plan'); // Moved to next stage
    });

    it('should list active workflows', async () => {
      const command1 = WorkflowUtils.createResearchCommand(
        AgentType.ORCHESTRATOR,
        'Workflow 1'
      );
      const command2 = WorkflowUtils.createResearchCommand(
        AgentType.COMPONENT_DEVELOPER,
        'Workflow 2'
      );

      await dispatcher.executeCommand(command1);
      await dispatcher.executeCommand(command2);

      const activeWorkflows = await dispatcher.listActiveWorkflows();
      expect(activeWorkflows.length).toBe(2);
    });

    it('should pause and resume workflows', async () => {
      const command = WorkflowUtils.createResearchCommand(
        AgentType.ORCHESTRATOR,
        'Test workflow'
      );

      const result = await dispatcher.executeCommand(command);
      const workflowId = result.result.artifacts[0]; // Simplified

      await dispatcher.pauseWorkflow(workflowId);
      let status = await dispatcher.getWorkflowStatus(workflowId);
      expect(status?.status).toBe('on_hold');

      await dispatcher.resumeWorkflow(workflowId);
      status = await dispatcher.getWorkflowStatus(workflowId);
      expect(status?.status).toBe('in_progress');
    });

    it('should cancel workflows', async () => {
      const command = WorkflowUtils.createResearchCommand(
        AgentType.ORCHESTRATOR,
        'Test workflow'
      );

      await dispatcher.executeCommand(command);
      const workflowId = command.metadata?.workflowId || '';

      await dispatcher.cancelWorkflow(workflowId);
      const status = await dispatcher.getWorkflowStatus(workflowId);
      expect(status).toBeNull(); // Should be removed from active workflows
    });
  });

  describe('Metrics and Analysis', () => {
    it('should provide workflow metrics', async () => {
      const commands = WorkflowUtils.createStandardWorkflowSequence(
        AgentType.COMPONENT_DEVELOPER,
        ['Test project'],
        [{ type: 'component', name: 'TestComp' }],
        'Test completed',
        ['Test outcomes']
      );

      await dispatcher.executeBatch(commands);
      const workflowId = commands[0].metadata?.workflowId || '';

      const metrics = await dispatcher.getWorkflowMetrics(workflowId);

      expect(metrics.commands.total).toBe(5);
      expect(metrics.commands.completed).toBe(5);
      expect(metrics.commands.progress).toBe(100);
      expect(metrics.workflowId).toBe(workflowId);
    });

    it('should retry failed commands', async () => {
      const command = WorkflowUtils.createResearchCommand(
        AgentType.ORCHESTRATOR,
        'Test retry'
      );

      await dispatcher.executeCommand(command);
      const workflowId = command.metadata?.workflowId || '';

      // Simulate retry
      const retryResult = await dispatcher.retryCommand(workflowId, command.id);
      
      expect(retryResult.success).toBe(true);
      expect(retryResult.commandId).toBe(command.id);
    });
  });
});

describe('WorkflowUtils', () => {
  describe('Command Creation', () => {
    it('should create research command with defaults', () => {
      const command = WorkflowUtils.createResearchCommand(
        AgentType.ORCHESTRATOR,
        'Test research'
      );

      expect(command.command).toBe('workflow.research');
      expect(command.stage).toBe('research');
      expect(command.agent).toBe(AgentType.ORCHESTRATOR);
      expect(command.parameters.query).toBe('Test research');
      expect(command.parameters.maxResults).toBe(20);
      expect(command.parameters.includeEvidence).toBe(true);
    });

    it('should create plan command with custom options', () => {
      const command = WorkflowUtils.createPlanCommand(
        AgentType.DESIGN_SYSTEM,
        ['Create design system'],
        {
          deliverables: ['components', 'tokens'],
          priority: 'high'
        }
      );

      expect(command.command).toBe('workflow.plan');
      expect(command.parameters.requirements).toContain('Create design system');
      expect(command.parameters.deliverables).toEqual(['components', 'tokens']);
      expect(command.priority).toBe('high');
    });

    it('should create escalation command', () => {
      const command = WorkflowUtils.createEscalateCommand(
        AgentType.COMPONENT_DEVELOPER,
        'Critical security issue',
        'critical',
        {
          escalateTo: AgentType.SECURITY,
          blockWorkflow: true
        }
      );

      expect(command.command).toBe('workflow.escalate');
      expect(command.parameters.issue).toBe('Critical security issue');
      expect(command.parameters.severity).toBe('critical');
      expect(command.parameters.escalateTo).toBe(AgentType.SECURITY);
      expect(command.parameters.blockWorkflow).toBe(true);
    });
  });

  describe('Command Validation', () => {
    it('should validate correct command sequence', () => {
      const commands = WorkflowUtils.createStandardWorkflowSequence(
        AgentType.COMPONENT_DEVELOPER,
        ['Test'],
        [{ type: 'component', name: 'Test' }],
        'Complete',
        ['Outcomes']
      );

      const validation = WorkflowUtils.validateCommandSequence(commands);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect invalid command sequence', () => {
      const commands = [
        WorkflowUtils.createBuildCommand(
          AgentType.COMPONENT_DEVELOPER,
          [{ type: 'component', name: 'Test' }]
        ),
        WorkflowUtils.createResearchCommand(
          AgentType.ORCHESTRATOR,
          'Test'
        )
      ];

      const validation = WorkflowUtils.validateCommandSequence(commands);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('First command must be research stage');
    });

    it('should provide warnings for missing stages', () => {
      const commands = [
        WorkflowUtils.createResearchCommand(
          AgentType.ORCHESTRATOR,
          'Test'
        ),
        WorkflowUtils.createCompleteCommand(
          AgentType.ORCHESTRATOR,
          ['artifact'],
          'Summary',
          ['Outcomes']
        )
      ];

      const validation = WorkflowUtils.validateCommandSequence(commands);

      expect(validation.valid).toBe(true);
      expect(validation.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Agent Capabilities', () => {
    it('should provide agent capabilities', () => {
      const devCapabilities = WorkflowUtils.getAgentCapabilities(AgentType.COMPONENT_DEVELOPER);
      
      expect(devCapabilities.primaryStages).toContain('build');
      expect(devCapabilities.primaryStages).toContain('validate');
      expect(devCapabilities.specialization).toContain('react_components');
      expect(devCapabilities.canEscalateTo).toContain(AgentType.DESIGN_SYSTEM);
    });

    it('should provide orchestrator capabilities', () => {
      const orchestratorCapabilities = WorkflowUtils.getAgentCapabilities(AgentType.ORCHESTRATOR);
      
      expect(orchestratorCapabilities.primaryStages).toContain('plan');
      expect(orchestratorCapabilities.primaryStages).toContain('complete');
      expect(orchestratorCapabilities.canEscalateTo).toHaveLength(0);
      expect(orchestratorCapabilities.specialization).toContain('coordination');
    });
  });

  describe('Analysis Utilities', () => {
    it('should analyze command results', () => {
      const results = [
        {
          stage: 'research',
          success: true,
          executionTime: 1000,
          deviations: [],
          evidence: [{ type: 'test_result' }]
        },
        {
          stage: 'build',
          success: true,
          executionTime: 2000,
          deviations: [{ severity: 'minor' }],
          evidence: [{ type: 'code_review' }, { type: 'test_result' }]
        },
        {
          stage: 'validate',
          success: false,
          executionTime: 1500,
          deviations: [{ severity: 'critical' }],
          evidence: [{ type: 'automated_check' }]
        }
      ];

      const analysis = WorkflowUtils.analyzeCommandResults(results);

      expect(analysis.totalCommands).toBe(3);
      expect(analysis.successRate).toBeCloseTo(66.67, 1);
      expect(analysis.totalDeviations).toBe(2);
      expect(analysis.criticalDeviations).toBe(1);
      expect(analysis.totalEvidence).toBe(4);
      expect(analysis.averageExecutionTime).toBe(1500);
    });

    it('should create default timeline', () => {
      const timeline = WorkflowUtils.createDefaultTimeline();

      expect(timeline.start).toBeInstanceOf(Date);
      expect(timeline.end).toBeInstanceOf(Date);
      expect(timeline.milestones).toHaveLength(5);
      expect(timeline.milestones[0].name).toBe('Research Complete');
    });

    it('should generate workflow summary', () => {
      const commands = [
        WorkflowUtils.createResearchCommand(AgentType.ORCHESTRATOR, 'Test'),
        WorkflowUtils.createPlanCommand(AgentType.ORCHESTRATOR, ['Plan'])
      ];

      const summary = WorkflowUtils.generateWorkflowSummary(commands);

      expect(summary).toContain('2 commands');
      expect(summary).toContain('research -> plan');
      expect(summary).toContain('ORCHESTRATOR');
    });
  });
});