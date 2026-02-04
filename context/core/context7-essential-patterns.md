# Core Context7 Essential Patterns

<metadata>
version: "1.0.0"
last_updated: "2026-01-03"
dependencies: []
tags: ["context7", "patterns", "core", "essential"]
category: "core"
</metadata>

## Context
Essential patterns and foundational concepts for Context7 usage across all systems. This is the dependency root for all Context7-related context files.

### Scope
- Universal Context7 usage patterns
- Foundational tool chain execution
- Query construction fundamentals
- Library resolution basics

### Boundaries
- Does not include agent-specific patterns
- Does not define library priorities
- Does not specify quality metrics

### Relationships
- All Context7 context files depend on these essential patterns
- context:orchestration/context7-orchestration - Builds on these fundamentals
- context:frontend/library-management - Applies these patterns to library management
- context:agents/frontend-integration - Extends patterns for agent usage
- context:quality/context7-qa - Validates these patterns against quality standards

---

## Context7 Tool Chain Pattern

### Standard Execution Flow

```yaml
standard_flow:
  step_1_library_resolution:
    tool: "resolve-library-id"
    purpose: "Identify correct Context7 library identifier"
    input: "Library name or framework from user query"
    output: "Context7-compatible library ID (e.g., /vercel/next.js)"

    examples:
      query: "How do I use React useEffect?"
      resolve: "React"
      result: "/facebook/react"

      query: "Next.js API routes documentation"
      resolve: "Next.js"
      result: "/vercel/next.js"

  step_2_documentation_query:
    tool: "context7_query-docs"
    purpose: "Fetch relevant documentation with code examples"
    input: "library_id + specific_query"
    parameters:
      libraryId: "From step 1 (required)"
      query: "Specific question with context (required)"

    examples:
      library_id: "/vercel/next.js"
      query: "How to implement API routes with TypeScript"

      library_id: "/facebook/react"
      query: "React useEffect cleanup function for removing event listeners"

  step_3_application:
    purpose: "Use documentation for the agent's specific task"
    integration:
      - "Apply code examples to implementation"
      - "Follow API patterns from documentation"
      - "Adapt best practices to specific use case"
      - "Cross-reference with existing code"

    tools:
      - "read: Check existing code"
      - "edit: Apply specific changes"
      - "write: Create new implementations"
```

### Automatic Trigger Detection

```yaml
automatic_triggers:
  documentation_queries:
    pattern: "how do I use|what's the API for|show me docs for"
    action: "Auto-activate Context7 flow"
    priority: "HIGH"

    examples:
      - "How do I use React Query for data fetching?"
      - "What's the API for Next.js Server Components?"
      - "Show me docs for Tailwind CSS responsive utilities"

  framework_questions:
    pattern: "[Framework] [Feature]"
    action: "Auto-activate Context7 flow"
    priority: "HIGH"

    examples:
      - "Next.js App Router dynamic routes"
      - "React hooks patterns"
      - "Vue 3 Composition API"

  library_setup:
    pattern: "setup|configure|initialize|install [Library]"
    action: "Auto-activate Context7 flow"
    priority: "MEDIUM"

    examples:
      - "Setup React Query in Next.js"
      - "Configure Tailwind CSS with custom theme"
      - "Initialize Zustand store with TypeScript"

  code_examples:
    pattern: "show me example|code snippet|demonstrate"
    action: "Auto-activate Context7 flow"
    priority: "HIGH"

    examples:
      - "Show me example of React form validation"
      - "Code snippet for Next.js authentication"
      - "Demonstrate React Query cache invalidation"

  version_specific:
    pattern: "version|breaking change|migration"
    action: "Auto-activate Context7 flow"
    priority: "MEDIUM"

    examples:
      - "React 18 vs React 19 differences"
      - "Next.js 13 to 14 migration guide"
      - "React Router v5 to v6 breaking changes"
```

---

## Query Construction Fundamentals

### Query Structure

