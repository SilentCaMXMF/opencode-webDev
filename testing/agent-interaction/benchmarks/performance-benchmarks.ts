/**
 * Performance Benchmark Definitions
 *
 * Defines performance benchmarks and metrics for all agents in the
 * Frontend Design Agent System.
 */

export interface Benchmark {
  id: string;
  name: string;
  description: string;
  category: 'response_time' | 'throughput' | 'memory' | 'cpu' | 'network';
  target: number;
  unit: string;
  threshold?: number;
  warning_threshold?: number;
  critical_threshold?: number;
  measurement_method: 'p50' | 'p95' | 'p99' | 'avg' | 'min' | 'max';
}

export interface BenchmarkSuite {
  id: string;
  name: string;
  description: string;
  benchmarks: Benchmark[];
}

export interface PerformanceTarget {
  agent: string;
  benchmarks: BenchmarkSuite[];
}

// ============================================================================
// Response Time Benchmarks
// ============================================================================

const responseTimeBenchmarks: Benchmark[] = [
  {
    id: 'agent_response_time',
    name: 'Agent Response Time',
    description: 'Time for an agent to respond to a message',
    category: 'response_time',
    target: 500,
    unit: 'ms',
    warning_threshold: 600,
    critical_threshold: 1000,
    measurement_method: 'p95'
  },
  {
    id: 'handoff_latency',
    name: 'Handoff Latency',
    description: 'Time for a handoff to complete between agents',
    category: 'response_time',
    target: 200,
    unit: 'ms',
    warning_threshold: 250,
    critical_threshold: 500,
    measurement_method: 'p95'
  },
  {
    id: 'context_sync_time',
    name: 'Context Sync Time',
    description: 'Time for context to synchronize across agents',
    category: 'response_time',
    target: 100,
    unit: 'ms',
    warning_threshold: 120,
    critical_threshold: 200,
    measurement_method: 'p95'
  },
  {
    id: 'decision_time',
    name: 'Decision Time',
    description: 'Time for a collaborative decision to be made',
    category: 'response_time',
    target: 5000,
    unit: 'ms',
    warning_threshold: 7000,
    critical_threshold: 10000,
    measurement_method: 'p95'
  },
  {
    id: 'tool_execution_time',
    name: 'Tool Execution Time',
    description: 'Time for a tool to execute',
    category: 'response_time',
    target: 1000,
    unit: 'ms',
    warning_threshold: 1200,
    critical_threshold: 2000,
    measurement_method: 'p95'
  },
  {
    id: 'conflict_resolution_time',
    name: 'Conflict Resolution Time',
    description: 'Time for a conflict to be resolved',
    category: 'response_time',
    target: 3000,
    unit: 'ms',
    warning_threshold: 4000,
    critical_threshold: 6000,
    measurement_method: 'p95'
  },
  {
    id: 'context7_query_time',
    name: 'Context7 Query Time',
    description: 'Time for a Context7 query to complete',
    category: 'response_time',
    target: 300,
    unit: 'ms',
    warning_threshold: 400,
    critical_threshold: 600,
    measurement_method: 'p95'
  }
];

// ============================================================================
// Throughput Benchmarks
// ============================================================================

const throughputBenchmarks: Benchmark[] = [
  {
    id: 'messages_per_second',
    name: 'Messages Per Second',
    description: 'Number of messages processed per second',
    category: 'throughput',
    target: 100,
    unit: 'msg/s',
    threshold: 80,
    warning_threshold: 90,
    critical_threshold: 70,
    measurement_method: 'avg'
  },
  {
    id: 'handoffs_per_second',
    name: 'Handoffs Per Second',
    description: 'Number of handoffs completed per second',
    category: 'throughput',
    target: 50,
    unit: 'handoffs/s',
    threshold: 40,
    warning_threshold: 45,
    critical_threshold: 35,
    measurement_method: 'avg'
  },
  {
    id: 'context_updates_per_second',
    name: 'Context Updates Per Second',
    description: 'Number of context updates processed per second',
    category: 'throughput',
    target: 200,
    unit: 'updates/s',
    threshold: 160,
    warning_threshold: 180,
    critical_threshold: 140,
    measurement_method: 'avg'
  },
  {
    id: 'tool_calls_per_second',
    name: 'Tool Calls Per Second',
    description: 'Number of tool calls processed per second',
    category: 'throughput',
    target: 75,
    unit: 'calls/s',
    threshold: 60,
    warning_threshold: 67,
    critical_threshold: 52,
    measurement_method: 'avg'
  }
];

// ============================================================================
// Memory Benchmarks
// ============================================================================

