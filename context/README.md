# Context7 Orchestration System for Frontend Design Agent System

<metadata>
version: "1.0.0"
last_updated: "2026-01-03"
dependencies: []
tags: ["context7", "orchestration", "frontend", "index"]
category: "system"
</metadata>

## Overview

This system provides a unified Context7 orchestration layer for the Frontend Design Agent System, centralizing library management and providing consistent documentation access across all 11 agents (1 orchestrator + 10 specialists).

### System Purpose

The Context7 Orchestration System eliminates redundancy and ensures consistency by:

1. **Centralizing Library Management** - Single source of truth for library priorities and documentation access
2. **Standardizing Usage Patterns** - Consistent Context7 trigger definitions and query formats across all agents
3. **Optimizing Performance** - Shared caching, query deduplication, and efficient library resolution
4. **Ensuring Quality** - Comprehensive QA framework for monitoring and improving Context7 usage

### System Components

```
Context7 Orchestration System
│
├── Core Foundation
│   └── context7-essential-patterns.md
│       └── Foundational patterns and universal Context7 usage
│
├── Orchestration Layer
│   └── context7-orchestration.md
│       └── System-wide Context7 coordination and standards
│
├── Library Management
│   └── frontend/library-management.md
│       └── Library priorities, hierarchies, and management
│
├── Agent Integration
│   └── agents/frontend-integration.md
│       └── How each agent uses the unified Context7 system
│
└── Quality Assurance
    └── quality/context7-qa.md
        └── Monitoring, validation, and continuous improvement
```

---

## Quick Start Guide

### For New Users

1. **Start with Essentials**: Read `context/core/context7-essential-patterns.md`
   - Learn the standard Context7 tool chain
   - Understand automatic trigger patterns
   - Master query construction fundamentals

2. **Understand the System**: Read `context/orchestration/context7-orchestration.md`
   - Learn how Context7 is orchestrated across the system
   - Understand automated triggers and fallback strategies
   - Review caching and usage patterns

3. **Explore Libraries**: Read `context/frontend/library-management.md`
   - See library priority hierarchy
   - Find essential library identifiers
   - Understand version management strategies

4. **Agent Integration**: Read `context/agents/frontend-integration.md`
   - Learn how each agent uses Context7
   - Review agent-specific patterns
   - Understand cross-agent coordination

5. **Quality Assurance**: Read `context/quality/context7-qa.md`
   - Understand quality metrics and monitoring
   - Learn validation and improvement processes
   - Review quality checklists

### For Orchestrator Agent

The orchestrator agent should reference:

1. **Orchestration Layer**: Central coordination responsibilities
2. **Agent Integration**: Understanding all specialist agent needs
3. **Quality Assurance**: System-wide monitoring and optimization
4. **Library Management**: Maintaining library priorities

### For Specialist Agents

Each specialist agent should reference:

1. **Essential Patterns**: Universal Context7 usage patterns
2. **Agent Integration**: Their specific integration patterns and library preferences
3. **Library Management**: Priority libraries relevant to their domain
4. **Quality Assurance**: Quality metrics for their Context7 usage

---

## System Architecture

### Dependency Graph

```yaml
context7_system:
  root:
    - "context/core/context7-essential-patterns.md"

  orchestration:
    depends_on: "essential_patterns"
    provides:
      - "Universal usage standards"
      - "Automated trigger patterns"
      - "Tool chain execution"

  library_management:
    depends_on: "orchestration"
    provides:
      - "Library priorities"
      - "Common identifiers"
      - "Version strategies"

  agent_integration:
    depends_on: ["orchestration", "library_management"]
    provides:
      - "Agent-specific patterns"
      - "Library preferences per agent"
      - "Cross-agent coordination"

  quality_assurance:
    depends_on: ["orchestration", "library_management", "agent_integration"]
    provides:
      - "Quality metrics"
      - "Monitoring framework"
      - "Improvement processes"
```

### Data Flow

