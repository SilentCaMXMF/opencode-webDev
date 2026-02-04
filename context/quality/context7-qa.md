# Context7 Quality Assurance Framework

<metadata>
version: "1.0.0"
last_updated: "2026-01-03"
dependencies: ["context:orchestration/context7-orchestration", "context:frontend/library-management", "context:agents/frontend-integration"]
tags: ["context7", "quality", "assurance", "monitoring"]
category: "quality"
</metadata>

## Context
Comprehensive quality assurance framework for monitoring, validating, and improving Context7 usage across the Frontend Design Agent System.

### Scope
- Context7 query quality monitoring
- Documentation validation
- Agent usage assessment
- Continuous improvement processes

### Boundaries
- Does not replace agent-specific QA processes
- Does not validate non-Context7 functionality
- Does not define user acceptance criteria

### Relationships
- context:orchestration/context7-orchestration - Usage standards to validate against
- context:frontend/library-management - Library quality indicators
- context:agents/frontend-integration - Agent-specific quality metrics

---

## Quality Assurance Overview

The QA framework ensures Context7 provides consistent, high-quality documentation support across all agents through continuous monitoring and improvement.

```yaml
qa_framework:
  pillars:
    monitoring:
      - "Query quality tracking"
      - "Documentation relevance assessment"
      - "Agent satisfaction metrics"

    validation:
      - "Documentation accuracy checks"
      - "Version correctness verification"
      - "Best practice compliance"

    improvement:
      - "Pattern optimization"
      - "Library priority refinement"
      - "Agent training opportunities"

  feedback_loops:
    real_time:
      - "Query success monitoring"
      - "Error detection and handling"
      - "Cache effectiveness tracking"

    periodic:
      - "Usage pattern analysis"
      - "Quality score reviews"
      - "Library priority updates"
```

---

## Query Quality Metrics

### Query Effectiveness

```yaml
query_quality:
  specificity:
    excellent:
      score: "95-100%"
      criteria:
        - "Specific feature or component named"
        - "Clear use case provided"
        - "Context for usage included"
      examples:
        - "React Query useQuery cache invalidation for user profile updates"
        - "Next.js App Router Server Components data fetching patterns"

    good:
      score: "80-94%"
      criteria:
        - "Feature or component named"
        - "General use case implied"
        - "Some context provided"
      examples:
        - "React Query cache invalidation"
        - "Next.js Server Components"

    needs_improvement:
      score: "<80%"
      criteria:
        - "Vague or broad query"
        - "No specific use case"
        - "Insufficient context"
      examples:
        - "React Query"
        - "Next.js"

  relevance:
    measurement: "Documentation match to user intent"
    thresholds:
      excellent: "95%+ relevant results"
      good: "80-94% relevant results"
      poor: "<80% relevant results"

    assessment_factors:
      - "Results address specific question"
      - "Code examples are applicable"
      - "API references are current"
      - "Use cases match scenario"

  accuracy:
    measurement: "Correctness of documentation"
    checks:
      - "API signatures match current version"
      - "Code examples are functional"
      - "Best practices are current"
      - "No deprecated patterns recommended"

  completeness:
    measurement: "Coverage of requested topic"
    criteria:
      - "Core concept explained"
      - "Code examples provided"
      - "Edge cases covered"
      - "Related features mentioned"
```

### Query Pattern Analysis

```yaml
pattern_analysis:
  successful_patterns:
    high_performing:
      - "Specific component/feature + use case"
      - "Implementation + best practices"
      - "Troubleshooting + specific error"
      - "Comparison + specific scenario"

    success_rate: "92%+"

  low_performing_patterns:
    issues:
      - "Library name only (too broad)"
      - "Generic question without context"
      - "Mixed concerns (multiple topics)"
      - "Vague terminology"

    improvement_actions:
      - "Refine query with context"
      - "Split into multiple queries"
      - "Use specific terminology"
      - "Add use case description"

  common_query_types_by_success_rate:
    API_reference: 95%
    Setup_configuration: 90%
    Best_practices: 88%
    Troubleshooting: 85%
    Comparison: 82%
    General_overview: 75%
```

---

## Documentation Validation

### Version Accuracy

