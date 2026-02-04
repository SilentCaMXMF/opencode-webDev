# Frontend Design Agent System - Testing Infrastructure

## Quick Reference

### Installation
```bash
cd .opencode/workflows
npm install
npm run setup:env
```

### Running Tests
```bash
npm run test              # Unit tests
npm run test:integration   # Integration tests
npm run test:e2e          # E2E tests
npm run test:visual        # Visual regression
npm run test:accessibility  # Accessibility
npm run test:performance    # Performance
npm run test:all          # All tests
```

### Quality Gates
- **Coverage**: 80% overall, 90% critical
- **Performance**: Lighthouse > 90
- **Accessibility**: WCAG 2.1 AA, 95% compliance
- **Security**: 0 critical vulnerabilities

### Documentation
- **Testing Guide**: `docs/TESTING.md`
- **CI/CD Guide**: `docs/CI-CD.md`
- **Quality Gates**: `docs/QUALITY-GATES.md`
- **Troubleshooting**: `docs/TROUBLESHOOTING.md`

## Directory Structure

```
.opencode/workflows/
├── github-actions/          # CI/CD workflows
│   ├── ci.yml            # Continuous Integration
│   ├── cd.yml            # Continuous Deployment
│   ├── security-scan.yml  # Security scanning
│   ├── performance.yml    # Performance testing
│   ├── accessibility.yml  # Accessibility testing
│   └── quality-gates.yml  # Quality gate enforcement
├── vitest/                # Unit/Integration testing
│   ├── vitest.config.ts  # Vitest configuration
│   └── setup.js          # Test setup
├── cypress/               # E2E testing
│   └── cypress.config.js  # Cypress configuration
├── playwright/            # Visual/Integration testing
│   └── playwright.config.ts  # Playwright configuration
├── mocks/                 # Mock servers & data
│   ├── server.js         # Mock HTTP server
│   └── fixtures/        # Test fixtures
├── docker/                # Docker configurations
│   ├── Dockerfile        # Test environment
│   └── docker-compose.yml  # Multi-container setup
├── config/                # Shared configurations
│   ├── browsers.json     # Browser matrix
│   ├── devices.json      # Device testing matrix
│   └── quality-gates.json  # Quality thresholds
├── scripts/               # Utility scripts
│   ├── setup-test-env.sh   # Environment setup
│   ├── check-coverage.js   # Coverage validation
│   ├── generate-test-summary.js  # Test aggregation
│   ├── check-quality-gates.js  # Quality gate checks
│   └── health-check.js  # Health monitoring
└── docs/                  # Documentation
    ├── TESTING.md        # Testing guide
    ├── CI-CD.md          # CI/CD documentation
    ├── QUALITY-GATES.md  # Quality gates guide
    └── TROUBLESHOOTING.md  # Troubleshooting
```

## Key Features

### 1. Automated Testing Pipelines
- ✅ Unit tests (Vitest)
- ✅ Integration tests (Playwright)
- ✅ E2E tests (Cypress)
- ✅ Visual regression tests
- ✅ Accessibility tests (axe-core)
- ✅ Performance tests (Lighthouse)

### 2. CI/CD Automation
- ✅ Pull request checks
- ✅ Automated deployment
- ✅ Security scanning
- ✅ Quality gate enforcement
- ✅ Rollback capabilities
- ✅ Multi-environment support

### 3. Quality Gates
- ✅ Coverage thresholds
- ✅ Performance metrics
- ✅ Accessibility compliance
- ✅ Security vulnerability limits
- ✅ Bundle size controls

### 4. Test Environments
- ✅ Local development
- ✅ Docker containers
- ✅ CI/CD runners
- ✅ Staging
- ✅ Production

### 5. Multi-Browser Testing
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari/WebKit
- ✅ Edge
- ✅ Mobile browsers

### 6. Reporting & Monitoring
- ✅ Test result aggregation
- ✅ Coverage reports
- ✅ Lighthouse audits
- ✅ Accessibility reports
- ✅ Performance metrics
- ✅ Security scan results

## Agent Integration

The testing infrastructure supports all Frontend Design Agent System agents:

### Orchestrator Agent
- Test orchestration
- Result aggregation
- Quality gate enforcement

### Accessibility Specialist Agent
- Automated accessibility testing
- WCAG 2.1 AA validation
- Screen reader testing integration

### Performance Optimizer Agent
- Performance benchmarking
- Lighthouse audits
- Web Vitals monitoring
- Bundle size analysis

### Cross-Platform Specialist Agent
- Multi-browser testing
- Cross-device validation
- Responsive design testing

### Component Developer Agent
- Component unit tests
- Integration testing
- Visual regression tests

### Design System Specialist Agent
- Design token validation
- Component consistency checks
- Visual regression testing

## Quick Start Guide

### 1. Setup
```bash
# Navigate to workflows directory
cd .opencode/workflows

# Install dependencies
npm install

# Run environment setup
npm run setup:env
```

### 2. Run Tests
```bash
# Start test server (in one terminal)
npm run serve

# Run tests (in another terminal)
npm run test:all
```

### 3. View Results
```bash
# Open coverage report
open coverage/index.html

# Open Lighthouse report
open reports/lighthouse/report.html

# Open accessibility report
open reports/accessibility/pa11y-report.html
```

### 4. Docker Setup
```bash
# Build containers
docker-compose build

# Run all services
docker-compose up -d

# Run specific test suite
docker-compose run --rm playwright npm run test:integration
```

