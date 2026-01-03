# CI/CD Pipeline Documentation

## Overview

The Frontend Design Agent System uses GitHub Actions for automated testing, quality gates, and deployment. This documentation explains how the CI/CD pipeline works and how to work with it.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  GitHub Actions                         │
├─────────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────────┐  ┌──────────────┐              │
│  │ Pull Request │  │   Push       │              │
│  │  Workflow    │  │   Workflow   │              │
│  └──────┬───────┘  └──────┬───────┘              │
│         │                  │                          │
│         ▼                  ▼                          │
│  ┌──────────────────────────────────┐                │
│  │     CI Pipeline (ci.yml)       │                │
│  │  - Lint & Format             │                │
│  │  - Unit Tests                 │                │
│  │  - Integration Tests           │                │
│  │  - E2E Tests                 │                │
│  │  - Accessibility Tests         │                │
│  │  - Visual Tests               │                │
│  │  - Quality Gates              │                │
│  └──────────────┬───────────────┘                │
│                 │                                  │
│                 ▼                                  │
│  ┌──────────────────────────────────┐                │
│  │    CD Pipeline (cd.yml)      │                │
│  │  - Build                     │                │
│  │  - Security Scan             │                │
│  │  - Deploy to Staging         │                │
│  │  - Smoke Tests               │                │
│  │  - Deploy to Production      │                │
│  │  - Health Checks             │                │
│  │  - Rollback                 │                │
│  └──────────────────────────────────┘                │
│                                                       │
└─────────────────────────────────────────────────────────┘
```

## Workflows

### 1. CI Pipeline (`ci.yml`)

**Triggers**:
- Push to `main`, `develop`, or feature branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

**Jobs**:

#### Setup & Cache
- Caches dependencies
- Checks for test file changes
- Generates cache keys

#### Lint & Format Check
- Runs ESLint
- Runs Prettier checks
- Uploads lint results

#### Unit Tests
- Runs Vitest unit tests
- Generates code coverage
- Sharded for parallel execution
- Comments PR with coverage

#### Integration Tests
- Runs Playwright integration tests
- Tests across Chromium, Firefox, and WebKit
- Uploads test reports

#### E2E Tests
- Runs Cypress E2E tests
- Parallel execution in containers
- Records videos and screenshots on failure

#### Visual Tests
- Runs Playwright visual regression tests
- Detects UI changes
- Uploads visual reports

#### Accessibility Tests
- Runs axe-core accessibility scans
- WCAG 2.1 AA compliance checks
- Comments PR with accessibility issues

#### Coverage Aggregation
- Merges coverage from all shards
- Checks coverage thresholds
- Uploads combined coverage report

#### Quality Gates
- Validates all quality gate checks
- Blocks merge on failures
- Comments PR with results

#### Test Summary
- Aggregates all test results
- Generates summary report
- Publishes test results

#### Notifications
- Sends Slack notifications on failures
- Sends email notifications
- Only on push events

### 2. CD Pipeline (`cd.yml`)

**Triggers**:
- Push to `main` branch
- Manual workflow dispatch

**Jobs**:

#### Pre-Deployment Checks
- Validates deployment eligibility
- Generates version tags
- Creates Git tags

#### Full Test Suite
- Runs all tests before deployment
- Validates code quality
- Ensures no regressions

#### Build
- Builds the application
- Generates build info
- Uploads build artifacts

#### Security Scan
- Trivy container scan
- Dependency vulnerability scan
- Blocks deployment on critical vulnerabilities

#### Deploy to Staging
- Deploys to GitHub Pages (staging environment)
- Runs smoke tests
- Records deployment metadata
- Sends notifications

#### Deploy to Production
- Deploys to GitHub Pages (production)
- Runs health checks
- Creates deployment backup
- Records deployment metadata

#### Rollback
- Automatically triggered on failure
- Rolls back to last successful deployment
- Creates rollback issues
- Sends notifications

#### Post-Deployment Validation
- Runs Lighthouse audits
- Validates performance thresholds
- Uploads validation reports

#### Deployment Summary
- Generates deployment summary
- Comments on commit
- Uploads summary artifact

### 3. Security Scan Workflow (`security-scan.yml`)

**Triggers**:
- Daily schedule (2 AM UTC)
- Push to main/develop
- Pull requests
- Manual dispatch

**Jobs**:

#### Dependency Scan
- Runs `npm audit`
- Checks for critical vulnerabilities
- Comments PR with issues

#### Code Security Scan
- Runs CodeQL analysis
- Detects security issues in code
- Uploads SARIF reports

#### Secrets Scan
- Trivy secrets detection
- Gitleaks scan
- Detects committed secrets

#### Container Scan
- Scans Docker images
- Checks for vulnerabilities
- Uploads scan results

#### Dependency Check
- OWASP Dependency Check
- CVE database lookup
- Generates detailed reports

#### SBOM Generation
- CycloneDX SBOM
- SPDX SBOM
- Software Bill of Materials

#### License Compliance
- Checks package licenses
- Identifies problematic licenses
- Comments PR with issues

#### Security Summary
- Aggregates all security results
- Creates security issues (if needed)
- Comments PR with summary

### 4. Performance Testing Workflow (`performance.yml`)

**Triggers**:
- Push to main/develop
- Pull requests
- Daily schedule (3 AM UTC)
- Manual dispatch

**Jobs**:

#### Lighthouse Audit
- Runs Lighthouse CI
- Checks all performance metrics
- Validates against thresholds
- Comments PR with results

#### Web Vitals
- Tests Core Web Vitals
- Validates LCP, FID, CLS
- Checks against thresholds

#### Bundle Analysis
- Analyzes bundle sizes
- Checks size thresholds
- Generates bundle reports

#### Load Testing
- k6 load tests
- Stress testing
- Performance under load

#### Performance Regression
- Compares against baseline
- Detects performance changes
- Comments PR with changes

#### Performance Summary
- Aggregates performance results
- Creates summary reports

### 5. Accessibility Testing Workflow (`accessibility.yml`)

**Triggers**:
- Push to main/develop
- Pull requests
- Daily schedule (4 AM UTC)
- Manual dispatch

**Jobs**:

#### Automated A11y Tests
- Playwright + axe-core
- Multi-browser testing
- WCAG 2.1 AA checks

#### Pa11y Tests
- Static accessibility analysis
- Multiple page scanning
- Generates detailed reports

#### Keyboard Navigation
- Keyboard-only usage
- Focus management
- Tab order validation

#### Color Contrast
- WCAG contrast analysis
- All color combinations
- Generates reports

#### Screen Reader Testing
- NVDA/JAWS testing
- VoiceOver testing
- ARIA attribute validation

#### ARIA Validation
- ARIA attribute checks
- Role validation
- Label validation

#### WCAG Compliance
- Aggregates all a11y results
- Calculates compliance rate
- Validates thresholds

#### A11y Summary
- Comprehensive a11y summary
- Comments PR with results
- Creates issues (if needed)

### 6. Quality Gates Workflow (`quality-gates.yml`)

**Triggers**:
- Pull requests
- Manual dispatch

**Jobs**:

#### Coverage Gate
- Validates code coverage
- Critical files: 90%
- Overall: 80%
- Blocks merge on failure

#### Performance Gate
- Lighthouse thresholds
- Performance: 90
- Accessibility: 95
- Best Practices: 90

#### Accessibility Gate
- WCAG compliance
- Zero critical violations
- Max 5 serious violations

#### Security Gate
- Vulnerability checks
- Zero critical vulns
- Max 5 high vulns

#### Breaking Changes
- Detects breaking changes
- Checks commit messages
- Warns about breaking changes

#### Quality Gate Summary
- Aggregates all gate results
- Comments PR with status
- Blocks merge on failures

## Quality Gates

### Coverage Requirements

| Metric | Threshold | Description |
|--------|-----------|-------------|
| Critical Files | 90% | Main application logic |
| Lines | 80% | Overall line coverage |
| Functions | 80% | Function coverage |
| Branches | 75% | Branch coverage |
| Statements | 80% | Statement coverage |

### Performance Thresholds

| Metric | Threshold | Description |
|--------|-----------|-------------|
| Performance | 90 | Lighthouse performance score |
| Accessibility | 95 | Lighthouse accessibility score |
| Best Practices | 90 | Lighthouse best practices |
| SEO | 90 | Lighthouse SEO score |
| LCP | 2500ms | Largest Contentful Paint |
| FID | 100ms | First Input Delay |
| CLS | 0.1 | Cumulative Layout Shift |

### Accessibility Standards

| Standard | Level | Threshold |
|----------|-------|-----------|
| WCAG 2.1 | AA | 95% compliance |
| Critical Violations | 0 | Zero tolerance |
| Serious Violations | 5 | Maximum allowed |

### Security Requirements

| Metric | Threshold | Description |
|--------|-----------|-------------|
| Critical Vulnerabilities | 0 | Zero tolerance |
| High Vulnerabilities | 5 | Maximum allowed |
| Medium Vulnerabilities | 10 | Maximum allowed |
| Dependency Age | 2 years | Max age for critical deps |

## Environments

### Local
- **URL**: http://localhost:3000
- **Purpose**: Development and testing
- **Deployment**: Manual

### Staging
- **URL**: https://username.github.io/ (preview)
- **Purpose**: Pre-production testing
- **Deployment**: Automated on main branch
- **Tests**: Full test suite + smoke tests

### Production
- **URL**: https://username.github.io/
- **Purpose**: Live production
- **Deployment**: Automated on main branch
- **Tests**: Full test suite + smoke tests + health checks

## Workflow Configuration

### Environment Variables

Required secrets and variables:

```
# GitHub Actions Secrets (Configure in Repository Settings)
CYPRESS_RECORD_KEY           # Cypress recording key
GITHUB_TOKEN                  # GitHub token (automatic)
SLACK_WEBHOOK_URL            # Slack webhook URL
SMTP_SERVER                  # SMTP server for email
SMTP_PORT                    # SMTP port
SMTP_USERNAME                # SMTP username
SMTP_PASSWORD                # SMTP password
NOTIFICATION_EMAIL            # Email for notifications
GITLEAKS_LICENSE             # Gitleaks license (optional)
```

### Workflow Dispatch Parameters

Manual workflows support:

- **test_type**: Test suite to run
- **environment**: Target environment (staging/production)
- **version**: Version tag (optional)
- **skip_tests**: Skip tests (not recommended)
- **check_type**: Quality gate to check

## Monitoring & Alerts

### Test Reports

All test reports are available as artifacts:
- Coverage reports
- Lighthouse reports
- Accessibility reports
- Visual regression reports
- Security scan reports

### Notifications

#### Slack
- Pipeline failures
- Deployment status
- Security issues
- Performance regressions

#### Email
- Critical failures
- Security vulnerabilities
- Deployment notifications

#### GitHub
- PR comments with test results
- Coverage reports
- Accessibility issues
- Performance changes

### Metrics Tracked

- Test execution time
- Success/failure rates
- Coverage trends
- Performance metrics
- Security vulnerabilities
- Accessibility compliance

## Troubleshooting

### Pipeline Failures

#### Common Issues

1. **Tests Time Out**
   - Increase timeout in test configuration
   - Optimize test performance
   - Check for flaky tests

2. **Coverage Below Threshold**
   - Write tests for uncovered code
   - Remove unnecessary code
   - Update coverage exclusions

3. **Performance Thresholds Failed**
   - Optimize bundle size
   - Improve loading performance
   - Fix accessibility issues

4. **Security Vulnerabilities Found**
   - Update dependencies
   - Review and fix code issues
   - Monitor for false positives

### Debugging in CI

#### View Logs
- GitHub Actions logs
- Test reports (artifacts)
- Container logs

#### Re-run Workflows
- Re-run failed jobs
- Re-run with debug logging
- Run manually with dispatch

#### Local Reproduction
```bash
# Install same Node version
nvm use 20

