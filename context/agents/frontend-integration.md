# Frontend Agent Context7 Integration Guide

<metadata>
version: "1.0.0"
last_updated: "2026-01-03"
dependencies: ["context:orchestration/context7-orchestration", "context:frontend/library-management"]
tags: ["context7", "agents", "integration", "frontend"]
category: "agents"
</metadata>

## Context
Defines how each of the 11 frontend design agents integrates with the unified Context7 orchestration system, including specialized usage patterns, library preferences, and workflow integration.

### Scope
- Integration patterns for all 11 agents
- Agent-specific Context7 usage guidelines
- Library preferences per agent
- Workflow integration examples

### Boundaries
- Does not replace individual agent workflows
- Does not define agent core functionality
- Does not specify non-Context7 tool usage

### Relationships
- context:orchestration/context7-orchestration - Universal usage standards
- context:frontend/library-management - Library hierarchy and priorities
- context:quality/context7-qa - Quality assurance for agent usage

---

## Agent Overview

The Frontend Design Agent System consists of:

```yaml
agents:
  orchestrator:
    role: "System coordination and delegation"
    context7_role: "Central coordination and optimization"

  specialists:
    - design_system_specialist
    - component_developer
    - performance_optimizer
    - accessibility_specialist
    - cross_platform_specialist
    - visual_designer
    - frontend_coder
    - code_reviewer
    - tester
    - documentation_specialist
```

---

## Orchestrator Agent

### Context7 Role
The orchestrator agent is the central hub for Context7 coordination across the entire system.

```yaml
orchestrator_context7_responsibilities:
  library_coordination:
    - "Maintains unified library priority list"
    - "Delegates Context7 queries to specialist agents"
    - "Optimizes Context7 usage across system"
    - "Resolves conflicting library requests"

  query_optimization:
    - "Refines user queries before routing"
    - "Combines related queries for efficiency"
    - "Filters redundant Context7 requests"
    - "Identifies cache reuse opportunities"

  quality_assurance:
    - "Monitors Context7 usage patterns"
    - "Tracks library query success rates"
    - "Identifies training opportunities"
    - "Suggests library additions/updates"

  system_integration:
    - "Ensures consistent Context7 usage"
    - "Updates agents on new libraries"
    - "Coordinates version updates"
    - "Manages cross-agent cache sharing"
```

### Usage Patterns

```yaml
orchestrator_patterns:
  delegation_workflow:
    step_1: "Receive user request"
    step_2: "Analyze for Context7 needs"
    step_3: "Resolve library ID if required"
    step_4: "Delegate to appropriate specialist"
    step_5: "Coordinate Context7 query execution"
    step_6: "Aggregate results and verify quality"

  optimization_workflow:
    step_1: "Identify multiple agents needing same library"
    step_2: "Execute Context7 query once"
    step_3: "Share results across agents"
    step_4: "Cache for future use"
```

---

## Design System Specialist

### Context7 Integration Focus

```yaml
design_system_specialist:
  primary_libraries:
    - Tailwind CSS
    - Radix UI
    - Framer Motion
    - CSS Variables

  context7_patterns:
    design_tokens:
      query: "How to implement design tokens with [Technology]"
      examples:
        - "Design tokens with CSS variables"
        - "Tailwind CSS custom properties for theming"
        - "Design token scalability patterns"

    component_architecture:
      query: "[Component Library] [Component] best practices for [Use Case]"
      examples:
        - "Radix UI Dialog composition patterns"
        - "shadcn/ui component customization"
        - "Component variant system design"

    theming_systems:
      query: "[Styling Library] theming for [Requirement]"
      examples:
        - "Tailwind CSS dark mode with system preferences"
        - "CSS variables for dynamic theming"
        - "Theme switching implementation patterns"

    animation_principles:
      query: "[Animation Library] [Pattern] for [Goal]"
      examples:
        - "Framer Motion layout animations"
        - "Micro-interaction patterns with Framer Motion"
        - "Animation performance best practices"

  workflow_integration:
    phase_research:
      - "Query design token implementation"
      - "Research component library patterns"
      - "Investigate theming approaches"

    phase_design:
      - "Reference animation patterns"
      - "Check accessibility implementations"
      - "Verify responsive design patterns"

    phase_implementation:
      - "Get component API references"
      - "Query styling configuration"
      - "Resolve specific implementation issues"
```

