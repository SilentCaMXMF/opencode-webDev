#!/usr/bin/env node

/**
 * Health Check Script
 * Performs basic health checks on the application
 */

const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TIMEOUT = 10000;

// Health check endpoints
const checks = [
  {
    name: 'Homepage',
    path: '/',
    expectedStatus: 200
  },
  {
    name: 'About Section',
    path: '/#summary-section',
    expectedStatus: 200
  },
  {
    name: 'Skills Section',
    path: '/#skills-section',
    expectedStatus: 200
  },
  {
    name: 'Projects Section',
    path: '/#github-repos-section',
    expectedStatus: 200
  },
  {
    name: 'Contact Section',
    path: '/#contacts',
    expectedStatus: 200
  }
];

// Check single endpoint
function checkEndpoint(check) {
  return new Promise((resolve, reject) => {
    const url = new URL(check.path, BASE_URL);
    const startTime = Date.now();

    const req = http.get(url, (res) => {
      const duration = Date.now() - startTime;

      if (res.statusCode === check.expectedStatus) {
        resolve({
          name: check.name,
          path: check.path,
          status: 'pass',
          statusCode: res.statusCode,
          duration
        });
      } else {
        resolve({
          name: check.name,
          path: check.path,
          status: 'fail',
          statusCode: res.statusCode,
          duration,
          expected: check.expectedStatus
        });
      }
    });

    req.on('error', (error) => {
      resolve({
        name: check.name,
        path: check.path,
        status: 'fail',
        statusCode: 'error',
        error: error.message
      });
    });

    req.setTimeout(TIMEOUT, () => {
      req.destroy();
      resolve({
        name: check.name,
        path: check.path,
        status: 'fail',
        statusCode: 'timeout',
        error: `Timeout after ${TIMEOUT}ms`
      });
    });
  });
}

// Format duration
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// Main execution
async function main() {
  console.log(`\n🏥 Health Check: ${BASE_URL}\n`);

  const results = await Promise.all(checks.map(checkEndpoint));

  // Display results
  console.log('Results:');
  console.log('─'.repeat(50));

  results.forEach(result => {
    const statusIcon = result.status === 'pass' ? '✅' : '❌';
    const duration = result.duration ? formatDuration(result.duration) : 'N/A';

    console.log(`${statusIcon} ${result.name}`);
    console.log(`   Path: ${result.path}`);
    console.log(`   Status: ${result.statusCode}`);
    console.log(`   Duration: ${duration}`);

    if (result.status === 'fail') {
      console.log(`   Expected: ${result.expected || '200'}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }
    console.log('');
  });

  // Summary
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.length - passed;

  console.log('─'.repeat(50));
  console.log(`\nSummary:`);
  console.log(`  Total: ${results.length}`);
  console.log(`  ${'✅'.repeat(passed)} Passed: ${passed}`);
  console.log(`  ${'❌'.repeat(failed)} Failed: ${failed}`);
  console.log('');

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run health check
main().catch(error => {
  console.error('Health check error:', error);
  process.exit(1);
});