const memoryBenchmarks: Benchmark[] = [
  {
    id: 'agent_memory_usage',
    name: 'Agent Memory Usage',
    description: 'Memory used by each agent',
    category: 'memory',
    target: 100,
    unit: 'MB',
    warning_threshold: 150,
    critical_threshold: 200,
    measurement_method: 'max'
  },
  {
    id: 'context_memory_usage',
    name: 'Context Memory Usage',
    description: 'Memory used for context storage',
    category: 'memory',
    target: 50,
    unit: 'MB',
    warning_threshold: 75,
    critical_threshold: 100,
    measurement_method: 'max'
  },
  {
    id: 'message_queue_memory',
    name: 'Message Queue Memory',
    description: 'Memory used for message queues',
    category: 'memory',
    target: 20,
    unit: 'MB',
    warning_threshold: 30,
    critical_threshold: 50,
    measurement_method: 'max'
  },
  {
    id: 'total_memory_usage',
    name: 'Total System Memory',
    description: 'Total memory used by the agent system',
    category: 'memory',
    target: 500,
    unit: 'MB',
    warning_threshold: 750,
    critical_threshold: 1000,
    measurement_method: 'max'
  },
  {
    id: 'memory_leak_detection',
    name: 'Memory Leak Detection',
    description: 'Memory growth over time (should be minimal)',
    category: 'memory',
    target: 5,
    unit: 'MB/hour',
    warning_threshold: 10,
    critical_threshold: 20,
    measurement_method: 'avg'
  }
];

// ============================================================================
// CPU Benchmarks
// ============================================================================

const cpuBenchmarks: Benchmark[] = [
  {
    id: 'agent_cpu_usage',
    name: 'Agent CPU Usage',
    description: 'CPU usage per agent',
    category: 'cpu',
    target: 20,
    unit: '%',
    warning_threshold: 30,
    critical_threshold: 50,
    measurement_method: 'avg'
  },
  {
    id: 'total_cpu_usage',
    name: 'Total System CPU',
    description: 'Total CPU usage by the agent system',
    category: 'cpu',
    target: 60,
    unit: '%',
    warning_threshold: 75,
    critical_threshold: 90,
    measurement_method: 'avg'
  },
  {
    id: 'cpu_efficiency',
    name: 'CPU Efficiency',
    description: 'Messages processed per CPU cycle',
    category: 'cpu',
    target: 1000,
    unit: 'msg/MHz',
    threshold: 800,
    warning_threshold: 900,
    critical_threshold: 700,
    measurement_method: 'avg'
  }
];

// ============================================================================
// Network Benchmarks
// ============================================================================

const networkBenchmarks: Benchmark[] = [
  {
    id: 'network_latency',
    name: 'Network Latency',
    description: 'Network latency between agents',
    category: 'network',
    target: 10,
    unit: 'ms',
    warning_threshold: 20,
    critical_threshold: 50,
    measurement_method: 'p95'
  },
  {
    id: 'bandwidth_usage',
    name: 'Bandwidth Usage',
    description: 'Network bandwidth used',
    category: 'network',
    target: 10,
    unit: 'MB/s',
    warning_threshold: 15,
    critical_threshold: 20,
    measurement_method: 'max'
  },
  {
    id: 'message_size',
    name: 'Message Size',
    description: 'Average size of messages',
    category: 'network',
    target: 10,
    unit: 'KB',
    warning_threshold: 15,
    critical_threshold: 25,
    measurement_method: 'avg'
  }
];

// ============================================================================
// Agent-Specific Benchmarks
// ============================================================================

const orchestratorBenchmarks: BenchmarkSuite = {
  id: 'orchestrator_benchmarks',
  name: 'Orchestrator Benchmarks',
  description: 'Performance benchmarks for the Frontend Design Orchestrator',
  benchmarks: [
    {
      id: 'orchestrator_response_time',
      name: 'Orchestrator Response Time',
      description: 'Time for orchestrator to respond to requests',
      category: 'response_time',
      target: 400,
      unit: 'ms',
      warning_threshold: 500,
      critical_threshold: 800,
      measurement_method: 'p95'
    },
    {
      id: 'task_delegation_time',
      name: 'Task Delegation Time',
      description: 'Time for orchestrator to delegate tasks',
      category: 'response_time',
      target: 150,
      unit: 'ms',
      warning_threshold: 200,
      critical_threshold: 300,
      measurement_method: 'p95'
    },
    {
      id: 'coordination_overhead',
      name: 'Coordination Overhead',
      description: 'Time spent coordinating agents',
      category: 'response_time',
      target: 100,
      unit: 'ms',
      warning_threshold: 150,
      critical_threshold: 200,
      measurement_method: 'p95'
    },
    {
      id: 'orchestrator_memory',
      name: 'Orchestrator Memory Usage',
      description: 'Memory used by orchestrator',
      category: 'memory',
      target: 80,
      unit: 'MB',
      warning_threshold: 120,
      critical_threshold: 160,
      measurement_method: 'max'
    }
  ]
};

