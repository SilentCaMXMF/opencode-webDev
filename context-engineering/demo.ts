import { createContextSystem } from '../src/index';
import { AgentType } from '../src/types';

// Create AgentType constants for runtime use
const AgentTypes = {
  ORCHESTRATOR: 'ORCHESTRATOR' as const,
  DESIGN_SYSTEM: 'DESIGN_SYSTEM' as const,
  COMPONENT_DEVELOPER: 'COMPONENT_DEVELOPER' as const,
  PERFORMANCE_OPTIMIZER: 'PERFORMANCE_OPTIMIZER' as const,
  ACCESSIBILITY: 'ACCESSIBILITY' as const,
  CROSS_PLATFORM: 'CROSS_PLATFORM' as const,
  TESTING_QA: 'TESTING_QA' as const,
  SECURITY: 'SECURITY' as const,
  ANIMATION: 'ANIMATION' as const,
  I18N: 'I18N' as const,
  UX_RESEARCH: 'UX_RESEARCH' as const
};

async function demonstrateContextSystem() {
  console.log('🚀 Initializing Context Engineering System...');
  
  // Initialize the system with in-memory database for demo
  const contextSystem = await createContextSystem(':memory:');
  
  console.log('📝 Creating Architectural Decision Record...');
  
  // Create an ADR
  const adr = await contextSystem.createADR({
    title: 'Use TypeScript for Component Library',
    problem: 'Need to choose between TypeScript and JavaScript for component library',
    alternatives: [
      'TypeScript with strict mode',
      'TypeScript with loose mode',
      'JavaScript with JSDoc',
      'Plain JavaScript'
    ],
    chosen: 'TypeScript with strict mode',
    rationale: 'TypeScript provides better type safety, IDE support, and developer experience',
    consequences: [
      'Better type safety and catch errors at compile time',
      'Improved IDE support with autocomplete',
      'Slightly longer build times',
      'Learning curve for team members'
    ],
    agents: [AgentTypes.DESIGN_SYSTEM, AgentTypes.COMPONENT_DEVELOPER],
    tags: ['typescript', 'component-library', 'architecture'],
    priority: 'high'
  });
  
  console.log(`✅ Created ADR: ${adr.title}`);
  
  console.log('🎨 Creating Reusable Pattern...');
  
  // Create a pattern
  const pattern = await contextSystem.createPattern({
    title: 'Compound Component Pattern',
    description: 'Use compound components for flexible API design with React Context',
    category: 'component',
    complexity: 'medium',
    reusability: 'high',
    dependencies: ['React Context API', 'useContext hook'],
    examples: [
      'Menu component with Menu.Item and Menu.Submenu',
      'Tabs component with Tabs.List and Tabs.Panel',
      'Accordion with Accordion.Item and Accordion.Content'
    ],
    agents: [AgentTypes.COMPONENT_DEVELOPER],
    tags: ['react', 'components', 'pattern', 'composition']
  });
  
  console.log(`✅ Created Pattern: ${pattern.title}`);
  
  console.log('🔍 Searching for context...');
  
  // Search for React-related context
  const searchResults = await contextSystem.search({
    query: 'React',
    limit: 10
  });
  
  console.log(`📊 Found ${searchResults.entries.length} results matching 'React':`);
  searchResults.entries.forEach(entry => {
    console.log(`  - ${entry.title} (${entry.type})`);
  });
  
  console.log('🤝 Recording agent interaction...');
  
  // Record an agent interaction
  const interaction = await contextSystem.addAgentInteraction(
    AgentTypes.COMPONENT_DEVELOPER,
    {
      action: 'Implemented Button component using compound pattern',
      outcome: 'Component created with full accessibility support',
      context: 'Used React ARIA attributes and semantic HTML',
      relatedEntries: [pattern.id]
    }
  );
  
  console.log(`✅ Recorded interaction: ${interaction.title}`);
  
  console.log('📈 Getting agent activity statistics...');
  
  // Get activity for Component Developer
  const activity = await contextSystem.getAgentActivity(AgentTypes.COMPONENT_DEVELOPER);
  
  console.log(`📊 Component Developer Activity:`);
  console.log(`  - Total interactions: ${activity.totalInteractions}`);
  console.log(`  - Average confidence: ${(activity.averageConfidence * 100).toFixed(1)}%`);
  console.log(`  - Top tags: ${activity.topTags.map(t => t.tag).slice(0, 3).join(', ')}`);
  
  console.log('🔗 Discovering collaboration patterns...');
  
  // Discover patterns
  const patterns = await contextSystem.discoverPatterns(5);
  
  console.log(`🧠 Discovered ${patterns.length} patterns:`);
  patterns.forEach((pattern, index) => {
    console.log(`  ${index + 1}. ${pattern.pattern} (${(pattern.confidence * 100).toFixed(1)}% confidence)`);
  });
  
  console.log('📊 System Statistics:');
  
  // Get overall statistics
  const stats = await contextSystem.getStatistics();
  
  console.log(`  - Total entries: ${stats.totalEntries}`);
  console.log(`  - Average confidence: ${(stats.averageConfidence * 100).toFixed(1)}%`);
  console.log(`  - Entries by type:`);
  Object.entries(stats.entriesByType).forEach(([type, count]) => {
    console.log(`    * ${type}: ${count}`);
  });
  
  console.log('🎉 Context Engineering System demo completed successfully!');
  
  // Clean up
  await contextSystem.close();
}

// Run the demo
demonstrateContextSystem().catch(console.error);