---

## Component Developer

### Context7 Integration Focus

```yaml
component_developer:
  primary_libraries:
    - React
    - Next.js
    - React Hook Form
    - Radix UI
    - React Query

  context7_patterns:
    component_implementation:
      query: "React [Component Type] implementation with [Feature]"
      examples:
        - "React functional component with TypeScript"
        - "React hooks patterns for form handling"
        - "Higher-order component patterns"

    data_integration:
      query: "[State Management] [Pattern] for [Data Flow]"
      examples:
        - "React Query useQuery with Next.js Server Components"
        - "Form state management with React Hook Form"
        - "Server state vs client state patterns"

    composition_patterns:
      query: "React composition patterns for [Use Case]"
      examples:
        - "Compound component pattern with Radix UI"
        - "Render props vs custom hooks"
        - "Component composition for UI libraries"

    typescript_integration:
      query: "TypeScript [Feature] with [Library]"
      examples:
        - "TypeScript generic components"
        - "React props typing best practices"
        - "Next.js TypeScript configuration"

  workflow_integration:
    phase_development:
      - "Get API references for components"
      - "Query hook patterns and usage"
      - "Research state management approaches"

    phase_refactoring:
      - "Compare implementation patterns"
      - "Query best practices for specific scenarios"
      - "Verify performance patterns"
```

---

## Performance Optimizer

### Context7 Integration Focus

```yaml
performance_optimizer:
  primary_libraries:
    - React DevTools
    - React Query
    - Next.js
    - Webpack Bundle Analyzer
    - Framer Motion

  context7_patterns:
  render_optimization:
    query: "React [Optimization Pattern] for [Use Case]"
    examples:
      - "React memo and useMemo patterns"
      - "React Server Components performance"
      - "Preventing unnecessary re-renders"

  data_fetching:
    query: "[Library] caching strategy for [Scenario]"
    examples:
      - "React Query cache invalidation patterns"
      - "Next.js data fetching performance"
      - "Optimistic updates with React Query"

  bundle_optimization:
    query: "[Build Tool] optimization for [Goal]"
    examples:
      - "Next.js bundle splitting strategies"
      - "Webpack Bundle Analyzer interpretation"
      - "Tree shaking best practices"

  animation_performance:
    query: "[Animation Library] performance optimization"
    examples:
      - "Framer Motion GPU acceleration"
      - "Animation performance patterns"
      - "Reducing animation jank"

  monitoring:
    query: "[Monitoring Tool] for [Metric]"
    examples:
      - "React DevTools profiler usage"
      - "Next.js analytics setup"
      - "Performance metrics interpretation"

  workflow_integration:
    phase_analysis:
      - "Query performance monitoring tools"
      - "Research optimization patterns"
      - "Get best practices for specific scenarios"

    phase_optimization:
      - "Reference API for optimization libraries"
      - "Query implementation examples"
      - "Verify optimization strategies"
```

---

## Accessibility Specialist

### Context7 Integration Focus

