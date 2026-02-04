# Session Memory Template

**Purpose**: Template for tracking active development sessions and context preservation

## Session Structure

```typescript
interface SessionMemory {
  sessionId: string;
  agentId: string;
  agentType: AgentType;
  startTime: Date;
  lastActivity: Date;
  status: 'active' | 'paused' | 'completed';
  
  // Context tracking
  currentTask: TaskContext;
  previousTasks: TaskContext[];
  relevantDecisions: string[]; // ADR IDs
  
  // Memory management
  importantContext: ContextEntry[];
  agentInteractions: AgentInteraction[];
  learnings: SessionLearning[];
  
  // Performance tracking
  metrics: SessionMetrics;
}
```

## Task Context Template

```typescript
interface TaskContext {
  taskId: string;
  type: string;
  description: string;
  startTime: Date;
  status: 'in_progress' | 'completed' | 'blocked';
  
  // Context sources used
  referencedADRs: string[];
  referencedPatterns: string[];
  referencedSessions: string[];
  
  // Decision tracking
  decisions: TaskDecision[];
  outcomes: TaskOutcome[];
  
  // Agent collaboration
  collaboratingAgents: AgentCollaboration[];
  handoffs: HandoffRecord[];
}

interface TaskDecision {
  timestamp: Date;
  description: string;
  rationale: string;
  alternatives: string[];
  confidence: number;
  sources: string[];
}

interface TaskOutcome {
  timestamp: Date;
  type: 'success' | 'error' | 'partial';
  description: string;
  metrics?: Record<string, number>;
  learnings: string[];
}
```

## Agent Interaction Template

```typescript
interface AgentInteraction {
  timestamp: Date;
  fromAgent: AgentType;
  toAgent: AgentType;
  interactionType: 'handoff' | 'consultation' | 'collaboration' | 'review';
  
  // Context exchange
  sharedContext: ContextFragment[];
  purpose: string;
  outcome: InteractionOutcome;
  
  // Relationship tracking
  relationshipStrength: number;
  followUpRequired: boolean;
}

interface ContextFragment {
  type: 'decision' | 'pattern' | 'requirement' | 'constraint';
  content: string;
  relevance: number;
  source: string;
}

interface InteractionOutcome {
  success: boolean;
  duration: number; // milliseconds
  quality: number; // 0-1
  feedback: string;
  nextSteps: string[];
}
```

## Learning Capture Template

```typescript
interface SessionLearning {
  timestamp: Date;
  category: 'pattern' | 'decision' | 'process' | 'technical' | 'collaboration';
  
  // Learning content
  title: string;
  description: string;
  context: string;
  
  // Applicability
  applicableAgents: AgentType[];
  applicableSituations: string[];
  
  // Validation
  confidence: number;
  evidence: string[];
  validationNeeded: boolean;
  
  // Sharing
  shouldShare: boolean;
  shareWithAgents: AgentType[];
  addToPatternLibrary: boolean;
}
```

## Performance Metrics Template

```typescript
interface SessionMetrics {
  // Time tracking
  totalDuration: number;
  activeTime: number;
  pauseTime: number;
  
  // Task metrics
  tasksCompleted: number;
  tasksBlocked: number;
  averageTaskDuration: number;
  
  // Collaboration metrics
  agentInteractions: number;
  handoffCount: number;
  collaborationSuccess: number;
  
  // Context metrics
  contextHitRate: number;
  relevantDecisionsFound: number;
  patternsUsed: number;
  
  // Quality metrics
  decisionConfidence: number;
  outcomeQuality: number;
  errorRate: number;
}
```

## Session Templates by Agent Type

### ORCHESTRATOR Session Template
```typescript
const orchestratorSessionTemplate = {
  focusAreas: [
    'agent_coordination',
    'task_distribution',
    'conflict_resolution',
    'quality_assurance'
  ],
  
  trackedInteractions: [
    'task_assignment',
    'agent_handoffs',
    'resource_allocation',
    'deadline_management'
  ],
  
  keyMetrics: [
    'agent_utilization',
    'task_completion_rate',
    'collaboration_efficiency',
    'quality_gate_pass_rate'
  ]
};
```

