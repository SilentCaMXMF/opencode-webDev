# Context Engineering API Examples

This document provides practical examples of how to integrate the Context Engineering System with your 11-agent Frontend Design Agent System.

## Agent Integration Examples

### 1. Design System Agent

```typescript
import { createContextSystem, AgentType } from '@frontend-agents/context-engineering';

const contextSystem = await createContextSystem();

// Design System Agent creating a design token decision
const designDecision = await contextSystem.createADR({
  title: 'CSS Custom Properties for Design Tokens',
  problem: 'Need to choose an approach for managing design tokens',
  alternatives: [
    'CSS Custom Properties',
    'Sass variables',
    'JavaScript object with CSS-in-JS',
    'Static JSON file'
  ],
  chosen: 'CSS Custom Properties',
  rationale: 'Native browser support, runtime theming, better performance',
  consequences: [
    'Better runtime theme switching',
    'Reduced bundle size',
    'Improved developer experience',
    'Limited IE11 support'
  ],
  agents: [AgentType.DESIGN_SYSTEM, AgentType.COMPONENT_DEVELOPER],
  tags: ['design-tokens', 'css', 'theming'],
  priority: 'high'
});

// Store color palette pattern
const colorPattern = await contextSystem.createPattern({
  title: 'Semantic Color System Pattern',
  description: 'Use semantic color names (primary, secondary, success, warning) instead of literal colors',
  category: 'component',
  complexity: 'simple',
  reusability: 'high',
  dependencies: ['CSS Custom Properties'],
  examples: ['Button variants using semantic colors', 'Alert system using status colors'],
  agents: [AgentType.DESIGN_SYSTEM],
  tags: ['colors', 'semantic', 'design-system']
});
```

### 2. Component Developer Agent

```typescript
// Component Developer storing a compound component pattern
const compoundPattern = await contextSystem.createPattern({
  title: 'Compound Component Pattern with React Context',
  description: 'Use React Context API to manage compound component state and provide flexible API',
  category: 'component',
  complexity: 'medium',
  reusability: 'high',
  dependencies: ['React Context', 'useContext hook'],
  examples: [
    'Menu with Menu.Item, Menu.Submenu components',
    'Accordion with Accordion.Item and Accordion.Panel',
    'Tabs with Tabs.List and Tabs.Panel'
  ],
  agents: [AgentType.COMPONENT_DEVELOPER],
  tags: ['react', 'context', 'compound-components']
});

// Record component development session
const componentSession = await contextSystem.storeSessionMemory({
  sessionTasks: [
    'Implement Button compound component',
    'Add accessibility attributes',
    'Write unit tests',
    'Create Storybook documentation'
  ],
  sessionOutcomes: [
    'Button component with variants (primary, secondary, ghost)',
    'Full keyboard navigation support',
    '95% test coverage achieved',
    'Interactive documentation published'
  ],
  agents: [AgentType.COMPONENT_DEVELOPER, AgentType.TESTING_QA, AgentType.ACCESSIBILITY],
  summary: 'Successfully implemented accessible Button component using compound pattern',
  tags: ['button', 'component', 'accessibility', 'testing']
});
```

### 3. Performance Optimizer Agent

```typescript
// Performance optimization decision
const performanceADR = await contextSystem.createADR({
  title: 'React.memo with Custom Comparison for Performance',
  problem: 'Child components re-rendering unnecessarily causing performance issues',
  alternatives: [
    'React.memo with default comparison',
    'React.memo with custom comparison function',
    'useMemo hook',
    'Component decomposition'
  ],
  chosen: 'React.memo with custom comparison function',
  rationale: 'Provides granular control over re-rendering while maintaining component structure',
  consequences: [
    'Reduced unnecessary re-renders',
    'Better performance in large lists',
    'Increased code complexity',
    'Need for careful comparison logic'
  ],
  agents: [AgentType.PERFORMANCE_OPTIMIZER, AgentType.COMPONENT_DEVELOPER],
  tags: ['performance', 'react', 'optimization'],
  priority: 'high'
});

// Performance optimization pattern
const perfPattern = await contextSystem.createPattern({
  title: 'Virtual List Pattern for Large Datasets',
  description: 'Implement windowing/virtualization for rendering large lists efficiently',
  category: 'performance',
  complexity: 'complex',
  reusability: 'high',
  dependencies: ['Intersection Observer API', 'react-window'],
  examples: [
    'Data table with 10,000+ rows',
    'Chat message list with infinite scroll',
    'Image gallery with lazy loading'
  ],
  agents: [AgentType.PERFORMANCE_OPTIMIZER],
  tags: ['virtualization', 'performance', 'lists', 'react-window']
});
```

