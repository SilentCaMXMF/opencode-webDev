import { v4 as uuidv4 } from 'uuid';
import { ContextSystem } from '../../../context-engineering/dist/core/context-system';
import { 
  BuildCommand, 
  CommandResult,
  WorkflowStage,
  AgentType,
  Deviation,
  Evidence
} from '@types/workflow';

export class BuildCommandHandler {
  private contextSystem: ContextSystem;
  private deviationTracker: Map<string, Deviation[]> = new Map();

  constructor(contextSystem: ContextSystem) {
    this.contextSystem = contextSystem;
  }

  async execute(command: BuildCommand): Promise<CommandResult> {
    const startTime = Date.now();
    const deviations: Deviation[] = [];
    const evidence: Evidence[] = [];
    let checkpointTimeout: NodeJS.Timeout | null = null;

    try {
      // Start deviation tracking if enabled
      if (command.parameters.trackDeviations) {
        this.startDeviationTracking(command.id, command.parameters.checkpointInterval);
      }

      // Retrieve and analyze specifications
      const specifications = await this.getSpecifications(command.parameters.specifications);
      
      // Build artifacts
      const buildResults = await this.buildArtifacts(
        command.parameters.artifacts,
        specifications
      );
      
      // Track build progress and deviations
      const progress = await this.trackBuildProgress(buildResults, command);
      
      // Generate build evidence
      evidence.push(...await this.generateBuildEvidence(buildResults, progress, command));

      // Collect deviations during build
      const buildDeviations = await this.detectBuildDeviations(
        buildResults,
        specifications,
        command
      );
      deviations.push(...buildDeviations);

      // Clear checkpoint timer
      if (checkpointTimeout) {
        clearInterval(checkpointTimeout);
      }

      const executionTime = Date.now() - startTime;

      return {
        commandId: command.id,
        success: true,
        stage: 'build',
        agent: command.agent,
        timestamp: new Date(),
        executionTime,
        result: {
          specifications,
          buildResults,
          progress,
          artifacts: buildResults.map(result => result.artifact),
          summary: await this.generateBuildSummary(buildResults, progress)
        },
        deviations,
        evidence,
        nextStage: 'validate',
        artifacts: buildResults.map(result => result.artifact)
      };

    } catch (error) {
      // Clear checkpoint timer on error
      if (checkpointTimeout) {
        clearInterval(checkpointTimeout);
      }

      const executionTime = Date.now() - startTime;
      
      return {
        commandId: command.id,
        success: false,
        stage: 'build',
        agent: command.agent,
        timestamp: new Date(),
        executionTime,
        result: null,
        deviations,
        evidence,
        message: `Build command failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async getSpecifications(specificationRefs: string[]): Promise<any[]> {
    const specifications: any[] = [];

    for (const ref of specificationRefs) {
      try {
        // Try to get from context system first
        const searchResult = await this.contextSystem.search({
          query: ref,
          types: ['project_context', 'architectural_decision'],
          limit: 10
        });

        if (searchResult.entries.length > 0) {
          const entry = searchResult.entries[0];
          specifications.push({
            ref,
            content: JSON.parse(entry.content),
            source: 'context_system',
            id: entry.id
          });
        } else {
          // Create a minimal specification if not found
          specifications.push({
            ref,
            content: {
              requirements: [ref],
              constraints: [],
              deliverables: [ref]
            },
            source: 'generated',
            id: uuidv4()
          });
        }
      } catch (error) {
        // Handle case where specification cannot be parsed
        specifications.push({
          ref,
          content: {
            requirements: [ref],
            constraints: [],
            deliverables: [ref]
          },
          source: 'fallback',
          id: uuidv4()
        });
      }
    }

    return specifications;
  }

  private async buildArtifacts(artifacts: any[], specifications: any[]): Promise<any[]> {
    const buildResults: any[] = [];

    for (const artifact of artifacts) {
      const result = await this.buildSingleArtifact(artifact, specifications);
      buildResults.push(result);
    }

    return buildResults;
  }

  private async buildSingleArtifact(artifact: any, specifications: any[]): Promise<any> {
    const startTime = Date.now();
    
    try {
      let buildResult: any;

      switch (artifact.type) {
        case 'component':
          buildResult = await this.buildComponent(artifact, specifications);
          break;
        case 'module':
          buildResult = await this.buildModule(artifact, specifications);
          break;
        case 'page':
          buildResult = await this.buildPage(artifact, specifications);
          break;
        case 'service':
          buildResult = await this.buildService(artifact, specifications);
          break;
        case 'utility':
          buildResult = await this.buildUtility(artifact, specifications);
          break;
        default:
          throw new Error(`Unknown artifact type: ${artifact.type}`);
      }

      const executionTime = Date.now() - startTime;

      return {
        artifact,
        success: true,
        executionTime,
        result: buildResult,
        generatedFiles: buildResult.files || [],
        dependencies: buildResult.dependencies || [],
        metadata: buildResult.metadata || {}
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;

      return {
        artifact,
        success: false,
        executionTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        generatedFiles: [],
        dependencies: [],
        metadata: {}
      };
    }
  }

  private async buildComponent(artifact: any, specifications: any[]): Promise<any> {
    const componentName = artifact.name;
    const componentPath = artifact.path;

    // Generate React component structure
    const componentCode = this.generateComponentCode(componentName, artifact);
    const componentStyles = this.generateComponentStyles(componentName, artifact);
    const componentTests = this.generateComponentTests(componentName, artifact);
    const componentStories = this.generateComponentStories(componentName, artifact);

    return {
      files: [
        {
          path: `${componentPath}/${componentName}.tsx`,
          content: componentCode,
          type: 'component'
        },
        {
          path: `${componentPath}/${componentName}.module.css`,
          content: componentStyles,
          type: 'styles'
        },
        {
          path: `${componentPath}/${componentName}.test.tsx`,
          content: componentTests,
          type: 'test'
        },
        {
          path: `${componentPath}/${componentName}.stories.tsx`,
          content: componentStories,
          type: 'storybook'
        }
      ],
      dependencies: this.determineComponentDependencies(artifact),
      metadata: {
        type: 'react_component',
        framework: 'React',
        testable: true,
        storybook: true
      }
    };
  }

  private async buildModule(artifact: any, specifications: any[]): Promise<any> {
    const moduleName = artifact.name;
    const modulePath = artifact.path;

    // Generate module structure
    const moduleCode = this.generateModuleCode(moduleName, artifact);
    const moduleTypes = this.generateModuleTypes(moduleName, artifact);
    const moduleTests = this.generateModuleTests(moduleName, artifact);
    const moduleIndex = this.generateModuleIndex(moduleName);

    return {
      files: [
        {
          path: `${modulePath}/${moduleName}.ts`,
          content: moduleCode,
          type: 'module'
        },
        {
          path: `${modulePath}/${moduleName}.types.ts`,
          content: moduleTypes,
          type: 'types'
        },
        {
          path: `${modulePath}/${moduleName}.test.ts`,
          content: moduleTests,
          type: 'test'
        },
        {
          path: `${modulePath}/index.ts`,
          content: moduleIndex,
          type: 'index'
        }
      ],
      dependencies: this.determineModuleDependencies(artifact),
      metadata: {
        type: 'typescript_module',
        exportable: true,
        testable: true
      }
    };
  }

  private async buildPage(artifact: any, specifications: any[]): Promise<any> {
    const pageName = artifact.name;
    const pagePath = artifact.path;

    // Generate page structure
    const pageCode = this.generatePageCode(pageName, artifact);
    const pageStyles = this.generatePageStyles(pageName, artifact);
    const pageTests = this.generatePageTests(pageName, artifact);
    const pageMetadata = this.generatePageMetadata(pageName, artifact);

    return {
      files: [
        {
          path: `${pagePath}/${pageName}.tsx`,
          content: pageCode,
          type: 'page'
        },
        {
          path: `${pagePath}/${pageName}.module.css`,
          content: pageStyles,
          type: 'styles'
        },
        {
          path: `${pagePath}/${pageName}.test.tsx`,
          content: pageTests,
          type: 'test'
        },
        {
          path: `${pagePath}/metadata.json`,
          content: pageMetadata,
          type: 'metadata'
        }
      ],
      dependencies: this.determinePageDependencies(artifact),
      metadata: {
        type: 'react_page',
        routeable: true,
        ssr: true,
        testable: true
      }
    };
  }

  private async buildService(artifact: any, specifications: any[]): Promise<any> {
    const serviceName = artifact.name;
    const servicePath = artifact.path;

    // Generate service structure
    const serviceCode = this.generateServiceCode(serviceName, artifact);
    const serviceTypes = this.generateServiceTypes(serviceName, artifact);
    const serviceTests = this.generateServiceTests(serviceName, artifact);
    const serviceConfig = this.generateServiceConfig(serviceName, artifact);

    return {
      files: [
        {
          path: `${servicePath}/${serviceName}.ts`,
          content: serviceCode,
          type: 'service'
        },
        {
          path: `${servicePath}/${serviceName}.types.ts`,
          content: serviceTypes,
          type: 'types'
        },
        {
          path: `${servicePath}/${serviceName}.test.ts`,
          content: serviceTests,
          type: 'test'
        },
        {
          path: `${servicePath}/${serviceName}.config.ts`,
          content: serviceConfig,
          type: 'config'
        }
      ],
      dependencies: this.determineServiceDependencies(artifact),
      metadata: {
        type: 'typescript_service',
        testable: true,
        configurable: true
      }
    };
  }

  private async buildUtility(artifact: any, specifications: any[]): Promise<any> {
    const utilityName = artifact.name;
    const utilityPath = artifact.path;

    // Generate utility structure
    const utilityCode = this.generateUtilityCode(utilityName, artifact);
    const utilityTests = this.generateUtilityTests(utilityName, artifact);
    const utilityDocs = this.generateUtilityDocs(utilityName, artifact);

    return {
      files: [
        {
          path: `${utilityPath}/${utilityName}.ts`,
          content: utilityCode,
          type: 'utility'
        },
        {
          path: `${utilityPath}/${utilityName}.test.ts`,
          content: utilityTests,
          type: 'test'
        },
        {
          path: `${utilityPath}/${utilityName}.md`,
          content: utilityDocs,
          type: 'documentation'
        }
      ],
      dependencies: this.determineUtilityDependencies(artifact),
      metadata: {
        type: 'typescript_utility',
        reusable: true,
        documented: true,
        testable: true
      }
    };
  }

  // Code generation methods
  private generateComponentCode(name: string, artifact: any): string {
    return `import React from 'react';
import styles from './${name}.module.css';

export interface ${name}Props {
  // Props will be generated based on artifact metadata
}

export const ${name}: React.FC<${name}Props> = (props) => {
  return (
    <div className={styles.container}>
      <h1>${name} Component</h1>
      {/* Component implementation */}
    </div>
  );
};

export default ${name};
`;
  }

  private generateComponentStyles(name: string, artifact: any): string {
    return `.container {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
`;
  }

  private generateComponentTests(name: string, artifact: any): string {
    import { render, screen } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders without crashing', () => {
    render(<${name} />);
    expect(screen.getByText('${name} Component')).toBeInTheDocument();
  });

  it('applies correct styles', () => {
    const { container } = render(<${name} />);
    expect(container.firstChild).toHaveClass('container');
  });
});
`;
  }

  private generateComponentStories(name: string, artifact: any): string {
    import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta: Meta<typeof ${name}> = {
  title: 'Components/${name}',
  component: ${name},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
`;
  }

  private generateModuleCode(name: string, artifact: any): string {
    return `/**
 * ${name} module implementation
 * Generated by Frontend Design Agent System
 */

export class ${name} {
  private config: any;

  constructor(config: any = {}) {
    this.config = config;
  }

  async execute(params: any): Promise<any> {
    // Module implementation
    return { success: true, data: params };
  }
}

export default ${name};
`;
  }

  private generateModuleTypes(name: string, artifact: any): string {
    return `export interface ${name}Config {
  // Configuration interface
}

export interface ${name}Params {
  // Parameters interface
}

export interface ${name}Result {
  // Result interface
}
`;
  }

  private generateModuleTests(name: string, artifact: any): string {
    import { ${name} } from './${name}';

describe('${name}', () => {
  it('should initialize with default config', () => {
    const instance = new ${name}();
    expect(instance).toBeDefined();
  });

  it('should execute successfully', async () => {
    const instance = new ${name}();
    const result = await instance.execute({});
    expect(result.success).toBe(true);
  });
});
`;
  }

  private generateModuleIndex(name: string): string {
    export { ${name} } from './${name}';
export type { ${name}Config, ${name}Params, ${name}Result } from './${name}Types';
export default ${name};
`;
  }

  private generatePageCode(name: string, artifact: any): string {
    return `import React from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import styles from './${name}.module.css';
import type { ${name}PageProps } from './${name}.types';

export const ${name}Page: React.FC<${name}PageProps> = (props) => {
  return (
    <div className={styles.page}>
      <h1>${name} Page</h1>
      {/* Page implementation */}
    </div>
  );
};

export default ${name}Page;
`;
  }

  private generatePageStyles(name: string, artifact: any): string {
    return `.page {
  min-height: 100vh;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
`;
  }

  private generatePageTests(name: string, artifact: any): string {
    import { render, screen } from '@testing-library/react';
import { ${name}Page } from './${name}';

describe('${name}Page', () => {
  it('renders without crashing', () => {
    render(<${name}Page />);
    expect(screen.getByText('${name} Page')).toBeInTheDocument();
  });
});
`;
  }

  private generatePageMetadata(name: string, artifact: any): string {
  {
  "title": "${name}",
  "description": "Generated page for ${name}",
  "route": "/${name.toLowerCase()}",
  "layout": "default"
}
`;
  }

  private generateServiceCode(name: string, artifact: any): string {
    return `/**
 * ${name} service implementation
 * Generated by Frontend Design Agent System
 */

import { ${name}Config, ${name}Request, ${name}Response } from './${name}.types';

export class ${name}Service {
  private config: ${name}Config;

  constructor(config: ${name}Config) {
    this.config = config;
  }

  async execute(request: ${name}Request): Promise<${name}Response> {
    try {
      // Service implementation
      return {
        success: true,
        data: request,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default ${name}Service;
`;
  }

  private generateServiceTypes(name: string, artifact: any): string {
    export interface ${name}Config {
  apiEndpoint?: string;
  timeout?: number;
  retries?: number;
}

export interface ${name}Request {
  // Request interface
  data?: any;
}

export interface ${name}Response {
  success: boolean;
  data?: any;
  error?: string;
  timestamp?: string;
}
`;
  }

  private generateServiceTests(name: string, artifact: any): string {
    import { ${name}Service } from './${name}';

describe('${name}Service', () => {
  it('should initialize with config', () => {
    const service = new ${name}Service({ apiEndpoint: 'test' });
    expect(service).toBeDefined();
  });

  it('should execute successfully', async () => {
    const service = new ${name}Service({});
    const result = await service.execute({});
    expect(result.success).toBe(true);
  });
});
`;
  }

  private generateServiceConfig(name: string, artifact: any): string {
    export const default${name}Config = {
  apiEndpoint: process.env.NEXT_PUBLIC_API_ENDPOINT || '/api/${name.toLowerCase()}',
  timeout: 10000,
  retries: 3
};

export const development${name}Config = {
  ...default${name}Config,
  timeout: 5000
};

export const production${name}Config = {
  ...default${name}Config,
  retries: 5
};
`;
  }

  private generateUtilityCode(name: string, artifact: any): string {
    return `/**
 * ${name} utility implementation
 * Generated by Frontend Design Agent System
 */

/**
 * Main utility function
 */
export function ${name.toLowerCase()}(input: any): any {
  // Utility implementation
  return input;
}

/**
 * Additional utility functions
 */
export const ${name}Helpers = {
  format: (data: any) => JSON.stringify(data, null, 2),
  validate: (data: any) => data !== null && data !== undefined
};

export default ${name.toLowerCase()};
`;
  }

  private generateUtilityTests(name: string, artifact: any): string {
    import { ${name.toLowerCase()}, ${name}Helpers } from './${name}';

describe('${name}', () => {
  it('should handle input correctly', () => {
    const result = ${name.toLowerCase()}('test');
    expect(result).toBe('test');
  });

  it('should format data correctly', () => {
    const data = { test: true };
    const formatted = ${name}Helpers.format(data);
    expect(formatted).toBe(JSON.stringify(data, null, 2));
  });

  it('should validate data correctly', () => {
    expect(${name}Helpers.validate({})).toBe(true);
    expect(${name}Helpers.validate(null)).toBe(false);
  });
});
`;
  }

  private generateUtilityDocs(name: string, artifact: any): string {
# ${name}

## Description

${name} utility provides helpful functions for data manipulation.

## Functions

### \`${name.toLowerCase()}()\`

Main utility function that processes input data.

**Parameters:**
- \`input\` (any): Input data to process

**Returns:**
- (any): Processed data

**Example:**
\`\`\`typescript
import { ${name.toLowerCase()} } from './${name}';

const result = ${name.toLowerCase()}('hello');
console.log(result); // 'hello'
\`\`\`

### \`${name}Helpers.format()\`

Formats data as pretty-printed JSON.

**Parameters:**
- \`data\` (any): Data to format

**Returns:**
- (string): Formatted JSON string

### \`${name}Helpers.validate()\`

Validates that data is not null or undefined.

**Parameters:**
- \`data\` (any): Data to validate

**Returns:**
- (boolean): True if valid, false otherwise
`;
  }

  // Dependency determination methods
  private determineComponentDependencies(artifact: any): string[] {
    const deps = ['react'];
    
    if (artifact.metadata?.usesRouting) deps.push('next/router');
    if (artifact.metadata?.usesForms) deps.push('react-hook-form');
    if (artifact.metadata?.usesStyling) deps.push('@emotion/react');
    
    return deps;
  }

  private determineModuleDependencies(artifact: any): string[] {
    const deps: string[] = [];
    
    if (artifact.metadata?.usesHttp) deps.push('axios');
    if (artifact.metadata?.usesState) deps.push('zustand');
    if (artifact.metadata?.usesUtils) deps.push('lodash');
    
    return deps;
  }

  private determinePageDependencies(artifact: any): string[] {
    const deps = ['react', 'next'];
    
    if (artifact.metadata?.usesLayout) deps.push('@/components/Layout');
    if (artifact.metadata?.usesSEO) deps.push('next-seo');
    
    return deps;
  }

  private determineServiceDependencies(artifact: any): string[] {
    const deps: string[] = [];
    
    if (artifact.metadata?.usesHttp) deps.push('axios', 'axios-retry');
    if (artifact.metadata?.usesCache) deps.push('memory-cache');
    if (artifact.metadata?.usesValidation) deps.push('zod');
    
    return deps;
  }

  private determineUtilityDependencies(artifact: any): string[] {
    const deps: string[] = [];
    
    if (artifact.metadata?.usesDate) deps.push('date-fns');
    if (artifact.metadata?.usesString) deps.push('lodash/string');
    if (artifact.metadata?.usesMath) deps.push('lodash/math');
    
    return deps;
  }

  private async trackBuildProgress(buildResults: any[], command: BuildCommand): Promise<any> {
    const progress = {
      total: command.parameters.artifacts.length,
      completed: buildResults.filter(r => r.success).length,
      failed: buildResults.filter(r => !r.success).length,
      totalFiles: buildResults.reduce((sum, r) => sum + (r.generatedFiles?.length || 0), 0),
      averageBuildTime: buildResults.reduce((sum, r) => sum + r.executionTime, 0) / buildResults.length
    };

    return progress;
  }

  private async generateBuildEvidence(buildResults: any[], progress: any, command: BuildCommand): Promise<Evidence[]> {
    const evidence: Evidence[] = [];

    // Build completion evidence
    evidence.push({
      id: uuidv4(),
      type: 'automated_check',
      stage: 'build',
      agent: command.agent,
      data: {
        totalArtifacts: progress.total,
        completedArtifacts: progress.completed,
        failedArtifacts: progress.failed,
        successRate: progress.completed / progress.total,
        totalFilesGenerated: progress.totalFiles,
        averageBuildTime: progress.averageBuildTime
      },
      timestamp: new Date(),
      confidence: 0.9
    });

    // Code quality evidence (basic checks)
    evidence.push({
      id: uuidv4(),
      type: 'code_review',
      stage: 'build',
      agent: command.agent,
      data: {
        generatedCodeLines: buildResults.reduce((sum, r) => 
          sum + r.generatedFiles.reduce((fileSum: number, file: any) => 
            fileSum + (file.content?.split('\n').length || 0), 0), 0),
        testFilesGenerated: buildResults.reduce((sum, r) => 
          sum + r.generatedFiles.filter((f: any) => f.type === 'test').length, 0),
        documentationFiles: buildResults.reduce((sum, r) => 
          sum + r.generatedFiles.filter((f: any) => f.type === 'documentation').length, 0)
      },
      timestamp: new Date(),
      confidence: 0.8
    });

    return evidence;
  }

  private async detectBuildDeviations(
    buildResults: any[],
    specifications: any[],
    command: BuildCommand
  ): Promise<Deviation[]> {
    const deviations: Deviation[] = [];

    // Check for failed builds
    const failedArtifacts = buildResults.filter(r => !r.success);
    if (failedArtifacts.length > 0) {
      deviations.push({
        id: uuidv4(),
        timestamp: new Date(),
        stage: 'build',
        agent: command.agent,
        expected: 'All artifacts build successfully',
        actual: `${failedArtifacts.length} artifacts failed to build`,
        severity: 'major',
        justification: 'Failed builds indicate specification or implementation issues'
      });
    }

    // Check for missing dependencies
    const missingDeps = new Set<string>();
    for (const result of buildResults) {
      for (const dep of result.dependencies) {
        try {
          // Try to resolve dependency (simplified check)
          require.resolve(dep);
        } catch {
          missingDeps.add(dep);
        }
      }
    }

    if (missingDeps.size > 0) {
      deviations.push({
        id: uuidv4(),
        timestamp: new Date(),
        stage: 'build',
        agent: command.agent,
        expected: 'All dependencies available',
        actual: `Missing dependencies: ${Array.from(missingDeps).join(', ')}`,
        severity: 'minor',
        justification: 'Missing dependencies will cause runtime issues'
      });
    }

    return deviations;
  }

  private startDeviationTracking(commandId: string, interval: number): void {
    this.deviationTracker.set(commandId, []);
    
    const timer = setInterval(() => {
      // Simulate deviation checkpoint
      // In a real implementation, this would check actual build status
    }, interval);
  }

  private async generateBuildSummary(buildResults: any[], progress: any): Promise<string> {
    const summary = [];
    
    summary.push(`Built ${progress.completed}/${progress.total} artifacts successfully`);
    summary.push(`Generated ${progress.totalFiles} files`);
    
    if (progress.failed > 0) {
      summary.push(`${progress.failed} artifacts failed to build`);
    }
    
    const types = [...new Set(buildResults.map(r => r.artifact.type))];
    summary.push(`Artifact types: ${types.join(', ')}`);

    return summary.join('. ');
  }
}