<three_layer_architecture @priority-1>
PHASE 2: THREE-LAYER AGENT ARCHITECTURE
Inspired by SAFe methodology (Hooks → Commands → Skills)

LAYER 1: AUTOMATIC HOOKS @priority-1a
These hooks run automatically before/after agent tasks:

preTaskValidation() @hook-1
- Auto-format checks before task execution
- Blocker detection and reporting
- Dependency verification
- Code style compliance validation
- Context: Verify all required context is available before proceeding

contextVerification() @hook-2
- Verify required context entries exist
- Validate context freshness (< 24 hours)
- Check context completeness for task type
- Flag stale context for refresh
- Integration: Uses Context Engineering System

securityScan() @hook-3
- Auto-security validation before modifications
- Dependency vulnerability checks
- Secret detection in code
- CSP and CORS compliance verification
- Integration: security-specialist authority escalation

preHandoffValidation() @hook-4
- Validate handoff readiness
- Verify context completeness for transfer
- Check agent compatibility
- Ensure evidence collection completeness

postTaskAudit() @hook-5
- Validate task completion against requirements
- Collect evidence artifacts
- Update context with new learnings
- Report metrics to monitoring system

LAYER 2: USER COMMANDS @priority-1b
Standardized commands invoked by users or orchestrator:

/start-work [project] @command-1
- Begin workflow with proper initialization
- Load project context and requirements
- Initialize workflow tracking
- Set up quality gates

/handoff [from-agent] [to-agent] [context] @command-2
- Structured agent coordination and handoff
- Preserve context during transfer
- Maintain audit trail
- Validate handoff completion

/escalate [issue] [severity] @command-3
- Issue escalation protocol
- Notify appropriate authority
- Preserve evidence
- Track resolution

/validate [evidence-type] @command-4
- Evidence gathering and validation
- Quality gate verification
- Compliance checking
- Generate validation report

/complete [summary] @command-5
- Generate context artifacts
- Document decisions and rationale
- Archive session context
- Update pattern library

/research [query] @command-6
- Search accumulated context
- Query external resources
- Synthesize findings
- Update context with new knowledge

/plan [feature] @command-7
- Create structured specification
- Define implementation approach
- Identify dependencies
- Estimate effort and timeline

LAYER 3: MODEL-INVOKED SKILLS @priority-1c
Skills invoked automatically by the model based on context:

patternDiscovery() @skill-1
- Detect reusable patterns in codebase
- Identify anti-patterns
- Suggest refactoring opportunities
- Update pattern library
- Trigger: When implementing similar functionality

architecturalReview() @skill-2
- Validate against ADRs (Architectural Decision Records)
- Check consistency with system architecture
- Identify architectural drift
- Recommend corrections
- Trigger: Before significant implementation decisions

complianceCheck() @skill-3
- Role-specific validation (A11y, Security, Performance)
- Verify quality gate compliance
- Check regulatory requirements
- Flag compliance issues
- Trigger: Before task completion

contextGeneration() @skill-4
- Create persistent context artifacts
- Document decisions with rationale
- Update ADRs
- Generate pattern documentation
- Trigger: After significant decisions

evidenceCollection() @skill-5
- Gather test results and metrics
- Capture performance data
- Document accessibility audits
- Compile security scan results
- Trigger: During /validate command

crossReferenceAnalysis() @skill-6
- Analyze dependencies between components
- Identify potential conflicts
- Suggest integration points
- Trigger: During architectural decisions

bestPracticeEnforcement() @skill-7
- Validate against established patterns
- Suggest improvements
- Flag deviations from standards
- Trigger: During code reviews

AUTHORITY ESCALATION PATTERNS @priority-1d
Each layer has escalation paths:

Hooks → Commands:
- Hook failures automatically trigger /escalate command
- Security issues → immediate /escalate with severity=critical
- Context issues → /research then /validate

Commands → Skills:
- /validate automatically invokes complianceCheck skill
- /handoff automatically triggers patternDiscovery if new context
- /plan automatically triggers architecturalReview

Skills → Human Review:
- complianceCheck failures with authority implications → /escalate
- architecturalReview with major concerns → /escalate
- patternDiscovery with breaking changes → /escalate

INTEGRATION WITH EXISTING WORKFLOW @priority-1e
Three-layer architecture integrates with existing workflow execution:

Stage 1: Requirements Analysis
- HOOKS: preTaskValidation (check context), securityScan (initial scan)
- COMMANDS: /research (gather requirements), /plan (create plan)
- SKILLS: patternDiscovery (analyze similar projects)

Stage 2: Architecture Design
- HOOKS: contextVerification (verify design context)
- COMMANDS: /handoff (to system-architect), /validate (architecture review)
- SKILLS: architecturalReview (validate against ADRs), complianceCheck (initial compliance)

Stage 3: Design System Creation
- HOOKS: preTaskValidation (check design tokens)
- COMMANDS: /handoff (to system-architect)
- SKILLS: patternDiscovery (find existing patterns), bestPracticeEnforcement

Stage 4: Implementation Coordination
- HOOKS: preTaskValidation (code style), securityScan (dependency check), contextVerification
- COMMANDS: /handoff (to frontend-specialist), /complete (mark completion)
- SKILLS: evidenceCollection (track progress), crossReferenceAnalysis

Stage 5: Performance & Accessibility Optimization
- HOOKS: preTaskValidation (metrics baseline), securityScan (optimization safety)
- COMMANDS: /handoff (to performance-engineer, a11y-specialist), /validate (metrics)
- SKILLS: complianceCheck (A11y, performance), evidenceCollection

Stage 6: Quality Assurance
- HOOKS: preTaskValidation (test coverage), contextVerification (test context)
- COMMANDS: /handoff (to quality-specialist), /validate (evidence gathering)
- SKILLS: complianceCheck (all gates), evidenceCollection (test results)
DEVTOOLS INTEGRATION @priority-8
- Performance analysis and optimization
- Accessibility auditing and testing
- Cross-browser compatibility testing
- Network request analysis and optimization

SUBAGENT DELEGATION MAPPING @priority-8
- Design system creation: design-system-specialist
- Component development: component-developer
- Performance optimization: performance-optimizer
- Quality assurance: testing-qa-specialist
- Accessibility audit: accessibility-specialist
- Security assessment: security-specialist
- Animation implementation: animation-specialist
- Internationalization: i18n-specialist
- UX research: ux-research-specialist
</three_layer_architecture>