```yaml
version_validation:
  automatic_checks:
    current_version:
      check: "Documentation matches latest stable version"
      method: "Compare docs to library version API"
      threshold: "Must match or be within 1 minor version"

    version_specific:
      check: "User-specified version accuracy"
      method: "Query with version parameter"
      threshold: "Must match exact version"

    deprecation_warnings:
      check: "No deprecated APIs recommended"
      method: "Cross-reference with deprecation lists"
      threshold: "Zero deprecated patterns"

  manual_review_triggers:
    - "Version mismatch detected"
    - "Deprecated API in results"
    - "Breaking changes without migration guide"
    - "Ambiguous version information"

  validation_process:
    step_1: "Extract version from query"
    step_2: "Verify against current stable version"
    step_3: "Check for deprecations"
    step_4: "Flag discrepancies"
    step_5: "Provide version guidance if needed"
```

### Content Quality Assessment

```yaml
content_quality:
  code_examples:
    criteria:
      completeness:
        - "Runnable code provided"
        - "All imports included"
        - "Setup shown if complex"
      accuracy:
        - "Matches current API"
        - "No syntax errors"
        - "TypeScript types correct"
      relevance:
        - "Addresses the query"
        - "Real-world applicable"
        - "Best practice followed"

    grading:
      excellent: "All criteria met + error handling + comments"
      good: "Most criteria met"
      needs_improvement: "Missing imports, incomplete, or outdated"

  best_practices:
    validation:
      - "Follows official documentation recommendations"
      - "Current industry standards applied"
      - "Security considerations addressed"
      - "Performance implications noted"

    anti_pattern_detection:
      - "Deprecated patterns identified"
      - "Security vulnerabilities flagged"
      - "Performance anti-patterns noted"
      - "Accessibility violations highlighted"

  clarity:
    assessment:
      - "Technical level appropriate"
      - "Explanations are clear"
      - "Examples build logically"
      - "Related concepts linked"

    reading_level:
      target: "Intermediate to advanced developers"
      indicators:
        - "Technical terminology used correctly"
        - "Assumes basic knowledge"
        - "Builds on fundamentals"
```

### Library Quality Indicators

```yaml
library_quality:
  documentation_completeness:
    excellent:
      - "Comprehensive API reference"
      - "Multiple use case examples"
      - "Migration guides available"
      - "Updated within 6 months"

    good:
      - "Basic API reference"
      - "Core use cases covered"
      - "Some examples provided"
      - "Updated within 1 year"

    needs_review:
      - "Limited API documentation"
      - "Few examples"
      - "Outdated content"
      - "No recent updates"

  maintenance_status:
    active:
      - "Recent commits (<3 months)"
      - "Active issues/discussions"
      - "Regular releases"
      - "Responsive maintainers"

    stable:
      - "Mature library"
      - "Bug fixes only"
      - "Slow release cycle"
      - "Limited new features"

    deprecated:
      - "Official deprecation notice"
      - "No commits >1 year"
      - "Security vulnerabilities"
      - "Alternative recommended"

  community_support:
    strong:
      - "High GitHub stars (>10k)"
      - "Active Discord/Slack"
      - "StackOverflow answers"
      - "Multiple tutorials"

    moderate:
      - "Medium GitHub stars (1-10k)"
      - "Some community activity"
      - "Limited tutorials"

    weak:
      - "Low GitHub stars (<1k)"
      - "Minimal community"
      - "Few external resources"
```

---

## Agent Usage Assessment

### Performance by Agent Type

