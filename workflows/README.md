# Frontend Design Agent System - Testing Infrastructure

## Overview

This directory contains comprehensive testing infrastructure and CI/CD pipeline configuration for the Frontend Design Agent System. The infrastructure supports all 11 agents (1 orchestrator + 10 specialists) with automated testing, quality gates, and deployment automation.

## Structure

```
.opencode/workflows/
├── package.json                    # Shared testing dependencies
├── github-actions/                 # CI/CD workflows
│   ├── ci.yml                     # Continuous Integration
│   ├── cd.yml                     # Continuous Deployment
│   ├── security-scan.yml          # Security vulnerability scanning
│   ├── performance.yml            # Performance testing
│   ├── accessibility.yml          # Accessibility testing
│   └── quality-gates.yml          # Quality gate enforcement
├── vitest/                        # Unit & Integration testing
│   ├── vitest.config.ts           # Vitest configuration
│   ├── setup.js                   # Test setup
│   └── reporters/                 # Custom reporters
├── cypress/                       # E2E testing
│   ├── cypress.config.js          # Cypress configuration
│   ├── e2e/                       # E2E test specs
│   ├── fixtures/                 # Test fixtures
│   ├── support/                   # Support files
│   └── plugins/                   # Custom plugins
├── playwright/                    # Visual & Cross-browser testing
│   ├── playwright.config.ts       # Playwright configuration
│   ├── tests/                     # Test specs
│   └── visual/                    # Visual regression tests
├── mocks/                         # Mock servers & data
│   ├── server.js                  # Mock HTTP server
│   └── fixtures/                 # Mock data fixtures
├── docker/                        # Docker configurations
│   ├── Dockerfile                 # Test environment
│   └── docker-compose.yml         # Multi-container orchestration
├── config/                        # Shared configurations
│   ├── browsers.json              # Browser matrix
│   ├── devices.json               # Device testing matrix
│   ├── quality-gates.json         # Quality gate thresholds
│   └── test-data.json             # Test data fixtures
├── reports/                       # Test reports (generated)
├── scripts/                       # Utility scripts
│   ├── setup-test-env.sh          # Environment setup
│   ├── run-all-tests.sh           # Test orchestration
│   └── generate-reports.js        # Report generation
└── docs/                          # Documentation
    ├── TESTING.md                 # Testing guide
    ├── CI-CD.md                   # CI/CD guide
    ├── QUALITY-GATES.md           # Quality gates documentation
    └── TROUBLESHOOTING.md         # Troubleshooting guide
```

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Setup test environment
npm run setup:env
```

### Running Tests

```bash
# Run all tests
npm run test:all

# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run visual regression tests
npm run test:visual

# Run accessibility tests
npm run test:accessibility

# Run performance tests
npm run test:performance
```

### Running Locally

```bash
# Start mock server
npm run mock-server

# Start development server
npm run serve