```yaml
query_structure:
  ideal_format: "[Library] [Feature/Component] for [Use Case/Context]"

  components:
    library: "The specific library or framework"
    feature: "The specific API, component, or pattern"
    use_case: "The specific scenario or context"
    output_type: "What you need (examples, API, best practices)"

  formula: "Library + Feature + Use Case = Effective Query"
```

### Query Quality Levels

```yaml
quality_levels:
  excellent:
    score: "95-100%"
    pattern: "Specific + Contextual + Output-oriented"

    examples:
      - "React Query useQuery cache invalidation for user profile updates"
      - "Next.js App Router Server Components data fetching with TypeScript"
      - "Tailwind CSS dark mode with system preference detection"

    characteristics:
      - "Specific feature named"
      - "Clear use case provided"
      - "Context included (TypeScript, authentication, etc.)"
      - "Actionable expected outcome"

  good:
    score: "80-94%"
    pattern: "Specific + Some Context"

    examples:
      - "React Query cache invalidation"
      - "Next.js Server Components data fetching"
      - "Tailwind CSS dark mode"

    characteristics:
      - "Specific feature named"
      - "General use case implied"
      - "Some context provided"

  needs_improvement:
    score: "<80%"
    pattern: "Vague + No Context"

    examples:
      - "React Query"
      - "Next.js data fetching"
      - "Tailwind theming"

    characteristics:
      - "Too broad or generic"
      - "No specific use case"
      - "Insufficient context"

    improvement_actions:
      - "Add specific feature/component name"
      - "Include use case or scenario"
      - "Add relevant context (TypeScript, environment, etc.)"
      - "Specify desired output (API, examples, best practices)"
```

### Common Query Patterns

```yaml
patterns:
  API_reference:
    format: "[Library] [Feature] API reference"
    examples:
      - "React useEffect API reference"
      - "Next.js getStaticProps API reference"
      - "React Query useMutation API reference"

  implementation_guide:
    format: "How to implement [Feature] with [Library] for [Use Case]"
    examples:
      - "How to implement authentication with NextAuth.js in Next.js"
      - "How to implement form validation with React Hook Form"
      - "How to implement dark mode with Tailwind CSS"

  best_practices:
    format: "[Library] best practices for [Use Case]"
    examples:
      - "React state management best practices for large applications"
      - "Next.js performance optimization best practices"
      - "Tailwind CSS component styling best practices"

  troubleshooting:
    format: "[Library] [Issue] troubleshooting and solutions"
    examples:
      - "React useEffect infinite loop troubleshooting"
      - "Next.js hydration error solutions"
      - "React Query stale data troubleshooting"

  comparison:
    format: "Compare [Library A] vs [Library B] for [Use Case]"
    examples:
      - "Compare SWR vs React Query for server state management"
      - "Compare React Context vs Zustand for client state"
      - "Compare Next.js Pages Router vs App Router"
```

---

## Library Resolution Fundamentals

### Resolution Strategy

```yaml
resolution_strategy:
  primary_match:
    method: "Exact library name"
    priority: "HIGHEST"
    examples:
      - "React" → "/facebook/react"
      - "Next.js" → "/vercel/next.js"
      - "Vue" → "/vuejs/core"

  secondary_match:
    method: "Common aliases"
    priority: "HIGH"
    examples:
      - "RQ" → "/tanstack/react-query"
      - "TanStack Query" → "/tanstack/react-query"
      - "RTL" → "/testing-library/react-testing-library"

  framework_match:
    method: "Framework ecosystem search"
    priority: "MEDIUM"
    examples:
      - "React router" → "/remix-run/react-router"
      - "React forms" → Suggest multiple options

  fallback:
    method: "Web search + generic Context7 query"
    priority: "LOW"
    examples:
      - Unknown library → Search web, try closest match
```

### Common Library Identifiers

```yaml
essential_identifiers:
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

  testing:
    Jest: "/jestjs/jest"
    Testing Library: "/testing-library/react-testing-library"
    Playwright: "/playwright/playwright"
    Cypress: "/cypress-io/cypress"

  forms:
    React Hook Form: "/react-hook-form/react-hook-form"

  animation:
    Framer Motion: "/framer/motion"
```