```yaml
agent_performance:
  orchestrator:
    metrics:
      query_coordination_success: 98%
      cache_hit_rate: 65%
      cross_agent_sharing: 80%

    focus:
      - "Coordination efficiency"
      - "Query optimization"
      - "Knowledge sharing"

  design_system_specialist:
    metrics:
      query_success_rate: 94%
      implementation_accuracy: 92%
      documentation_compliance: 96%

    focus:
      - "Design token accuracy"
      - "Component pattern correctness"
      - "Thaming implementation"

  component_developer:
    metrics:
      query_success_rate: 95%
      implementation_accuracy: 93%
      documentation_compliance: 97%

    focus:
      - "Component API accuracy"
      - "Hook pattern correctness"
      - "Data flow validation"

  performance_optimizer:
    metrics:
      query_success_rate: 93%
      implementation_accuracy: 91%
      optimization_effectiveness: 89%

    focus:
      - "Performance pattern accuracy"
      - "Optimization effectiveness"
      - "Measurement validation"

  accessibility_specialist:
    metrics:
      query_success_rate: 96%
      implementation_accuracy: 94%
      wcag_compliance: 98%

    focus:
      - "ARIA pattern accuracy"
      - "Compliance verification"
      - "Testing correctness"

  cross_platform_specialist:
    metrics:
      query_success_rate: 92%
      implementation_accuracy: 90%
      browser_compatibility: 94%

    focus:
      - "Cross-browser accuracy"
      - "Responsive pattern correctness"
      - "Device compatibility"

  visual_designer:
    metrics:
      query_success_rate: 91%
      implementation_accuracy: 89%
      accessibility_visuals: 93%

    focus:
      - "Animation accuracy"
      - "Visual accessibility"
      - "Effect correctness"

  frontend_coder:
    metrics:
      query_success_rate: 94%
      implementation_accuracy: 92%
      pattern_correctness: 95%

    focus:
      - "Setup accuracy"
      - "Pattern correctness"
      - "Configuration validation"

  code_reviewer:
    metrics:
      query_success_rate: 95%
      best_practice_compliance: 97%
      security_validation: 96%

    focus:
      - "Best practice accuracy"
      - "Security pattern correctness"
      - "Standard compliance"

  tester:
    metrics:
      query_success_rate: 93%
      test_pattern_accuracy: 91%
      coverage_effectiveness: 89%

    focus:
      - "Testing pattern accuracy"
      - "Mocking correctness"
      - "Assertion validity"

  documentation_specialist:
    metrics:
      query_success_rate: 95%
      documentation_quality: 96%
      example_correctness: 94%

    focus:
      - "Documentation pattern accuracy"
      - "Example validity"
      - "Standard compliance"
```

### Common Issues by Agent

```yaml
agent_issues:
  design_system_specialist:
    common:
      - "Ambiguous design token queries"
      - "Missing theming context"
    solutions:
      - "Require theme system specification"
      - "Ask for use case context"

  component_developer:
    common:
      - "Missing TypeScript types in queries"
      - "Vague hook usage scenarios"
    solutions:
      - "Require TypeScript context"
      - "Specify component hierarchy"

  performance_optimizer:
    common:
      - "Multiple optimization concerns in single query"
      - "Missing performance metrics"
    solutions:
      - "Split complex optimization queries"
      - "Require baseline metrics"

  accessibility_specialist:
    common:
      - "Missing WCAG level specification"
      - "Unclear assistive technology context"
    solutions:
      - "Require WCAG level (A/AA/AAA)"
      - "Specify target screen reader"

  cross_platform_specialist:
    common:
      - "Missing device/browser context"
      - "Ambiguous viewport specifications"
    solutions:
      - "Require target devices"
      - "Specify viewport ranges"

  visual_designer:
    common:
      - "Missing accessibility context for animations"
      - "Ambiguous motion preferences"
    solutions:
      - "Require reduced-motion consideration"
      - "Specify animation duration"

  frontend_coder:
    common:
      - "Missing environment context (dev/prod)"
      - "Vague error descriptions"
    solutions:
      - "Specify environment"
      - "Provide error messages/steps"

  code_reviewer:
    common:
      - "Missing code context in queries"
      - "Unclear review criteria"
    solutions:
      - "Provide code snippets"
      - "Specify review focus"

  tester:
    common:
      - "Missing test type context (unit/integration/e2e)"
      - "Unclear mock requirements"
    solutions:
      - "Specify test type"
      - "Define mock expectations"

  documentation_specialist:
    common:
      - "Missing target audience"
      - "Unclear documentation format"
    solutions:
      - "Specify audience (beginner/advanced)"
      - "Define format (API/guide/tutorial)"
```

---

## Monitoring and Reporting

### Real-Time Monitoring

```yaml
real_time_monitoring:
  query_execution:
    track:
      - "Query submission timestamp"
      - "Library resolution time"
      - "Documentation retrieval time"
      - "Total query duration"

    alerts:
      slow_query: ">10 seconds total duration"
      failed_resolution: "Library not found"
      empty_results: "No documentation returned"
      version_mismatch: "Version discrepancy detected"

  cache_performance:
    metrics:
      - "Cache hit rate"
      - "Cache miss rate"
      - "Cache age distribution"
      - "Cache invalidation frequency"

    thresholds:
      excellent_hit_rate: "50%+"
      good_hit_rate: "30-49%"
      needs_improvement: "<30%"

  error_tracking:
    error_types:
      library_not_found:
        frequency: "Track per library"
        action: "Improve library aliases"

      empty_results:
        frequency: "Track per query type"
        action: "Refine query patterns"

      version_mismatch:
        frequency: "Track per library"
        action: "Update version detection"

      timeout:
        frequency: "Track overall"
        action: "Optimize query complexity"
```

