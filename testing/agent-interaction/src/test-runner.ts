/**
 * Test Runner Script
 *
 * Runs all agent interaction tests and generates reports
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Suite } from 'vitest';

// Import all test suites
import './agent-communication.test';
import './context-sharing.test';
import './conflict-resolution.test';
import './decision-framework.test';

// Test metadata
const TEST_SUITE_NAME = 'Frontend Design Agent System - Agent Interaction Tests';
const TEST_SUITE_VERSION = '1.0.0';
const TEST_RUN_ID = `TEST-${Date.now()}`;

// Global variables for tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let skippedTests = 0;
const testResults: any[] = [];
const startTime = Date.now();

/**
 * Setup before all tests
 */
beforeAll(() => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║  ${TEST_SUITE_NAME}                                  ║
║  Version: ${TEST_SUITE_VERSION}                                    ║
║  Test Run ID: ${TEST_RUN_ID}                              ║
╚══════════════════════════════════════════════════════════╝
`);

  // Setup test environment
  process.env.NODE_ENV = 'test';
});

/**
 * Cleanup after all tests
 */
afterAll(() => {
  const duration = Date.now() - startTime;
  const passRate = ((passedTests / totalTests) * 100).toFixed(2);

  console.log(`
╔══════════════════════════════════════════════════════════╗
║  Test Results Summary                                      ║
╠══════════════════════════════════════════════════════════╣
║  Total Tests:      ${totalTests.toString().padEnd(15)} ║
║  Passed:           ${passedTests.toString().padEnd(15)} ║
║  Failed:           ${failedTests.toString().padEnd(15)} ║
║  Skipped:          ${skippedTests.toString().padEnd(15)} ║
║  Pass Rate:        ${passRate.padEnd(15)} ║
║  Duration:         ${duration.toString().padEnd(15)}ms   ║
╚══════════════════════════════════════════════════════════╝
`);

  // Generate detailed report
  generateTestReport(duration, passRate);
});

/**
 * Generate test report
 */
function generateTestReport(duration: number, passRate: string) {
  const report = {
    test_suite: TEST_SUITE_NAME,
    version: TEST_SUITE_VERSION,
    test_run_id: TEST_RUN_ID,
    generated_at: new Date().toISOString(),
    summary: {
      total_tests: totalTests,
      passed_tests: passedTests,
      failed_tests: failedTests,
      skipped_tests: skippedTests,
      pass_rate: parseFloat(passRate),
      duration_ms: duration
    },
    results: testResults,
    recommendations: generateRecommendations()
  };

  // Save report
  const fs = require('fs');
  const path = require('path');
  const reportsDir = path.join(__dirname, '../reports');

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath = path.join(reportsDir, `agent-interaction-test-results-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n📊 Test report saved to: ${reportPath}\n`);
}

/**
 * Generate recommendations based on test results
 */
function generateRecommendations(): string[] {
  const recommendations: string[] = [];

  if (failedTests === 0) {
    recommendations.push('All tests passed. No immediate actions required.');
  } else {
    recommendations.push(`${failedTests} tests failed. Prioritize fixing high-priority test failures.`);
  }

  if (parseFloat((passedTests / totalTests).toFixed(2)) < 0.95) {
    recommendations.push('Pass rate below 95%. Review test failures and improve system reliability.');
  }

  if (totalTests > 0 && failedTests / totalTests > 0.1) {
    recommendations.push('Failure rate above 10%. Investigate systemic issues.');
  }

  return recommendations;
}

// Export for test results tracking
export const testRunner = {
  TEST_SUITE_NAME,
  TEST_SUITE_VERSION,
  TEST_RUN_ID,
  getTestResults: () => ({
    total: totalTests,
    passed: passedTests,
    failed: failedTests,
    skipped: skippedTests,
    results: testResults
  }),
  recordTestResult: (result: any) => {
    totalTests++;
    testResults.push(result);

    if (result.status === 'passed') {
      passedTests++;
    } else if (result.status === 'failed') {
      failedTests++;
    } else if (result.status === 'skipped') {
      skippedTests++;
    }
  }
};
