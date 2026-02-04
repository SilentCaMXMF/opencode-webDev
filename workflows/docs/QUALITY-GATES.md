# Quality Gates Documentation

## Overview

Quality gates are automated checks that must pass before code can be merged or deployed. They ensure code quality, security, performance, and accessibility standards are maintained.

## Purpose

Quality gates serve to:

- **Prevent Regressions**: Catch issues before they reach production
- **Maintain Standards**: Ensure consistent code quality
- **Enforce Policies**: Automate code review standards
- **Reduce Risk**: Minimize production issues
- **Improve Speed**: Accelerate code review process

## Quality Gate Categories

### 1. Coverage Gate

**Purpose**: Ensure adequate test coverage

**Tools**: Vitest, Codecov

**Thresholds**:

| Metric | Threshold | Critical | Overall |
|--------|-----------|-----------|----------|
| Lines | 80% | 90% | 80% |
| Functions | 80% | 90% | 80% |
| Branches | 75% | 85% | 75% |
| Statements | 80% | 90% | 80% |

**Critical Files** (require 90% coverage):
- `js/script.js`
- `css/style.css`

**Configuration**:
```json
{
  "coverage": {
    "critical": 90,
    "overall": 80,
    "lines": 80,
    "functions": 80,
    "branches": 75,
    "statements": 80
  }
}
```

**Failure Actions**:
- Block merge to main branch
- Comment PR with coverage report
- Suggest files to increase coverage

### 2. Performance Gate

**Purpose**: Maintain application performance standards

**Tools**: Lighthouse, Web Vitals

**Thresholds**:

| Metric | Threshold | Description |
|--------|-----------|-------------|
| Lighthouse Performance | 90 | Overall performance score |
| Lighthouse Accessibility | 95 | Accessibility score |
| Lighthouse Best Practices | 90 | Best practices score |
| Lighthouse SEO | 90 | SEO score |
| LCP | 2500ms | Largest Contentful Paint |
| FID | 100ms | First Input Delay |
| CLS | 0.1 | Cumulative Layout Shift |
| FCP | 1800ms | First Contentful Paint |
| TTFB | 600ms | Time to First Byte |

**Configuration**:
```json
{
  "lighthouse": {
    "performance": 90,
    "accessibility": 95,
    "bestPractices": 90,
    "seo": 90
  },
  "webVitals": {
    "LCP": 2500,
    "FID": 100,
    "CLS": 0.1,
    "FCP": 1800,
    "TTFB": 600
  }
}
```

**Failure Actions**:
- Block merge to main branch
- Comment PR with performance issues
- Provide optimization suggestions

### 3. Accessibility Gate

**Purpose**: Ensure WCAG 2.1 AA compliance

**Tools**: axe-core, Pa11y, Lighthouse

**Thresholds**:

| Metric | Threshold | Description |
|--------|-----------|-------------|
| WCAG Level | AA | WCAG 2.1 compliance |
| Compliance Rate | 95% | Overall compliance |
| Critical Violations | 0 | Zero tolerance |
| Serious Violations | 5 | Maximum allowed |
| Moderate Violations | 10 | Maximum allowed |

**Configuration**:
```json
{
  "accessibility": {
    "wcagLevel": "AA",
    "complianceRate": 95,
    "maxViolations": 5,
    "criticalViolations": 0,
    "seriousViolations": 5,
    "moderateViolations": 10
  }
}
```

**Failure Actions**:
- Block merge to main branch
- Comment PR with accessibility violations
- Provide remediation guidance

### 4. Security Gate

**Purpose**: Identify and block security vulnerabilities

**Tools**: npm audit, Snyk, Trivy, CodeQL

**Thresholds**:

| Metric | Threshold | Description |
|--------|-----------|-------------|
| Critical Vulnerabilities | 0 | Zero tolerance |
| High Vulnerabilities | 5 | Maximum allowed |
| Medium Vulnerabilities | 10 | Maximum allowed |
| Low Vulnerabilities | 20 | Maximum allowed |
| Dependency Age | 2 years | Max age for critical deps |