```
User Request
    ↓
Orchestrator Agent
    ↓
Context7 Essential Patterns (Universal)
    ↓
Library Management (Identify Library)
    ↓
Orchestration Layer (Execute Query)
    ↓
Documentation Retrieved
    ↓
Specialist Agent (Apply to Task)
    ↓
Quality Assurance (Monitor & Validate)
```

---

## File Structure

```
.opencode/context/
│
├── README.md (this file)
│
├── core/
│   └── context7-essential-patterns.md
│       └── Foundational Context7 patterns and usage
│
├── orchestration/
│   └── context7-orchestration.md
│       └── Central orchestration layer and system standards
│
├── frontend/
│   └── library-management.md
│       └── Frontend library priorities and management
│
├── agents/
│   └── frontend-integration.md
│       └── Agent-specific Context7 integration patterns
│
└── quality/
    └── context7-qa.md
        └── Quality assurance framework and metrics
```

---

## Key Features

### 1. Centralized Library Management

**Problem**: Each agent had duplicate Context7 trigger definitions and library priorities.

**Solution**: Single source of truth for all library information.

**Benefits**:
- Eliminates redundancy
- Ensures consistency
- Easy updates and maintenance
- Optimized caching strategy

### 2. Automated Context7 Triggers

**Problem**: Inconsistent trigger patterns across agents.

**Solution**: Universal trigger definitions with automatic activation.

**Benefits**:
- Predictable Context7 usage
- Automatic documentation access
- Reduced manual intervention
- Consistent user experience

### 3. Agent Integration Patterns

**Problem**: Each agent used Context7 differently with no coordination.

**Solution**: Standardized integration patterns with agent-specific customizations.

**Benefits**:
- Shared knowledge and patterns
- Agent-specific optimizations
- Cross-agent coordination
- Efficient query routing

### 4. Quality Assurance Framework

**Problem**: No monitoring or validation of Context7 usage quality.

**Solution**: Comprehensive QA framework with continuous improvement.

**Benefits**:
- Quality metrics and monitoring
- Validation and verification
- Continuous improvement
- Agent training opportunities

---

## Standard Context7 Workflow

### Universal Pattern

```
1. Detect Trigger (Automatic)
   ├─ Documentation queries
   ├─ Framework questions
   ├─ Library setup
   └─ Code example requests

2. Resolve Library (resolve-library-id)
   ├─ Exact name match
   ├─ Common aliases
   └─ Fallback strategies

3. Query Documentation (context7_query-docs)
   ├─ Specific query construction
   ├─ Include use case context
   └─ Specify version if needed

4. Review Results
   ├─ Verify relevance
   ├─ Check accuracy
   └─ Confirm completeness

5. Apply to Task
   ├─ Follow documented patterns
   ├─ Adapt to use case
   └─ Validate with project code

6. Optional: Cache
   └─ Save for reuse in session
```

### Example Flow

```
User: "How do I use React Query cache invalidation for user profile updates?"

1. Trigger Detection: ✓ (documentation query)
2. Library Resolution: React Query → /tanstack/react-query
3. Documentation Query: "useQuery cache invalidation for profile updates"
4. Review Results: Cache invalidation patterns and examples
5. Apply to Task: Implement with current project patterns
6. Cache Results: Save for similar queries
```

---

## Agent Overview

### Orchestrator Agent

**Role**: Central coordination and optimization

**Context7 Responsibilities**:
- Coordinate Context7 usage across all agents
- Optimize queries and prevent redundancy
- Maintain library priority list
- Monitor quality and suggest improvements

**Primary Libraries**: All critical libraries

### Specialist Agents (10)

1. **Design System Specialist**
   - Focus: Design tokens, component architecture, theming, animation
   - Primary Libraries: Tailwind CSS, Radix UI, Framer Motion

2. **Component Developer**
   - Focus: Component implementation, hooks, composition, TypeScript
   - Primary Libraries: React, Next.js, React Hook Form

3. **Performance Optimizer**
   - Focus: Render optimization, caching, bundles, animations
   - Primary Libraries: React DevTools, React Query, Next.js