## CI/CD Integration

### Pull Request Checks
```yaml
# Automatic on PR to main/develop
- Lint & format checks
- Unit tests
- Integration tests
- E2E tests
- Accessibility tests
- Visual tests
- Quality gates
```

### Deployment Pipeline
```yaml
# Automatic on push to main
1. Full test suite
2. Security scan
3. Build application
4. Deploy to staging
5. Smoke tests
6. Deploy to production
7. Health checks
8. Rollback on failure
```

## Quality Gate Status

| Gate | Status | Threshold | Current |
|-------|--------|-----------|---------|
| Coverage | ✅ | 80% | See report |
| Performance | ✅ | 90 | See report |
| Accessibility | ✅ | WCAG AA | See report |
| Security | ✅ | 0 critical | See report |
| Bundle Size | ✅ | 2MB | See report |

## Monitoring

### Test Results
- **Coverage**: `coverage/index.html`
- **Lighthouse**: `reports/lighthouse/`
- **Accessibility**: `reports/accessibility/`
- **Visual**: `playwright-report/`
- **E2E**: `cypress/videos/`

### CI/CD
- **GitHub Actions**: Repository Actions tab
- **Artifacts**: Workflow run artifacts
- **Logs**: GitHub Actions logs

### Alerts
- **Slack**: Pipeline failures, deployments
- **Email**: Critical failures
- **GitHub**: PR comments, issues

## Best Practices

### Before Committing
1. ✅ Run tests locally
2. ✅ Check linting
3. ✅ Verify coverage
4. ✅ Test accessibility
5. ✅ Check bundle size

### Before Merging
1. ✅ Review all CI checks
2. ✅ Check quality gate status
3. ✅ Review test reports
4. ✅ Verify deployment readiness
5. ✅ Test staging environment

### After Deployment
1. ✅ Monitor health checks
2. ✅ Review error logs
3. ✅ Check performance metrics
4. ✅ Verify user feedback
5. ✅ Monitor analytics

## Support

### Documentation
- 📖 [Testing Guide](docs/TESTING.md)
- 📖 [CI/CD Guide](docs/CI-CD.md)
- 📖 [Quality Gates](docs/QUALITY-GATES.md)
- 📖 [Troubleshooting](docs/TROUBLESHOOTING.md)

### Issues
- 🐛 Open GitHub issue with:
  - Description of problem
  - Steps to reproduce
  - Expected vs actual behavior
  - Logs and error messages
  - Environment details

### Getting Help
1. Check documentation
2. Review troubleshooting guide
3. Check test logs and reports
4. Search existing issues
5. Open new issue with details

## Configuration Files

### Test Configuration
- **Vitest**: `vitest/vitest.config.ts`
- **Cypress**: `cypress/cypress.config.js`
- **Playwright**: `playwright/playwright.config.ts`

### Quality Gates
- **Thresholds**: `config/quality-gates.json`
- **Browser Matrix**: `config/browsers.json`
- **Device Matrix**: `config/devices.json`

### CI/CD
- **CI Pipeline**: `github-actions/ci.yml`
- **CD Pipeline**: `github-actions/cd.yml`
- **Security Scan**: `github-actions/security-scan.yml`
- **Performance**: `github-actions/performance.yml`
- **Accessibility**: `github-actions/accessibility.yml`
- **Quality Gates**: `github-actions/quality-gates.yml`

## Environment Variables

### Required
```env
NODE_ENV=test
BASE_URL=http://localhost:3000
MOCK_SERVER_URL=http://localhost:8080
CI=true
```

### Optional (for CI/CD)
```env
CYPRESS_RECORD_KEY=your-key
SLACK_WEBHOOK_URL=your-webhook
SMTP_SERVER=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=user@example.com
SMTP_PASSWORD=your-password
NOTIFICATION_EMAIL=admin@example.com
```

## Scripts

### Testing
```bash
npm run test                 # Unit tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage
npm run test:integration    # Integration tests
npm run test:e2e           # E2E tests
npm run test:visual         # Visual tests
npm run test:accessibility  # Accessibility
npm run test:performance    # Performance
npm run test:all           # All tests
```

### Quality
```bash
npm run lint               # Lint code
npm run lint:fix           # Fix linting
npm run format             # Format code
npm run format:check       # Check format
npm run validate           # Run all quality checks
```

### Utilities
```bash
npm run serve              # Start test server
npm run mock-server        # Start mock server
npm run setup:env         # Setup environment
npm run generate:test-summary  # Generate summary
npm run check:coverage     # Check coverage thresholds
```

## Contributing

When contributing to the testing infrastructure:

1. **Follow Existing Patterns**
   - Use established conventions
   - Maintain consistency
   - Update documentation

2. **Test Your Changes**
   - Run all tests locally
   - Check CI/CD pipeline
   - Verify quality gates

3. **Update Documentation**
   - Document new features
   - Update guides
   - Add examples

4. **Code Review**
   - Request review from team
   - Address feedback
   - Ensure all checks pass

## Changelog

### Version 1.0.0 (2026-01-03)
- ✅ Initial testing infrastructure
- ✅ CI/CD pipelines
- ✅ Quality gates
- ✅ Multi-browser testing
- ✅ Accessibility testing
- ✅ Performance testing
- ✅ Docker integration
- ✅ Comprehensive documentation

## License

MIT License - See LICENSE file for details

---

**Frontend Design Agent System** - Testing Infrastructure
**Last Updated**: January 3, 2026