**Configuration**:
```json
{
  "security": {
    "criticalVulnerabilities": 0,
    "highVulnerabilities": 5,
    "mediumVulnerabilities": 10,
    "lowVulnerabilities": 20,
    "maxDependenciesAge": 730
  }
}
```

**Failure Actions**:
- Block merge to main branch
- Comment PR with vulnerability details
- Suggest dependency updates

### 5. Bundle Size Gate

**Purpose**: Control application bundle size

**Tools**: bundlesize, webpack-bundle-analyzer

**Thresholds**:

| Metric | Threshold | Description |
|--------|-----------|-------------|
| Total Bundle | 2MB | Maximum total size |
| JS Bundle | 512KB | Maximum JS size |
| CSS Bundle | 256KB | Maximum CSS size |
| HTML Bundle | 50KB | Maximum HTML size |
| Image Size | 1MB | Maximum image size |

**Configuration**:
```json
{
  "bundleSize": {
    "js": 512000,
    "css": 256000,
    "html": 50000,
    "images": 1048576,
    "total": 2097152
  }
}
```

**Failure Actions**:
- Warn on PR comments
- Suggest optimization strategies
- Don't block merge (warning only)

## Gate Enforcement

### Pull Request Workflow

```
┌─────────────────────────────────────────┐
│         Pull Request Created           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Run Quality Gate Checks          │
├─────────────────────────────────────────┤
│  ✓ Coverage Gate                  │
│  ✓ Performance Gate                │
│  ✓ Accessibility Gate              │
│  ✓ Security Gate                  │
│  ✓ Bundle Size Gate               │
└──────────────┬──────────────────────┘
               │
               ▼
         All Passed?
          /     \
        Yes       No
         │         │
         ▼         ▼
    Approve    Block Merge
      │         Comment with Issues
      ▼
   Merge Allowed
```

### Deployment Workflow

```
┌─────────────────────────────────────────┐
│      Deployment to Staging          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Run All Quality Gates          │
├─────────────────────────────────────────┤
│  ✓ Full Test Suite                │
│  ✓ Coverage Gate                  │
│  ✓ Performance Gate                │
│  ✓ Accessibility Gate              │
│  ✓ Security Gate                  │
└──────────────┬──────────────────────┘
               │
               ▼
         All Passed?
          /     \
        Yes       No
         │         │
         ▼         ▼
    Deploy    Rollback & Block
     to Prod   Deployment
```

## Gate Status

### States

| Status | Description | Action |
|--------|-------------|--------|
| **PASS** | All thresholds met | Allow merge/deploy |
| **FAIL** | One or more thresholds not met | Block merge/deploy |
| **SKIP** | Check not applicable or data missing | Continue without blocking |
| **WARN** | Below optimal but not critical | Warn but allow |

### Status Indicators

- ✅ **PASS**: Gate passed successfully
- ❌ **FAIL**: Gate failed, blocking action
- ⏭️ **SKIP**: Gate skipped
- ⚠️ **WARN**: Warning, not blocking

## Customizing Quality Gates

### Adding New Gates

1. **Define Thresholds**

Edit `.opencode/workflows/config/quality-gates.json`:

```json
{
  "newGate": {
    "threshold": 90,
    "description": "New quality gate"
  }
}
```

2. **Implement Check**

Add job in `.github/workflows/quality-gates.yml`:

```yaml
new-gate:
  name: New Quality Gate
  runs-on: ubuntu-latest
  steps:
    - name: Run Check
      run: |
        npm run test:new-gate
    - name: Validate Thresholds
      run: |
        # Your validation logic
```

3. **Update Summary**

Include in quality gates summary job.

### Modifying Thresholds

1. **Edit Configuration**

Update thresholds in `quality-gates.json`:

```json
{
  "coverage": {
    "critical": 95,  // Increased from 90
    "overall": 85    // Increased from 80
  }
}
```

2. **Test Changes**

Ensure existing code meets new thresholds.

3. **Update Documentation**

Document threshold changes and rationale.

### Adding Exceptions

