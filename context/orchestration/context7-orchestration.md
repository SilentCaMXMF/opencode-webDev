# Context7 Orchestration Layer

<metadata>
version: "1.0.0"
last_updated: "2026-01-03"
dependencies: []
tags: ["context7", "orchestration", "centralized", "frontend"]
category: "core"
</metadata>

## Context
This orchestration layer provides centralized Context7 management for the Frontend Design Agent System, ensuring consistent documentation access across all 11 agents.

### Scope
- Centralized Context7 tool management
- Universal trigger patterns and automation
- Library priority hierarchy
- Agent integration standards

### Boundaries
- Does not replace individual agent specialized knowledge
- Does not define agent-specific workflows
- Does not replace agent-specific context

### Relationships
- context:frontend/library-management - Library hierarchy and priorities
- context:orchestration/agent-integration - Agent usage patterns
- context:quality/context7-qa - Quality assurance framework

---

## Overview

The Context7 Orchestration Layer is a unified system that standardizes how all Frontend Design Agent System agents interact with Context7 MCP tools. It eliminates redundancy, ensures consistency, and provides optimal documentation access for frontend development tasks.

### System Components

1. **Orchestration Engine** - Manages Context7 tool activation and routing
2. **Library Resolution System** - Determines optimal library documentation sources
3. **Trigger Manager** - Handles automatic Context7 activation patterns
4. **Cache Manager** - Manages documentation caching and reuse
5. **Agent Bridge** - Connects agents to the orchestration system

---

## Context7 Tool Architecture

### Tool Chain Execution Pattern

```yaml
standard_context7_flow:
  step_1:
    action: "resolve-library-id"
    purpose: "Identify library by name or query"
    triggers:
      - "Library name mentioned"
      - "Framework-specific question"
      - "Documentation request"
    output: "library identifier (e.g., /vercel/next.js)"

  step_2:
    action: "context7_query-docs"
    purpose: "Fetch relevant documentation"
    input: "library_id + specific_query"
    parameters:
      libraryId: "From step 1"
      query: "Specific topic or question"
    output: "Documentation with code examples"

  step_3:
    action: "Apply to agent task"
    purpose: "Use documentation for implementation"
    integration:
      - "Combine with file editing tools"
      - "Cross-reference with project code"
      - "Follow agent-specific patterns"
```

### Automatic Trigger Activation

The orchestration layer automatically activates Context7 when:

```yaml
activation_triggers:
  documentation_queries:
    patterns:
      - "how do I use"
      - "what's the API for"
      - "show me docs for"
      - "how to implement"
    priority: "HIGH"
    immediate: true

  framework_questions:
    patterns:
      - "Next.js routing"
      - "React hooks"
      - "Vue components"
      - "Svelte stores"
    priority: "HIGH"
    immediate: true

  library_setup:
    patterns:
      - "configure"
      - "setup"
      - "initialize"
      - "install"
    priority: "MEDIUM"
    immediate: true

  code_examples:
    patterns:
      - "show me example"
      - "code snippet"
      - "demonstrate"
      - "illustrate"
    priority: "HIGH"
    immediate: true

  version_specific:
    patterns:
      - "version"
      - "breaking change"
      - "migration"
    priority: "MEDIUM"
    immediate: true
```

---

## Universal Context7 Usage Standards

### Query Formatting Standards

All agents must follow these query format standards:

```yaml
query_standards:
  resolution:
    format: "Library name from user query"
    examples:
      - query: "How do I use React useEffect?"
        resolve: "React"
      - query: "Next.js API routes documentation"
        resolve: "Next.js"

  documentation_query:
    format: "Specific question with context"
    components:
      - "Primary topic/feature"
      - "Use case/context"
      - "Desired output (examples, API, patterns)"
    good_examples:
      - "How to use useEffect cleanup function for removing event listeners"
      - "Next.js getServerSideProps vs getStaticProps for dynamic routes"
      - "React Query mutation patterns for form submissions"
    poor_examples:
      - "useEffect" (too vague)
      - "Next.js routing" (too broad)

  version_handling:
    when_to_specify:
      - "User mentions specific version"
      - "Migration between major versions"
      - "Breaking changes"
      - "Deprecated features"
    format: "Include version in query when relevant"
```

### Context7 Integration Patterns

```yaml
integration_patterns:
  combined_workflow:
    pattern: "Context7 + File Operations"
    steps:
      1: "Use Context7 for API reference"
      2: "Read existing code with grep/read"
      3: "Apply changes with edit/write"
    example: "Implement React Query caching + modify cache configuration file"

  research_workflow:
    pattern: "Context7 Research Only"
    steps:
      1: "Use resolve-library-id to identify library"
      2: "Query docs for comprehensive overview"
      3: "Provide guidance without code changes"
    example: "Explain React 18 concurrent features"

  validation_workflow:
    pattern: "Context7 + Code Review"
    steps:
      1: "Review existing code patterns"
      2: "Use Context7 to verify best practices"
      3: "Compare implementation against docs"
    example: "Validate React state management patterns"
```

---

## Fallback Strategies

### Missing Library Handling

