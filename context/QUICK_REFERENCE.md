# Context7 Quick Reference Guide

<metadata>
version: "1.0.0"
last_updated: "2026-01-03"
type: "quick-reference"
</metadata>

## Context7 Tool Chain (Memorize This!)

```
1. resolve-library-id → Get library ID
2. context7_query-docs → Fetch documentation
3. Apply results → Implement following patterns
```

---

## Query Construction Template

```
[Library] [Feature/Component] for [Use Case] with [Context]

✓ Excellent: React Query useQuery cache invalidation for profile updates
✓ Good: React Query cache invalidation
✗ Poor: React Query
```

---

## Essential Library IDs (Copy These!)

```
React: /facebook/react
Next.js: /vercel/next.js
React Query: /tanstack/react-query
Zustand: /pmndrs/zustand
React Router: /remix-run/react-router
Tailwind CSS: /tailwindlabs/tailwindcss
Framer Motion: /framer/motion
React Hook Form: /react-hook-form/react-hook-form
Radix UI: /radix-ui/primitives
Jest: /jestjs/jest
Testing Library: /testing-library/react-testing-library
Playwright: /playwright/playwright
axe-core: /dequelabs/axe-core
```

---

## Automatic Triggers (Context7 Activates Automatically)

```
"How do I use..." → Activate
"What's the API for..." → Activate
"Show me docs for..." → Activate
"[Framework] [Feature]" → Activate
"Setup/Configure [Library]" → Activate
"Show me example..." → Activate
"Version/Migration..." → Activate
```

---

## Query Quality Checklist

### Before Querying
- [ ] Is the library name clear?
- [ ] Is the feature specific?
- [ ] Is the use case defined?
- [ ] Is the context included?

### After Querying
- [ ] Are results relevant?
- [ ] Are code examples complete?
- [ ] Is the API current?
- [ ] Are best practices followed?

---

## Agent-Specific Priorities

### Design System Specialist
```
Libraries: Tailwind CSS, Radix UI, Framer Motion
Focus: Design tokens, components, theming, animation
```

### Component Developer
```
Libraries: React, Next.js, React Query, React Hook Form
Focus: Components, hooks, composition, TypeScript
```

### Performance Optimizer
```
Libraries: React DevTools, React Query, Next.js
Focus: Optimization, caching, bundles, rendering
```

### Accessibility Specialist
```
Libraries: axe-core, Radix UI, Testing Library
Focus: ARIA, WCAG, keyboard, screen readers
```

### Cross-Platform Specialist
```
Libraries: Next.js, Tailwind CSS, Playwright
Focus: Browser compatibility, responsive, devices
```

### Visual Designer
```
Libraries: Framer Motion, Tailwind CSS, Radix UI
Focus: Animations, visual effects, colors, layouts
```

### Frontend Coder
```
Libraries: All framework libraries, Build tools
Focus: Setup, configuration, patterns, debugging
```

### Code Reviewer
```
Libraries: All framework libraries, ESLint, TypeScript
Focus: Best practices, security, performance
```

### Tester (TDD Agent)
```
Libraries: Jest, Testing Library, Playwright, MSW
Focus: Unit, integration, E2E, accessibility
```

### Documentation Specialist
```
Libraries: Storybook, TypeDoc, Docusaurus
Focus: API docs, examples, guides, writing
```

---

## Common Query Patterns

### API Reference
```
"[Library] [Feature] API reference"
Examples:
- React useEffect API reference
- Next.js getStaticProps API reference
- React Query useMutation API reference
```

### Implementation Guide
```
"How to implement [Feature] with [Library] for [Use Case]"
Examples:
- How to implement authentication with NextAuth.js in Next.js
- How to implement form validation with React Hook Form
- How to implement dark mode with Tailwind CSS
```

### Best Practices
```
"[Library] best practices for [Use Case]"
Examples:
- React state management best practices for large applications
- Next.js performance optimization best practices
- Tailwind CSS component styling best practices
```

### Troubleshooting
```
"[Library] [Issue] troubleshooting and solutions"
Examples:
- React useEffect infinite loop troubleshooting
- Next.js hydration error solutions
- React Query stale data troubleshooting
```

### Comparison
```
"Compare [Library A] vs [Library B] for [Use Case]"
Examples:
- Compare SWR vs React Query for server state management
- Compare React Context vs Zustand for client state
- Compare Next.js Pages Router vs App Router
```

---

## Fallback Strategies

### Library Not Found
1. Try alternate names (React Native Navigation → React Navigation)
2. Check for framework-specific naming
3. Search web for correct name
4. Use framework category query

### Empty Results
1. Refine query to be more specific
2. Add use case context
3. Split into multiple queries
4. Query related features

### Version Mismatch
1. Specify version explicitly
2. Check for migration guides
3. Note version differences
4. Use latest stable version if no specific need

---

## Do's and Don'ts

