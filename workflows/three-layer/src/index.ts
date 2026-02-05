/**
 * Three-Layer Architecture Implementation
 * 
 * Phase 2 of the Frontend Design Agent System Roadmap
 * 
 * This module implements the SAFe-inspired three-layer architecture:
 * - Layer 1: Automatic Hooks (preTaskValidation, contextVerification, securityScan, etc.)
 * - Layer 2: User Commands (/start-work, /handoff, /escalate, /validate, /complete)
 * - Layer 3: Model-Invoked Skills (patternDiscovery, architecturalReview, complianceCheck, etc.)
 * 
 * With Authority Escalation System supporting multiple targets based on issue type.
 */

// Types
export * from './types/three-layer';

// Layer 1: Hooks
export { HookSystem } from './layers/hooks';

// Layer 3: Skills
export { SkillSystem } from './layers/skills';

// Authority Escalation
export { AuthorityEscalationSystem } from './authority/escalation';

// Main Orchestrator
export { ThreeLayerOrchestrator } from './orchestrator';

// Version
export const THREE_LAYER_VERSION = '2.0.0';
export const THREE_LAYER_PHASE = 'Phase 2';

/**
 * Three-Layer Architecture Components Summary:
 * 
 * 1. Automatic Hooks (Layer 1):
 *    - preTaskValidation: Validates task readiness and blockers
 *    - contextVerification: Verifies context availability and freshness
 *    - securityScan: Automated security validation
 *    - preHandoffValidation: Validates handoff readiness
 *    - postTaskAudit: Validates task completion
 * 
 * 2. User Commands (Layer 2):
 *    - /start-work: Initialize workflow
 *    - /handoff: Coordinate agent handoffs
 *    - /escalate: Issue escalation with multiple targets
 *    - /validate: Evidence gathering and validation
 *    - /complete: Task completion with documentation
 *    - /research: Context search
 *    - /plan: Structured planning
 * 
 * 3. Model-Invoked Skills (Layer 3):
 *    - patternDiscovery: Detect reusable patterns
 *    - architecturalReview: Validate against ADRs
 *    - complianceCheck: Role-specific validation
 *    - contextGeneration: Create persistent context
 *    - evidenceCollection: Gather compliance evidence
 *    - crossReferenceAnalysis: Analyze dependencies
 *    - bestPracticeEnforcement: Validate standards
 * 
 * 4. Authority Escalation:
 *    - Four-level escalation path
 *    - Multiple targets based on issue type
 *    - Automatic routing
 *    - Escalation tracking and metrics
 */