Some files or components may need exceptions:

```json
{
  "coverage": {
    "exclude": [
      "legacy/**/*",
      "vendor/**/*"
    ]
  }
}
```

## Monitoring & Reporting

### Gate Status Dashboard

Track quality gate status over time:

| Date | Coverage | Performance | Accessibility | Security | Status |
|------|----------|-------------|----------------|-----------|--------|
| 2024-01-01 | 85% | 92 | 96% | 0 vulns | ✅ |
| 2024-01-02 | 82% | 88 | 94% | 0 vulns | ✅ |
| 2024-01-03 | 78% | 85 | 93% | 2 high | ⚠️ |

### Trend Analysis

Monitor trends to identify:

- Improving areas
- Regressions
- Patterns in failures
- Impact of changes

### Alerts

Configure alerts for:

- Gate failures
- Repeated failures
- Trends below thresholds
- Security vulnerabilities

## Troubleshooting

### Common Failures

#### Coverage Gate Failure

**Symptoms**: Coverage below threshold

**Solutions**:
1. Write tests for uncovered code
2. Remove unused/dead code
3. Refactor to improve testability
4. Update exclusion rules if justified

**Example**:
```bash
# Identify uncovered files
npm run test:coverage
cat coverage/index.html

# Write tests for low-coverage files
```

#### Performance Gate Failure

**Symptoms**: Lighthouse scores below threshold

**Solutions**:
1. Optimize bundle size
2. Improve load performance
3. Fix accessibility issues
4. Optimize images and assets

**Example**:
```bash
# Run Lighthouse locally
npx lighthouse http://localhost:3000

# Analyze bundle
npm run analyze-bundle
```

#### Accessibility Gate Failure

**Symptoms**: WCAG violations found

**Solutions**:
1. Fix critical violations
2. Add ARIA attributes
3. Improve keyboard navigation
4. Enhance color contrast

**Example**:
```bash
# Run accessibility scan
npm run test:accessibility

# Review violations
cat reports/accessibility/report.json
```

#### Security Gate Failure

**Symptoms**: Vulnerabilities detected

**Solutions**:
1. Update vulnerable dependencies
2. Fix security issues in code
3. Remove unused dependencies
4. Monitor for false positives

**Example**:
```bash
# Audit dependencies
npm audit

# Update dependencies
npm update
```

## Best Practices

### Before Pushing

1. **Run Tests Locally**
   ```bash
   npm run test:all
   ```

2. **Check Coverage**
   ```bash
   npm run test:coverage
   ```

3. **Lint Code**
   ```bash
   npm run lint
   ```

4. **Run Quality Gates**
   ```bash
   npm run test:quality-gates
   ```

### Writing Code

1. **Write Tests First**
   - TDD approach
   - Ensure good coverage
   - Test edge cases

2. **Consider Performance**
   - Optimize bundle size
   - Lazy load components
   - Use efficient algorithms

3. **Maintain Accessibility**
   - Use semantic HTML
   - Add ARIA labels
   - Test keyboard navigation

4. **Follow Security Practices**
   - Sanitize inputs
   - Use secure dependencies
   - Keep dependencies updated

### Maintaining Standards

1. **Regular Reviews**
   - Review gate metrics
   - Identify trends
   - Adjust thresholds as needed

2. **Continuous Improvement**
   - Optimize slow tests
   - Improve coverage
   - Fix recurring issues

3. **Documentation**
   - Document exceptions
   - Explain threshold changes
   - Share learnings

## Resources

### Documentation
- [Quality Gates Configuration](../config/quality-gates.json)
- [Testing Guide](TESTING.md)
- [CI/CD Documentation](CI-CD.md)

### Tools
- [Vitest](https://vitest.dev/)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse)
- [axe-core](https://www.deque.com/axe/)
- [npm audit](https://docs.npmjs.com/cli/audit)

### Best Practices
- [Code Coverage Best Practices](https://martinfowler.com/articles/modern-testing-principles.html)
- [Performance Optimization](https://web.dev/fast/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Last Updated**: January 3, 2026
