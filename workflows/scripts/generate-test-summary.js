#!/usr/bin/env node

/**
 * Generate Test Summary Report
 * Aggregates test results from all test suites and generates a comprehensive report
 */

const fs = require('fs');
const path = require('path');

const RESULTS_PATH = process.env.RESULTS_PATH || path.join(__dirname, '../../test-results');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Read test results
function readTestResults() {
  const results = {
    unit: { passed: 0, failed: 0, skipped: 0, total: 0, duration: 0 },
    integration: { passed: 0, failed: 0, skipped: 0, total: 0, duration: 0 },
    e2e: { passed: 0, failed: 0, skipped: 0, total: 0, duration: 0 },
    visual: { passed: 0, failed: 0, skipped: 0, total: 0, duration: 0 },
    accessibility: { passed: 0, failed: 0, skipped: 0, total: 0, duration: 0 },
    performance: { passed: 0, failed: 0, skipped: 0, total: 0, duration: 0 }
  };

  // Read Vitest results (Unit tests)
  const vitestResults = path.join(RESULTS_PATH, 'vitest-results.json');
  if (fs.existsSync(vitestResults)) {
    const data = JSON.parse(fs.readFileSync(vitestResults, 'utf8'));
    data.testResults.forEach(suite => {
      suite.assertionResults.forEach(test => {
        if (test.status === 'passed') results.unit.passed++;
        else if (test.status === 'failed') results.unit.failed++;
        else results.unit.skipped++;
        results.unit.total++;
      });
    });
  }

  // Read Playwright results (Integration tests)
  const playwrightResults = path.join(RESULTS_PATH, 'results.json');
  if (fs.existsSync(playwrightResults)) {
    const data = JSON.parse(fs.readFileSync(playwrightResults, 'utf8'));
    data.suites.forEach(suite => {
      suite.specs.forEach(spec => {
        spec.tests.forEach(test => {
          if (test.results[0].status === 'passed') results.integration.passed++;
          else if (test.results[0].status === 'failed') results.integration.failed++;
          else results.integration.skipped++;
          results.integration.total++;
        });
      });
    });
  }

  // Read Cypress results (E2E tests)
  const cypressResults = path.join(RESULTS_PATH, 'cypress-results.json');
  if (fs.existsSync(cypressResults)) {
    const data = JSON.parse(fs.readFileSync(cypressResults, 'utf8'));
    data.runs.forEach(run => {
      run.tests.forEach(test => {
        if (test.state === 'passed') results.e2e.passed++;
        else if (test.state === 'failed') results.e2e.failed++;
        else results.e2e.skipped++;
        results.e2e.total++;
      });
    });
  }

  return results;
}

// Calculate statistics
function calculateStats(results) {
  const stats = {
    totalPassed: 0,
    totalFailed: 0,
    totalSkipped: 0,
    totalTests: 0,
    passRate: 0,
    failRate: 0,
    suites: {}
  };

  for (const [suite, data] of Object.entries(results)) {
    stats.totalPassed += data.passed;
    stats.totalFailed += data.failed;
    stats.totalSkipped += data.skipped;
    stats.totalTests += data.total;

    stats.suites[suite] = {
      passed: data.passed,
      failed: data.failed,
      skipped: data.skipped,
      total: data.total,
      passRate: data.total > 0 ? ((data.passed / data.total) * 100).toFixed(2) : 0
    };
  }

  if (stats.totalTests > 0) {
    stats.passRate = ((stats.totalPassed / stats.totalTests) * 100).toFixed(2);
    stats.failRate = ((stats.totalFailed / stats.totalTests) * 100).toFixed(2);
  }

  return stats;
}

// Generate markdown report
function generateMarkdownReport(results, stats) {
  let report = '# Test Execution Summary\n\n';
  report += '## Overview\n\n';
  report += `- **Total Tests**: ${stats.totalTests}\n`;
  report += `- **Passed**: ${colors.green}${stats.totalPassed}${colors.reset}\n`;
  report += `- **Failed**: ${colors.red}${stats.totalFailed}${colors.reset}\n`;
  report += `- **Skipped**: ${colors.yellow}${stats.totalSkipped}${colors.reset}\n`;
  report += `- **Pass Rate**: ${stats.passRate}%\n\n`;

  report += '## Test Suite Results\n\n';
  report += '| Suite | Passed | Failed | Skipped | Total | Pass Rate |\n';
  report += '|-------|--------|--------|---------|-------|-----------|\n';

  for (const [suite, data] of Object.entries(stats.suites)) {
    const passRateColor = data.passRate >= 90 ? colors.green : data.passRate >= 70 ? colors.yellow : colors.red;
    report += `| ${suite} | ${data.passed} | ${data.failed} | ${data.skipped} | ${data.total} | ${passRateColor}${data.passRate}%${colors.reset} |\n`;
  }

  report += '\n## Detailed Results\n\n';

  for (const [suite, data] of Object.entries(stats.suites)) {
    report += `### ${suite.charAt(0).toUpperCase() + suite.slice(1)} Tests\n\n`;
    report += `- **Passed**: ${data.passed}\n`;
    report += `- **Failed**: ${data.failed}\n`;
    report += `- **Skipped**: ${data.skipped}\n`;
    report += `- **Pass Rate**: ${data.passRate}%\n\n`;
  }

  report += '\n---\n\n';
  report += `Generated at: ${new Date().toISOString()}\n`;

  return report;
}

// Generate console output
function printConsoleReport(results, stats) {
  console.log('\n' + '='.repeat(50));
  console.log('TEST EXECUTION SUMMARY');
  console.log('='.repeat(50) + '\n');

  console.log('Overall Statistics:');
  console.log(`  Total Tests: ${stats.totalTests}`);
  console.log(`  ${colors.green}Passed:${colors.reset} ${stats.totalPassed}`);
  console.log(`  ${colors.red}Failed:${colors.reset} ${stats.totalFailed}`);
  console.log(`  ${colors.yellow}Skipped:${colors.reset} ${stats.totalSkipped}`);
  console.log(`  Pass Rate: ${stats.passRate}%\n`);

  console.log('Suite Breakdown:');
  for (const [suite, data] of Object.entries(stats.suites)) {
    const statusColor = data.passRate >= 90 ? colors.green : data.passRate >= 70 ? colors.yellow : colors.red;
    console.log(`  ${suite.charAt(0).toUpperCase() + suite.slice(1)}: ${data.passed}/${data.total} (${statusColor}${data.passRate}%${colors.reset})`);
  }

  console.log('');
}

// Main execution
try {
  const results = readTestResults();
  const stats = calculateStats(results);

  // Print console report
  printConsoleReport(results, stats);

  // Generate markdown report
  const markdown = generateMarkdownReport(results, stats);
  const outputPath = path.join(__dirname, '../../test-summary-report.md');

  fs.writeFileSync(outputPath, markdown);
  console.log(`\n${colors.cyan}Test summary report generated:${colors.reset} ${outputPath}`);

  // Exit with appropriate code
  process.exit(stats.totalFailed > 0 ? 1 : 0);
} catch (error) {
  console.error(`${colors.red}Error generating test summary:${colors.reset}`, error.message);
  process.exit(1);
}
