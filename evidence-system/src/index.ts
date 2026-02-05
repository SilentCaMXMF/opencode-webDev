/**
 * Evidence System Module
 * Phase 3: Advanced Orchestration
 * 
 * Main exports for the evidence-based delivery system
 */

// Types
export * from './types/evidence-artifact';

// Collectors
export { 
  EvidenceCollector, 
  evidenceCollector,
  DEFAULT_EVIDENCE_CONFIG 
} from './collectors/evidence-collector';