```yaml
fallback_strategies:
  library_not_found:
    action: "Expand search"
    steps:
      1: "Try alternate library names"
      2: "Search for framework category"
      3: "Use websearch for general information"
    example:
      query: "React Navigation 5"
      fallback:
        - "React Navigation"
        - "React routing libraries"
        - "General navigation patterns"

  version_unavailable:
    action: "Use latest stable version"
    steps:
      1: "Query latest version documentation"
      2: "Note version differences if known"
      3: "Suggest migration guide if needed"
    example:
      query: "Next.js 12 specific features"
      fallback: "Query Next.js latest, note version-specific features"

  specific_feature_missing:
    action: "Broaden query scope"
    steps:
      1: "Query related features"
      2: "Search similar functionality"
      3: "Use code examples from similar patterns"
    example:
      query: "React Server Components data fetching"
      fallback: "React Server Components overview"
```

---

## Documentation Caching Strategy

```yaml
caching_strategy:
  session_cache:
    purpose: "Reuse within agent session"
    duration: "Agent session lifetime"
    scope: "Per-library queries"
    implementation: "Agent maintains query history"

  shared_cache:
    purpose: "Common libraries across agents"
    priority_libraries:
      - "/vercel/next.js"
      - "/facebook/react"
      - "/vercel/swr"
      - "/tanstack/react-query"
    duration: "24 hours"
    scope: "Framework core concepts"

  cache_invalidation:
    triggers:
      - "User specifies different version"
      - "Query for breaking changes"
      - "New major version detected"
    action: "Refresh documentation for library"
```

---

## Context7 Usage Monitoring

```yaml
monitoring:
  query_quality:
    metrics:
      - "Query specificity"
      - "Documentation relevance"
      - "Agent satisfaction"
    thresholds:
      excellent: "95%+ relevant results"
      good: "80-94% relevant results"
      needs_improvement: "<80% relevant results"

  usage_patterns:
    track:
      - "Most queried libraries"
      - "Common query types"
      - "Agent-specific needs"
    purpose: "Optimize library priority and documentation focus"

  error_tracking:
    capture:
      - "Failed library resolutions"
      - "Empty documentation results"
      - "Repetitive query failures"
    action: "Improve library aliases and fallback strategies"
```

---

## Orchestrator Agent Integration

The orchestrator agent has special Context7 responsibilities:

```yaml
orchestrator_context7_role:
  library_coordination:
    - "Maintains library priority list"
    - "Coordinates Context7 usage across agents"
    - "Resolves conflicting library requests"

  query_optimization:
    - "Refines agent queries for better results"
    - "Combines related queries"
    - "Filters redundant requests"

  quality_assurance:
    - "Monitors Context7 usage patterns"
    - "Identifies training opportunities"
    - "Suggests library additions"
```

---

## Version-Specific Documentation Strategy

```yaml
version_strategy:
  default_behavior:
    action: "Use latest stable version"
    reason: "Best practices and current documentation"

  explicit_version:
    when_to_use:
      - "User requests specific version"
      - "Migration scenarios"
      - "Legacy maintenance"
    pattern:
      - "Include version in query"
      - "Compare with latest if relevant"
      - "Note deprecations"

  version_detection:
    automatic:
      - "Detect from package.json"
      - "Infer from code patterns"
      - "Check project dependencies"
    manual:
      - "Ask user for version"
      - "Search for version indicators"
```

---

## Best Practices Summary

### For All Agents

1. **Always resolve library first** - Never skip library ID resolution
2. **Be specific in queries** - Include context, use case, and desired output
3. **Cache when appropriate** - Reuse documentation within sessions
4. **Combine with other tools** - Context7 + file editing + code review
5. **Handle failures gracefully** - Use fallback strategies and inform user
6. **Document version differences** - Note when using non-latest versions
7. **Monitor usage patterns** - Identify common queries and optimize

### Do's and Don'ts

```yaml
do:
  - "Resolve library ID before querying docs"
  - "Use specific, contextual queries"
  - "Check existing code before implementing"
  - "Cache frequently used documentation"
  - "Follow the standard tool chain"
  - "Handle missing libraries gracefully"

dont:
  - "Skip library resolution step"
  - "Use vague, broad queries"
  - "Assume latest version without checking"
  - "Duplicate identical Context7 queries"
  - "Ignore fallback strategies"
  - "Implement without verifying API"
```

---

## Quick Reference

### Standard Context7 Workflow

```
User Request
    ↓
Trigger Detection (Automatic)
    ↓
resolve-library-id (Get Library ID)
    ↓
context7_query-docs (Fetch Documentation)
    ↓
Apply to Agent Task (Implementation)
    ↓
Optional: Cache Results
```

### Common Query Patterns

```yaml
pattern_examples:
  setup:
    query: "How to setup [Library] in [Context]"
    example: "How to setup React Query in Next.js App Router"

  api_reference:
    query: "[Library] [Feature/Component] API reference"
    example: "Next.js getStaticProps API reference with params"

  best_practices:
    query: "[Library] best practices for [Use Case]"
    example: "React state management best practices for large forms"

  comparison:
    query: "Compare [Library A] vs [Library B] for [Use Case]"
    example: "Compare SWR vs React Query for server state"

  troubleshooting:
    query: "[Library] [Issue] troubleshooting and solutions"
    example: "React useEffect infinite loop troubleshooting"
```
