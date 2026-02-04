# Frontend Library Management System

<metadata>
version: "1.0.0"
last_updated: "2026-01-03"
dependencies: ["context:orchestration/context7-orchestration"]
tags: ["context7", "libraries", "frontend", "priority"]
category: "frontend"
</metadata>

## Context
Centralized library management system defining the priority hierarchy, categorization, and documentation strategies for all frontend libraries used by the Frontend Design Agent System.

### Scope
- Frontend framework libraries and ecosystem
- Testing and development tools
- Performance and security libraries
- Build tools and tooling
- Documentation sources and aliases

### Boundaries
- Backend libraries (handled by separate systems)
- DevOps/infrastructure tools
- Mobile development (React Native)
- Non-frontend web technologies

### Relationships
- context:orchestration/context7-orchestration - Usage standards and patterns
- context:agents/frontend-integration - Agent-specific library needs
- context:quality/context7-qa - Library quality validation

---

## Library Priority Hierarchy

### Critical Priority (Core Frameworks)
These libraries are most frequently used and should always be cached.

```yaml
critical_libraries:
  frameworks:
    - name: "React"
      context7_id: "/facebook/react"
      versions: ["18.x", "19.x"]
      usage: "Core UI framework for all React-based projects"
      common_queries:
        - "React hooks (useState, useEffect, useContext, etc.)"
        - "Component patterns (composition, higher-order, render props)"
        - "State management patterns"
        - "Performance optimization"
        - "React 18 concurrent features"

    - name: "Next.js"
      context7_id: "/vercel/next.js"
      versions: ["14.x", "15.x"]
      usage: "Full-stack React framework"
      common_queries:
        - "Routing (App Router, Pages Router)"
        - "Server Components vs Client Components"
        - "Data fetching (getStaticProps, getServerSideProps, fetch)"
        - "API routes"
        - "Image optimization"
        - "Authentication patterns"
        - "Deployment and Vercel integration"

  state_management:
    - name: "React Query"
      context7_id: "/tanstack/react-query"
      versions: ["5.x"]
      aliases: ["TanStack Query", "RQ"]
      usage: "Server state management"
      common_queries:
        - "useQuery for data fetching"
        - "useMutation for mutations"
        - "Query caching and invalidation"
        - "Pagination and infinite queries"
        - "Optimistic updates"
        - "DevTools integration"

    - name: "Zustand"
      context7_id: "/pmndrs/zustand"
      versions: ["4.x", "5.x"]
      usage: "Lightweight state management"
      common_queries:
        - "Create stores with Zustand"
        - "State slices and middleware"
        - "DevTools integration"
        - "TypeScript integration"
        - "Persistence middleware"

  routing:
    - name: "React Router"
      context7_id: "/remix-run/react-router"
      versions: ["6.x"]
      usage: "Client-side routing"
      common_queries:
        - "Route configuration"
        - "Nested routes"
        - "Data loaders and actions"
        - "Navigation hooks (useNavigate, useParams)"
        - "Route protection and auth"
```

### High Priority (Ecosystem Libraries)
Frequently used libraries with strong integration needs.

```yaml
high_priority_libraries:
  styling:
    - name: "Tailwind CSS"
      context7_id: "/tailwindlabs/tailwindcss"
      versions: ["3.x", "4.x"]
      usage: "Utility-first CSS framework"
      common_queries:
        - "Responsive design patterns"
        - "Custom configuration"
        - "Dark mode implementation"
        - "Animation utilities"
        - "Component variants"
        - "Integration with React"

    - name: "Framer Motion"
      context7_id: "/framer/motion"
      versions: ["11.x", "12.x"]
      usage: "Animation library"
      common_queries:
        - "Component animation"
        - "Layout animations"
        - "Gestures (drag, hover, tap)"
        - "Scroll animations"
        - "Variants and transitions"
        - "Performance optimization"

  forms:
    - name: "React Hook Form"
      context7_id: "/react-hook-form/react-hook-form"
      versions: ["7.x"]
      usage: "Form management"
      common_queries:
        - "Form setup and validation"
        - "Schema validation (Zod, Yup)"
        - "Dynamic forms"
        - "Form state management"
        - "Integration with UI libraries"
        - "Performance optimization"

  ui_components:
    - name: "Radix UI"
      context7_id: "/radix-ui/primitives"
      versions: ["latest"]
      usage: "Headless UI components"
      common_queries:
        - "Dialog, Dropdown, Popover components"
        - "Accessibility features"
        - "Customization and styling"
        - "Animation patterns"
        - "Composition patterns"

    - name: "shadcn/ui"
      context7_id: "/shadcn-ui/ui"
      versions: ["latest"]
      usage: "Component library built on Radix UI"
      common_queries:
        - "Installation and setup"
        - "Adding components"
        - "Customization and theming"
        - "TypeScript configuration"
        - "Dark mode setup"
```

### Medium Priority (Specialized Libraries)
Libraries used for specific use cases.