### 4. Accessibility Agent

```typescript
// Accessibility standards decision
const accessibilityADR = await contextSystem.createADR({
  title: 'WAI-ARIA Authoring Practices 1.2 Compliance',
  problem: 'Need to establish accessibility standards for component library',
  alternatives: [
    'WAI-ARIA 1.1 practices',
    'WAI-ARIA 1.2 practices',
    'Custom accessibility approach',
    'Manual testing only'
  ],
  chosen: 'WAI-ARIA Authoring Practices 1.2',
  rationale: 'Latest standards with comprehensive patterns and better screen reader support',
  consequences: [
    'Better screen reader compatibility',
    'Improved keyboard navigation',
    'Comprehensive pattern documentation',
    'Requires ongoing updates'
  ],
  agents: [AgentType.ACCESSIBILITY, AgentType.DESIGN_SYSTEM],
  tags: ['accessibility', 'aria', 'wcag', 'screen-reader'],
  priority: 'critical'
});

// Record accessibility audit session
const accessibilitySession = await contextSystem.storeSessionMemory({
  sessionTasks: [
    'Audit Button component for accessibility',
    'Test with screen readers',
    'Keyboard navigation testing',
    'Color contrast verification'
  ],
  sessionOutcomes: [
    'All buttons now have proper ARIA labels',
    'Full keyboard navigation implemented',
    'Color contrast WCAG AA compliant',
    'Screen reader testing passed'
  ],
  agents: [AgentType.ACCESSIBILITY, AgentType.TESTING_QA],
  summary: 'Comprehensive accessibility audit completed for Button component',
  tags: ['accessibility', 'audit', 'screen-reader', 'wcag']
});
```

## Cross-Agent Collaboration Examples

### Agent Handoff Protocol

```typescript
// Design System -> Component Developer handoff
await contextSystem.addAgentInteraction(
  AgentType.DESIGN_SYSTEM,
  {
    action: 'Completed design specifications for Button component',
    outcome: 'Design tokens and component variants finalized',
    context: 'Provided 3 variants (primary, secondary, ghost) with all states',
    relatedEntries: ['design-token-decision', 'button-design-spec']
  }
);

// Component Developer receives context and starts work
const designContext = await contextSystem.getContextForAgent(
  AgentType.COMPONENT_DEVELOPER,
  'project_context'
);

// Component Developer responds with implementation progress
await contextSystem.addAgentInteraction(
  AgentType.COMPONENT_DEVELOPER,
  {
    action: 'Started Button component implementation',
    outcome: 'Base component structure created with variants',
    context: 'Using compound pattern, integrating design tokens',
    relatedEntries: ['design-token-decision', 'button-design-spec']
  }
);
```

### Multi-Agent Decision Making

```typescript
// Create collaborative ADR involving multiple agents
const multiAgentADR = await contextSystem.createADR({
  title: 'State Management Solution for Component Library',
  problem: 'Choose state management approach for complex components',
  alternatives: [
    'React Context + useReducer',
    'Redux Toolkit',
    'Zustand',
    'Jotai',
    'Custom hooks only'
  ],
  chosen: 'React Context + useReducer',
  rationale: 'Built into React, good TypeScript support, no additional dependencies',
  consequences: [
    'No external dependencies',
    'Predictable state updates',
    'Good devtools support',
    'Potential prop drilling in deep hierarchies'
  ],
  agents: [
    AgentType.COMPONENT_DEVELOPER,
    AgentType.PERFORMANCE_OPTIMIZER,
    AgentType.DESIGN_SYSTEM
  ],
  tags: ['state-management', 'react', 'context', 'useReducer'],
  priority: 'high'
});
```

## Search and Discovery Examples

### Finding Relevant Patterns

```typescript
// Search for React component patterns
const reactPatterns = await contextSystem.search({
  query: 'react component composition',
  types: ['pattern'],
  tags: ['react', 'component'],
  limit: 10
});

// Find all ADRs related to performance
const performanceDecisions = await contextSystem.search({
  types: ['architectural_decision'],
  tags: ['performance'],
  limit: 20
});

// Get recent accessibility decisions
const recentAccessibility = await contextSystem.search({
  types: ['architectural_decision'],
  agents: [AgentType.ACCESSIBILITY],
  dateRange: {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
  },
  limit: 15
});
```

### Agent Collaboration Analysis