const specialistBenchmarks: BenchmarkSuite = {
  id: 'specialist_benchmarks',
  name: 'Specialist Agent Benchmarks',
  description: 'Performance benchmarks for all specialist agents',
  benchmarks: [
    {
      id: 'specialist_response_time',
      name: 'Specialist Response Time',
      description: 'Time for specialist agents to respond',
      category: 'response_time',
      target: 450,
      unit: 'ms',
      warning_threshold: 550,
      critical_threshold: 900,
      measurement_method: 'p95'
    },
    {
      id: 'specialist_memory',
      name: 'Specialist Memory Usage',
      description: 'Memory used by each specialist agent',
      category: 'memory',
      target: 50,
      unit: 'MB',
      warning_threshold: 75,
      critical_threshold: 100,
      measurement_method: 'max'
    },
    {
      id: 'specialist_throughput',
      name: 'Specialist Throughput',
      description: 'Messages processed per specialist',
      category: 'throughput',
      target: 15,
      unit: 'msg/s',
      threshold: 12,
      warning_threshold: 13,
      critical_threshold: 10,
      measurement_method: 'avg'
    }
  ]
};

// ============================================================================
// Load Testing Benchmarks
// ============================================================================

const loadTestingBenchmarks: BenchmarkSuite = {
  id: 'load_testing_benchmarks',
  name: 'Load Testing Benchmarks',
  description: 'Benchmarks for testing system under load',
  benchmarks: [
    {
      id: 'concurrent_agent_load',
      name: 'Concurrent Agent Load',
      description: 'Performance with all 11 agents active',
      category: 'throughput',
      target: 80,
      unit: '% throughput',
      threshold: 70,
      warning_threshold: 75,
      critical_threshold: 65,
      measurement_method: 'avg'
    },
    {
      id: 'sustained_load',
      name: 'Sustained Load',
      description: 'Performance over 1 hour of sustained load',
      category: 'throughput',
      target: 90,
      unit: '% throughput',
      threshold: 80,
      warning_threshold: 85,
      critical_threshold: 75,
      measurement_method: 'avg'
    },
    {
      id: 'peak_load',
      name: 'Peak Load',
      description: 'Performance during peak traffic (2x normal)',
      category: 'throughput',
      target: 70,
      unit: '% throughput',
      threshold: 60,
      warning_threshold: 65,
      critical_threshold: 55,
      measurement_method: 'avg'
    },
    {
      id: 'spike_handling',
      name: 'Spike Handling',
      description: 'Performance during sudden traffic spike (5x normal)',
      category: 'response_time',
      target: 1000,
      unit: 'ms',
      warning_threshold: 1500,
      critical_threshold: 2000,
      measurement_method: 'p95'
    }
  ]
};

// ============================================================================
// Integration Benchmarks
// ============================================================================

const integrationBenchmarks: BenchmarkSuite = {
  id: 'integration_benchmarks',
  name: 'Integration Benchmarks',
  description: 'Benchmarks for integration with external services',
  benchmarks: [
    {
      id: 'context7_integration',
      name: 'Context7 Integration',
      description: 'Time to interact with Context7',
      category: 'response_time',
      target: 350,
      unit: 'ms',
      warning_threshold: 450,
      critical_threshold: 600,
      measurement_method: 'p95'
    },
    {
      id: 'monitoring_integration',
      name: 'Monitoring Integration',
      description: 'Time to report metrics to monitoring',
      category: 'response_time',
      target: 100,
      unit: 'ms',
      warning_threshold: 150,
      critical_threshold: 200,
      measurement_method: 'p95'
    },
    {
      id: 'ci_cd_integration',
      name: 'CI/CD Integration',
      description: 'Time to run in CI/CD pipeline',
      category: 'response_time',
      target: 120000,
      unit: 'ms',
      warning_threshold: 150000,
      critical_threshold: 180000,
      measurement_method: 'p95'
    }
  ]
};

// ============================================================================
// Benchmark Collections
// ============================================================================

