# Context Migration Scripts

This directory contains migration scripts for maintaining and updating the context engineering system.

## Migration Script Template

```typescript
// migration-template.ts
import { ContextSystem } from '../src/context-system';
import { Logger } from '../src/utils/logger';

interface MigrationConfig {
  version: string;
  description: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
  validate: () => Promise<boolean>;
}

export const createMigration = (config: MigrationConfig): MigrationConfig => {
  return config;
};

// Migration execution helper
export const runMigration = async (migration: MigrationConfig): Promise<void> => {
  const logger = new Logger('Migration');
  
  try {
    logger.info(`Starting migration: ${migration.version} - ${migration.description}`);
    
    // Validate current state
    const isValid = await migration.validate();
    if (!isValid) {
      throw new Error('Migration validation failed');
    }
    
    // Run migration
    await migration.up();
    
    logger.info(`Migration completed successfully: ${migration.version}`);
  } catch (error) {
    logger.error(`Migration failed: ${migration.version}`, error);
    
    // Attempt rollback
    try {
      await migration.down();
      logger.info('Migration rolled back successfully');
    } catch (rollbackError) {
      logger.error('Rollback failed', rollbackError);
    }
    
    throw error;
  }
};
```

## Current Migrations

### Migration 001: Initialize Context System
```typescript
// migrations/001-initialize-context-system.ts
import { createMigration } from '../utils/migration-template';
import { ContextSystem } from '../src/context-system';
import { initialADRs } from '../data/initial-adrs';
import { initialPatterns } from '../data/initial-patterns';

export const migration001 = createMigration({
  version: '001',
  description: 'Initialize context system with initial ADRs and patterns',
  
  async up() {
    const contextSystem = new ContextSystem();
    
    // Create initial ADRs
    for (const adr of initialADRs) {
      await contextSystem.createADR(adr);
    }
    
    // Create initial patterns
    for (const pattern of initialPatterns) {
      await contextSystem.createPattern(pattern);
    }
    
    // Set up initial agent context
    await contextSystem.initializeAgentContext();
  },
  
  async down() {
    const contextSystem = new ContextSystem();
    await contextSystem.clearDatabase();
  },
  
  async validate() {
    // Check if database is empty
    const contextSystem = new ContextSystem();
    const count = await contextSystem.countEntries();
    return count === 0;
  }
});
```

### Migration 002: Add Agent Collaboration Tracking
```typescript
// migrations/002-add-collaboration-tracking.ts
import { createMigration } from '../utils/migration-template';
import { ContextSystem } from '../src/context-system';

export const migration002 = createMigration({
  version: '002',
  description: 'Add agent collaboration tracking and relationship metrics',
  
  async up() {
    const contextSystem = new ContextSystem();
    
    // Add new tables/collections for collaboration tracking
    await contextSystem.createCollection('agent_collaborations', {
      timestamp: Date,
      fromAgent: String,
      toAgent: String,
      interactionType: String,
      duration: Number,
      success: Boolean,
      outcome: Object,
      relationshipStrength: Number
    });
    
    // Add relationship metrics to agents
    await contextSystem.updateAgentSchema({
      collaborationMetrics: {
        totalInteractions: Number,
        successfulInteractions: Number,
        averageInteractionDuration: Number,
        relationshipStrengths: Map(String, Number)
      }
    });
    
    // Initialize collaboration tracking for existing agents
    await contextSystem.initializeCollaborationMetrics();
  },
  
  async down() {
    const contextSystem = new ContextSystem();
    await contextSystem.dropCollection('agent_collaborations');
    await contextSystem.removeAgentField('collaborationMetrics');
  },
  
  async validate() {
    const contextSystem = new ContextSystem();
    const hasCollaborationCollection = await contextSystem.collectionExists('agent_collaborations');
    const hasAgentMetrics = await contextSystem.agentHasField('collaborationMetrics');
    return hasCollaborationCollection && hasAgentMetrics;
  }
});
```

