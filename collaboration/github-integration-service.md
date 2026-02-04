# GitHub Integration Service
**Component:** Collaboration Integration System
**Version:** 1.0.0
**Last Updated:** 2026-01-03

## Overview

The GitHub Integration Service provides comprehensive integration between the Frontend Design Agent System and GitHub, enabling automated issue tracking, PR management, project board synchronization, and release management.

## Features

### Issue Management
- Automated issue creation from agent outputs
- Issue assignment and labeling
- Issue linking and dependencies
- Comment and discussion management
- Milestone and sprint tracking
- Issue templates and automation

### Pull Request Management
- Automated PR creation from agent work
- Code review integration
- Review assignment and tracking
- Automated PR comments and suggestions
- Merge conflict prevention
- Status checks and integration

### Project Management
- GitHub Projects (Classic and Next Gen) integration
- Automated board updates
- Column management and transitions
- Sprint and milestone tracking
- Progress reporting

### Release Management
- Automated release creation
- Release notes generation
- Version tagging
- Release asset management
- Release announcements

## API Reference

### Issue Management

```typescript
interface IssueService {
  /**
   * Create a new issue from agent output
   */
  createIssue(options: CreateIssueOptions): Promise<Issue>;

  /**
   * Update an existing issue
   */
  updateIssue(issueNumber: number, options: UpdateIssueOptions): Promise<Issue>;

  /**
   * Close an issue
   */
  closeIssue(issueNumber: number, comment?: string): Promise<void>;

  /**
   * Assign users to an issue
   */
  assignIssue(issueNumber: number, assignees: string[]): Promise<void>;

  /**
   * Add labels to an issue
   */
  labelIssue(issueNumber: number, labels: string[]): Promise<void>;

  /**
   * Add a comment to an issue
   */
  addComment(issueNumber: number, comment: string): Promise<Comment>;

  /**
   * Link issues (dependency)
   */
  linkIssues(sourceIssue: number, targetIssue: number, type: 'blocks' | 'is blocked by'): Promise<void>;

  /**
   * Add issue to milestone
   */
  addToMilestone(issueNumber: number, milestone: string | number): Promise<void>;

  /**
   * Get issue by number
   */
  getIssue(issueNumber: number): Promise<Issue>;

  /**
   * Search issues
   */
  searchIssues(query: string, filters?: IssueFilters): Promise<Issue[]>;
}

interface CreateIssueOptions {
  title: string;
  body: string;
  labels?: string[];
  assignees?: string[];
  milestone?: string | number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  agentId?: string; // Agent that created the issue
  taskId?: string; // Task identifier from orchestrator
  context?: Record<string, any>;
}

interface Issue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  author: User;
  assignees: User[];
  labels: Label[];
  milestone: Milestone | null;
  created_at: Date;
  updated_at: Date;
  closed_at: Date | null;
  html_url: string;
  comments: number;
}
```

### Pull Request Management