```yaml
accessibility_specialist:
  primary_libraries:
    - axe-core
    - Radix UI
    - Testing Library
    - React ARIA
    - lighthouse

  context7_patterns:
  a11y_implementation:
    query: "[Component Library] accessibility [Feature]"
    examples:
      - "Radix UI Dialog keyboard navigation"
      - "ARIA roles and attributes patterns"
      - "Focus management best practices"

  testing:
    query: "[Testing Library] accessibility testing [Pattern]"
    examples:
      - "Testing Library accessibility queries"
      - "axe-core integration with React"
      - "Automated accessibility testing setup"

  compliance:
    query: "WCAG [Level] compliance with [Technology]"
    examples:
      - "WCAG 2.1 AA compliance with React"
      - "Semantic HTML patterns for accessibility"
      - "Screen reader compatibility"

  remediation:
    query: "[Accessibility Issue] remediation [Pattern]"
    examples:
      - "Keyboard navigation trap fixes"
      - "Color contrast solutions"
      - "ARIA landmark implementation"

  workflow_integration:
    phase_review:
      - "Query accessibility patterns"
      - "Research compliance requirements"
      - "Get testing setup information"

    phase_fixing:
      - "Query remediation patterns"
      - "Reference component accessibility APIs"
      - "Verify WCAG compliance approaches"
```

---

## Cross-Platform Specialist

### Context7 Integration Focus

```yaml
cross_platform_specialist:
  primary_libraries:
    - Next.js
    - React
    - Tailwind CSS
    - Playwright
    - Modern browsers APIs

  context7_patterns:
  browser_compatibility:
    query: "[Technology] cross-browser [Feature]"
    examples:
      - "React cross-browser compatibility"
      - "Tailwind CSS vendor prefixes"
      - "CSS Grid fallback patterns"

  responsive_design:
    query: "[Styling Library] responsive [Pattern]"
    examples:
      - "Tailwind CSS mobile-first patterns"
      - "Responsive image optimization with Next.js"
      - "Breakpoint strategies"

  device_testing:
    query: "[Testing Tool] [Device Type] testing"
    examples:
      - "Playwright mobile testing patterns"
      - "Touch event handling with React"
      - "Viewport meta tag configuration"

  progressive_enhancement:
    query: "[Feature] progressive enhancement [Pattern]"
    examples:
      - "Feature detection with Modernizr"
      - "JavaScript graceful degradation"
      - "CSS feature queries support"

  workflow_integration:
    phase_testing:
      - "Query cross-browser testing tools"
      - "Research device compatibility patterns"
      - "Get viewport configuration guides"

    phase_optimization:
      - "Reference responsive design patterns"
      - "Query performance across devices"
      - "Verify compatibility APIs"
```

---

## Visual Designer (Accessibility + Visual)

### Context7 Integration Focus

```yaml
visual_designer:
  primary_libraries:
    - Framer Motion
    - Tailwind CSS
    - Radix UI
    - Color libraries (Chroma.js, etc.)

  context7_patterns:
  visual_effects:
    query: "[Animation Library] [Effect] implementation"
    examples:
      - "Framer Motion page transitions"
      - "Micro-interaction patterns"
      - "Loading state animations"

  accessibility_visuals:
    query: "[Effect] accessibility considerations"
    examples:
      - "Animation preference detection"
      - "Reduced motion implementation"
      - "High contrast mode support"

  color_systems:
    query: "[Color Tool] accessibility [Feature]"
    examples:
      - "Color contrast calculation"
      - "Accessible color palette generation"
      - "Dark mode color transitions"

  layout_systems:
    query: "[Layout System] responsive [Pattern]"
    examples:
      - "CSS Grid responsive layouts"
      - "Flexbox accessibility patterns"
      - "Container queries implementation"

  workflow_integration:
    phase_design:
      - "Query animation patterns"
      - "Research accessible visual effects"
      - "Get color system guidelines"

    phase_refinement:
      - "Reference visual effect APIs"
      - "Query accessibility visual standards"
      - "Verify responsive patterns"
```

---

## Frontend Coder

### Context7 Integration Focus

