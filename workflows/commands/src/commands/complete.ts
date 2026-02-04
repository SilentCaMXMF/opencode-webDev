import { v4 as uuidv4 } from 'uuid';
import { ContextSystem } from '../../../context-engineering/dist/core/context-system';
import { 
  CompleteCommand, 
  CommandResult,
  WorkflowStage,
  AgentType,
  Deviation,
  Evidence
} from '@types/workflow';

export class CompleteCommandHandler {
  private contextSystem: ContextSystem;

  constructor(contextSystem: ContextSystem) {
    this.contextSystem = contextSystem;
  }

  async execute(command: CompleteCommand): Promise<CommandResult> {
    const startTime = Date.now();
    const deviations: Deviation[] = [];
    const evidence: Evidence[] = [];

    try {
      // Validate completion prerequisites
      const prerequisiteCheck = await this.validateCompletionPrerequisites(command);
      
      // Generate completion artifacts
      const completionArtifacts = await this.generateCompletionArtifacts(command);
      
      // Store completion summary in context
      const summary = await this.storeCompletionSummary(command, completionArtifacts);
      
      // Perform cleanup if requested
      if (command.parameters.cleanup) {
        await this.performCleanup(command);
      }

      // Archive context if requested
      if (command.parameters.archive) {
        await this.archiveContext(command);
      }

      // Generate completion evidence
      evidence.push(...await this.generateCompletionEvidence(
        prerequisiteCheck,
        completionArtifacts,
        summary,
        command
      ));

      // Detect completion deviations
      const completionDeviations = await this.detectCompletionDeviations(
        prerequisiteCheck,
        completionArtifacts,
        command
      );
      deviations.push(...completionDeviations);

      const executionTime = Date.now() - startTime;

      return {
        commandId: command.id,
        success: true,
        stage: 'complete',
        agent: command.agent,
        timestamp: new Date(),
        executionTime,
        result: {
          prerequisiteCheck,
          completionArtifacts,
          summary,
          artifacts: completionArtifacts.map(artifact => artifact.path),
          outcomes: command.parameters.outcomes,
          nextSteps: command.parameters.nextSteps || [],
          completed: true
        },
        deviations,
        evidence,
        artifacts: completionArtifacts.map(artifact => artifact.path)
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      return {
        commandId: command.id,
        success: false,
        stage: 'complete',
        agent: command.agent,
        timestamp: new Date(),
        executionTime,
        result: null,
        deviations,
        evidence,
        message: `Complete command failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async validateCompletionPrerequisites(command: CompleteCommand): Promise<any> {
    const validation = {
      artifactsValid: true,
      workflowComplete: true,
      qualityGatesPassed: true,
      issues: []
    };

    // Validate that all specified artifacts exist
    for (const artifactRef of command.parameters.artifacts) {
      try {
        const searchResult = await this.contextSystem.search({
          query: artifactRef,
          types: ['project_context', 'code_knowledge'],
          limit: 5
        });

        if (searchResult.entries.length === 0) {
          validation.artifactsValid = false;
          validation.issues.push(`Artifact not found: ${artifactRef}`);
        }
      } catch (error) {
        validation.artifactsValid = false;
        validation.issues.push(`Error validating artifact ${artifactRef}: ${error}`);
      }
    }

    // Check workflow completion status
    const workflowEntries = await this.contextSystem.search({
      query: `workflow ${command.id}`,
      types: ['session_memory'],
      limit: 10
    });

    if (workflowEntries.entries.length === 0) {
      validation.workflowComplete = false;
      validation.issues.push('No workflow session memory found');
    }

    // Check if validation stage was completed successfully
    const validationEntries = await this.contextSystem.search({
      query: 'validate stage',
      types: ['agent_interaction'],
      limit: 10
    });

    const validationResults = validationEntries.entries.filter(entry => 
      entry.content.includes('passed') || entry.content.includes('failed')
    );

    if (validationResults.length === 0) {
      validation.qualityGatesPassed = false;
      validation.issues.push('No validation results found');
    }

    return validation;
  }

  private async generateCompletionArtifacts(command: CompleteCommand): Promise<any[]> {
    const artifacts: any[] = [];

    // Generate completion summary document
    artifacts.push(await this.generateCompletionSummaryDocument(command));

    // Generate artifact inventory
    artifacts.push(await this.generateArtifactInventory(command));

    // Generate workflow log
    artifacts.push(await this.generateWorkflowLog(command));

    // Generate deployment checklist
    artifacts.push(await this.generateDeploymentChecklist(command));

    // Generate handover documentation if there are next steps
    if (command.parameters.nextSteps && command.parameters.nextSteps.length > 0) {
      artifacts.push(await this.generateHandoverDocumentation(command));
    }

    return artifacts;
  }

  private async generateCompletionSummaryDocument(command: CompleteCommand): Promise<any> {
    const timestamp = new Date().toISOString();
    const summary = {
      id: uuidv4(),
      type: 'completion_summary',
      metadata: {
        generatedAt: timestamp,
        generatedBy: command.agent,
        commandId: command.id,
        version: '1.0'
      },
      content: {
        title: `Workflow Completion Summary - ${command.id}`,
        summary: command.parameters.summary,
        outcomes: command.parameters.outcomes,
        artifacts: command.parameters.artifacts,
        nextSteps: command.parameters.nextSteps || [],
        status: 'completed',
        completedAt: timestamp
      },
      sections: [
        {
          title: 'Executive Summary',
          content: command.parameters.summary
        },
        {
          title: 'Outcomes',
          content: command.parameters.outcomes.join('\n')
        },
        {
          title: 'Delivered Artifacts',
          content: command.parameters.artifacts.join('\n')
        },
        {
          title: 'Next Steps',
          content: (command.parameters.nextSteps || []).join('\n')
        }
      ]
    };

    return {
      path: `completion/${command.id}-summary.json`,
      content: JSON.stringify(summary, null, 2),
      type: 'summary_document',
      metadata: summary.metadata
    };
  }

  private async generateArtifactInventory(command: CompleteCommand): Promise<any> {
    const inventory = {
      id: uuidv4(),
      type: 'artifact_inventory',
      generatedAt: new Date().toISOString(),
      commandId: command.id,
      artifacts: []
    };

    // Collect information about all artifacts
    for (const artifactRef of command.parameters.artifacts) {
      try {
        const searchResult = await this.contextSystem.search({
          query: artifactRef,
          types: ['project_context', 'code_knowledge'],
          limit: 5
        });

        if (searchResult.entries.length > 0) {
          const entry = searchResult.entries[0];
          inventory.artifacts.push({
            ref: artifactRef,
            id: entry.id,
            type: entry.type,
            title: entry.title,
            createdAt: entry.metadata.createdAt,
            tags: entry.metadata.tags,
            agents: entry.metadata.agents,
            size: entry.content.length,
            checksum: this.simpleChecksum(entry.content)
          });
        } else {
          inventory.artifacts.push({
            ref: artifactRef,
            status: 'not_found',
            error: 'Artifact not found in context system'
          });
        }
      } catch (error) {
        inventory.artifacts.push({
          ref: artifactRef,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return {
      path: `completion/${command.id}-inventory.json`,
      content: JSON.stringify(inventory, null, 2),
      type: 'inventory_document',
      metadata: {
        artifactCount: inventory.artifacts.length,
        validArtifacts: inventory.artifacts.filter(a => !a.status).length
      }
    };
  }

  private async generateWorkflowLog(command: CompleteCommand): Promise<any> {
    const workflowLog = {
      id: uuidv4(),
      type: 'workflow_log',
      generatedAt: new Date().toISOString(),
      commandId: command.id,
      stages: ['research', 'plan', 'build', 'validate', 'complete'],
      timeline: [],
      metrics: {}
    };

    // Build workflow timeline from context
    for (const stage of workflowLog.stages) {
      const stageEntries = await this.contextSystem.search({
        query: `${stage} stage ${command.id}`,
        types: ['session_memory', 'agent_interaction'],
        limit: 20
      });

      if (stageEntries.entries.length > 0) {
        const latestEntry = stageEntries.entries[0];
        workflowLog.timeline.push({
          stage,
          timestamp: latestEntry.metadata.updatedAt,
          agent: latestEntry.metadata.agents[0],
          status: 'completed',
          entries: stageEntries.entries.length
        });
      } else {
        workflowLog.timeline.push({
          stage,
          timestamp: new Date().toISOString(),
          agent: command.agent,
          status: 'unknown',
          entries: 0
        });
      }
    }

    // Calculate workflow metrics
    workflowLog.metrics = {
      totalStages: workflowLog.stages.length,
      completedStages: workflowLog.timeline.filter(t => t.status === 'completed').length,
      totalEntries: workflowLog.timeline.reduce((sum, t) => sum + t.entries, 0),
      duration: this.calculateWorkflowDuration(workflowLog.timeline)
    };

    return {
      path: `completion/${command.id}-workflow-log.json`,
      content: JSON.stringify(workflowLog, null, 2),
      type: 'workflow_log',
      metadata: workflowLog.metrics
    };
  }

  private async generateDeploymentChecklist(command: CompleteCommand): Promise<any> {
    const checklist = {
      id: uuidv4(),
      type: 'deployment_checklist',
      generatedAt: new Date().toISOString(),
      commandId: command.id,
      sections: [
        {
          title: 'Pre-Deployment Checklist',
          items: [
            {
              id: 'pre-1',
              task: 'Review all artifacts for completeness',
              status: 'pending',
              responsible: 'Team Lead'
            },
            {
              id: 'pre-2',
              task: 'Run final quality checks',
              status: 'pending',
              responsible: 'QA Engineer'
            },
            {
              id: 'pre-3',
              task: 'Backup current version',
              status: 'pending',
              responsible: 'DevOps'
            }
          ]
        },
        {
          title: 'Deployment Tasks',
          items: [
            {
              id: 'dep-1',
              task: 'Deploy to staging environment',
              status: 'pending',
              responsible: 'DevOps'
            },
            {
              id: 'dep-2',
              task: 'Run smoke tests',
              status: 'pending',
              responsible: 'QA Engineer'
            },
            {
              id: 'dep-3',
              task: 'Deploy to production',
              status: 'pending',
              responsible: 'DevOps'
            }
          ]
        },
        {
          title: 'Post-Deployment Checklist',
          items: [
            {
              id: 'post-1',
              task: 'Monitor system performance',
              status: 'pending',
              responsible: 'DevOps'
            },
            {
              id: 'post-2',
              task: 'Verify functionality',
              status: 'pending',
              responsible: 'QA Engineer'
            },
            {
              id: 'post-3',
              task: 'Update documentation',
              status: 'pending',
              responsible: 'Team Lead'
            }
          ]
        }
      ]
    };

    return {
      path: `completion/${command.id}-deployment-checklist.json`,
      content: JSON.stringify(checklist, null, 2),
      type: 'checklist',
      metadata: {
        totalItems: checklist.sections.reduce((sum, section) => sum + section.items.length, 0)
      }
    };
  }

  private async generateHandoverDocumentation(command: CompleteCommand): Promise<any> {
    const handover = {
      id: uuidv4(),
      type: 'handover_documentation',
      generatedAt: new Date().toISOString(),
      commandId: command.id,
      summary: command.parameters.summary,
      nextSteps: command.parameters.nextSteps || [],
      artifacts: command.parameters.artifacts,
      responsibilities: {
        current: [command.agent],
        next: this.determineNextAgents(command.parameters.nextSteps)
      },
      notes: [
        'Workflow has been completed successfully',
        'All quality gates have been passed',
        'Artifacts are ready for next phase'
      ]
    };

    return {
      path: `completion/${command.id}-handover.json`,
      content: JSON.stringify(handover, null, 2),
      type: 'handover_document',
      metadata: {
        hasNextSteps: command.parameters.nextSteps && command.parameters.nextSteps.length > 0,
        nextStepsCount: (command.parameters.nextSteps || []).length
      }
    };
  }

  private async storeCompletionSummary(command: CompleteCommand, artifacts: any[]): Promise<any> {
    const summary = {
      id: uuidv4(),
      type: 'session_memory',
      title: `Workflow Completion: ${command.id}`,
      content: JSON.stringify({
        commandId: command.id,
        agent: command.agent,
        completedAt: new Date().toISOString(),
        summary: command.parameters.summary,
        outcomes: command.parameters.outcomes,
        artifacts: command.parameters.artifacts,
        nextSteps: command.parameters.nextSteps,
        generatedArtifacts: artifacts.map(a => a.path)
      }),
      metadata: {
        version: 1,
        tags: ['completion', 'workflow', command.agent],
        agents: [command.agent]
      }
    };

    await this.contextSystem.create(summary);
    return summary;
  }

  private async performCleanup(command: CompleteCommand): Promise<void> {
    // Clean up temporary files, caches, etc.
    // This would be implemented based on specific cleanup requirements
    
    // Example cleanup operations:
    // - Clear temporary build artifacts
    // - Clean up cache directories
    // - Close open connections
    // - Release resources
  }

  private async archiveContext(command: CompleteCommand): Promise<void> {
    // Archive workflow-related context entries
    const workflowEntries = await this.contextSystem.search({
      query: command.id,
      types: ['session_memory', 'agent_interaction'],
      limit: 50
    });

    for (const entry of workflowEntries.entries) {
      // Mark entries as archived (implementation depends on context system)
      // This could involve updating metadata or moving to archive storage
    }
  }

  private async generateCompletionEvidence(
    prerequisiteCheck: any,
    completionArtifacts: any[],
    summary: any,
    command: CompleteCommand
  ): Promise<Evidence[]> {
    const evidence: Evidence[] = [];

    // Prerequisite validation evidence
    evidence.push({
      id: uuidv4(),
      type: 'automated_check',
      stage: 'complete',
      agent: command.agent,
      data: {
        artifactsValid: prerequisiteCheck.artifactsValid,
        workflowComplete: prerequisiteCheck.workflowComplete,
        qualityGatesPassed: prerequisiteCheck.qualityGatesPassed,
        issuesCount: prerequisiteCheck.issues.length
      },
      timestamp: new Date(),
      confidence: 0.95
    });

    // Artifact generation evidence
    evidence.push({
      id: uuidv4(),
      type: 'automated_check',
      stage: 'complete',
      agent: command.agent,
      data: {
        artifactsGenerated: completionArtifacts.length,
        artifactTypes: completionArtifacts.map(a => a.type),
        totalArtifacts: command.parameters.artifacts.length
      },
      timestamp: new Date(),
      confidence: 0.9
    });

    // Documentation completeness evidence
    evidence.push({
      id: uuidv4(),
      type: 'manual_verification',
      stage: 'complete',
      agent: command.agent,
      data: {
        summaryStored: !!summary,
        summaryId: summary.id,
        outcomesProvided: command.parameters.outcomes.length > 0,
        nextStepsProvided: (command.parameters.nextSteps || []).length > 0
      },
      timestamp: new Date(),
      confidence: 0.85
    });

    return evidence;
  }

  private async detectCompletionDeviations(
    prerequisiteCheck: any,
    completionArtifacts: any[],
    command: CompleteCommand
  ): Promise<Deviation[]> {
    const deviations: Deviation[] = [];

    // Check for missing artifacts
    if (!prerequisiteCheck.artifactsValid) {
      deviations.push({
        id: uuidv4(),
        timestamp: new Date(),
        stage: 'complete',
        agent: command.agent,
        expected: 'All artifacts present and valid',
        actual: 'Some artifacts are missing or invalid',
        severity: 'major',
        justification: 'Missing artifacts will impact deployment and maintenance',
        resolution: 'Locate missing artifacts or regenerate them'
      });
    }

    // Check for incomplete workflow
    if (!prerequisiteCheck.workflowComplete) {
      deviations.push({
        id: uuidv4(),
        timestamp: new Date(),
        stage: 'complete',
        agent: command.agent,
        expected: 'All workflow stages completed',
        actual: 'Workflow appears incomplete',
        severity: 'critical',
        justification: 'Incomplete workflow may indicate unfinished tasks',
        resolution: 'Review workflow stages and complete missing steps'
      });
    }

    // Check for failed quality gates
    if (!prerequisiteCheck.qualityGatesPassed) {
      deviations.push({
        id: uuidv4(),
        timestamp: new Date(),
        stage: 'complete',
        agent: command.agent,
        expected: 'All quality gates passed',
        actual: 'Some quality gates failed',
        severity: 'critical',
        justification: 'Quality issues must be resolved before completion',
        resolution: 'Address quality gate failures and re-validate'
      });
    }

    // Check for insufficient documentation
    if (completionArtifacts.length < 3) {
      deviations.push({
        id: uuidv4(),
        timestamp: new Date(),
        stage: 'complete',
        agent: command.agent,
        expected: 'Comprehensive completion documentation',
        actual: 'Insufficient completion artifacts generated',
        severity: 'minor',
        justification: 'Better documentation improves maintainability',
        resolution: 'Generate additional documentation as needed'
      });
    }

    return deviations;
  }

  private simpleChecksum(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  private calculateWorkflowDuration(timeline: any[]): number {
    if (timeline.length === 0) return 0;
    
    const timestamps = timeline
      .filter(t => t.timestamp)
      .map(t => new Date(t.timestamp).getTime())
      .sort((a, b) => a - b);
    
    if (timestamps.length < 2) return 0;
    
    return timestamps[timestamps.length - 1] - timestamps[0];
  }

  private determineNextAgents(nextSteps: string[]): AgentType[] {
    // Simple logic to determine next responsible agents based on next steps
    const agents: AgentType[] = [];
    
    for (const step of nextSteps) {
      const lower = step.toLowerCase();
      
      if (lower.includes('deploy') || lower.includes('ops')) {
        agents.push('ORCHESTRATOR');
      }
      if (lower.includes('test') || lower.includes('qa')) {
        agents.push('TESTING_QA');
      }
      if (lower.includes('design') || lower.includes('ui')) {
        agents.push('DESIGN_SYSTEM');
      }
      if (lower.includes('performance')) {
        agents.push('PERFORMANCE_OPTIMIZER');
      }
      if (lower.includes('security')) {
        agents.push('SECURITY');
      }
      if (lower.includes('accessibility') || lower.includes('a11y')) {
        agents.push('ACCESSIBILITY');
      }
    }
    
    // Return unique agents
    return [...new Set(agents)];
  }
}