```typescript
interface PullRequestService {
  /**
   * Create a pull request
   */
  createPR(options: CreatePROptions): Promise<PullRequest>;

  /**
   * Update PR description or title
   */
  updatePR(prNumber: number, options: UpdatePROptions): Promise<PullRequest>;

  /**
   * Request reviews from users or teams
   */
  requestReview(prNumber: number, reviewers: ReviewRequest[]): Promise<void>;

  /**
   * Add review comment
   */
  addReviewComment(prNumber: number, comment: string, position?: number): Promise<ReviewComment>;

  /**
   * Submit a review
   */
  submitReview(prNumber: number, review: Review): Promise<Review>;

  /**
   * Merge a pull request
   */
  mergePR(prNumber: number, options: MergeOptions): Promise<MergeResult>;

  /**
   * Close a PR without merging
   */
  closePR(prNumber: number, comment?: string): Promise<void>;

  /**
   * Get PR by number
   */
  getPR(prNumber: number): Promise<PullRequest>;

  /**
   * List PRs with filters
   */
  listPRs(filters?: PRFilters): Promise<PullRequest[]>;

  /**
   * Check PR status and reviews
   */
  getPRStatus(prNumber: number): Promise<PRStatus>;
}

interface CreatePROptions {
  title: string;
  body: string;
  head: string; // Branch name
  base: string; // Target branch
  draft?: boolean;
  assignees?: string[];
  reviewers?: string[];
  labels?: string[];
  agentId?: string;
  taskId?: string;
}

interface PullRequest {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed' | 'merged';
  author: User;
  head: Branch;
  base: Branch;
  created_at: Date;
  updated_at: Date;
  merged_at: Date | null;
  draft: boolean;
  mergeable: boolean;
  review_decision: 'approved' | 'changes_requested' | 'review_required' | null;
  reviewers: Reviewer[];
  html_url: string;
  diff_url: string;
}

interface Review {
  id: number;
  user: User;
  state: 'approved' | 'changes_requested' | 'commented' | 'dismissed';
  body: string;
  submitted_at: Date;
  comments?: ReviewComment[];
}
```

### Project Management

```typescript
interface ProjectService {
  /**
   * Create a new project board
   */
  createProject(options: CreateProjectOptions): Promise<Project>;

  /**
   * Get project by ID or number
   */
  getProject(projectId: number): Promise<Project>;

  /**
   * Add issue to project
   */
  addIssueToProject(issueId: string, projectId: number, columnId?: string): Promise<void>;

  /**
   * Move issue between columns
   */
  moveIssue(issueId: string, columnId: string, position?: 'top' | 'bottom'): Promise<void>;

  /**
   * Update project field
   */
  updateProjectField(projectId: number, fieldId: string, value: any): Promise<void>;

  /**
   * Get project progress
   */
  getProjectProgress(projectId: number): Promise<ProjectProgress>;

  /**
   * Create milestone
   */
  createMilestone(options: CreateMilestoneOptions): Promise<Milestone>;

  /**
   * Get milestones
   */
  getMilestones(state?: 'open' | 'closed' | 'all'): Promise<Milestone[]>;
}

interface Project {
  id: number;
  name: string;
  body: string;
  owner: User;
  created_at: Date;
  updated_at: Date;
  columns: Column[];
  html_url: string;
}

interface Column {
  id: number;
  name: string;
  cards: Card[];
}

interface ProjectProgress {
  totalIssues: number;
  completedIssues: number;
  inProgressIssues: number;
  pendingIssues: number;
  completionPercentage: number;
  estimatedCompletion: Date | null;
}
```

### Release Management

```typescript
interface ReleaseService {
  /**
   * Create a new release
   */
  createRelease(options: CreateReleaseOptions): Promise<Release>;

  /**
   * Get release by tag or ID
   */
  getRelease(tagOrId: string | number): Promise<Release>;

  /**
   * List releases
   */
  listReleases(perPage?: number, page?: number): Promise<Release[]>;

  /**
   * Update release
   */
  updateRelease(id: number, options: UpdateReleaseOptions): Promise<Release>;

  /**
   * Delete a release
   */
  deleteRelease(id: number): Promise<void>;

  /**
   * Generate release notes from issues and PRs
   */
  generateReleaseNotes(fromTag: string, toTag: string): Promise<ReleaseNotes>;
}

interface Release {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  draft: boolean;
  prerelease: boolean;
  author: User;
  created_at: Date;
  published_at: Date;
  html_url: string;
  assets: Asset[];
}

interface ReleaseNotes {
  title: string;
  content: string;
  features: ReleaseItem[];
  bugfixes: ReleaseItem[];
  improvements: ReleaseItem[];
  breaking: ReleaseItem[];
  contributors: User[];
}
```

## Agent Integration

### Issue Creation from Agent Output