```yaml
frontend_coder:
  primary_libraries:
    - All framework libraries
    - Build tools (Vite, Webpack, esbuild)
    - TypeScript
    - ESLint/Prettier

  context7_patterns:
  setup_configuration:
    query: "[Library] setup for [Environment]"
    examples:
      - "Next.js TypeScript setup"
      - "Vite React configuration"
      - "ESLint rules for accessibility"

  coding_patterns:
    query: "[Language/Tool] [Pattern] implementation"
    examples:
      - "TypeScript generic patterns"
      - "React custom hook patterns"
      - "Async/await error handling"

  debugging:
    query: "[Issue] troubleshooting [Technology]"
    examples:
      - "React useEffect infinite loop causes"
      - "Next.js hydration errors"
      - "TypeScript type errors patterns"

  tooling_integration:
    query: "[Tool] [Feature] with [Framework]"
    examples:
      - "Webpack code splitting configuration"
      - "Vite plugin development"
      - "ESLint custom rules for React"

  workflow_integration:
    phase_development:
      - "Query setup and configuration"
      - "Get coding patterns and best practices"
      - "Research tooling integrations"

    phase_debugging:
      - "Query troubleshooting guides"
      - "Reference debugging tools"
      - "Get error pattern solutions"
```

---

## Code Reviewer

### Context7 Integration Focus

```yaml
code_reviewer:
  primary_libraries:
    - All framework libraries
    - ESLint/Prettier
    - TypeScript
    - Security libraries

  context7_patterns:
  best_practices:
    query: "[Library] best practices for [Pattern]"
    examples:
      - "React component best practices"
      - "TypeScript typing patterns"
      - "Next.js security best practices"

  security_patterns:
    query: "[Framework] security [Vulnerability]"
    examples:
      - "XSS prevention in React"
      - "Next.js security headers"
      - "Authentication patterns"

  performance_patterns:
    query: "[Code Pattern] performance implications"
    examples:
      - "React render performance patterns"
      - "Bundle size optimization"
      - "Memory leak patterns"

  linting_standards:
    query: "[Linting Tool] rules for [Goal]"
    examples:
      - "ESLint React a11y rules"
      - "TypeScript strict mode patterns"
      - "Prettier configuration standards"

  workflow_integration:
    phase_review:
      - "Query best practices for code patterns"
      - "Reference security guidelines"
      - "Get performance optimization suggestions"

    phase_feedback:
      - "Query alternative implementations"
      - "Reference documentation for suggestions"
      - "Verify best practice compliance"
```

---

## Tester (TDD Agent)

### Context7 Integration Focus

```yaml
tester:
  primary_libraries:
    - Jest
    - Testing Library
    - Playwright
    - MSW (Mock Service Worker)
    - React Testing Library

  context7_patterns:
  unit_testing:
    query: "[Testing Framework] [Test Type] patterns"
    examples:
      - "Jest async testing patterns"
      - "Testing Library component testing"
      - "Custom React hook testing"

  integration_testing:
    query: "[Testing Tool] integration [Scenario]"
    examples:
      - "React Query cache testing with MSW"
      - "Form validation testing"
      - "API integration testing"

  e2e_testing:
    query: "[E2E Tool] [User Flow] testing"
    examples:
      - "Playwright form submission testing"
      - "Multi-page navigation testing"
      - "Authentication flow testing"

  accessibility_testing:
    query: "[Testing Library] a11y testing [Pattern]"
    examples:
      - "axe-core automated testing"
      - "Keyboard navigation testing"
      - "Screen reader testing"

  workflow_integration:
    phase_test_development:
      - "Query testing patterns"
      - "Get API references for testing libraries"
      - "Research mocking strategies"

    phase_execution:
      - "Query debugging test failures"
      - "Reference testing tool documentation"
      - "Verify test coverage patterns"
```

---

## Documentation Specialist

### Context7 Integration Focus

```yaml
documentation_specialist:
  primary_libraries:
    - All framework documentation
    - JSDoc/TypeDoc
    - Storybook
    - VitePress/Docusaurus

  context7_patterns:
  api_documentation:
    query: "[Library] API documentation [Format]"
    examples:
      - "React component documentation patterns"
      - "TypeScript JSDoc patterns"
      - "API documentation best practices"

  storybook_integration:
    query: "Storybook [Feature] for [Component Type]"
    examples:
      - "Storybook addon patterns"
      - "Storybook for React components"
      - "Storybook accessibility testing"

  docs_generation:
    query: "[Doc Tool] [Feature] setup"
    examples:
      - "Docusaurus React integration"
      - "VitePress configuration"
      - "TypeDoc TypeScript documentation"

  documentation_patterns:
    query: "Technical writing patterns for [Audience]"
    examples:
      - "Developer documentation best practices"
      - "API documentation structure"
      - "Component documentation patterns"

  workflow_integration:
    phase_creation:
      - "Query documentation patterns"
      - "Get tooling setup guides"
      - "Research best practices"

    phase_refinement:
      - "Reference documentation standards"
      - "Query specific documentation formats"
      - "Verify clarity and completeness"
```