```yaml
medium_priority_libraries:
  testing:
    - name: "Jest"
      context7_id: "/jestjs/jest"
      versions: ["29.x"]
      usage: "JavaScript testing framework"
      common_queries:
        - "Test configuration"
        - "Testing React components"
        - "Mocking and spies"
        - "Async testing"
        - "Coverage configuration"

    - name: "Testing Library"
      context7_id: "/testing-library/react-testing-library"
      versions: ["14.x", "15.x"]
      aliases: ["React Testing Library", "RTL"]
      usage: "React component testing"
      common_queries:
        - "Render and screen queries"
        - "User interaction testing"
        - "Accessibility queries"
        - "Testing async behavior"
        - "Custom render functions"

  performance:
    - name: "React DevTools"
      context7_id: "/facebook/react"
      query_pattern: "React DevTools profiling"
      usage: "React performance debugging"
      common_queries:
        - "Component profiling"
        - "Rendering optimization"
        - "Memo and useMemo patterns"
        - "Identifying unnecessary renders"

    - name: "Webpack Bundle Analyzer"
      context7_id: "/webpack-contrib/webpack-bundle-analyzer"
      usage: "Bundle size analysis"
      common_queries:
        - "Setup and configuration"
        - "Interpreting results"
        - "Bundle optimization"
        - "Code splitting strategies"

  accessibility:
    - name: "axe-core"
      context7_id: "/dequelabs/axe-core"
      usage: "Accessibility testing"
      common_queries:
        - "Integration with React"
        - "Automated testing"
        - "Common accessibility issues"
        - "WCAG compliance"
```

### Category-Based Library Groups

#### Framework Ecosystem
```yaml
framework_ecosystem:
  react:
    core: "/facebook/react"
    router: "/remix-run/react-router"
    nextjs: "/vercel/next.js"
    remix: "/remix-run/remix"
    gatsby: "/gatsbyjs/gatsby"

  vue:
    core: "/vuejs/core"
    router: "/vuejs/router"
    state: "/pinia/pinia"
    next: "/vuejs/vue-next"

  svelte:
    core: "/sveltejs/svelte"
    kit: "/sveltejs/kit"
```

#### State Management
```yaml
state_management:
  server_state:
    - "/tanstack/react-query"
    - "/vercel/swr"

  client_state:
    - "/pmndrs/zustand"
    - "/reduxjs/redux"
    - "/reduxjs/redux-toolkit"
    - "@recoiljs/recoil"

  forms:
    - "/react-hook-form/react-hook-form"
    - "@formkit/vue"
```

#### Styling
```yaml
styling_libraries:
  utility_first:
    - "/tailwindlabs/tailwindcss"
    - "/antfu/unocss"

  css_in_js:
    - "/emotion-js/emotion"
    - "/styled-components/styled-components"

  component_libraries:
    - "/mui/material-ui"
    - "@nextui-org/react"
    - "@chakra-ui/chakra-ui"
```

#### Animation
```yaml
animation_libraries:
  - "/framer/motion"
  - "@react-spring/react-spring"
  - "/animejs/animejs"
```

---

## Library Usage Patterns

### Query Construction Guide

```yaml
query_construction:
  framework_queries:
    pattern: "[Framework] [Feature] for [Use Case]"
    examples:
      - "Next.js API routes for RESTful APIs"
      - React Server Components for data fetching"
      - "React Router v6 nested routes for e-commerce"

  component_queries:
    pattern: "[Component Library] [Component] with [Requirement]"
    examples:
      - "Radix UI Dialog with form integration"
      - "shadcn/ui Select with async options"
      - "Radix UI Accordion accessibility features"

  state_management_queries:
    pattern: "[Library] [Pattern] for [Scenario]"
    examples:
      - "React Query cache invalidation for user profile updates"
      - "Zustand persistence middleware for auth state"
      - "React Context vs Zustand for theme management"

  styling_queries:
    pattern: "[Styling Library] [Feature] [Goal]"
    examples:
      - "Tailwind CSS responsive breakpoints for mobile-first design"
      - "Framer Motion layout animations for smooth transitions"
      - "Radix UI theming with CSS variables"
```

### Agent-Specific Library Focus

```yaml
agent_library_focus:
  design_system_specialist:
    primary:
      - Tailwind CSS
      - Radix UI
      - Framer Motion
    focus: "Component patterns and design tokens"

  component_developer:
    primary:
      - React
      - Next.js
      - React Hook Form
    focus: "Component implementation and patterns"

  performance_optimizer:
    primary:
      - React DevTools
      - React Query
      - Next.js
    focus: "Performance optimization techniques"

  accessibility_specialist:
    primary:
      - axe-core
      - Radix UI
      - Testing Library
    focus: "Accessibility compliance and testing"

  cross_platform_specialist:
    primary:
      - Next.js
      - React
      - Tailwind CSS
    focus: "Cross-browser and cross-device compatibility"
```

---

## Version Management Strategy