```typescript
class AgentIssueCreator {
  constructor(private github: IssueService, private agentId: string) {}

  /**
   * Create an issue from agent output
   */
  async createFromAgentOutput(output: AgentOutput): Promise<Issue> {
    const issueData = this.parseAgentOutput(output);

    const issue = await this.github.createIssue({
      ...issueData,
      agentId: this.agentId,
      labels: this.generateLabels(issueData)
    });

    // Add context comment with agent details
    await this.addContextComment(issue.number, output);

    return issue;
  }

  /**
   * Parse agent output into issue data
   */
  private parseAgentOutput(output: AgentOutput): CreateIssueOptions {
    // Extract title, body, priority from output
    return {
      title: output.title || `Task from ${this.agentId}`,
      body: this.formatBody(output),
      priority: output.priority || 'medium',
      context: {
        agentId: this.agentId,
        timestamp: new Date().toISOString(),
        outputData: output
      }
    };
  }

  /**
   * Generate labels based on agent type and output
   */
  private generateLabels(data: CreateIssueOptions): string[] {
    const labels: string[] = ['frontend', 'automated', this.agentId];

    // Add priority label
    if (data.priority) {
      labels.push(`priority: ${data.priority}`);
    }

    // Add agent-specific labels
    switch (this.agentId) {
      case 'FD-PO-04': // Performance Optimizer
        labels.push('performance');
        break;
      case 'FD-AX-05': // Accessibility Specialist
        labels.push('accessibility');
        break;
      case 'FD-SC-08': // Security Specialist
        labels.push('security');
        break;
      case 'FD-TQ-07': // Testing & QA
        labels.push('testing', 'quality');
        break;
    }

    return labels;
  }

  /**
   * Format issue body from agent output
   */
  private formatBody(output: AgentOutput): string {
    return `## Agent: ${this.agentId}

**Generated:** ${new Date().toISOString()}

## Description
${output.description || output.summary || 'No description provided.'}

## Details
${this.formatDetails(output)}

## Recommendations
${this.formatRecommendations(output)}

## Context
\`\`\`json
${JSON.stringify(output.context || {}, null, 2)}
\`\`\`
`;
  }

  /**
   * Add context comment to issue
   */
  private async addContextComment(issueNumber: number, output: AgentOutput): Promise<void> {
    const comment = `**Agent Context**
- **Agent ID:** ${this.agentId}
- **Task ID:** ${output.taskId || 'N/A'}
- **Timestamp:** ${new Date().toISOString()}
- **Processing Time:** ${output.processingTime || 'N/A'}

**Output Metadata:**
\`\`\`json
${JSON.stringify(output.metadata || {}, null, 2)}
\`\`\`
`;

    await this.github.addComment(issueNumber, comment);
  }
}
```

### PR Creation for Agent Work

```typescript
class AgentPRCreator {
  constructor(
    private github: PullRequestService,
    private agentId: string,
    private codeReview?: CodeReviewService
  ) {}

  /**
   * Create a PR for agent work
   */
  async createForAgentWork(work: AgentWork): Promise<PullRequest> {
    // Determine branch name
    const branchName = this.generateBranchName(work);

    // Create PR
    const pr = await this.github.createPR({
      title: work.title || `Work from ${this.agentId}`,
      body: this.formatBody(work),
      head: branchName,
      base: work.baseBranch || 'main',
      draft: work.draft || false,
      assignees: work.assignees || [],
      labels: this.generateLabels(work),
      agentId: this.agentId,
      taskId: work.taskId
    });

    // Run automated code review
    if (this.codeReview) {
      await this.runAutomatedReview(pr.number, work);
    }

    // Request reviews if specified
    if (work.reviewers && work.reviewers.length > 0) {
      await this.github.requestReview(pr.number, work.reviewers.map(r => ({ type: 'user', id: r })));
    }

    return pr;
  }