# Run tests in watch mode
npm run test:watch
```

## Test Types

### 1. Unit Tests
- **Framework**: Vitest
- **Coverage**: 90% for critical code, 80% overall
- **Location**: `vitest/unit/`
- **Command**: `npm run test`

### 2. Integration Tests
- **Framework**: Playwright
- **Scope**: Component and feature integration
- **Location**: `playwright/tests/integration/`
- **Command**: `npm run test:integration`

### 3. E2E Tests
- **Framework**: Cypress
- **Scope**: Full user flows
- **Location**: `cypress/e2e/`
- **Command**: `npm run test:e2e`

### 4. Visual Regression Tests
- **Framework**: Playwright
- **Scope**: UI consistency across browsers
- **Location**: `playwright/tests/visual/`
- **Command**: `npm run test:visual`

### 5. Accessibility Tests
- **Tool**: axe-core, pa11y
- **Standards**: WCAG 2.1 AA
- **Command**: `npm run test:accessibility`

### 6. Performance Tests
- **Tool**: Lighthouse
- **Metrics**: Performance, Accessibility, Best Practices, SEO
- **Thresholds**: Lighthouse scores > 90
- **Command**: `npm run test:performance`

## CI/CD Pipeline

### Automated Workflows

1. **Pull Request Workflow** (`ci.yml`)
   - Linting and formatting checks
   - Unit test execution
   - Integration test execution
   - Security vulnerability scanning
   - Code coverage reporting

2. **Deployment Workflow** (`cd.yml`)
   - Full test suite execution
   - Quality gate validation
   - Automated deployment to staging/production
   - Rollback capabilities

3. **Security Workflow** (`security-scan.yml`)
   - Dependency vulnerability scanning
   - Code security analysis
   - Secrets detection
   - Compliance checks

4. **Performance Workflow** (`performance.yml`)
   - Performance benchmarking
   - Lighthouse audits
   - Bundle size analysis
   - Performance regression detection

5. **Accessibility Workflow** (`accessibility.yml`)
   - Automated accessibility testing
   - WCAG 2.1 AA compliance
   - ARIA attribute validation
   - Keyboard navigation testing

6. **Quality Gates Workflow** (`quality-gates.yml`)
   - Coverage threshold enforcement
   - Lighthouse score validation
   - Security vulnerability blocking
   - Breaking change detection

## Quality Gates

### Coverage Requirements
- **Critical Code**: 90% minimum
- **Overall Code**: 80% minimum
- **Accessibility**: 100% of WCAG 2.1 AA criteria

### Performance Thresholds
- **Lighthouse Performance**: > 90
- **Lighthouse Accessibility**: > 95
- **Lighthouse Best Practices**: > 90
- **Lighthouse SEO**: > 90

### Security Requirements
- **High Severity Vulnerabilities**: 0
- **Medium Severity Vulnerabilities**: < 5
- **Dependency Age**: < 2 years for critical deps

### Accessibility Standards
- **WCAG 2.1 Level AA**: 100% compliance
- **Keyboard Navigation**: All functionality accessible
- **Screen Reader**: Full support

## Browser Testing Matrix

### Primary Browsers
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### Mobile Testing
- iOS Safari (latest 2 versions)
- Chrome Mobile (latest 2 versions)

## Docker Integration

```bash
# Build test environment
docker-compose build

# Run tests in Docker
docker-compose run --rm tests

# Run specific test suite
docker-compose run --rm tests npm run test:unit
```

## Agent Integration

### Orchestrator Agent
- Automated test orchestration
- Test result aggregation
- Quality gate enforcement

### Accessibility Specialist Agent
- Automated a11y testing integration
- WCAG compliance validation
- Screen reader testing

### Performance Optimizer Agent
- Performance benchmarking
- Bundle size optimization
- Performance regression detection

### Cross-Platform Specialist Agent
- Multi-browser testing
- Cross-device validation
- Responsive design testing

### Component Developer Agent
- Component unit tests
- Component integration tests
- Visual regression tests

### Accessibility Specialist Agent
- axe-core integration
- Automated a11y testing
- WCAG compliance checks

### Design System Specialist Agent
- Design token validation
- Component consistency checks
- Visual regression testing

## Test Reports

Reports are generated in the `reports/` directory:
- `coverage/` - Code coverage reports
- `lighthouse/` - Performance audit reports
- `accessibility/` - Accessibility test results
- `visual/` - Visual regression reports
- `e2e/` - E2E test results

## Troubleshooting

See `docs/TROUBLESHOOTING.md` for common issues and solutions.

## Contributing

When adding new tests or modifying the testing infrastructure:

1. Follow existing patterns and conventions
2. Update documentation
3. Ensure all quality gates pass
4. Add comments for complex test logic
5. Include visual regression tests for UI changes

## Support

For issues or questions:
- Check documentation in `docs/`
- Review troubleshooting guide
- Open an issue with detailed description

## License

MIT License - See LICENSE file for details
