# Workflow Templates

**Version:** 1.0.0
**Template ID:** WT-FD-2024-007
**Last Updated:** 2026-01-03

## Table of Contents

- [Overview](#overview)
- [Component Development Workflow](#component-development-workflow)
- [Performance Audit Workflow](#performance-audit-workflow)
- [Accessibility Compliance Workflow](#accessibility-compliance-workflow)
- [Security Review Workflow](#security-review-workflow)
- [Cross-Platform Testing Workflow](#cross-platform-testing-workflow)
- [Design System Update Workflow](#design-system-update-workflow)
- [Feature Implementation Workflow](#feature-implementation-workflow)
- [Emergency Rollback Workflow](#emergency-rollback-workflow)

---

## Overview

### Purpose

Provide reusable workflow templates for common scenarios in the Frontend Design Agent System to standardize processes and accelerate task execution.

### Template Structure

Each template includes:

1. **Workflow Definition**: Structure and pattern
2. **Agent Assignments**: Which agents participate
3. **Handoff Sequence**: Order of operations
4. **Context Requirements**: What context is needed
5. **Tool Requirements**: What tools are needed
6. **Success Criteria**: How to measure success
7. **Error Handling**: What to do when things fail
8. **Estimated Duration**: Time estimate

### Usage Instructions

1. Select appropriate template for your task
2. Copy template configuration
3. Customize parameters as needed
4. Execute via Orchestrator
5. Monitor progress
6. Review results

---

## Component Development Workflow

### Workflow Definition

```typescript
{
  template_id: "component_development_v1",
  name: "Component Development Workflow",
  description: "End-to-end development of a new UI component",
  pattern: WorkflowPattern.PIPELINE,
  version: "1.0.0"
}
```

### Agent Sequence

```
┌─────────────────────────────────────────────────────────────┐
│  Orchestrator (FD-ORC-01)                             │
│  - Initiates workflow                                      │
│  - Monitors progress                                       │
│  - Collects final results                                 │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Design System (FD-DS-02)                              │
│  - Creates design specification                           │
│  - Defines component props and variants                    │
│  - Establishes accessibility requirements                  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Component Developer (FD-CD-03)                         │
│  - Implements component code                               │
│  - Applies design tokens                                  │
│  - Adds accessibility attributes                           │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Accessibility Specialist (FD-AX-05)                     │
│  - Validates WCAG compliance                              │
│  - Tests with screen readers                              │
│  - Provides a11y recommendations                        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Performance Optimizer (FD-PO-04)                       │
│  - Optimizes rendering performance                         │
│  - Checks bundle size impact                              │
│  - Ensures performance budgets met                         │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Testing & QA (FD-TQ-07)                              │
│  - Creates unit tests                                    │
│  - Creates integration tests                              │
│  - Creates e2e tests                                   │
│  - Generates test reports                                 │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Orchestrator (FD-ORC-01)                             │
│  - Reviews all results                                   │
│  - Finalizes component                                   │
│  - Updates documentation                                 │
└─────────────────────────────────────────────────────────────┘
```

### Configuration

```typescript
{
  workflow_id: generateUUID(),
  template_id: "component_development_v1",

  // Task definition
  task: {
    title: "Create Button Component",
    description: "Develop a reusable button component with multiple variants",
    priority: TaskPriority.HIGH,
    deliverables: [
      "component_code",
      "design_specification",
      "unit_tests",
      "accessibility_report",
      "performance_report"
    ]
  },

  // Agent assignments
  agents: [
    {
      agent_id: "FD-DS-02",
      role: "design_system",
      stage: 1,
      dependencies: [],
      estimated_duration: "PT10M"
    },
    {
      agent_id: "FD-CD-03",
      role: "implementation",
      stage: 2,
      dependencies: ["FD-DS-02"],
      estimated_duration: "PT20M"
    },
    {
      agent_id: "FD-AX-05",
      role: "accessibility_validation",
      stage: 3,
      dependencies: ["FD-CD-03"],
      estimated_duration: "PT10M"
    },
    {
      agent_id: "FD-PO-04",
      role: "performance_optimization",
      stage: 4,
      dependencies: ["FD-AX-05"],
      estimated_duration: "PT10M"
    },
    {
      agent_id: "FD-TQ-07",
      role: "testing",
      stage: 5,
      dependencies: ["FD-PO-04"],
      estimated_duration: "PT15M"
    }
  ],

  // Context requirements
  context_requirements: {
    design: {
      system_version: "2.0.0",
      tokens: ["colors", "typography", "spacing"],
      components: ["existing_components"]
    },
    code: {
      framework: "react",
      language: "typescript",
      build_tool: "vite"
    },
    accessibility: {
      wcag_level: "AA",
      requirements: ["keyboard_navigable", "screen_reader_compatible"]
    },
    performance: {
      budgets: {
        lcp: 2500,
        fid: 100,
        cls: 0.1
      }
    }
  },

  // Tool requirements
  tool_requirements: [
    {
      tool_id: "storybook",
      required_by: ["FD-DS-02", "FD-CD-03"],
      purpose: "Component development and preview"
    },
    {
      tool_id: "figma-api",
      required_by: ["FD-DS-02"],
      purpose: "Design specification"
    },
    {
      tool_id: "axe-core",
      required_by: ["FD-AX-05"],
      purpose: "Accessibility testing"
    },
    {
      tool_id: "lighthouse",
      required_by: ["FD-PO-04"],
      purpose: "Performance auditing"
    },
    {
      tool_id: "jest",
      required_by: ["FD-TQ-07"],
      purpose: "Unit testing"
    }
  ],

  // Success criteria
  success_criteria: [
    {
      criteria_id: "design_spec_complete",
      description: "Design specification is complete",
      agent: "FD-DS-02",
      type: "output_exists",
      expected_output: "design_spec"
    },
    {
      criteria_id: "component_implemented",
      description: "Component code implements design",
      agent: "FD-CD-03",
      type: "code_review",
      expected_output: "component_code"
    },
    {
      criteria_id: "a11y_compliant",
      description: "WCAG AA compliance achieved",
      agent: "FD-AX-05",
      type: "validation",
      threshold: 100,  // 100% compliance
      metric: "compliance_percentage"
    },
    {
      criteria_id: "performance_meets_budget",
      description: "Performance within budget",
      agent: "FD-PO-04",
      type: "validation",
      threshold: 100,  // Must meet all budgets
      metric: "budget_compliance"
    },
    {
      criteria_id: "test_coverage",
      description: "Test coverage >= 80%",
      agent: "FD-TQ-07",
      type: "validation",
      threshold: 80,
      metric: "coverage_percentage"
    }
  ],

  // Error handling
  error_handling: {
    on_design_failure: "retry_with_fallback_design",
    on_implementation_failure: "request_review",
    on_a11y_failure: "provide_recommendations_and_retry",
    on_performance_failure: "optimize_or_simplify",
    on_test_failure: "fix_and_retest"
  },

  // Timeout configuration
  timeouts: {
    per_stage: "PT30M",
    total_workflow: "PT2H"
  }
}
```

### Execution Example

```typescript
import { WorkflowExecutor } from '../core/WorkflowExecutor';

// Create workflow executor
const executor = new WorkflowExecutor();

// Load template
const template = await loadTemplate("component_development_v1");

// Customize template
const workflow = {
  ...template,
  task: {
    ...template.task,
    title: "Create Modal Component",
    description: "Develop a reusable modal component for dialogs and alerts"
  }
};

// Execute workflow
const result = await executor.execute(workflow);

// Check results
console.log("Workflow result:", result);

if (result.success) {
  console.log("Component developed successfully");
  console.log("Deliverables:", result.deliverables);
} else {
  console.error("Workflow failed:", result.error);
  console.log("Failed at stage:", result.failed_stage);
}
```

---

## Performance Audit Workflow

### Workflow Definition

```typescript
{
  template_id: "performance_audit_v1",
  name: "Performance Audit Workflow",
  description: "Comprehensive performance audit of application",
  pattern: WorkflowPattern.MAP_REDUCE,
  version: "1.0.0"
}
```

### Agent Sequence (Parallel)

```
┌─────────────────────────────────────────────────────────────┐
│  Orchestrator (FD-ORC-01)                             │
│  - Initiates audit                                        │
│  - Distributes tasks                                      │
│  - Aggregates results                                    │
└─────────────────────────────────────────────────────────────┘
                          │
              ┌───────────┼───────────┐
              │           │           │
              ▼           ▼           ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Performance    │ │  Accessibility  │ │  Security       │
│  (FD-PO-04)   │ │  (FD-AX-05)   │ │  (FD-SC-08)   │
│  - Core metrics │ │  - Impact on   │ │  - Security     │
│  - Bundle size │ │    performance  │ │    impact      │
│  - Load times  │ │  - A11y perf   │ │  - Load time    │
│                │ │    metrics     │ │    issues      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
              │           │           │
              └───────────┼───────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Orchestrator (FD-ORC-01)                             │
│  - Aggregates findings                                    │
│  - Identifies critical issues                             │
│  - Prioritizes optimizations                             │
│  - Generates report                                      │
└─────────────────────────────────────────────────────────────┘
```

### Configuration

```typescript
{
  workflow_id: generateUUID(),
  template_id: "performance_audit_v1",

  task: {
    title: "Performance Audit",
    description: "Comprehensive performance audit of the application",
    priority: TaskPriority.HIGH,
    deliverables: [
      "performance_report",
      "accessibility_report",
      "security_report",
      "consolidated_findings",
      "optimization_recommendations"
    ]
  },

  agents: [
    {
      agent_id: "FD-PO-04",
      role: "performance_auditor",
      stage: 1,
      parallel_group: "audit_group",
      estimated_duration: "PT15M"
    },
    {
      agent_id: "FD-AX-05",
      role: "accessibility_auditor",
      stage: 1,
      parallel_group: "audit_group",
      estimated_duration: "PT10M"
    },
    {
      agent_id: "FD-SC-08",
      role: "security_auditor",
      stage: 1,
      parallel_group: "audit_group",
      estimated_duration: "PT10M"
    }
  ],

  context_requirements: {
    performance: {
      current_metrics: true,
      historical_data: true
    },
    accessibility: {
      wcag_level: "AA",
      previous_audit_results: true
    },
    security: {
      previous_vulnerability_scan: true
    }
  },

  tool_requirements: [
    {
      tool_id: "lighthouse",
      required_by: ["FD-PO-04"],
      purpose: "Performance metrics"
    },
    {
      tool_id: "webpagetest",
      required_by: ["FD-PO-04"],
      purpose: "Detailed performance testing"
    },
    {
      tool_id: "axe-core",
      required_by: ["FD-AX-05"],
      purpose: "Accessibility testing"
    },
    {
      tool_id: "snyk",
      required_by: ["FD-SC-08"],
      purpose: "Vulnerability scanning"
    }
  ],

  success_criteria: [
    {
      criteria_id: "performance_measured",
      description: "Core Web Vitals measured",
      agent: "FD-PO-04",
      type: "validation",
      metric: "metrics_collected",
      threshold: 1
    },
    {
      criteria_id: "accessibility_audited",
      description: "Accessibility audit completed",
      agent: "FD-AX-05",
      type: "validation",
      metric: "audit_completed",
      threshold: 1
    },
    {
      criteria_id: "security_scanned",
      description: "Security scan completed",
      agent: "FD-SC-08",
      type: "validation",
      metric: "scan_completed",
      threshold: 1
    }
  ],

  aggregation: {
    type: "consolidated_report",
    prioritization: "impact_based",
    threshold: "critical"
  }
}
```

---

## Accessibility Compliance Workflow

### Workflow Definition

```typescript
{
  template_id: "a11y_compliance_v1",
  name: "Accessibility Compliance Workflow",
  description: "Ensure WCAG compliance for a component or feature",
  pattern: WorkflowPattern.PEER_REVIEW,
  version: "1.0.0"
}
```

### Agent Sequence

```
┌─────────────────────────────────────────────────────────────┐
│  Orchestrator (FD-ORC-01)                             │
│  - Initiates a11y compliance workflow                     │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Component Developer (FD-CD-03)                         │
│  - Provides initial implementation                        │
│  - Self-reviews for a11y                                │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Accessibility Specialist (FD-AX-05)                     │
│  - Runs comprehensive a11y audit                         │
│  - Provides detailed feedback                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Component Developer (FD-CD-03)                         │
│  - Addresses a11y feedback                              │
│  - Implements fixes                                      │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Accessibility Specialist (FD-AX-05)                     │
│  - Re-audits fixes                                      │
│  - Validates compliance                                   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Testing & QA (FD-TQ-07)                               │
│  - Creates a11y tests                                    │
│  - Tests with assistive technologies                       │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Orchestrator (FD-ORC-01)                             │
│  - Finalizes compliance status                           │
│  - Updates documentation                                 │
└─────────────────────────────────────────────────────────────┘
```

### Configuration

```typescript
{
  workflow_id: generateUUID(),
  template_id: "a11y_compliance_v1",

  task: {
    title: "WCAG AA Compliance",
    description: "Ensure component meets WCAG AA accessibility standards",
    priority: TaskPriority.HIGH,
    deliverables: [
      "accessibility_audit_report",
      "a11y_fixes",
      "a11y_tests",
      "compliance_certificate"
    ]
  },

  agents: [
    {
      agent_id: "FD-CD-03",
      role: "implementation",
      stages: [1, 3],
      estimated_duration: "PT15M"
    },
    {
      agent_id: "FD-AX-05",
      role: "accessibility_validation",
      stages: [2, 4],
      estimated_duration: "PT15M"
    },
    {
      agent_id: "FD-TQ-07",
      role: "testing",
      stage: 5,
      estimated_duration: "PT10M"
    }
  ],

  context_requirements: {
    accessibility: {
      wcag_level: "AA",
      target_criteria: [
        "1.1.1",
        "1.3.1",
        "2.1.1",
        "2.4.1",
        "3.3.2"
      ]
    },
    code: {
      component_files: true
    }
  },

  tool_requirements: [
    {
      tool_id: "axe-core",
      required_by: ["FD-AX-05"],
      purpose: "Automated a11y testing"
    },
    {
      tool_id: "wave",
      required_by: ["FD-AX-05"],
      purpose: "WAVE accessibility evaluation"
    },
    {
      tool_id: "screen_reader_simulator",
      required_by: ["FD-AX-05", "FD-TQ-07"],
      purpose: "Screen reader testing"
    }
  ],

  success_criteria: [
    {
      criteria_id: "wcag_aa_compliant",
      description: "WCAG AA compliance achieved",
      agent: "FD-AX-05",
      type: "validation",
      threshold: 100,
      metric: "compliance_percentage"
    },
    {
      criteria_id: "screen_reader_compatible",
      description: "Compatible with screen readers",
      agent: "FD-TQ-07",
      type: "validation",
      threshold: 1,
      metric: "screen_reader_tests_passed"
    },
    {
      criteria_id: "keyboard_navigable",
      description: "Fully keyboard navigable",
      agent: "FD-AX-05",
      type: "validation",
      threshold: 1,
      metric: "keyboard_navigation_score"
    }
  ],

  peer_review: {
    rounds: 2,
    feedback_required: true,
    iteration_allowed: true
  }
}
```

---

## Security Review Workflow

### Workflow Definition

```typescript
{
  template_id: "security_review_v1",
  name: "Security Review Workflow",
  description: "Comprehensive security review for code or feature",
  pattern: WorkflowPattern.PIPELINE,
  version: "1.0.0"
}
```

### Configuration

```typescript
{
  workflow_id: generateUUID(),
  template_id: "security_review_v1",

  task: {
    title: "Security Review",
    description: "Comprehensive security review of code changes",
    priority: TaskPriority.HIGH,
    deliverables: [
      "vulnerability_scan_results",
      "security_audit_report",
      "recommendations",
      "security_certificate"
    ]
  },

  agents: [
    {
      agent_id: "FD-SC-08",
      role: "security_auditor",
      stage: 1,
      estimated_duration: "PT20M"
    },
    {
      agent_id: "FD-TQ-07",
      role: "security_testing",
      stage: 2,
      dependencies: ["FD-SC-08"],
      estimated_duration: "PT15M"
    }
  ],

  context_requirements: {
    security: {
      scan_type: "comprehensive",
      include_dependencies: true,
      check_for: [
        "xss",
        "csrf",
        "injection_attacks",
        "data_exposure",
        "authentication_issues"
      ]
    }
  },

  tool_requirements: [
    {
      tool_id: "snyk",
      required_by: ["FD-SC-08"],
      purpose: "Vulnerability scanning"
    },
    {
      tool_id: "owasp-zap",
      required_by: ["FD-SC-08"],
      purpose: "Web application security scanning"
    },
    {
      tool_id: "npm-audit",
      required_by: ["FD-SC-08"],
      purpose: "Dependency vulnerability check"
    }
  ],

  success_criteria: [
    {
      criteria_id: "no_critical_vulnerabilities",
      description: "No critical vulnerabilities found",
      agent: "FD-SC-08",
      type: "validation",
      threshold: 0,
      metric: "critical_vulnerabilities"
    },
    {
      criteria_id: "high_vulnerabilities_resolved",
      description: "High vulnerabilities addressed or mitigated",
      agent: "FD-SC-08",
      type: "validation",
      threshold: 0,
      metric: "high_vulnerabilities_unresolved"
    }
  ],

  severity_levels: {
    critical: "must_fix",
    high: "must_fix",
    medium: "should_fix",
    low: "consider_fixing"
  }
}
```

---

## Cross-Platform Testing Workflow

### Workflow Definition

```typescript
{
  template_id: "cross_platform_testing_v1",
  name: "Cross-Platform Testing Workflow",
  description: "Test across multiple browsers and devices",
  pattern: WorkflowPattern.MAP_REDUCE,
  version: "1.0.0"
}
```

### Configuration

```typescript
{
  workflow_id: generateUUID(),
  template_id: "cross_platform_testing_v1",

  task: {
    title: "Cross-Platform Testing",
    description: "Test across all supported browsers and devices",
    priority: TaskPriority.HIGH,
    deliverables: [
      "browser_test_results",
      "device_test_results",
      "compatibility_matrix",
      "cross_browser_report"
    ]
  },

  // Multiple test runners working in parallel
  agents: [
    {
      agent_id: "FD-CP-06",
      role: "chrome_testing",
      stage: 1,
      parallel_group: "browser_tests",
      platform: "chrome",
      estimated_duration: "PT15M"
    },
    {
      agent_id: "FD-CP-06",
      role: "firefox_testing",
      stage: 1,
      parallel_group: "browser_tests",
      platform: "firefox",
      estimated_duration: "PT15M"
    },
    {
      agent_id: "FD-CP-06",
      role: "safari_testing",
      stage: 1,
      parallel_group: "browser_tests",
      platform: "safari",
      estimated_duration: "PT15M"
    },
    {
      agent_id: "FD-CP-06",
      role: "edge_testing",
      stage: 1,
      parallel_group: "browser_tests",
      platform: "edge",
      estimated_duration: "PT15M"
    }
  ],

  context_requirements: {
    cross_platform: {
      browsers: ["chrome", "firefox", "safari", "edge"],
      versions: {
        chrome: ">= 120",
        firefox: ">= 121",
        safari: ">= 17",
        edge: ">= 120"
      },
      devices: ["desktop", "tablet", "mobile"]
    }
  },

  tool_requirements: [
    {
      tool_id: "browserstack",
      required_by: ["FD-CP-06"],
      purpose: "Cross-browser testing"
    },
    {
      tool_id: "cypress",
      required_by: ["FD-CP-06"],
      purpose: "Automated browser testing"
    },
    {
      tool_id: "playwright",
      required_by: ["FD-CP-06"],
      purpose: "Multi-browser automation"
    }
  ],

  success_criteria: [
    {
      criteria_id: "all_browsers_pass",
      description: "Tests pass on all supported browsers",
      agent: "FD-CP-06",
      type: "validation",
      threshold: 100,
      metric: "browser_pass_rate"
    },
    {
      criteria_id: "critical_bugs_none",
      description: "No critical cross-platform bugs",
      agent: "FD-CP-06",
      type: "validation",
      threshold: 0,
      metric: "critical_cross_platform_bugs"
    }
  ]
}
```

---

## Design System Update Workflow

### Workflow Definition

```typescript
{
  template_id: "design_system_update_v1",
  name: "Design System Update Workflow",
  description: "Update design system with new tokens, components, or patterns",
  pattern: WorkflowPattern.MANAGER_WORKER,
  version: "1.0.0"
}
```

### Configuration

```typescript
{
  workflow_id: generateUUID(),
  template_id: "design_system_update_v1",

  task: {
    title: "Update Design System",
    description: "Update design system with new design tokens and components",
    priority: TaskPriority.HIGH,
    deliverables: [
      "updated_tokens",
      "updated_components",
      "migration_guide",
      "version_documentation"
    ]
  },

  agents: [
    {
      agent_id: "FD-ORC-01",
      role: "manager",
      stage: 0,
      estimated_duration: "PT5M"
    },
    {
      agent_id: "FD-DS-02",
      role: "design_system_update",
      stage: 1,
      dependencies: [],
      estimated_duration: "PT20M"
    },
    {
      agent_id: "FD-CD-03",
      role: "component_update",
      stage: 2,
      dependencies: ["FD-DS-02"],
      estimated_duration: "PT25M"
    },
    {
      agent_id: "FD-I1-10",
      role: "i18n_update",
      stage: 3,
      dependencies: ["FD-CD-03"],
      estimated_duration: "PT15M"
    },
    {
      agent_id: "FD-AN-09",
      role: "animation_update",
      stage: 4,
      dependencies: ["FD-CD-03"],
      estimated_duration: "PT15M"
    },
    {
      agent_id: "FD-TQ-07",
      role: "validation_testing",
      stage: 5,
      dependencies: ["FD-I1-10", "FD-AN-09"],
      estimated_duration: "PT20M"
    }
  ],

  context_requirements: {
    design: {
      current_version: "2.0.0",
      target_version: "2.1.0"
    },
    i18n: {
      supported_locales: ["en", "es", "fr", "de"],
      require_updates: true
    }
  },

  tool_requirements: [
    {
      tool_id: "figma-api",
      required_by: ["FD-DS-02"],
      purpose: "Design source"
    },
    {
      tool_id: "style-dictionary",
      required_by: ["FD-DS-02"],
      purpose: "Token generation"
    },
    {
      tool_id: "chromatic",
      required_by: ["FD-TQ-07"],
      purpose: "Visual regression testing"
    }
  ],

  success_criteria: [
    {
      criteria_id: "tokens_updated",
      description: "Design tokens updated and generated",
      agent: "FD-DS-02",
      type: "validation",
      threshold: 1,
      metric: "tokens_updated"
    },
    {
      criteria_id: "components_updated",
      description: "Components use new tokens",
      agent: "FD-CD-03",
      type: "validation",
      threshold: 100,
      metric: "component_token_usage"
    },
    {
      criteria_id: "i18n_supported",
      description: "New tokens support all locales",
      agent: "FD-I1-10",
      type: "validation",
      threshold: 100,
      metric: "locale_coverage"
    },
    {
      criteria_id: "visual_regression_none",
      description: "No visual regressions introduced",
      agent: "FD-TQ-07",
      type: "validation",
      threshold: 0,
      metric: "visual_regressions"
    }
  ],

  versioning: {
    strategy: "semantic",
    bump: "minor",
    tag_release: true
  }
}
```

---

## Feature Implementation Workflow

### Workflow Definition

```typescript
{
  template_id: "feature_implementation_v1",
  name: "Feature Implementation Workflow",
  description: "End-to-end implementation of a new feature",
  pattern: WorkflowPattern.PIPELINE,
  version: "1.0.0"
}
```

### Configuration

```typescript
{
  workflow_id: generateUUID(),
  template_id: "feature_implementation_v1",

  task: {
    title: "Implement New Feature",
    description: "Implement feature from requirements to deployment",
    priority: TaskPriority.HIGH,
    deliverables: [
      "feature_code",
      "tests",
      "documentation",
      "deployment_artifacts"
    ]
  },

  agents: [
    {
      agent_id: "FD-UR-11",
      role: "ux_research",
      stage: 1,
      estimated_duration: "PT15M"
    },
    {
      agent_id: "FD-DS-02",
      role: "design",
      stage: 2,
      dependencies: ["FD-UR-11"],
      estimated_duration: "PT20M"
    },
    {
      agent_id: "FD-CD-03",
      role: "implementation",
      stage: 3,
      dependencies: ["FD-DS-02"],
      estimated_duration: "PT45M"
    },
    {
      agent_id: "FD-AX-05",
      role: "accessibility",
      stage: 4,
      dependencies: ["FD-CD-03"],
      estimated_duration: "PT10M"
    },
    {
      agent_id: "FD-PO-04",
      role: "performance",
      stage: 5,
      dependencies: ["FD-AX-05"],
      estimated_duration: "PT10M"
    },
    {
      agent_id: "FD-SC-08",
      role: "security",
      stage: 6,
      dependencies: ["FD-PO-04"],
      estimated_duration: "PT10M"
    },
    {
      agent_id: "FD-TQ-07",
      role: "testing",
      stage: 7,
      dependencies: ["FD-SC-08"],
      estimated_duration: "PT20M"
    },
    {
      agent_id: "FD-CP-06",
      role: "cross_platform",
      stage: 8,
      dependencies: ["FD-TQ-07"],
      estimated_duration: "PT15M"
    }
  ],

  context_requirements: {
    ux: {
      user_stories: true,
      acceptance_criteria: true
    },
    design: {
      wireframes: true,
      prototypes: true
    }
  },

  tool_requirements: [
    {
      tool_id: "figma-api",
      required_by: ["FD-DS-02"],
      purpose: "Design tools"
    },
    {
      tool_id: "jest",
      required_by: ["FD-TQ-07"],
      purpose: "Testing"
    },
    {
      tool_id: "cypress",
      required_by: ["FD-TQ-07"],
      purpose: "E2E testing"
    },
    {
      tool_id: "browserstack",
      required_by: ["FD-CP-06"],
      purpose: "Cross-browser testing"
    }
  ],

  success_criteria: [
    {
      criteria_id: "meets_user_requirements",
      description: "Feature meets user requirements",
      agent: "FD-UR-11",
      type: "validation",
      threshold: 100,
      metric: "requirement_coverage"
    },
    {
      criteria_id: "a11y_compliant",
      description: "WCAG AA compliant",
      agent: "FD-AX-05",
      type: "validation",
      threshold: 100,
      metric: "compliance_percentage"
    },
    {
      criteria_id: "performance_meets_budget",
      description: "Performance within budget",
      agent: "FD-PO-04",
      type: "validation",
      threshold: 100,
      metric: "budget_compliance"
    },
    {
      criteria_id: "no_security_issues",
      description: "No security vulnerabilities",
      agent: "FD-SC-08",
      type: "validation",
      threshold: 0,
      metric: "high_vulnerabilities"
    },
    {
      criteria_id: "tests_pass",
      description: "All tests pass",
      agent: "FD-TQ-07",
      type: "validation",
      threshold: 100,
      metric: "test_pass_rate"
    }
  ]
}
```

---

## Emergency Rollback Workflow

### Workflow Definition

```typescript
{
  template_id: "emergency_rollback_v1",
  name: "Emergency Rollback Workflow",
  description: "Emergency rollback of deployment or changes",
  pattern: WorkflowPattern.PIPELINE,
  version: "1.0.0",
  priority: "critical"
}
```

### Configuration

```typescript
{
  workflow_id: generateUUID(),
  template_id: "emergency_rollback_v1",

  task: {
    title: "Emergency Rollback",
    description: "Emergency rollback of failed deployment or changes",
    priority: TaskPriority.CRITICAL,
    deliverables: [
      "rollback_completed",
      "post_rollback_tests",
      "incident_report"
    ]
  },

  agents: [
    {
      agent_id: "FD-ORC-01",
      role: "orchestrator",
      stage: 0,
      estimated_duration: "PT5M"
    },
    {
      agent_id: "FD-TQ-07",
      role: "rollback_execution",
      stage: 1,
      estimated_duration: "PT10M"
    },
    {
      agent_id: "FD-PO-04",
      role: "performance_validation",
      stage: 2,
      dependencies: ["FD-TQ-07"],
      estimated_duration: "PT10M"
    },
    {
      agent_id: "FD-AX-05",
      role: "functionality_validation",
      stage: 3,
      dependencies: ["FD-PO-04"],
      estimated_duration: "PT10M"
    },
    {
      agent_id: "FD-SC-08",
      role: "security_validation",
      stage: 4,
      dependencies: ["FD-AX-05"],
      estimated_duration: "PT10M"
    }
  ],

  context_requirements: {
    deployment: {
      last_stable_version: true,
      rollback_procedures: true
    }
  },

  tool_requirements: [
    {
      tool_id: "git",
      required_by: ["FD-TQ-07"],
      purpose: "Rollback execution"
    },
    {
      tool_id: "lighthouse",
      required_by: ["FD-PO-04"],
      purpose: "Performance validation"
    },
    {
      tool_id: "axe-core",
      required_by: ["FD-AX-05"],
      purpose: "Accessibility validation"
    }
  ],

  success_criteria: [
    {
      criteria_id: "rollback_successful",
      description: "Rollback completed successfully",
      agent: "FD-TQ-07",
      type: "validation",
      threshold: 1,
      metric: "rollback_success"
    },
    {
      criteria_id: "performance_restored",
      description: "Performance restored to previous level",
      agent: "FD-PO-04",
      type: "validation",
      threshold: 100,
      metric: "performance_restored"
    },
    {
      criteria_id: "functionality_restored",
      description: "Functionality restored",
      agent: "FD-AX-05",
      type: "validation",
      threshold: 1,
      metric: "functionality_restored"
    }
  ],

  emergency: {
    alert_on_start: true,
    notify_stakeholders: true,
    create_incident: true,
    max_duration: "PT30M"
  }
}
```

---

## Template Library

### Template Index

```typescript
const WORKFLOW_TEMPLATES = {
  "component_development_v1": "Component Development Workflow",
  "performance_audit_v1": "Performance Audit Workflow",
  "a11y_compliance_v1": "Accessibility Compliance Workflow",
  "security_review_v1": "Security Review Workflow",
  "cross_platform_testing_v1": "Cross-Platform Testing Workflow",
  "design_system_update_v1": "Design System Update Workflow",
  "feature_implementation_v1": "Feature Implementation Workflow",
  "emergency_rollback_v1": "Emergency Rollback Workflow"
};
```

### Template Usage API

```typescript
class WorkflowTemplateManager {
  private templates: Map<string, WorkflowTemplate> = new Map();

  constructor() {
    this.loadTemplates();
  }

  // Get template by ID
  getTemplate(templateId: string): WorkflowTemplate | undefined {
    return this.templates.get(templateId);
  }

  // List all templates
  listTemplates(): WorkflowTemplate[] {
    return Array.from(this.templates.values());
  }

  // Search templates
  searchTemplates(query: string): WorkflowTemplate[] {
    const lowerQuery = query.toLowerCase();

    return this.listTemplates().filter(template =>
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery)
    );
  }

  // Get recommended templates
  getRecommendedTemplates(task: Task): WorkflowTemplate[] {
    const recommendations: WorkflowTemplate[] = [];

    // Analyze task to recommend templates
    const keywords = this.extractKeywords(task);

    for (const template of this.listTemplates()) {
      const templateKeywords = this.extractKeywords({
        title: template.name,
        description: template.description
      });

      const overlap = keywords.filter(k => templateKeywords.includes(k)).length;

      if (overlap > 0) {
        recommendations.push({
          ...template,
          relevance_score: overlap / keywords.length
        });
      }
    }

    return recommendations
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, 5);
  }

  // Customize template
  customizeTemplate(
    templateId: string,
    customizations: TemplateCustomizations
  ): WorkflowTemplate {
    const template = this.getTemplate(templateId);

    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    return {
      ...template,
      ...customizations,
      customizations_applied: true
    };
  }

  private loadTemplates(): void {
    // Load templates from directory
    // Implementation would read .opencode/workflows/templates/
  }

  private extractKeywords(task: Task): string[] {
    // Extract keywords from task
    const text = `${task.title} ${task.description}`.toLowerCase();

    const keywords = text.match(/\b\w+\b/g) || [];

    return [...new Set(keywords)];
  }
}

interface WorkflowTemplate {
  template_id: string;
  name: string;
  description: string;
  pattern: WorkflowPattern;
  version: string;
  estimated_duration: string;
  agents: AgentAssignment[];
  success_criteria: SuccessCriteria[];
}

interface TemplateCustomizations {
  agents?: AgentAssignment[];
  success_criteria?: SuccessCriteria[];
  timeouts?: { [key: string]: string };
  customizations_applied?: boolean;
}
```

---

## Implementation Checklist

- [ ] Create WorkflowExecutor class
- [ ] Implement all workflow templates
- [ ] Create template manager
- [ ] Add template validation
- [ ] Create template loading mechanism
- [ ] Implement template customization
- [ ] Add template recommendations
- [ ] Create workflow monitoring
- [ ] Add error handling
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Create documentation
- [ ] Add examples
- [ ] Performance test templates

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-03 | Initial release with complete workflow templates |

---

**Related Documents:**
- [Handoff Protocol Specification](./01-handoff-protocol-specification.md)
- [Context Sharing Architecture](./02-context-sharing-architecture.md)
- [Implementation Guide](./06-implementation-guide.md)
- [Documentation](./08-documentation.md)