  /**
   * Run automated code review
   */
  private async runAutomatedReview(prNumber: number, work: AgentWork): Promise<void> {
    try {
      const review = await this.codeReview.analyzePR(work.files);

      if (review.comments && review.comments.length > 0) {
        for (const comment of review.comments) {
          await this.github.addReviewComment(prNumber, comment.body, comment.position);
        }
      }

      // Add summary comment
      await this.github.addReviewComment(prNumber, review.summary);
    } catch (error) {
      console.error('Automated review failed:', error);
    }
  }

  /**
   * Generate branch name
   */
  private generateBranchName(work: AgentWork): string {
    const prefix = this.getAgentPrefix(this.agentId);
    const sanitizedTitle = work.title
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50) || 'changes';
    const timestamp = Date.now().toString(36);

    return `${prefix}/${sanitizedTitle}-${timestamp}`;
  }

  private getAgentPrefix(agentId: string): string {
    const prefixes: Record<string, string> = {
      'FD-DS-02': 'design-system',
      'FD-CD-03': 'component',
      'FD-PO-04': 'performance',
      'FD-AX-05': 'accessibility',
      'FD-CP-06': 'cross-platform',
      'FD-TQ-07': 'testing',
      'FD-SC-08': 'security',
      'FD-AN-09': 'animation',
      'FD-I1-10': 'i18n',
      'FD-UR-11': 'ux-research'
    };
    return prefixes[agentId] || 'agent';
  }
}
```

### Project Board Integration

```typescript
class ProjectBoardManager {
  constructor(
    private github: ProjectService,
    private agentId: string
  ) {}

  /**
   * Sync issue to project board
   */
  async syncIssue(issue: Issue, projectId: number, targetColumn?: string): Promise<void> {
    // Find or create project
    const project = await this.getOrCreateProject(projectId);

    // Add issue to project
    await this.github.addIssueToProject(
      issue.id.toString(),
      project.id,
      targetColumn || 'To Do'
    );

    // Update with agent-specific metadata
    await this.updateProjectFields(project.id, issue);
  }

  /**
   * Move issue to appropriate column based on status
   */
  async moveIssueByStatus(issue: Issue, status: 'todo' | 'in-progress' | 'review' | 'done'): Promise<void> {
    const columnMap: Record<string, string> = {
      'todo': 'To Do',
      'in-progress': 'In Progress',
      'review': 'Review',
      'done': 'Done'
    };

    await this.github.moveIssue(issue.id.toString(), columnMap[status]);
  }

  /**
   * Update project progress
   */
  async updateProgress(projectId: number): Promise<ProjectProgress> {
    const progress = await this.github.getProjectProgress(projectId);

    // Log to performance monitoring
    await this.logProgressMetrics(projectId, progress);

    return progress;
  }

  /**
   * Create milestone for agent work
   */
  async createAgentMilestone(title: string, dueDate: Date, description?: string): Promise<Milestone> {
    return this.github.createMilestone({
      title: `${this.agentId}: ${title}`,
      description: description || `Milestone for ${this.agentId}`,
      due_on: dueDate
    });
  }

  private async logProgressMetrics(projectId: number, progress: ProjectProgress): Promise<void> {
    // Integration with performance monitoring (Action 3.03)
    // Implementation would log metrics to TimescaleDB
  }
}
```

## Workflows

### New Feature Workflow

```typescript
class NewFeatureWorkflow {
  constructor(
    private github: IssueService,
    private prService: PullRequestService,
    private projectManager: ProjectBoardManager
  ) {}

  async execute(featureRequest: FeatureRequest): Promise<WorkflowResult> {
    // Step 1: Create feature issue
    const issue = await this.github.createIssue({
      title: featureRequest.title,
      body: this.formatFeatureBody(featureRequest),
      labels: ['enhancement', 'feature', 'automated'],
      priority: featureRequest.priority || 'medium'
    });

    // Step 2: Add to project board
    await this.projectManager.syncIssue(issue, featureRequest.projectId, 'To Do');

    // Step 3: Create milestone if provided
    if (featureRequest.milestone) {
      await this.github.addToMilestone(issue.number, featureRequest.milestone);
    }

    // Step 4: Create development branch (integration with Git operations)
    const branchName = `feature/${featureRequest.title.toLowerCase().replace(/ /g, '-')}-${issue.number}`;

    return {
      issue,
      branchName,
      status: 'created'
    };
  }
}
```

### Bug Fix Workflow

```typescript
class BugFixWorkflow {
  constructor(
    private github: IssueService,
    private agentIssueCreator: AgentIssueCreator
  ) {}