```yaml
version_management:
  default_versions:
    React: "18.x"
    Next.js: "14.x"
    React Query: "5.x"
    Tailwind CSS: "3.x"

  version_detection:
    automatic:
      - "Parse package.json"
      - "Check lock files"
      - "Analyze import patterns"
    manual:
      - "Ask user for version"
      - "Search for version comments"

  compatibility_matrix:
    React_18:
      Next.js: ["13.x", "14.x"]
      React_Query: ["4.x", "5.x"]
      React_Router: ["6.x"]

    React_19:
      Next.js: ["14.x", "15.x"]
      React_Query: ["5.x"]
      React_Router: ["6.x"]

  migration_guides:
    priorities:
      - "Next.js Pages to App Router"
      - "React 18 to React 19"
      - "React Router v5 to v6"
```

---

## Library Quality Indicators

```yaml
quality_indicators:
  documentation_quality:
    excellent:
      - "Comprehensive code examples"
      - "Multiple use cases"
      - "API reference complete"
      - "Updated within 6 months"
    good:
      - "Basic code examples"
      - "Core use cases"
      - "API reference available"
    needs_review:
      - "Outdated examples"
      - "Limited use cases"
      - "Missing API reference"

  maintenance_status:
    active:
      - "Recent commits (<3 months)"
      - "Active issues/discussions"
      - "Regular releases"
    stable:
      - "Mature library"
      - "Bug fixes only"
      - "Slow release cycle"
    deprecated:
      - "Official deprecation notice"
      - "No commits >1 year"
      - "Security vulnerabilities"
```

---

## Library Usage Statistics

```yaml
usage_tracking:
  most_queried:
    - Next.js: 35%
    - React: 25%
    - React Query: 15%
    - Tailwind CSS: 10%
    - Radix UI: 8%
    - Other: 7%

  query_categories:
    API_reference: 40%
    Setup_configuration: 25%
    Best_practices: 15%
    Troubleshooting: 12%
    Comparison: 8%

  agent_usage:
    component_developer: 30%
    design_system_specialist: 25%
    performance_optimizer: 15%
    accessibility_specialist: 12%
    cross_platform_specialist: 10%
    orchestrator: 8%
```

---

## Library Resolution Rules

```yaml
resolution_rules:
  primary_resolution:
    method: "Exact name match"
    priority: "Highest"
    examples:
      - "Next.js" → "/vercel/next.js"
      - "React" → "/facebook/react"

  secondary_resolution:
    method: "Known aliases"
    priority: "High"
    examples:
      - "RQ" → "/tanstack/react-query"
      - "RTL" → "/testing-library/react-testing-library"

  tertiary_resolution:
    method: "Framework category"
    priority: "Medium"
    examples:
      - "React router" → "/remix-run/react-router"
      - "State management" → Suggest based on use case

  fallback_resolution:
    method: "Web search + Context7 generic query"
    priority: "Low"
    examples:
      - Unknown library → Search web, then try closest match
```

---

## Library Caching Policy

```yaml
caching_policy:
  always_cache:
    - "/facebook/react"
    - "/vercel/next.js"
    - "/tanstack/react-query"
    - "/tailwindlabs/tailwindcss"
    - "/radix-ui/primitives"

  cache_duration:
    critical: "24 hours"
    high_priority: "12 hours"
    medium_priority: "6 hours"

  cache_refresh:
    triggers:
      - "Explicit version request"
      - "Breaking changes query"
      - "User request for fresh docs"

  cache_key:
    format: "{library_id}:{version}:{primary_topic}"
    example: "/vercel/next.js:14:server-components"
```

---

## Quick Reference: Common Context7 Library IDs

```yaml
common_library_ids:
  frameworks:
    React: "/facebook/react"
    Next.js: "/vercel/next.js"
    Vue: "/vuejs/core"
    Svelte: "/sveltejs/svelte"
    Remix: "/remix-run/remix"

  routing:
    React Router: "/remix-run/react-router"
    Next.js Router: "/vercel/next.js"

  state_management:
    React Query: "/tanstack/react-query"
    Zustand: "/pmndrs/zustand"
    Redux Toolkit: "/reduxjs/redux-toolkit"

  styling:
    Tailwind CSS: "/tailwindlabs/tailwindcss"
    Emotion: "/emotion-js/emotion"
    Styled Components: "/styled-components/styled-components"

  components:
    Radix UI: "/radix-ui/primitives"
    shadcn/ui: "/shadcn-ui/ui"
    MUI: "/mui/material-ui"
    Chakra UI: "/chakra-ui/chakra-ui"

  animation:
    Framer Motion: "/framer/motion"
    React Spring: "@react-spring/react-spring"

  forms:
    React Hook Form: "/react-hook-form/react-hook-form"

  testing:
    Jest: "/jestjs/jest"
    Testing Library: "/testing-library/react-testing-library"
    Playwright: "/playwright/playwright"
    Cypress: "/cypress-io/cypress"

  performance:
    React DevTools: "/facebook/react"
    Bundle Analyzer: "/webpack-contrib/webpack-bundle-analyzer"

  accessibility:
    axe-core: "/dequelabs/axe-core"
    lighthouse: "/GoogleChrome/lighthouse"
```