### Migration 003: Add Pattern Effectiveness Tracking
```typescript
// migrations/003-add-pattern-effectiveness.ts
import { createMigration } from '../utils/migration-template';
import { ContextSystem } from '../src/context-system';

export const migration003 = createMigration({
  version: '003',
  description: 'Add pattern effectiveness tracking and usage analytics',
  
  async up() {
    const contextSystem = new ContextSystem();
    
    // Add effectiveness metrics to patterns
    await contextSystem.updatePatternSchema({
      usage: {
        timesUsed: Number,
        lastUsed: Date,
        successRate: Number,
        averageImplementationTime: Number,
        agentUsage: Map(String, Number)
      },
      feedback: [{
        agentId: String,
        agentType: String,
        rating: Number,
        comment: String,
        timestamp: Date
      }]
    });
    
    // Create analytics collection
    await contextSystem.createCollection('pattern_analytics', {
      patternId: String,
      agentType: String,
      usageDate: Date,
      implementationTime: Number,
      success: Boolean,
      issues: Array(String)
    });
    
    // Migrate existing patterns with default metrics
    await contextSystem.migratePatternMetrics();
  },
  
  async down() {
    const contextSystem = new ContextSystem();
    await contextSystem.dropCollection('pattern_analytics');
    await contextSystem.removePatternFields(['usage', 'feedback']);
  },
  
  async validate() {
    const contextSystem = new ContextSystem();
    const hasAnalytics = await contextSystem.collectionExists('pattern_analytics');
    const hasPatternMetrics = await contextSystem.patternHasField('usage');
    return hasAnalytics && hasPatternMetrics;
  }
});
```

## Migration Runner

```typescript
// migration-runner.ts
import { ContextSystem } from '../src/context-system';
import { Logger } from '../src/utils/logger';
import { migration001 } from './001-initialize-context-system';
import { migration002 } from './002-add-collaboration-tracking';
import { migration003 } from './003-add-pattern-effectiveness';

const migrations = [
  migration001,
  migration002,
  migration003
];

export class MigrationRunner {
  private contextSystem: ContextSystem;
  private logger: Logger;
  
  constructor() {
    this.contextSystem = new ContextSystem();
    this.logger = new Logger('MigrationRunner');
  }
  
  async runMigrations(targetVersion?: string): Promise<void> {
    const currentVersion = await this.getCurrentVersion();
    const migrationsToRun = this.getMigrationsToRun(currentVersion, targetVersion);
    
    if (migrationsToRun.length === 0) {
      this.logger.info('No migrations to run');
      return;
    }
    
    this.logger.info(`Running ${migrationsToRun.length} migrations`);
    
    for (const migration of migrationsToRun) {
      await this.runMigration(migration);
      await this.recordMigration(migration.version);
    }
    
    this.logger.info('All migrations completed successfully');
  }
  
  async rollback(targetVersion: string): Promise<void> {
    const currentVersion = await this.getCurrentVersion();
    const migrationsToRollback = this.getMigrationsToRollback(currentVersion, targetVersion);
    
    this.logger.info(`Rolling back ${migrationsToRollback.length} migrations`);
    
    for (const migration of migrationsToRollback) {
      await this.rollbackMigration(migration);
      await this.removeMigrationRecord(migration.version);
    }
    
    this.logger.info('Rollback completed successfully');
  }
  
  private async getCurrentVersion(): Promise<string> {
    return this.contextSystem.getSetting('migration_version') || '000';
  }
  
  private getMigrationsToRun(currentVersion: string, targetVersion?: string): any[] {
    const currentIndex = migrations.findIndex(m => m.version === currentVersion);
    const targetIndex = targetVersion 
      ? migrations.findIndex(m => m.version === targetVersion)
      : migrations.length;
    
    return migrations.slice(currentIndex + 1, targetIndex);
  }
  
  private getMigrationsToRollback(currentVersion: string, targetVersion: string): any[] {
    const currentIndex = migrations.findIndex(m => m.version === currentVersion);
    const targetIndex = migrations.findIndex(m => m.version === targetVersion);
    
    return migrations.slice(targetIndex + 1, currentIndex + 1).reverse();
  }
  
  private async runMigration(migration: any): Promise<void> {
    try {
      await migration.up();
      this.logger.info(`Migration ${migration.version} completed`);
    } catch (error) {
      this.logger.error(`Migration ${migration.version} failed`, error);
      throw error;
    }
  }
  
  private async rollbackMigration(migration: any): Promise<void> {
    try {
      await migration.down();
      this.logger.info(`Migration ${migration.version} rolled back`);
    } catch (error) {
      this.logger.error(`Migration rollback ${migration.version} failed`, error);
      throw error;
    }
  }
  
  private async recordMigration(version: string): Promise<void> {
    await this.contextSystem.createRecord('migrations', {
      version,
      appliedAt: new Date()
    });
    await this.contextSystem.setSetting('migration_version', version);
  }
  
  private async removeMigrationRecord(version: string): Promise<void> {
    await this.contextSystem.deleteRecord('migrations', { version });
    // Update version to previous migration
    const appliedMigrations = await this.contextSystem.getRecords('migrations', {}, { sort: { appliedAt: -1 }, limit: 1 });
    const previousVersion = appliedMigrations.length > 0 ? appliedMigrations[0].version : '000';
    await this.contextSystem.setSetting('migration_version', previousVersion);
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];
  const targetVersion = process.argv[3];
  const runner = new MigrationRunner();
  
  try {
    switch (command) {
      case 'up':
        await runner.runMigrations(targetVersion);
        break;
      case 'down':
        if (!targetVersion) {
          console.error('Target version required for rollback');
          process.exit(1);
        }
        await runner.rollback(targetVersion);
        break;
      case 'status':
        const currentVersion = await runner.getCurrentVersion();
        console.log(`Current migration version: ${currentVersion}`);
        break;
      default:
        console.log('Usage: npm run migrate [up|down|status] [target-version]');
        process.exit(1);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
```