4. **Accessibility Specialist**
   - Focus: ARIA, keyboard navigation, screen readers, WCAG
   - Primary Libraries: axe-core, Radix UI, Testing Library

5. **Cross-Platform Specialist**
   - Focus: Browser compatibility, responsive design, device testing
   - Primary Libraries: Next.js, Tailwind CSS, Playwright

6. **Visual Designer**
   - Focus: Visual effects, animations, colors, layouts
   - Primary Libraries: Framer Motion, Tailwind CSS

7. **Frontend Coder**
   - Focus: Setup, configuration, coding patterns, debugging
   - Primary Libraries: All framework libraries, Build tools

8. **Code Reviewer**
   - Focus: Best practices, security, performance, linting
   - Primary Libraries: All framework libraries, ESLint, TypeScript

9. **Tester (TDD Agent)**
   - Focus: Unit tests, integration tests, E2E tests, accessibility tests
   - Primary Libraries: Jest, Testing Library, Playwright, MSW

10. **Documentation Specialist**
    - Focus: API documentation, Storybook, doc generation, writing
    - Primary Libraries: Storybook, TypeDoc, Docusaurus

---

## Library Priority Levels

### Critical (Core Frameworks)

- React (/facebook/react)
- Next.js (/vercel/next.js)
- React Query (/tanstack/react-query)
- Zustand (/pmndrs/zustand)
- React Router (/remix-run/react-router)

### High (Ecosystem Libraries)

- Tailwind CSS (/tailwindlabs/tailwindcss)
- Framer Motion (/framer/motion)
- React Hook Form (/react-hook-form/react-hook-form)
- Radix UI (/radix-ui/primitives)
- shadcn/ui (/shadcn-ui/ui)

### Medium (Specialized Libraries)

- Jest (/jestjs/jest)
- Testing Library (/testing-library/react-testing-library)
- Playwright (/playwright/playwright)
- axe-core (/dequelabs/axe-core)

---

## Query Quality Levels

### Excellent (95-100%)

**Pattern**: Specific feature + Clear use case + Context

**Examples**:
- "React Query useQuery cache invalidation for user profile updates"
- "Next.js App Router Server Components data fetching with TypeScript"
- "Tailwind CSS dark mode with system preference detection"

### Good (80-94%)

**Pattern**: Specific feature + Some context

**Examples**:
- "React Query cache invalidation"
- "Next.js Server Components data fetching"
- "Tailwind CSS dark mode"

### Needs Improvement (<80%)

**Pattern**: Vague or too broad

**Examples**:
- "React Query"
- "Next.js data fetching"
- "Tailwind theming"

---

## Quality Metrics

### System-Wide Metrics

- **Query Success Rate**: Target 95%+
- **Documentation Relevance**: Target 90%+
- **Implementation Accuracy**: Target 90%+
- **Cache Hit Rate**: Target 40%+

### Agent-Specific Metrics

- **Orchestrator**: Coordination efficiency 98%
- **Design System Specialist**: Query success 94%
- **Component Developer**: Query success 95%
- **Performance Optimizer**: Query success 93%
- **Accessibility Specialist**: Query success 96%
- Other specialist agents: 91-95% success rates

---

## Common Use Cases

### Use Case 1: New Feature Implementation

```
1. Orchestrator receives request
2. Orchestrator resolves library
3. Specialist agent queries Context7
4. Specialist reviews documentation
5. Specialist implements following patterns
6. Code reviewer validates compliance
```

### Use Case 2: Performance Optimization

```
1. Performance optimizer identifies issue
2. Queries Context7 for optimization patterns
3. Reviews best practices and APIs
4. Applies optimizations
5. Monitors impact
6. Documents improvements
```

### Use Case 3: Accessibility Review

```
1. Accessibility specialist reviews code
2. Queries Context7 for ARIA patterns
3. Validates WCAG compliance
4. Checks with testing library
5. Suggests improvements
6. Verifies fixes
```

---

## Maintenance and Updates

### Regular Updates