### Periodic Reporting

```yaml
periodic_reports:
  daily:
    metrics:
      - "Total queries"
      - "Success rate"
      - "Average query time"
      - "Cache hit rate"
      - "Top 10 libraries"

    distribution: "Orchestrator and specialist agents"

  weekly:
    metrics:
      - "Agent-specific success rates"
      - "Query pattern analysis"
      - "Library priority effectiveness"
      - "Quality score trends"
      - "Improvement recommendations"

    distribution: "All agents with agent-specific summaries"

  monthly:
    metrics:
      - "Comprehensive performance analysis"
      - "Library quality updates"
      - "Training opportunity identification"
      - "Priority library adjustments"
      - "Strategic recommendations"

    distribution: "Orchestrator and system administrators"

  quarterly:
    deliverables:
      - "System performance review"
      - "Library priority rebalancing"
      - "Query pattern optimization"
      - "Agent training plan"
      - "Roadmap updates"

    distribution: "All stakeholders"
```

---

## Continuous Improvement

### Pattern Optimization

```yaml
pattern_optimization:
  analysis_process:
    step_1: "Collect query data (success rate, time, relevance)"
    step_2: "Identify low-performing patterns"
    step_3: "Analyze failure causes"
    step_4: "Develop improved patterns"
    step_5: "Test with sample queries"
    step_6: "Deploy to agents"
    step_7: "Monitor improvement"

  example_optimizations:
    before: "React hooks"
    after: "React useEffect cleanup pattern for event listeners"
    improvement: "Success rate 65% → 92%"

    before: "Next.js routing"
    after: "Next.js App Router dynamic route params with TypeScript"
    improvement: "Success rate 58% → 89%"
```

### Library Priority Refinement

```yaml
priority_refinement:
  criteria:
    query_frequency:
      - "High usage (>100 queries/week)"
      - "Medium usage (50-100 queries/week)"
      - "Low usage (<50 queries/week)"

    success_rate:
      - "Excellent (>95%)"
      - "Good (80-95%)"
      - "Needs improvement (<80%)"

    documentation_quality:
      - "Excellent (comprehensive, current)"
      - "Good (adequate, some outdated)"
      - "Needs review (incomplete, outdated)"

  adjustment_rules:
    promote:
      - "High frequency + excellent success rate"
      - "High frequency + good documentation quality"
      - "Agent-specific critical need"

    demote:
      - "Low frequency + poor success rate"
      - "Poor documentation quality"
      - "Better alternatives available"

    remove:
      - "No queries for 90 days"
      - "Deprecated/maintained elsewhere"
      - "Replaced by superior library"
```

### Agent Training Opportunities

```yaml
training_identification:
  triggers:
    query_quality:
      - "Consistently vague queries (<70% success)"
      - "Repeated pattern failures"
      - "Missing context in queries"

    library_usage:
      - "Incorrect library choices"
      - "Missing optimal libraries"
      - "Outdated library usage"

    implementation:
      - "Low documentation compliance (<80%)"
      - "Repeated best practice violations"
      - "Anti-pattern usage"

  training_content:
    query_formulation:
      - "How to write specific, contextual queries"
      - "Including use case and context"
      - "Specifying version when relevant"

    library_selection:
      - "Choosing the right library for the job"
      - "Understanding library strengths/weaknesses"
      - "Staying current with library ecosystem"

    best_practices:
      - "Following documented patterns"
      - "Avoiding anti-patterns"
      - "Implementing accessibility and performance"
```

---

## Quality Score Calculation

```yaml
quality_scoring:
  query_quality_score:
    formula: "0.3 * specificity + 0.3 * relevance + 0.2 * accuracy + 0.2 * completeness"

    grades:
      A: "90-100% - Excellent"
      B: "80-89% - Good"
      C: "70-79% - Needs Improvement"
      D: "60-69% - Poor"
      F: "<60% - Unacceptable"

  agent_performance_score:
    formula: "0.4 * query_success + 0.3 * implementation_accuracy + 0.2 * documentation_compliance + 0.1 * cache_effectiveness"

    grades:
      A: "90-100% - Exceptional"
      B: "80-89% - Strong"
      C: "70-79% - Satisfactory"
      D: "60-69% - Needs Development"
      F: "<60% - Unsatisfactory"

  library_quality_score:
    formula: "0.4 * documentation_completeness + 0.3 * maintenance_status + 0.2 * community_support + 0.1 * update_frequency"

    grades:
      A: "90-100% - Recommended"
      B: "80-89% - Good Choice"
      C: "70-79% - Acceptable"
      D: "60-69% - Use with Caution"
      F: "<60% - Avoid"
```

