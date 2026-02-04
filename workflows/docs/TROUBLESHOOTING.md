# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the Frontend Design Agent System testing infrastructure.

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Test Execution Issues](#test-execution-issues)
3. [CI/CD Pipeline Issues](#cicd-pipeline-issues)
4. [Performance Issues](#performance-issues)
5. [Accessibility Issues](#accessibility-issues)
6. [Coverage Issues](#coverage-issues)
7. [Docker Issues](#docker-issues)

---

## Installation Issues

### Node.js Version Incompatibility

**Symptoms**:
```
npm ERR! engine Unsupported engine
npm ERR! node: unsupported version
```

**Solutions**:
```bash
# Check current Node.js version
node --version

# Install required version (20.x)
nvm install 20
nvm use 20

# Verify version
node --version
```

### npm Install Fails

**Symptoms**:
```
npm ERR! code ERESOLVE
npm ERR! peer dep missing
```

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Use legacy peer deps (last resort)
npm install --legacy-peer-deps
```

### Playwright Browsers Not Found

**Symptoms**:
```
Error: Executable doesn't exist at /path/to/chromium
```

**Solutions**:
```bash
# Install Playwright browsers
npx playwright install --with-deps

# Install specific browser
npx playwright install chromium

# Update browsers
npx playwright install --force
```

### Cypress Cannot Find Browser

**Symptoms**:
```
Can't find Chrome installation
```

**Solutions**:
```bash
# Verify Chrome is installed
google-chrome --version

# Or use system Chrome
# Edit cypress.config.js:
// {
//   e2e: {
//     browser: 'chrome',
//     chromeWebSecurity: false
//   }
// }
```

---

## Test Execution Issues

### Tests Pass Locally but Fail in CI

**Symptoms**:
- Tests work on local machine
- Fail in GitHub Actions
- Inconsistent behavior

**Solutions**:

#### 1. Check Environment Variables
```bash
# Ensure test environment variables are set
cat .env.test

# In CI, check secrets are configured
# Repository Settings -> Secrets and variables -> Actions
```

#### 2. Adjust Timeouts
```javascript
// Vitest
test.setTimeout(10000);

// Playwright
test('example', async ({ page }) => {
  await page.goto('/', { timeout: 30000 });
});

// Cypress
cy.get('.element', { timeout: 10000 }).should('be.visible');
```

#### 3. Add Waits
```javascript
// Playwright
await page.waitForSelector('.element');
await page.waitForLoadState('networkidle');

// Cypress
cy.intercept('GET', '/api/data').as('getData');
cy.visit('/');
cy.wait('@getData');
```

#### 4. Mock External Dependencies
```javascript
// Vitest
vi.mock('axios');

// Cypress
cy.intercept('GET', '/api/data', { fixture: 'data.json' });

// Playwright
await page.route('**/api/data', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify(mockData)
  });
});
```

### Flaky Tests

**Symptoms**:
- Tests intermittently fail
- Inconsistent results
- Random failures

**Solutions**:

#### 1. Add Retries
```javascript
// Vitest
test.retry(3);

// Playwright
// In playwright.config.ts:
{
  retries: process.env.CI ? 2 : 0
}

// Cypress
// In cypress.config.js:
{
  retries: {
    runMode: 2,
    openMode: 0
  }
}
```

#### 2. Isolate Tests
```javascript
// Don't depend on test order
test('test 1', async () => {
  // Independent setup
});

test('test 2', async () => {
  // Independent setup
});
```

#### 3. Use Explicit Waits
```javascript
// Wait for specific conditions
await expect(page.locator('.element')).toBeVisible();
await expect(page).toHaveURL(/dashboard/);

// Not arbitrary delays
// await page.waitForTimeout(1000); // Bad practice
```

#### 4. Stabilize Async Operations
```javascript
// Use proper async handling
await Promise.all([
  page.click('.button'),
  page.waitForNavigation()
]);

// Or use waitForResponse
await page.waitForResponse(response =>
  response.url().includes('/api/data')
);
```

### Tests Run Too Slow

**Symptoms**:
- Test suite takes > 10 minutes
- Individual tests slow
- CI timeouts

**Solutions**:

#### 1. Parallelize Tests
```javascript
// Vitest
// In vitest.config.ts:
{
  pool: 'threads',
  poolOptions: {
    threads: {
      maxThreads: 4
    }
  }
}

// Playwright
// Automatically parallel with projects:
{
  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' }
  ]
}
```

#### 2. Optimize Selectors
```javascript
// Fast - data attributes
page.locator('[data-testid="submit-button"]')

// Slow - complex CSS
page.locator('div.form-container > div.row:last-child > button')

// Very slow - text
page.getByText('Submit')
```

#### 3. Mock External Services
```javascript
// Don't make real API calls
cy.intercept('GET', '/api/**', { fixture: 'mock.json' });

// Or use mock server
nock('https://api.example.com')
  .get('/data')
  .reply(200, mockData);
```

#### 4. Reduce E2E Tests
```javascript
// Focus on critical paths
// Use unit/integration tests for edge cases

// Example good E2E test coverage:
// - User authentication
// - Main user flows (checkout, profile)
// - Critical error scenarios
```

### Coverage Report Not Generated

**Symptoms**:
- Coverage report missing
- `coverage/` directory empty
- Coverage shows 0%

**Solutions**:

#### 1. Check Coverage Configuration
```javascript
// vitest.config.ts
{
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html', 'lcov'],
    include: ['**/*.{js,ts}'],
    exclude: ['node_modules/', 'tests/']
  }
}
```

#### 2. Run Coverage Command
```bash
# Must use coverage flag
npm run test:coverage

# Or
vitest run --coverage
```

#### 3. Check File Paths
```bash
# Verify files are being instrumented
cat coverage/coverage-summary.json

# Check coverage.json exists
ls -la coverage/
```

---

## CI/CD Pipeline Issues

### Workflow Fails Immediately

**Symptoms**:
- Workflow fails in first job
- Checkout or setup fails

**Solutions**:

#### 1. Check Workflow Syntax
```bash
# Validate YAML syntax
yamllint .github/workflows/*.yml

# Check for indentation errors
# Ensure proper YAML formatting
```

#### 2. Verify Permissions
```yaml
# In workflow file:
permissions:
  contents: read
  checks: write
  pull-requests: write
```

#### 3. Check Node Version
```yaml
# Ensure correct Node version
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20.x'
```

### Artifact Not Found

**Symptoms**:
```
Error: Unable to find artifact
Artifact not found
```

**Solutions**:

#### 1. Check Artifact Upload
```yaml
# Must upload before trying to download
- name: Upload Artifact
  uses: actions/upload-artifact@v4
  with:
    name: my-artifact
    path: ./path/to/files
```

#### 2. Use Correct Path
```yaml
# Download with correct path
- name: Download Artifact
  uses: actions/download-artifact@v4
  with:
    name: my-artifact
    path: ./download/path
```

#### 3. Check Retention Period
```yaml
# Artifacts expire after 90 days by default
# Increase retention if needed:
- name: Upload Artifact
  uses: actions/upload-artifact@v4
  with:
    retention-days: 30
```

### Secrets Not Available

**Symptoms**:
```
Error: secret not found
undefined secret
```

**Solutions**:

#### 1. Configure Secrets
```
# Go to Repository Settings
# Secrets and variables -> Actions
# Add new repository secret
```

#### 2. Reference Correctly
```yaml
# Correct syntax
env:
  MY_SECRET: ${{ secrets.MY_SECRET }}

# Not:
env:
  MY_SECRET: ${{ secrets.my_secret }}  # Case sensitive
```

#### 3. Check Organization Secrets
```
# Organization secrets must be enabled
# Repository Settings -> Secrets
# Enable access to organization secrets
```

### Deployment Fails

**Symptoms**:
- Deployment job fails
- Rollback triggered
- Health checks fail

**Solutions**:

#### 1. Check Build
```bash
# Build locally first
npm run build

# Verify output
ls -la dist/
```

#### 2. Check Environment
```yaml
# Ensure correct environment
environment:
  name: staging
  url: ${{ steps.deployment.outputs.page_url }}
```

#### 3. Verify Health Check
```yaml
# Dockerfile health check
HEALTHCHECK --interval=30s --timeout=10s \
  CMD node -e "require('http').get('http://localhost:3000')"
```

#### 4. Check Logs
```bash
# View deployment logs
# GitHub Actions -> Workflow run -> Deployment job

# Check server logs
docker logs <container-id>
```

---

## Performance Issues

### Lighthouse Scores Below Threshold

**Symptoms**:
- Performance < 90
- Accessibility < 95
- Best Practices < 90

**Solutions**:

#### 1. Optimize Bundle Size
```bash
# Analyze bundle
npm run analyze-bundle

# Code split
import(/* webpackChunkName: "lodash" */ 'lodash').then(_ => {
  // Use lodash
});
```

#### 2. Optimize Images
```bash
# Compress images
npx imagemin src/img/* --out-dir=dist/img

# Use WebP format
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description">
</picture>
```

#### 3. Fix Accessibility Issues
```bash
# Run accessibility audit
npm run test:accessibility

# Fix common issues:
# - Add alt text to images
# - Use semantic HTML
# - Ensure keyboard navigation
```

#### 4. Improve Core Web Vitals
```javascript
// Reduce LCP
- Preload critical resources
- Optimize images
- Remove render-blocking resources

// Reduce FID
- Minimize JavaScript execution
- Use event delegation
- Code split bundles

// Reduce CLS
- Reserve space for images
- Avoid injecting content
- Use CSS transforms for animations
```

### Performance Regression

**Symptoms**:
- Performance score decreased
- Load time increased
- Web Vitals worsened

**Solutions**:

#### 1. Identify Changes
```bash
# Compare with baseline
npm run test:performance-regression

# View diff
cat performance-diff.json
```

#### 2. Profile Application
```javascript
// Chrome DevTools Performance tab
// Record and analyze:
// - Long tasks
// - Layout shifts
// - Network requests
```

#### 3. Optimize Problem Areas
```javascript
// Lazy load components
const LazyComponent = lazy(() => import('./Component'));

// Defer non-critical JS
<script defer src="script.js"></script>

// Preload critical resources
<link rel="preload" href="critical.css" as="style">
```

---

## Accessibility Issues

### WCAG Violations Found

**Symptoms**:
- Accessibility gate fails
- axe-core finds violations
- Pa11y reports issues

**Solutions**:

#### 1. Review Violations
```bash
# Run accessibility scan
npm run test:accessibility

# View detailed report
cat reports/accessibility/axe-results.json
```

#### 2. Fix Common Issues
```html
<!-- Add alt text -->
<img src="image.jpg" alt="Description of image">

<!-- Use semantic HTML -->
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>

<!-- Add ARIA labels -->
<button aria-label="Close menu">&times;</button>

<!-- Ensure color contrast -->
<style>
  .text {
    color: #333; /* Good contrast */
    background: #fff;
  }
