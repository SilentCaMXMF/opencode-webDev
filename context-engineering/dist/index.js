"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextAPI = exports.ContextEngineeringSystem = void 0;
exports.createContextSystem = createContextSystem;
const context_system_1 = require("./core/context-system");
Object.defineProperty(exports, "ContextEngineeringSystem", { enumerable: true, get: function () { return context_system_1.ContextEngineeringSystem; } });
// Import AgentType values for use in runtime
const AgentTypes = {
    ORCHESTRATOR: 'ORCHESTRATOR',
    DESIGN_SYSTEM: 'DESIGN_SYSTEM',
    COMPONENT_DEVELOPER: 'COMPONENT_DEVELOPER',
    PERFORMANCE_OPTIMIZER: 'PERFORMANCE_OPTIMIZER',
    ACCESSIBILITY: 'ACCESSIBILITY',
    CROSS_PLATFORM: 'CROSS_PLATFORM',
    TESTING_QA: 'TESTING_QA',
    SECURITY: 'SECURITY',
    ANIMATION: 'ANIMATION',
    I18N: 'I18N',
    UX_RESEARCH: 'UX_RESEARCH'
};
// Export all public APIs
__exportStar(require("./types"), exports);
__exportStar(require("./core/context-system"), exports);
__exportStar(require("./storage/database"), exports);
__exportStar(require("./search/search-engine"), exports);
// Factory function for convenient initialization
async function createContextSystem(dbPath) {
    const system = new context_system_1.ContextEngineeringSystem(dbPath);
    await system.initialize();
    return system;
}
// Helper functions for common operations
class ContextAPI {
    system;
    constructor(system) {
        this.system = system;
    }
    // Quick search methods
    async quickSearch(query, limit = 10) {
        const searchQuery = {
            query,
            limit,
            offset: 0
        };
        const result = await this.system.search(searchQuery);
        return result.entries;
    }
    // Get latest context for an agent
    async getAgentContext(agent) {
        return await this.system.getContextForAgent(agent);
    }
    // Store a quick note/memo
    async storeMemo(title, content, tags = []) {
        return await this.system.storeGeneralContext({
            title,
            content,
            type: 'project_context',
            agents: [AgentTypes.ORCHESTRATOR],
            tags: ['memo', ...tags],
            confidence: 0.6
        });
    }
    // Create ADR with simplified interface
    async createDecision(title, problem, chosen, rationale) {
        return await this.system.createADR({
            title,
            problem,
            alternatives: [chosen], // Single alternative for simple cases
            chosen,
            rationale,
            consequences: [],
            agents: [AgentTypes.ORCHESTRATOR],
            priority: 'medium'
        });
    }
    // Store pattern with simplified interface
    async storePattern(title, description, category = 'component') {
        return await this.system.createPattern({
            title,
            description,
            category,
            complexity: 'medium',
            reusability: 'high',
            agents: [AgentTypes.COMPONENT_DEVELOPER],
            tags: ['component', 'pattern']
        });
    }
}
exports.ContextAPI = ContextAPI;
// Default export for easy usage
exports.default = context_system_1.ContextEngineeringSystem;
//# sourceMappingURL=index.js.map