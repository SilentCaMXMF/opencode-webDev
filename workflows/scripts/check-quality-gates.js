#!/usr/bin/env node

/**
 * Check Quality Gates Script
 * Validates all quality gates and returns appropriate exit code
 */

const fs = require('fs');
const path = require('path');

// Load configuration
const configPath = path.join(__dirname, '../config/quality-gates.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Results object
const results = {
  coverage: { status: 'unknown', details: {} },
  performance: { status: 'unknown', details: {} },
  accessibility: { status: 'unknown', details: {} },
  security: { status: 'unknown', details: {} }
};

// Check coverage gate
function checkCoverageGate() {
  const coveragePath = path.join(process.env.ARTIFACTS_PATH || './test-results', 'coverage-report/coverage-summary.json');

  if (!fs.existsSync(coveragePath)) {
    results.coverage = {
      status: 'skip',
      details: { message: 'Coverage report not found' }
    };
    return;
  }

  const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  const total = coverage.total;

  const checks = {
    lines: total.lines.pct >= config.coverage.lines,
    functions: total.functions.pct >= config.coverage.functions,
    branches: total.branches.pct >= config.coverage.branches,
    statements: total.statements.pct >= config.coverage.statements
  };

  const passed = Object.values(checks).every(c => c);

  results.coverage = {
    status: passed ? 'pass' : 'fail',
    details: {
      lines: total.lines.pct,
      functions: total.functions.pct,
      branches: total.branches.pct,
      statements: total.statements.pct,
      thresholds: config.coverage
    }
  };
}

// Check performance gate
function checkPerformanceGate() {
  const perfPath = path.join(process.env.ARTIFACTS_PATH || './test-results', 'performance-gate-report/lighthouse-gate.json');

  if (!fs.existsSync(perfPath)) {
    results.performance = {
      status: 'skip',
      details: { message: 'Performance report not found' }
    };
    return;
  }

  const lighthouse = JSON.parse(fs.readFileSync(perfPath, 'utf8'));
  const scores = lighthouse.categories;

  const performance = (scores.performance.score * 100).toFixed(0);
  const accessibility = (scores.accessibility.score * 100).toFixed(0);
  const bestPractices = (scores.bestPractices.score * 100).toFixed(0);

  const passed = performance >= config.lighthouse.performance &&
               accessibility >= config.lighthouse.accessibility &&
               bestPractices >= config.lighthouse.bestPractices;

  results.performance = {
    status: passed ? 'pass' : 'fail',
    details: {
      performance,
      accessibility,
      bestPractices,
      thresholds: config.lighthouse
    }
  };
}

// Check accessibility gate
function checkAccessibilityGate() {
  const a11yPath = path.join(process.env.ARTIFACTS_PATH || './test-results', 'accessibility-gate-report/accessibility-gate.json');

  if (!fs.existsSync(a11yPath)) {
    results.accessibility = {
      status: 'skip',
      details: { message: 'Accessibility report not found' }
    };
    return;
  }

  const axe = JSON.parse(fs.readFileSync(a11yPath, 'utf8'));
  const violations = axe.violations || [];

  const critical = violations.filter(v => v.impact === 'critical').length;
  const serious = violations.filter(v => v.impact === 'serious').length;

  const passed = critical === 0 && serious <= config.accessibility.seriousViolations;

  results.accessibility = {
    status: passed ? 'pass' : 'fail',
    details: {
      totalViolations: violations.length,
      critical,
      serious,
      thresholds: config.accessibility
    }
  };
}

// Check security gate
function checkSecurityGate() {
  const secPath = path.join(process.env.ARTIFACTS_PATH || './test-results', 'security-gate-report/security-gate.json');

  if (!fs.existsSync(secPath)) {
    results.security = {
      status: 'skip',
      details: { message: 'Security report not found' }
    };
    return;
  }

  const security = JSON.parse(fs.readFileSync(secPath, 'utf8'));
  const vulnerabilities = security.vulnerabilities || [];

  const critical = vulnerabilities.filter(v => v.severity === 'critical').length;
  const high = vulnerabilities.filter(v => v.severity === 'high').length;

  const passed = critical <= config.security.criticalVulnerabilities;

  results.security = {
    status: passed ? 'pass' : 'fail',
    details: {
      critical,
      high,
      totalVulnerabilities: vulnerabilities.length,
      thresholds: config.security
    }
  };
}

// Generate quality gate report
function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    status: 'unknown',
    gates: results,
    summary: {}
  };

  const statuses = Object.values(results).map(r => r.status);
  const failures = statuses.filter(s => s === 'fail').length;
  const skips = statuses.filter(s => s === 'skip').length;

  if (failures > 0) {
    report.status = 'fail';
  } else if (skips > 0) {
    report.status = 'partial';
  } else {
    report.status = 'pass';
  }

  report.summary = {
    totalGates: Object.keys(results).length,
    passed: statuses.filter(s => s === 'pass').length,
    failed: failures,
    skipped: skips
  };

  return report;
}

// Main execution
try {
  checkCoverageGate();
  checkPerformanceGate();
  checkAccessibilityGate();
  checkSecurityGate();

  const report = generateReport();

  // Write report files
  fs.writeFileSync(
    path.join(process.cwd(), 'quality-gate-status.json'),
    JSON.stringify({ status: report.status }, null, 2)
  );

  fs.writeFileSync(
    path.join(process.cwd(), 'quality-gate-report.json'),
    JSON.stringify(report, null, 2)
  );

  // Generate markdown report
  let markdown = '# Quality Gates Report\n\n';
  markdown += `**Overall Status**: ${report.status === 'pass' ? '✅ PASS' : report.status === 'partial' ? '⚠️ PARTIAL' : '❌ FAIL'}\n\n`;

  markdown += '## Gate Results\n\n';
  markdown += '| Gate | Status | Details |\n';
  markdown += '|------|--------|---------|\n';

  for (const [name, result] of Object.entries(report.gates)) {
    const statusEmoji = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏭️';
    markdown += `| ${name} | ${statusEmoji} ${result.status} | ${JSON.stringify(result.details)} |\n`;
  }

  markdown += '\n## Summary\n\n';
  markdown += `- **Total Gates**: ${report.summary.totalGates}\n`;
  markdown += `- **Passed**: ${report.summary.passed}\n`;
  markdown += `- **Failed**: ${report.summary.failed}\n`;
  markdown += `- **Skipped**: ${report.summary.skipped}\n`;

  fs.writeFileSync('quality-gate-report.md', markdown);

  // Console output
  console.log('\nQuality Gates Status:', report.status.toUpperCase());
  console.log('- Passed:', report.summary.passed);
  console.log('- Failed:', report.summary.failed);
  console.log('- Skipped:', report.summary.skipped);

  // Exit with appropriate code
  process.exit(report.status === 'pass' ? 0 : 1);
} catch (error) {
  console.error('Error checking quality gates:', error.message);
  process.exit(1);
}