---

## Quality Assurance Checklist

### Pre-Query Checklist

```yaml
pre_query_check:
  for_all_agents:
    - "Is the library known or can it be resolved?"
    - "Is the query specific and contextual?"
    - "Is the use case clearly defined?"
    - "Is the target audience/level appropriate?"
    - "Have similar queries been cached?"

  for_specialists:
    - "Does the query include agent-specific context?"
    - "Is the library a priority for this agent?"
    - "Are there related queries that could be combined?"
```

### Post-Query Checklist

```yaml
post_query_check:
  validation:
    - "Are results relevant to the query?"
    - "Is the version information correct?"
    - "Are code examples complete and accurate?"
    - "Are best practices followed?"
    - "Are there deprecated patterns?"

    quality:
    - "Is the documentation current?"
    - "Are there security considerations?"
    - "Are performance implications noted?"
    - "Are accessibility requirements addressed?"
    - "Are edge cases covered?"

    implementation:
    - "Does the result enable implementation?"
    - "Are all required imports shown?"
    - "Is setup/configuration included?"
    - "Are related features mentioned?"
```

### Agent-Specific QA Checklist

```yaml
agent_checklists:
  design_system_specialist:
    - "Design tokens follow CSS variables pattern?"
    - "Theming includes dark mode?"
    - "Components are composable?"
    - "Animations respect prefers-reduced-motion?"

  component_developer:
    - "Components use functional patterns?"
    - "Hooks follow rules of hooks?"
    - "TypeScript types are complete?"
    - "Props interface is defined?"

  performance_optimizer:
    - "Optimization is measurable?"
    - "Caching strategy is appropriate?"
    - "Bundle impact is considered?"
    - "Rendering is optimized?"

  accessibility_specialist:
    - "ARIA attributes are correct?"
    - "Keyboard navigation is supported?"
    - "Screen reader announcements are appropriate?"
    - "WCAG level is specified?"

  cross_platform_specialist:
    - "Browser compatibility verified?"
    - "Responsive breakpoints defined?"
    - "Mobile touch handling included?"
    - "Fallback strategies provided?"

  visual_designer:
    - "Animations have controls?"
    - "Color contrast meets WCAG AA?"
    - "Visual hierarchy is clear?"
    - "Motion is purposeful?"

  frontend_coder:
    - "Setup steps are complete?"
    - "Configuration is accurate?"
    - "Error handling is shown?"
    - "Debugging guidance provided?"

  code_reviewer:
    - "Best practices are current?"
    - "Security vulnerabilities flagged?"
    - "Performance impact noted?"
    - "Refactoring suggestions included?"

  tester:
    - "Test type is specified?"
    - "Mocking strategy is clear?"
    - "Assertions are comprehensive?"
    - "Coverage is addressed?"

  documentation_specialist:
    - "Audience is specified?"
    - "Examples are runnable?"
    - "API references are complete?"
    - "Structure is logical?"
```

---

## Quality Improvement Feedback Loop

```yaml
feedback_loop:
  collect:
    sources:
      - "Query success metrics"
      - "Agent performance scores"
      - "Cache effectiveness data"
      - "Error tracking reports"
      - "User satisfaction feedback"

  analyze:
    techniques:
      - "Trend analysis over time"
      - "Comparative analysis by agent"
      - "Library performance comparison"
      - "Query pattern clustering"

  act:
    actions:
      immediate:
        - "Alert on critical failures"
        - "Block repeated errors"
        - "Escalate quality issues"

      short_term:
        - "Update query patterns"
        - "Adjust library priorities"
        - "Provide training feedback"

      long_term:
        - "System architecture improvements"
        - "Library ecosystem updates"
        - "Agent capability enhancements"

  review:
    cycle: "Monthly comprehensive review"
    deliverables:
      - "Quality report"
      - "Improvement roadmap"
      - "Training plan"
      - "Budget recommendations"
```