  async execute(bugReport: BugReport): Promise<WorkflowResult> {
    // Create bug issue
    const issue = await this.github.createIssue({
      title: `Bug: ${bugReport.title}`,
      body: this.formatBugBody(bugReport),
      labels: ['bug', 'defect', bugReport.severity],
      priority: bugReport.severity === 'critical' ? 'critical' : 'high'
    });

    // Assign to appropriate team based on bug type
    const assignees = this.getAssigneesForBug(bugReport.type);
    if (assignees.length > 0) {
      await this.github.assignIssue(issue.number, assignees);
    }

    // Add to critical queue if severe
    if (bugReport.severity === 'critical') {
      await this.github.labelIssue(issue.number, ['critical', 'urgent']);
    }

    return {
      issue,
      status: 'assigned'
    };
  }
}
```

## Configuration

```typescript
interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  defaultBranch: string;
  baseUrl?: string;
  defaults: {
    assignees: string[];
    labels: string[];
    reviewers: string[];
  };
  projects: {
    enabled: boolean;
    defaultProject?: number;
    columnMapping?: Record<string, string>;
  };
  milestones: {
    enabled: boolean;
    autoCreate: boolean;
  };
  releases: {
    enabled: boolean;
    autoGenerateNotes: boolean;
  };
  automation: {
    issueTemplates: boolean;
    prTemplates: boolean;
    autoAssign: boolean;
    autoLabel: boolean;
  };
}
```

## Best Practices

1. **Use descriptive titles and bodies** for issues and PRs
2. **Apply consistent labels** to categorize and filter work
3. **Link related issues** to maintain traceability
4. **Use project boards** to track progress visually
5. **Create milestones** for releases and sprints
6. **Automate repetitive tasks** to reduce manual work
7. **Integrate with code review** for quality checks
8. **Use status checks** to ensure quality gates
9. **Document automation rules** clearly
10. **Monitor and review** automation effectiveness

## Error Handling

All service methods should implement proper error handling:

```typescript
try {
  const issue = await github.createIssue(options);
} catch (error) {
  if (error instanceof GitHubError) {
    // Handle GitHub API errors
    console.error(`GitHub API Error: ${error.message}`);
    console.error(`Status: ${error.status}`);
    console.error(`Request: ${error.request}`);
  } else {
    // Handle other errors
    console.error('Unexpected error:', error);
  }
}
```

## Testing

```typescript
describe('GitHub Integration Service', () => {
  let github: IssueService;

  beforeEach(() => {
    github = new GitHubService(mockConfig);
  });

  describe('createIssue', () => {
    it('should create an issue with valid options', async () => {
      const options = {
        title: 'Test Issue',
        body: 'Test body',
        labels: ['test']
      };

      const issue = await github.createIssue(options);

      expect(issue.title).toBe(options.title);
      expect(issue.body).toBe(options.body);
      expect(issue.labels).toHaveLength(1);
    });

    it('should handle agent-specific labels', async () => {
      const creator = new AgentIssueCreator(github, 'FD-PO-04');

      const issue = await creator.createFromAgentOutput(mockAgentOutput);

      expect(issue.labels).toContain('performance');
      expect(issue.labels).toContain('FD-PO-04');
    });
  });
});
```

---

## Next Steps

- [ ] Review [Setup Guide](../SETUP.md)
- [ ] Check [Configuration Reference](../CONFIGURATION.md)
- [ ] Explore [Notification Service](./notification-service.md)
- [ ] Review [Code Review Automation](./code-review-automation.md)