</style>
```

#### 3. Test with Screen Readers
```bash
# Use NVDA (Windows)
# Or VoiceOver (Mac)
# Navigate and verify announcements
```

#### 4. Test Keyboard Navigation
```javascript
// Ensure all functionality accessible
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    // Handle tab navigation
  }
  if (e.key === 'Enter') {
    // Handle enter key
  }
});
```

### Color Contrast Issues

**Symptoms**:
- axe-core reports color contrast failures
- WCAG AA not met

**Solutions**:

#### 1. Check Contrast Ratio
```bash
# Use contrast checker
npm run test:color-contrast

# Online tools:
# - https://webaim.org/resources/contrastchecker/
# - https://contrast-ratio.com/
```

#### 2. Fix Contrast
```css
/* Good contrast (ratio >= 4.5:1) */
.text {
  color: #333333;  /* Dark gray */
  background: #ffffff; /* White */
}

/* For large text (ratio >= 3:1) */
.heading {
  color: #444444;
  background: #ffffff;
  font-size: 1.25rem;
  font-weight: bold;
}
```

#### 3. Use Semantic Colors
```css
:root {
  --text-primary: #333333;
  --text-secondary: #666666;
  --background-primary: #ffffff;
  --background-secondary: #f5f5f5;
  --error: #dc3545;
  --success: #28a745;
  --warning: #ffc107;
}
```

---

## Coverage Issues

### Coverage Below Threshold

**Symptoms**:
- Coverage gate fails
- Line/branch coverage too low
- Critical files below 90%

**Solutions**:

#### 1. Identify Uncovered Code
```bash
# Generate coverage report
npm run test:coverage