## Package.json Scripts

```json
{
  "scripts": {
    "migrate": "ts-node context-engineering/migrations/migration-runner.ts",
    "migrate:up": "npm run migrate up",
    "migrate:down": "npm run migrate down",
    "migrate:status": "npm run migrate status",
    "migrate:validate": "ts-node context-engineering/migrations/validate-migrations.ts"
  }
}
```

## Validation Script

```typescript
// validate-migrations.ts
import { ContextSystem } from '../src/context-system';
import { Logger } from '../src/utils/logger';
import { migrations } from './migration-runner';

async function validateMigrations(): Promise<void> {
  const contextSystem = new ContextSystem();
  const logger = new Logger('MigrationValidator');
  
  logger.info('Validating all migrations...');
  
  for (const migration of migrations) {
    try {
      // Test validation
      const isValid = await migration.validate();
      if (!isValid) {
        logger.error(`Migration ${migration.version} validation failed`);
        process.exit(1);
      }
      
      // Test up migration on test database
      await migration.up();
      
      // Test rollback
      await migration.down();
      
      logger.info(`Migration ${migration.version} validated successfully`);
    } catch (error) {
      logger.error(`Migration ${migration.version} validation failed:`, error);
      process.exit(1);
    }
  }
  
  logger.info('All migrations validated successfully');
}

if (require.main === module) {
  validateMigrations().catch(error => {
    console.error('Migration validation failed:', error);
    process.exit(1);
  });
}
```

## Usage Examples

### Running All Migrations
```bash
npm run migrate:up
```

### Running Migrations to Specific Version
```bash
npm run migrate:up 002
```

### Rolling Back to Previous Version
```bash
npm run migrate:down 001
```

### Checking Migration Status
```bash
npm run migrate:status
```

### Validating All Migrations
```bash
npm run migrate:validate
```

## Migration Best Practices

1. **Always include validation** - Ensure migrations can run successfully
2. **Provide rollback functionality** - Always include a down migration
3. **Test migrations** - Validate migrations on test data
4. **Document changes** - Clearly describe what each migration does
5. **Version carefully** - Use semantic versioning for migration IDs
6. **Backup data** - Always backup before running migrations
7. **Monitor performance** - Track migration performance and optimize if needed

These migration scripts provide a robust foundation for maintaining and evolving the context engineering system over time.