```typescript
// Discover agent collaboration patterns
const collaborations = await contextSystem.getAgentCollaborationPatterns();

console.log('Top Collaborations:');
collaborations.forEach(collab => {
  console.log(`${collab.agents.join(' + ')}: ${collab.frequency} collaborations`);
});

// Get specific agent's activity
const componentDevActivity = await contextSystem.getAgentActivity(
  AgentType.COMPONENT_DEVELOPER,
  30 // Last 30 days
);

console.log('Component Developer Activity:');
console.log(`Total interactions: ${componentDevActivity.totalInteractions}`);
console.log('By type:', componentDevActivity.contextsByType);
console.log('Top tags:', componentDevActivity.topTags.slice(0, 5));
```

### Pattern Discovery

```typescript
// Discover patterns in the knowledge base
const patterns = await contextSystem.discoverPatterns();

patterns.forEach(pattern => {
  console.log(`Pattern: ${pattern.pattern}`);
  console.log(`Confidence: ${(pattern.confidence * 100).toFixed(1)}%`);
  console.log(`Found in ${pattern.entries.length} entries`);
  console.log('---');
});
```

## Advanced Usage Examples

### Context Relationships

```typescript
// Create related entries and establish relationships
const baseADR = await contextSystem.createADR({
  title: 'TypeScript for Component Library',
  problem: 'Choose language for component library',
  alternatives: ['TypeScript', 'JavaScript with JSDoc', 'Flow'],
  chosen: 'TypeScript',
  rationale: 'Better type safety, improved developer experience, ecosystem support',
  consequences: ['Better IDE support', 'Reduced runtime errors', 'Learning curve'],
  agents: [AgentType.DESIGN_SYSTEM, AgentType.COMPONENT_DEVELOPER],
  tags: ['typescript', 'types', 'language'],
  priority: 'critical'
});

// Create implementation pattern
const tsPattern = await contextSystem.createPattern({
  title: 'Generic Component Pattern with TypeScript',
  description: 'Use generics for flexible, type-safe component APIs',
  category: 'component',
  complexity: 'medium',
  reusability: 'high',
  agents: [AgentType.COMPONENT_DEVELOPER],
  tags: ['typescript', 'generics', 'component']
});

// Link the pattern to the decision
await contextSystem.addRelationship(
  tsPattern.id,
  baseADR.id,
  'builds_on',
  0.9
);
```

### Session Context Management

```typescript
// Set session context for ongoing work
contextSystem.setSessionContext('current-component', 'Button');
contextSystem.setSessionContext('current-priority', 'high');
contextSystem.setSessionContext('collaborating-agents', [
  AgentType.DESIGN_SYSTEM,
  AgentType.COMPONENT_DEVELOPER,
  AgentType.ACCESSIBILITY
]);

// Use session context in agent decisions
const currentComponent = contextSystem.getSessionContext('current-component');
const collaboratingAgents = contextSystem.getSessionContext('collaborating-agents');

// Find relevant context based on session
const relevantContext = await contextSystem.search({
  query: currentComponent,
  agents: collaboratingAgents,
  limit: 10
});
```

### Quality Assurance Integration

```typescript
// Testing Agent records test results
await contextSystem.addAgentInteraction(
  AgentType.TESTING_QA,
  {
    action: 'Comprehensive testing of Button component',
    outcome: 'All tests passing, 95% coverage achieved',
    context: 'Unit tests, integration tests, accessibility tests completed',
    relatedEntries: ['button-component', 'button-design-spec']
  }
);

// Security Agent records security audit
await contextSystem.addAgentInteraction(
  AgentType.SECURITY,
  {
    action: 'Security audit of component library',
    outcome: 'No critical vulnerabilities found',
    context: 'Dependency scan, XSS prevention reviewed',
    relatedEntries: ['typescript-decision']
  }
);
```

## Monitoring and Analytics

```typescript
// Get system statistics
const stats = await contextSystem.getStatistics();
console.log('Context Engineering Stats:');
console.log(`Total entries: ${stats.totalEntries}`);
console.log('Entries by type:', stats.entriesByType);
console.log(`Average confidence: ${(stats.averageConfidence * 100).toFixed(1)}%`);

// Monitor knowledge gaps
const gaps = await contextSystem.discoverPatterns();
const lowConfidenceEntries = await contextSystem.search({
  limit: 50
});

const lowConfidence = lowConfidenceEntries.entries.filter(
  entry => entry.metadata.confidence < 0.5
);

if (lowConfidence.length > 5) {
  console.log('Warning: High number of low-confidence entries detected');
  console.log('Consider reviewing and updating these entries');
}
```

These examples demonstrate how the Context Engineering System can be deeply integrated into your agent workflows, providing persistent memory, enabling collaboration, and facilitating knowledge discovery across your Frontend Design Agent System.