#!/bin/bash

# Setup Test Environment Script
# This script sets up the testing environment for the Frontend Design Agent System

set -e

echo "🚀 Setting up testing environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check Node.js version
check_node() {
    echo "Checking Node.js version..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        print_success "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js not found. Please install Node.js 20.x or later."
        exit 1
    fi
}

# Check npm version
check_npm() {
    echo "Checking npm version..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm -v)
        print_success "npm found: $NPM_VERSION"
    else
        print_error "npm not found."
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    echo "Installing dependencies..."
    if [ -f "package.json" ]; then
        npm ci
        print_success "Dependencies installed"
    else
        print_warning "No package.json found in current directory"
        print_warning "Please run this script from the root directory"
        exit 1
    fi
}

# Create required directories
create_directories() {
    echo "Creating required directories..."
    mkdir -p reports/{lighthouse,accessibility,visual,e2e,coverage}
    mkdir -p playwright-report
    mkdir -p test-results
    mkdir -p cypress/{screenshots,videos}
    print_success "Directories created"
}

# Install Playwright browsers
install_playwright() {
    echo "Installing Playwright browsers..."
    npx playwright install --with-deps
    print_success "Playwright browsers installed"
}

# Setup environment variables
setup_env() {
    echo "Setting up environment variables..."

    if [ ! -f ".env.test" ]; then
        cat > .env.test << EOF
# Test Environment Variables
NODE_ENV=test
CI=true
BASE_URL=http://localhost:3000
MOCK_SERVER_URL=http://localhost:8080
EOF
        print_success ".env.test created"
    else
        print_warning ".env.test already exists"
    fi
}

# Verify installation
verify_installation() {
    echo "Verifying installation..."

    # Check if vitest is installed
    if npm list vitest &> /dev/null; then
        print_success "Vitest installed"
    else
        print_error "Vitest not installed"
        exit 1
    fi

    # Check if cypress is installed
    if npm list cypress &> /dev/null; then
        print_success "Cypress installed"
    else
        print_error "Cypress not installed"
        exit 1
    fi

    # Check if playwright is installed
    if npm list @playwright/test &> /dev/null; then
        print_success "Playwright installed"
    else
        print_error "Playwright not installed"
        exit 1
    fi
}

# Run setup checks
run_setup_checks() {
    echo "Running setup checks..."

    # Test if mock server can be started
    if [ -f "tests/mocks/server.js" ]; then
        print_success "Mock server found"
    else
        print_warning "Mock server not found. Create it at tests/mocks/server.js"
    fi

    # Test if test configuration files exist
    if [ -f "vitest.config.ts" ]; then
        print_success "Vitest configuration found"
    fi

    if [ -f "cypress.config.js" ]; then
        print_success "Cypress configuration found"
    fi

    if [ -f "playwright.config.ts" ]; then
        print_success "Playwright configuration found"
    fi
}

# Print setup summary
print_summary() {
    echo ""
    echo "================================"
    echo "Setup completed successfully!"
    echo "================================"
    echo ""
    echo "Next steps:"
    echo "1. Run unit tests: npm run test"
    echo "2. Run integration tests: npm run test:integration"
    echo "3. Run E2E tests: npm run test:e2e"
    echo "4. Run visual tests: npm run test:visual"
    echo "5. Run accessibility tests: npm run test:accessibility"
    echo "6. Run performance tests: npm run test:performance"
    echo ""
    echo "To run all tests: npm run test:all"
    echo ""
    echo "To start the test server: npm run serve"
    echo "To start the mock server: npm run mock-server"
    echo ""
}

# Main setup flow
main() {
    check_node
    check_npm
    install_dependencies
    create_directories
    install_playwright
    setup_env
    verify_installation
    run_setup_checks
    print_summary
}

# Run main function
main