---

## Context7 Integration Patterns

### Combined Tool Workflow

```yaml
combined_workflow:
  context7_research:
    steps:
      1: "Use Context7 for API reference"
      2: "Get code examples and best practices"
      3: "Understand implementation requirements"

  code_analysis:
    steps:
      1: "Use grep to find existing patterns"
      2: "Use read to examine current implementation"
      3: "Compare with Context7 documentation"

  implementation:
    steps:
      1: "Use edit for specific changes"
      2: "Use write for new components"
      3: "Follow Context7 examples and patterns"

  example_flow:
    query: "Implement React Query useQuery in Next.js App Router"

    actions:
      1: "resolve-library-id: React Query → /tanstack/react-query"
      2: "context7_query-docs: How to use useQuery in Next.js App Router"
      3: "grep: Find existing data fetching patterns in project"
      4: "read: Examine current component structure"
      5: "edit: Apply useQuery pattern following Context7 examples"
```

### Documentation-First Development

```yaml
documentation_first:
  principle: "Always consult Context7 documentation before implementing"

  benefits:
    - "Accurate API usage"
    - "Current best practices"
    - "Complete code examples"
    - "Avoids outdated patterns"

  workflow:
    research:
      - "Query Context7 for feature documentation"
      - "Review code examples"
      - "Understand best practices"

    implement:
      - "Follow documented patterns"
      - "Adapt examples to specific use case"
      - "Ensure compliance with best practices"

    verify:
      - "Cross-check implementation with docs"
      - "Validate against examples"
      - "Confirm best practice compliance"
```

---

## Error Handling Fundamentals

### Common Error Scenarios

```yaml
error_scenarios:
  library_not_found:
    cause: "Library name not in Context7 database"
    symptoms: "resolve-library-id returns no results"

    resolution:
      1: "Try alternate library names"
      2: "Check for framework-specific naming"
      3: "Search web for correct name"
      4: "Use framework category query"

    example:
      query: "React Native Navigation"
      fallback: "React Navigation" → "/react-navigation/react-navigation"

  empty_results:
    cause: "Query too broad or specific feature not covered"
    symptoms: "context7_query-docs returns minimal/no content"

    resolution:
      1: "Refine query to be more specific"
      2: "Add use case context"
      3: "Split into multiple queries"
      4: "Query related features"

    example:
      query: "Next.js"
      refined: "Next.js Server Components data fetching"

  version_mismatch:
    cause: "Documentation doesn't match requested version"
    symptoms: "API signatures differ, features not found"

    resolution:
      1: "Specify version explicitly in query"
      2: "Check for migration guides"
      3: "Note version differences"
      4: "Use latest stable version if no specific need"

    example:
      query: "React Router v5 nested routes"
      fallback: "React Router v6 nested routes with migration notes"
```

### Fallback Strategies

```yaml
fallback_strategies:
  library_resolution:
    level_1: "Exact match attempt"
    level_2: "Common aliases search"
    level_3: "Framework category search"
    level_4: "Web search + generic query"

  documentation_query:
    level_1: "Specific feature query"
    level_2: "Broader feature category"
    level_3: "Library overview"
    level_4: "Web search for external docs"

  implementation:
    level_1: "Follow Context7 examples exactly"
    level_2: "Adapt examples to use case"
    level_3: "Combine multiple patterns"
    level_4: "Use external documentation resources"
```

---

## Performance Fundamentals

### Efficient Context7 Usage