# Install dependencies
npm ci

# Run same tests
npm run test:integration

# Run with CI environment
CI=true npm test
```

## Best Practices

### Before Committing

1. Run tests locally
2. Check linting
3. Verify coverage
4. Test accessibility
5. Check bundle size

### Before Merging

1. Review all CI checks
2. Check quality gate status
3. Review test reports
4. Verify deployment readiness
5. Test staging environment

### After Deployment

1. Monitor health checks
2. Review error logs
3. Check performance metrics
4. Verify user feedback
5. Monitor analytics

## Contributing to CI/CD

### Adding New Workflows

1. Create workflow file in `.github/workflows/`
2. Follow naming conventions
3. Include proper triggers
4. Add documentation
5. Test locally first

### Modifying Workflows

1. Fork and test changes
2. Update documentation
3. Get review from team
4. Test in feature branch
5. Merge to main

### Adding Quality Gates

1. Update `quality-gates.json`
2. Add gate to workflow
3. Add documentation
4. Test thresholds
5. Monitor results

## Resources

### Documentation
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cypress CI Documentation](https://docs.cypress.io/guides/continuous-integration/github-actions)
- [Playwright CI Documentation](https://playwright.dev/docs/ci)

### Best Practices
- [CI/CD Best Practices](https://martinfowler.com/articles/continuousIntegration.html)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Quality Gates](https://www.sonarsource.com/resources/quality-gates/)

---

**Last Updated**: January 3, 2026