export const benchmarkCollections: Record<string, BenchmarkSuite> = {
  response_time: {
    id: 'response_time_benchmarks',
    name: 'Response Time Benchmarks',
    description: 'Benchmarks measuring response times across the system',
    benchmarks: responseTimeBenchmarks
  },
  throughput: {
    id: 'throughput_benchmarks',
    name: 'Throughput Benchmarks',
    description: 'Benchmarks measuring system throughput',
    benchmarks: throughputBenchmarks
  },
  memory: {
    id: 'memory_benchmarks',
    name: 'Memory Benchmarks',
    description: 'Benchmarks measuring memory usage',
    benchmarks: memoryBenchmarks
  },
  cpu: {
    id: 'cpu_benchmarks',
    name: 'CPU Benchmarks',
    description: 'Benchmarks measuring CPU usage',
    benchmarks: cpuBenchmarks
  },
  network: {
    id: 'network_benchmarks',
    name: 'Network Benchmarks',
    description: 'Benchmarks measuring network performance',
    benchmarks: networkBenchmarks
  },
  orchestrator: orchestratorBenchmarks,
  specialists: specialistBenchmarks,
  load_testing: loadTestingBenchmarks,
  integration: integrationBenchmarks
};

// ============================================================================
// Performance Targets by Agent
// ============================================================================

export const agentPerformanceTargets: Record<string, PerformanceTarget> = {
  orchestrator: {
    agent: 'Frontend Design Orchestrator',
    benchmarks: [orchestratorBenchmarks]
  },
  design_system: {
    agent: 'Design System Specialist',
    benchmarks: [specialistBenchmarks]
  },
  component_developer: {
    agent: 'Component Developer',
    benchmarks: [specialistBenchmarks]
  },
  performance_optimizer: {
    agent: 'Performance Optimizer',
    benchmarks: [specialistBenchmarks]
  },
  accessibility: {
    agent: 'Accessibility Specialist',
    benchmarks: [specialistBenchmarks]
  },
  cross_platform: {
    agent: 'Cross-Platform Specialist',
    benchmarks: [specialistBenchmarks]
  },
  testing_qa: {
    agent: 'Testing & QA Specialist',
    benchmarks: [specialistBenchmarks]
  },
  security: {
    agent: 'Security Specialist',
    benchmarks: [specialistBenchmarks]
  },
  animation: {
    agent: 'Animation Specialist',
    benchmarks: [specialistBenchmarks]
  },
  i18n: {
    agent: 'I18n Specialist',
    benchmarks: [specialistBenchmarks]
  },
  ux_research: {
    agent: 'UX Research Specialist',
    benchmarks: [specialistBenchmarks]
  }
};

// ============================================================================
// Benchmark Execution Utilities
// ============================================================================

/**
 * Get all benchmarks
 */
export function getAllBenchmarks(): Benchmark[] {
  return Object.values(benchmarkCollections).flatMap(suite => suite.benchmarks);
}

/**
 * Get benchmarks by category
 */
export function getBenchmarksByCategory(category: Benchmark['category']): Benchmark[] {
  return Object.values(benchmarkCollections)
    .flatMap(suite => suite.benchmarks)
    .filter(b => b.category === category);
}

/**
 * Get benchmarks for specific agent
 */
export function getAgentBenchmarks(agent: string): Benchmark[] {
  const target = agentPerformanceTargets[agent];
  if (!target) return [];
  return target.benchmarks.flatMap(suite => suite.benchmarks);
}

/**
 * Get benchmark by ID
 */
export function getBenchmarkById(id: string): Benchmark | undefined {
  return Object.values(benchmarkCollections)
    .flatMap(suite => suite.benchmarks)
    .find(b => b.id === id);
}

/**
 * Check if benchmark meets target
 */
export function checkBenchmarkTarget(benchmark: Benchmark, actual: number): {
  meetsTarget: boolean;
  status: 'pass' | 'warning' | 'fail';
  diff: number;
} {
  const diff = actual - benchmark.target;
  
  if (diff <= 0) {
    return { meetsTarget: true, status: 'pass', diff };
  }
  
  if (benchmark.warning_threshold && actual >= benchmark.warning_threshold) {
    return { meetsTarget: false, status: 'warning', diff };
  }
  
  if (benchmark.critical_threshold && actual >= benchmark.critical_threshold) {
    return { meetsTarget: false, status: 'fail', diff };
  }
  
  return { meetsTarget: false, status: 'warning', diff };
}

// ============================================================================
// Export all
// ============================================================================

export default {
  benchmarkCollections,
  agentPerformanceTargets,
  getAllBenchmarks,
  getBenchmarksByCategory,
  getAgentBenchmarks,
  getBenchmarkById,
  checkBenchmarkTarget
};