```yaml
efficiency_practices:
  query_specificity:
    principle: "Specific queries return faster, more relevant results"
    action: "Always include feature and use case in query"

    benefit:
      - "Faster results"
      - "Higher relevance"
      - "Better code examples"
      - "Reduced follow-up queries"

  cache_utilization:
    principle: "Reuse documentation when possible"
    action: "Check cache before making Context7 queries"

    benefits:
      - "Faster response time"
      - "Reduced API calls"
      - "Consistent documentation"
      - "Better system performance"

  query_batching:
    principle: "Combine related queries when appropriate"
    action: "Look for opportunities to query multiple features together"

    benefits:
      - "Fewer total queries"
      - "Comprehensive documentation"
      - "Better understanding of relationships"
      - "Improved efficiency"
```

### Query Timing Guidelines

```yaml
timing_guidelines:
  quick_queries:
    duration: "<2 seconds"
    pattern: "Specific feature with clear context"
    examples:
      - "React useEffect cleanup function"
      - "Next.js getStaticProps API"
      - "Tailwind CSS responsive breakpoints"

  moderate_queries:
    duration: "2-5 seconds"
    pattern: "Complex feature or multiple aspects"
    examples:
      - "React Query cache invalidation strategies"
      - "Next.js authentication patterns with NextAuth.js"
      - "Tailwind CSS custom theme configuration"

  complex_queries:
    duration: "5-10 seconds"
    pattern: "Broad topics or multiple libraries"
    examples:
      - "Complete React state management comparison"
      - "Next.js vs Remix architecture comparison"
      - "Full-stack React authentication strategies"

  timeout_handling:
    threshold: "10 seconds"
    action: "Consider query too broad, refine and retry"
    strategy: "Break into smaller, more specific queries"
```

---

## Quality Fundamentals

### Query Quality Checklist

```yaml
quality_checklist:
  pre_query:
    - "Is the library name clear?"
    - "Is the feature/component specific?"
    - "Is the use case defined?"
    - "Is the context included (TypeScript, environment, etc.)?"

  post_query:
    - "Are results relevant to the question?"
    - "Are code examples complete?"
    - "Is the API current and accurate?"
    - "Are best practices followed?"

  implementation:
    - "Does the code match the documentation?"
    - "Are all imports included?"
    - "Is setup/configuration shown?"
    - "Are error cases handled?"
```

### Best Practice Principles

```yaml
best_practices:
  always:
    - "Resolve library ID before querying docs"
    - "Use specific, contextual queries"
    - "Check existing code before implementing"
    - "Follow documented patterns"

  often:
    - "Cache frequently used documentation"
    - "Combine related features in queries"
    - "Cross-reference with project patterns"
    - "Adapt examples to specific use cases"

  never:
    - "Skip library resolution"
    - "Use vague, broad queries"
    - "Assume API signatures
    - "Ignore version differences"
```

---

## Quick Reference

### Standard Context7 Flow

```
User Query → Trigger Detection → Library Resolution
                                                ↓
                                    Documentation Query
                                                ↓
                                    Review Results
                                                ↓
                                    Apply to Task
                                                ↓
                                    Optional: Cache
```

### Query Construction Template

```
[Library] [Feature/Component] for [Use Case/Context]

Examples:
✓ React useEffect cleanup for event listeners
✓ Next.js Server Components data fetching with TypeScript
✓ Tailwind CSS dark mode with system preference

✗ React hooks (too broad)
✗ Next.js routing (too general)
✗ Tailwind theming (no context)
```

### Essential Library IDs

```
Framework Core:
- React: /facebook/react
- Next.js: /vercel/next.js
- Vue: /vuejs/core

State Management:
- React Query: /tanstack/react-query
- Zustand: /pmndrs/zustand

Styling:
- Tailwind CSS: /tailwindlabs/tailwindcss

Testing:
- Jest: /jestjs/jest
- Testing Library: /testing-library/react-testing-library
- Playwright: /playwright/playwright
```

---

## Next Steps

After mastering these essential patterns:

1. **Orchestration**: See `context:orchestration/context7-orchestration` for system-wide usage
2. **Library Management**: See `context:frontend/library-management` for library priorities
3. **Agent Integration**: See `context:agents/frontend-integration` for agent-specific patterns
4. **Quality Assurance**: See `context:quality/context7-qa` for quality standards