# View report
open coverage/index.html

# Find uncovered files
grep -r "0%" coverage/
```

#### 2. Write Tests for Uncovered Code
```javascript
// Test uncovered function
test('uncoveredFunction', () => {
  expect(uncoveredFunction('input')).toBe('output');
});

// Test all branches
test('handles all cases', () => {
  expect(function(1)).toBe('one');
  expect(function(2)).toBe('two');
  expect(function(3)).toBe('three');
});
```

#### 3. Remove Dead Code
```javascript
// Unused code reduces coverage
// Remove or document why it exists

// Commented out code:
// function oldFunction() { ... }  // Remove this
```

#### 4. Refactor for Testability
```javascript
// Hard to test
function complexFunction() {
  const result = fetchAPI(); // Hard to mock
  return processData(result);
}

// Easier to test
function complexFunction(fetcher = fetchAPI) {
  const result = fetcher(); // Can inject mock
  return processData(result);
}

// Test
test('complexFunction', () => {
  const mockFetcher = vi.fn(() => mockData);
  expect(complexFunction(mockFetcher)).toBe(expected);
});
```

---

## Docker Issues

### Container Won't Start

**Symptoms**:
- Docker build fails
- Container exits immediately
- Health check fails

**Solutions**:

#### 1. Check Dockerfile
```dockerfile
# Ensure proper base image
FROM node:20-alpine