- **Daily**: Monitoring metrics and performance
- **Weekly**: Pattern analysis and optimization
- **Monthly**: Quality review and library updates
- **Quarterly**: Comprehensive system review

### Update Triggers

- New library versions released
- Agent feedback on query patterns
- Quality metrics below threshold
- New agent requirements identified

### Update Process

1. Identify update need (metrics, feedback, requests)
2. Analyze impact on agents and workflows
3. Implement changes in appropriate context file
4. Test with sample queries
5. Deploy and monitor
6. Validate improvement

---

## Troubleshooting

### Common Issues

**Issue**: Library not found in resolution

**Solution**:
1. Try alternate library names
2. Check for framework-specific naming
3. Use fallback strategies
4. Update library management if needed

**Issue**: Query returns irrelevant results

**Solution**:
1. Refine query with more specificity
2. Add use case context
3. Include version if relevant
4. Split into multiple queries

**Issue**: Documentation doesn't match project version

**Solution**:
1. Check package.json for version
2. Specify version in query
3. Look for migration guides
4. Note version differences in response

---

## Best Practices

### For All Agents

1. **Always resolve library first** - Never skip library ID resolution
2. **Be specific in queries** - Include context, use case, and desired output
3. **Cache when appropriate** - Reuse documentation within sessions
4. **Combine with other tools** - Context7 + file editing + code review
5. **Handle failures gracefully** - Use fallback strategies and inform user
6. **Document version differences** - Note when using non-latest versions
7. **Monitor usage patterns** - Identify common queries and optimize

### Do's and Don'ts

**Do**:
- ✓ Resolve library ID before querying docs
- ✓ Use specific, contextual queries
- ✓ Check existing code before implementing
- ✓ Cache frequently used documentation
- ✓ Follow the standard tool chain
- ✓ Handle missing libraries gracefully

**Don't**:
- ✗ Skip library resolution step
- ✗ Use vague, broad queries
- ✗ Assume latest version without checking
- ✗ Duplicate identical Context7 queries
- ✗ Ignore fallback strategies
- ✗ Implement without verifying API

---

## Quick Reference

### Essential Library IDs

```yaml
Frameworks:
  React: /facebook/react
  Next.js: /vercel/next.js
  Vue: /vuejs/core

State Management:
  React Query: /tanstack/react-query
  Zustand: /pmndrs/zustand

Styling:
  Tailwind CSS: /tailwindlabs/tailwindcss

Testing:
  Jest: /jestjs/jest
  Testing Library: /testing-library/react-testing-library
  Playwright: /playwright/playwright

Forms:
  React Hook Form: /react-hook-form/react-hook-form

Animation:
  Framer Motion: /framer/motion

Accessibility:
  axe-core: /dequelabs/axe-core
```

### Query Templates

```
API Reference: [Library] [Feature] API reference
Implementation: How to implement [Feature] with [Library] for [Use Case]
Best Practices: [Library] best practices for [Use Case]
Troubleshooting: [Library] [Issue] troubleshooting and solutions
Comparison: Compare [Library A] vs [Library B] for [Use Case]
```

### Standard Flow

```
User Request → Trigger Detection → Library Resolution
                                                ↓
                                    Documentation Query
                                                ↓
                                    Review Results
                                                ↓
                                    Apply to Task
                                                ↓
                                    Optional: Cache
```

---

## Support and Feedback

### Getting Help

1. Check this README and context files
2. Review agent-specific integration guide
3. Consult library management for priorities
4. Refer to quality assurance for metrics

### Providing Feedback

- Quality metrics below expected thresholds
- Suggested library additions
- Query pattern improvements
- Agent-specific requirements

---

## Version History

- **v1.0.0** (2026-01-03): Initial release
  - Core orchestration system
  - Library management framework
  - Agent integration patterns
  - Quality assurance framework

---

## Contributing

When contributing improvements:

1. Update the appropriate context file
2. Maintain dependency relationships
3. Update version and last_updated metadata
4. Test with sample queries
5. Document changes in commit message