### DESIGN_SYSTEM Session Template
```typescript
const designSystemSessionTemplate = {
  focusAreas: [
    'design_tokens',
    'component_specs',
    'design_consistency',
    'accessibility_guidelines'
  ],
  
  trackedInteractions: [
    'design_reviews',
    'pattern_creation',
    'token_updates',
    'component_validation'
  ],
  
  keyMetrics: [
    'design_system_compliance',
    'component_reusability',
    'accessibility_score',
    'design_consistency_rate'
  ]
};
```

### COMPONENT_DEVELOPER Session Template
```typescript
const componentDeveloperSessionTemplate = {
  focusAreas: [
    'component_implementation',
    'typescript_usage',
    'testing_strategies',
    'performance_optimization'
  ],
  
  trackedInteractions: [
    'code_reviews',
    'pattern_application',
    'design_system_integration',
    'testing_collaboration'
  ],
  
  keyMetrics: [
    'code_quality',
    'test_coverage',
    'performance_scores',
    'accessibility_compliance'
  ]
};
```

## Session Lifecycle Management

### Session Initialization
```typescript
async function initializeSession(
  agentId: string,
  agentType: AgentType,
  initialTask?: TaskContext
): Promise<SessionMemory> {
  const template = getSessionTemplate(agentType);
  const relevantContext = await loadRelevantContext(agentType, initialTask);
  
  return {
    sessionId: generateSessionId(),
    agentId,
    agentType,
    startTime: new Date(),
    lastActivity: new Date(),
    status: 'active',
    
    currentTask: initialTask || null,
    previousTasks: [],
    relevantDecisions: relevantContext.adrs,
    
    importantContext: relevantContext.context,
    agentInteractions: [],
    learnings: [],
    
    metrics: {
      totalDuration: 0,
      activeTime: 0,
      pauseTime: 0,
      tasksCompleted: 0,
      tasksBlocked: 0,
      averageTaskDuration: 0,
      agentInteractions: 0,
      handoffCount: 0,
      collaborationSuccess: 0,
      contextHitRate: 0,
      relevantDecisionsFound: relevantContext.adrs.length,
      patternsUsed: 0,
      decisionConfidence: 0,
      outcomeQuality: 0,
      errorRate: 0
    }
  };
}
```

### Context Update Template
```typescript
async function updateSessionContext(
  sessionId: string,
  contextUpdate: ContextUpdate
): Promise<void> {
  const session = await loadSession(sessionId);
  
  // Update current task
  if (contextUpdate.taskUpdate) {
    session.currentTask = {
      ...session.currentTask,
      ...contextUpdate.taskUpdate,
      lastUpdated: new Date()
    };
  }
  
  // Add agent interactions
  if (contextUpdate.interaction) {
    session.agentInteractions.push({
      ...contextUpdate.interaction,
      timestamp: new Date()
    });
  }
  
  // Capture learnings
  if (contextUpdate.learning) {
    session.learnings.push({
      ...contextUpdate.learning,
      timestamp: new Date()
    });
  }
  
  // Update metrics
  session.metrics = calculateSessionMetrics(session);
  session.lastActivity = new Date();
  
  await saveSession(session);
}
```

### Session Completion Template
```typescript
async function completeSession(
  sessionId: string,
  finalOutcome: SessionOutcome
): Promise<void> {
  const session = await loadSession(sessionId);
  
  session.status = 'completed';
  session.metrics.totalDuration = Date.now() - session.startTime.getTime();
  
  // Process learnings for sharing
  const shareableLearnings = session.learnings.filter(l => l.shouldShare);
  if (shareableLearnings.length > 0) {
    await shareLearnings(shareableLearnings);
  }
  
  // Add patterns to library
  const newPatterns = session.learnings.filter(l => l.addToPatternLibrary);
  if (newPatterns.length > 0) {
    await addToPatternLibrary(newPatterns);
  }
  
  // Update collaboration metrics
  await updateCollaborationMetrics(session.agentInteractions);
  
  // Archive session
  await archiveSession(session, finalOutcome);
}
```

## Context Retrieval Templates