# Copy package files first
COPY package*.json ./
RUN npm ci

# Then copy application
COPY . .

# Set working directory
WORKDIR /app

# Expose port
EXPOSE 3000

# Set entry point
CMD ["npm", "start"]
```

#### 2. Check docker-compose.yml
```yaml
# Ensure services are defined correctly
services:
  app:
    build:
      context: ..
      dockerfile: ./.opencode/workflows/docker/Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      - mock-server
    environment:
      - NODE_ENV=test
```

#### 3. View Container Logs
```bash
# View logs
docker-compose logs app

# Follow logs
docker-compose logs -f app

# Check exit status
docker-compose ps
```

### Port Conflicts

**Symptoms**:
```
Error: bind: address already in use
Port 3000 is already allocated
```

**Solutions**:

#### 1. Check Port Usage
```bash
# Find process using port
lsof -i :3000
# Or
netstat -tulpn | grep :3000
```

#### 2. Change Port
```yaml
# In docker-compose.yml
services:
  app:
    ports:
      - "3001:3000"  # Map different host port
```

#### 3. Stop Conflicting Service
```bash
# Stop conflicting process
kill -9 <PID>

# Or stop all containers
docker-compose down
```

### Volume Mount Issues

**Symptoms**:
- Files not visible in container
- Permission denied errors
- Changes not persisted

**Solutions**:

#### 1. Check Volume Paths
```yaml
# Use absolute paths
volumes:
  - /path/on/host:/path/in/container

# Or relative to compose file
volumes:
  - ../:/app
```

#### 2. Fix Permissions
```bash
# Change ownership
sudo chown -R $USER:$USER /path/to/volume

# Or run with user
docker-compose run --user $(id -u):$(id -g) app
```

#### 3. Verify Mount
```bash
# Enter container
docker-compose exec app sh

# Check mount
ls -la /app
```

---

## Getting Help

### Debug Mode

```bash
# Run tests in debug mode
npx playwright test --debug
npx cypress open

# Run workflows with debug logging
# Add to workflow:
- name: Debug
  run: |
    set -x  # Echo commands
    npm test
```

### Log Collection

```bash
# Collect all logs
npm run test:all 2>&1 | tee test-run.log

# Collect Docker logs
docker-compose logs > docker.log

# Collect CI logs
# Download from GitHub Actions
```

### Support Channels

1. **Documentation**
   - Testing Guide: `TESTING.md`
   - CI/CD Guide: `CI-CD.md`
   - Quality Gates: `QUALITY-GATES.md`

2. **Issue Tracker**
   - Open issue with:
     - Description of problem
     - Steps to reproduce
     - Expected vs actual behavior
     - Logs and error messages
     - Environment details

3. **Community**
   - Stack Overflow tags: `vitest`, `cypress`, `playwright`
   - GitHub Discussions

---

**Last Updated**: January 3, 2026
