#!/bin/bash

# Verification Script
# Verifies that all testing infrastructure files are properly configured

set -e

echo "🔍 Verifying Testing Infrastructure..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Counters
TOTAL=0
PASSED=0
FAILED=0

# Check file exists
check_file() {
  TOTAL=$((TOTAL + 1))
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}✗${NC} $1 (missing)"
    FAILED=$((FAILED + 1))
  fi
}

# Check directory exists
check_dir() {
  TOTAL=$((TOTAL + 1))
  if [ -d "$1" ]; then
    echo -e "${GREEN}✓${NC} $1 (directory)"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}✗${NC} $1 (missing directory)"
    FAILED=$((FAILED + 1))
  fi
}

# Check script executable
check_executable() {
  TOTAL=$((TOTAL + 1))
  if [ -x "$1" ]; then
    echo -e "${GREEN}✓${NC} $1 (executable)"
    PASSED=$((PASSED + 1))
  else
    echo -e "${YELLOW}⚠${NC} $1 (not executable)"
    FAILED=$((FAILED + 1))
  fi
}

echo "📁 Checking Directories..."
check_dir "github-actions"
check_dir "vitest"
check_dir "cypress"
check_dir "playwright"
check_dir "mocks"
check_dir "mocks/fixtures"
check_dir "docker"
check_dir "config"
check_dir "scripts"
check_dir "docs"
check_dir "reports"

echo ""
echo "📝 Checking GitHub Actions Workflows..."
check_file "github-actions/ci.yml"
check_file "github-actions/cd.yml"
check_file "github-actions/security-scan.yml"
check_file "github-actions/performance.yml"
check_file "github-actions/accessibility.yml"
check_file "github-actions/quality-gates.yml"

echo ""
echo "🔧 Checking Configuration Files..."
check_file "vitest/vitest.config.ts"
check_file "vitest/setup.js"
check_file "cypress/cypress.config.js"
check_file "playwright/playwright.config.ts"
check_file "package.json"

echo ""
echo "🐳 Checking Docker Files..."
check_file "docker/docker-compose.yml"
check_file "docker/Dockerfile"

echo ""
echo "⚙️  Checking Configuration Files..."
check_file "config/quality-gates.json"
check_file "config/browsers.json"
check_file "config/devices.json"

echo ""
echo "🎭 Checking Mock Files..."
check_file "mocks/server.js"
check_file "mocks/fixtures/github_repos.json"
check_file "mocks/fixtures/github_user.json"
check_file "mocks/fixtures/mock_responses.json"

echo ""
echo "📜 Checking Scripts..."
check_file "scripts/setup-test-env.sh"
check_file "scripts/check-coverage.js"
check_file "scripts/generate-test-summary.js"
check_file "scripts/check-quality-gates.js"
check_file "scripts/health-check.js"

echo ""
echo "📚 Checking Documentation..."
check_file "docs/TESTING.md"
check_file "docs/CI-CD.md"
check_file "docs/QUALITY-GATES.md"
check_file "docs/TROUBLESHOOTING.md"
check_file "README.md"
check_file "IMPLEMENTATION-SUMMARY.md"

echo ""
echo "🔒 Checking Script Permissions..."
if [ -f "scripts/setup-test-env.sh" ]; then
  chmod +x scripts/setup-test-env.sh
  check_executable "scripts/setup-test-env.sh"
fi

if [ -f "scripts/check-coverage.js" ]; then
  chmod +x scripts/check-coverage.js
  check_executable "scripts/check-coverage.js"
fi

if [ -f "scripts/generate-test-summary.js" ]; then
  chmod +x scripts/generate-test-summary.js
  check_executable "scripts/generate-test-summary.js"
fi

if [ -f "scripts/check-quality-gates.js" ]; then
  chmod +x scripts/check-quality-gates.js
  check_executable "scripts/check-quality-gates.js"
fi

if [ -f "scripts/health-check.js" ]; then
  chmod +x scripts/health-check.js
  check_executable "scripts/health-check.js"
fi

echo ""
echo "────────────────────────────────────────"
echo "Verification Summary"
echo "────────────────────────────────────────"
echo -e "Total Checks: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
  echo -e "${RED}Failed: $FAILED${NC}"
  echo ""
  echo "⚠️  Some checks failed. Please review and fix."
  exit 1
else
  echo -e "${GREEN}Failed: $FAILED${NC}"
  echo ""
  echo -e "${GREEN}✅ All checks passed!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Run: npm install"
  echo "2. Run: npm run setup:env"
  echo "3. Run: npm run test:all"
  echo ""
  exit 0
fi