### Do ✓
- [ ] Resolve library ID before querying docs
- [ ] Use specific, contextual queries
- [ ] Check existing code before implementing
- [ ] Cache frequently used documentation
- [ ] Follow the standard tool chain
- [ ] Handle missing libraries gracefully

### Don't ✗
- [ ] Skip library resolution step
- [ ] Use vague, broad queries
- [ ] Assume latest version without checking
- [ ] Duplicate identical Context7 queries
- [ ] Ignore fallback strategies
- [ ] Implement without verifying API

---

## Error Handling

### Library Not Found
```
Action:
1. Try alternate library names
2. Check common aliases
3. Search web for correct name
4. Use framework category fallback
```

### Empty Results
```
Action:
1. Refine query specificity
2. Add use case context
3. Split into multiple queries
4. Query related features
```

### Version Mismatch
```
Action:
1. Check package.json for version
2. Specify version in query
3. Look for migration guides
4. Note version differences
```

---

## Performance Tips

### Efficient Queries
- Be specific: "React useEffect cleanup" > "React hooks"
- Add context: "with TypeScript", "for user forms"
- Include use case: "for profile updates"
- Specify output: "API reference", "code examples"

### Caching
- Critical libraries cached for 24 hours
- High priority cached for 12 hours
- Check cache before querying
- Reuse within agent sessions

---

## Quality Targets

### Query Success Rate: 95%+
### Documentation Relevance: 90%+
### Implementation Accuracy: 90%+
### Cache Hit Rate: 40%+

---

## File Locations

```
.opencode/context/
├── README.md (System overview)
├── core/context7-essential-patterns.md (Start here!)
├── orchestration/context7-orchestration.md (Standards)
├── frontend/library-management.md (Libraries)
├── agents/frontend-integration.md (Agent patterns)
├── quality/context7-qa.md (Quality metrics)
└── IMPLEMENTATION_SUMMARY.md (Summary)
```

---

## Quick Links

### For Beginners
1. Start: `core/context7-essential-patterns.md`
2. Learn: `orchestration/context7-orchestration.md`
3. Explore: `frontend/library-management.md`

### For Orchestrator
1. Your Role: `orchestration/context7-orchestration.md`
2. All Agents: `agents/frontend-integration.md`
3. Quality: `quality/context7-qa.md`

### For Specialists
1. Patterns: `core/context7-essential-patterns.md`
2. Your Integration: `agents/frontend-integration.md`
3. Your Libraries: `frontend/library-management.md`

---

## Essential Commands

### Always Start With
```
resolve-library-id
  Input: "React"
  Output: "/facebook/react"
```

### Then Query Docs
```
context7_query-docs
  libraryId: "/facebook/react"
  query: "useEffect cleanup for event listeners"
```

### Then Apply
```
Use edit/write tools
  Follow Context7 examples
  Adapt to use case
  Verify with project code
```

---

## Common Scenarios

### New Feature Implementation
1. Resolve library
2. Query docs for implementation patterns
3. Check existing code
4. Apply following examples
5. Validate with documentation

### Performance Issue
1. Query optimization patterns
2. Review best practices
3. Apply optimizations
4. Monitor impact

### Accessibility Review
1. Query ARIA patterns
2. Validate WCAG compliance
3. Check with testing library
4. Suggest improvements

---

## Version Tips

### When to Specify Version
- User mentions specific version
- Migration scenarios
- Legacy maintenance
- Breaking changes

### How to Specify
```
"Next.js 14 Server Components"
"React Router v5 to v6 migration"
"React 18 vs React 19 features"
```

### Default Behavior
- Always use latest stable version unless specified otherwise
- Check package.json for project version
- Note version differences when relevant

---

## Agent Coordination

### Orchestrator Responsibilities
- Coordinate Context7 usage across agents
- Optimize queries and prevent redundancy
- Maintain library priority list
- Monitor quality and suggest improvements

### Cross-Agent Sharing
- Critical libraries shared across agents
- Query results cached and reused
- Knowledge shared via orchestrator
- Agent-specific patterns documented

---

## Quick Troubleshooting

### Query Returns No Results
→ Refine query, add context, be more specific

### Library Not Found
→ Try alternate names, check aliases, use fallback

### Wrong Version
→ Specify version in query, check package.json

### Results Not Relevant
→ Review query construction, add use case context

---

## Remember

1. **Always resolve library first**
2. **Be specific in queries**
3. **Cache when appropriate**
4. **Handle failures gracefully**
5. **Follow documented patterns**
6. **Verify before implementing**

---

## Need More Info?

- Full Documentation: `README.md`
- Detailed Implementation: `IMPLEMENTATION_SUMMARY.md`
- Essential Patterns: `core/context7-essential-patterns.md`
- Agent Integration: `agents/frontend-integration.md`

---

**Version**: 1.0.0 | **Last Updated**: 2026-01-03 | **Total Files**: 7 | **Total Lines**: 4,419