---

## Cross-Agent Context7 Coordination

```yaml
coordination_patterns:
  shared_caching:
    policy: "Critical libraries cached for all agents"
    libraries:
      - "/facebook/react"
      - "/vercel/next.js"
      - "/tanstack/react-query"
      - "/tailwindlabs/tailwindcss"

  query_deduplication:
    orchestrator_role: "Identify and combine similar queries"
    example: "Multiple agents query Next.js routing → Single query, shared results"

  knowledge_sharing:
    mechanism: "Agent-to-agent Context7 insights"
    process:
      1: "Specialist queries Context7"
      2: "Results captured and shared"
      3: "Orchestrator maintains knowledge base"
      4: "Other agents access shared insights"

  workflow_integration:
    sequential: "Agent A queries → Results inform Agent B"
    parallel: "Multiple agents query same library → Coordinated by orchestrator"
    iterative: "Query → Implementation → Refine → Re-query"
```

---

## Agent-Specific Context7 Triggers

```yaml
agent_triggers:
  design_system_specialist:
    triggers:
      - "design tokens"
      - "component variants"
      - "theming"
      - "design patterns"
    priority_libraries: [Tailwind CSS, Radix UI, Framer Motion]

  component_developer:
    triggers:
      - "component implementation"
      - "hooks patterns"
      - "composition"
      - "data flow"
    priority_libraries: [React, Next.js, React Query]

  performance_optimizer:
    triggers:
      - "optimization"
      - "caching"
      - "bundle size"
      - "rendering"
    priority_libraries: [React DevTools, React Query, Next.js]

  accessibility_specialist:
    triggers:
      - "WCAG"
      - "ARIA"
      - "keyboard navigation"
      - "screen reader"
    priority_libraries: [axe-core, Radix UI, Testing Library]

  cross_platform_specialist:
    triggers:
      - "cross-browser"
      - "responsive"
      - "mobile"
      - "viewport"
    priority_libraries: [Next.js, Tailwind CSS, Playwright]

  visual_designer:
    triggers:
      - "animation"
      - "visual effects"
      - "color"
      - "micro-interactions"
    priority_libraries: [Framer Motion, Tailwind CSS]

  frontend_coder:
    triggers:
      - "setup"
      - "configuration"
      - "troubleshooting"
      - "pattern"
    priority_libraries: [All framework libraries, Build tools]

  code_reviewer:
    triggers:
      - "best practices"
      - "security"
      - "performance"
      - "linting"
    priority_libraries: [All framework libraries, ESLint, TypeScript]

  tester:
    triggers:
      - "test pattern"
      - "mocking"
      - "assertion"
      - "coverage"
    priority_libraries: [Jest, Testing Library, Playwright, MSW]

  documentation_specialist:
    triggers:
      - "documentation pattern"
      - "JSDoc"
      - "Storybook"
      - "docs generation"
    priority_libraries: [Storybook, TypeDoc, Docusaurus]
```

---

## Quality Metrics by Agent

```yaml
agent_quality_metrics:
  query_success_rate:
    target: "95%+"
    measurement: "Relevant documentation returned"

  implementation_accuracy:
    target: "90%+"
    measurement: "Code matches Context7 documentation"

  documentation_compliance:
    target: "100%"
    measurement: "Follows documented best practices"

  cache_hit_rate:
    target: "40%+"
    measurement: "Reusable Context7 results"
```
