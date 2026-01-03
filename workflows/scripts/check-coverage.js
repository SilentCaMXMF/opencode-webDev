#!/usr/bin/env node

/**
 * Check Coverage Thresholds Script
 * Validates that code coverage meets the required thresholds
 */

const fs = require('fs');
const path = require('path');

// Load quality gates configuration
const configPath = path.join(__dirname, '../config/quality-gates.json');
let config = { coverage: { critical: 90, overall: 80 } };

if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

// Coverage report path
const coveragePath = path.join(__dirname, '../../coverage/coverage-summary.json');

if (!fs.existsSync(coveragePath)) {
  console.error('❌ Coverage report not found at:', coveragePath);
  process.exit(1);
}

const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));

// Check thresholds
const checkThreshold = (value, threshold, label) => {
  if (value < threshold) {
    console.error(`❌ ${label} coverage (${value}%) below threshold (${threshold}%)`);
    return false;
  }
  console.log(`✅ ${label} coverage: ${value}%`);
  return true;
};

console.log('Checking coverage thresholds...');
console.log('Critical threshold:', config.coverage.critical + '%');
console.log('Overall threshold:', config.coverage.overall + '%');
console.log('');

let allPassed = true;

// Check overall coverage
const total = coverage.total;
allPassed &= checkThreshold(total.lines.pct, config.coverage.overall, 'Lines');
allPassed &= checkThreshold(total.functions.pct, config.coverage.overall, 'Functions');
allPassed &= checkThreshold(total.branches.pct, config.coverage.overall, 'Branches');
allPassed &= checkThreshold(total.statements.pct, config.coverage.overall, 'Statements');

// Check critical files
const criticalFiles = ['js/script.js', 'css/style.css'];
let criticalPassed = true;

for (const file of criticalFiles) {
  if (coverage[file]) {
    const fileCoverage = coverage[file];
    const passed = checkThreshold(
      fileCoverage.lines.pct,
      config.coverage.critical,
      `Critical file: ${file}`
    );
    criticalPassed &= passed;
  }
}

if (!criticalPassed) {
  allPassed = false;
  console.error('');
  console.error('❌ Critical files coverage below threshold');
}

console.log('');
if (allPassed) {
  console.log('✅ All coverage thresholds passed');
  process.exit(0);
} else {
  console.error('❌ Some coverage thresholds failed');
  process.exit(1);
}