### Relevant Context Loading
```typescript
async function loadRelevantContext(
  agentType: AgentType,
  task?: TaskContext
): Promise<RelevantContext> {
  const queries = buildContextQueries(agentType, task);
  const context = await Promise.all([
    searchADRs(queries.adrs),
    findPatterns(queries.patterns),
    getRecentSessions(queries.sessions)
  ]);
  
  return {
    adrs: context[0],
    patterns: context[1],
    sessions: context[2],
    relevance: calculateRelevance(context)
  };
}

function buildContextQueries(
  agentType: AgentType,
  task?: TaskContext
): ContextQueries {
  const baseQuery = {
    agents: [agentType],
    confidence: { min: 0.7 }
  };
  
  if (task) {
    return {
      adrs: {
        ...baseQuery,
        tags: task.tags,
        types: ['architectural_decision'],
        limit: 10
      },
      patterns: {
        ...baseQuery,
        category: task.category,
        types: ['pattern'],
        limit: 15
      },
      sessions: {
        agents: [agentType],
        taskType: task.type,
        status: 'completed',
        limit: 5,
        sortBy: 'success',
        order: 'desc'
      }
    };
  }
  
  return baseQuery;
}
```

## Session Analytics Template

### Session Performance Analysis
```typescript
interface SessionAnalysis {
  sessionId: string;
  agentType: AgentType;
  performanceScores: {
    efficiency: number;
    quality: number;
    collaboration: number;
    learning: number;
  };
  
  keyInsights: {
    strengths: string[];
    improvements: string[];
    patterns: string[];
    recommendations: string[];
  };
  
  comparison: {
    vsAgentAverage: number;
    vsPreviousSessions: number;
    vsSystemAverage: number;
  };
}

async function analyzeSession(sessionId: string): Promise<SessionAnalysis> {
  const session = await loadSession(sessionId);
  const agentHistory = await getAgentSessionHistory(session.agentType);
  const systemAverages = await getSystemPerformanceAverages();
  
  return {
    sessionId: session.id,
    agentType: session.agentType,
    performanceScores: calculatePerformanceScores(session),
    keyInsights: generateInsights(session, agentHistory),
    comparison: generateComparison(session, agentHistory, systemAverages)
  };
}
```

## Usage Examples

### Starting a New Session
```typescript
// Component Developer starting a new task
const session = await initializeSession(
  'agent-comp-123',
  AgentType.COMPONENT_DEVELOPER,
  {
    taskId: 'task-456',
    type: 'component_development',
    description: 'Create new Button component with variants',
    tags: ['button', 'component', 'react']
  }
);

// Session will automatically load:
// - ADR-001 (TypeScript usage)
// - ADR-002 (Component architecture)
// - Compound component pattern
// - Previous successful component development sessions
```

### Recording Agent Collaboration
```typescript
await updateSessionContext(session.sessionId, {
  interaction: {
    fromAgent: AgentType.COMPONENT_DEVELOPER,
    toAgent: AgentType.ACCESSIBILITY,
    interactionType: 'consultation',
    purpose: 'Review Button component for accessibility',
    sharedContext: [
      {
        type: 'pattern',
        content: 'Compound component pattern implementation',
        relevance: 0.9,
        source: 'pattern-compound-component'
      }
    ],
    outcome: {
      success: true,
      duration: 3000,
      quality: 0.95,
      feedback: 'Excellent accessibility implementation',
      nextSteps: ['Add ARIA labels', 'Implement keyboard navigation']
    },
    relationshipStrength: 0.8,
    followUpRequired: false
  }
});
```

### Capturing Learnings
```typescript
await updateSessionContext(session.sessionId, {
  learning: {
    category: 'pattern',
    title: 'Compound components improve accessibility testing',
    description: 'Using compound component pattern made it easier to test accessibility',
    context: 'Button component development with Menu sub-components',
    applicableAgents: [AgentType.COMPONENT_DEVELOPER, AgentType.ACCESSIBILITY],
    applicableSituations: ['complex_ui_components', 'accessibility_testing'],
    confidence: 0.9,
    evidence: [
      'Faster accessibility review process',
      'Better keyboard navigation implementation',
      'Cleaner ARIA attribute management'
    ],
    validationNeeded: false,
    shouldShare: true,
    shareWithAgents: [AgentType.COMPONENT_DEVELOPER, AgentType.DESIGN_SYSTEM],
    addToPatternLibrary: true
  }
});
```

These session memory templates provide a comprehensive framework for capturing, organizing, and learning from agent interactions while maintaining valuable context across sessions.