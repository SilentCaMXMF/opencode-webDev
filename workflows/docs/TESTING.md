# Testing Guide - Frontend Design Agent System

## Table of Contents

1. [Overview](#overview)
2. [Testing Philosophy](#testing-philosophy)
3. [Test Types](#test-types)
4. [Setup and Installation](#setup-and-installation)
5. [Running Tests](#running-tests)
6. [Writing Tests](#writing-tests)
7. [Test Coverage](#test-coverage)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Overview

The Frontend Design Agent System uses a comprehensive testing strategy to ensure code quality, accessibility, performance, and security across all components.

### Testing Goals

- **Reliability**: Catch bugs before they reach production
- **Maintainability**: Make code easier to understand and modify
- **Accessibility**: Ensure WCAG 2.1 AA compliance
- **Performance**: Maintain optimal application performance
- **Security**: Identify and fix vulnerabilities early

### Testing Tools

- **Vitest**: Unit and integration testing
- **Cypress**: End-to-end testing
- **Playwright**: Visual regression and cross-browser testing
- **axe-core**: Accessibility testing
- **Lighthouse**: Performance and best practices
- **Pa11y**: Static accessibility analysis

## Testing Philosophy

### Testing Pyramid

```
        /\
       /  \
      / E2E \
     /--------\
    /          \
   / Integration \
  /______________\
 /                \
/     Unit Tests    \
/__________________\
```

- **Unit Tests**: Fast, isolated tests for individual functions/components
- **Integration Tests**: Test interactions between components
- **E2E Tests**: Full user workflows across the application

### Test Responsibilities

- **70% Unit Tests**: Test individual functions and components
- **20% Integration Tests**: Test component interactions
- **10% E2E Tests**: Test critical user journeys

## Test Types

### 1. Unit Tests

**Purpose**: Test individual functions and components in isolation

**Tools**: Vitest, @testing-library/dom

**Example**:
```javascript
import { expect, test, describe } from 'vitest';
import { formatCurrency } from './utils';

describe('formatCurrency', () => {
  test('formats numbers as currency', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });
});
```

**When to Write**:
- Pure functions
- Utility functions
- Component rendering logic
- Data transformations

### 2. Integration Tests

**Purpose**: Test interactions between components and modules

**Tools**: Playwright, Vitest

**Example**:
```javascript
test('user can add item to cart', async ({ page }) => {
  await page.goto('/products');
  await page.click('[data-testid="add-to-cart-1"]');
  await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
});
```

**When to Write**:
- Component composition
- API integration
- State management
- User interactions

### 3. E2E Tests

**Purpose**: Test complete user workflows

**Tools**: Cypress

**Example**:
```javascript
describe('Checkout Flow', () => {
  it('completes a purchase', () => {
    cy.visit('/products');
    cy.get('[data-testid="add-to-cart-1"]').click();
    cy.get('[data-testid="checkout"]').click();
    cy.get('[data-testid="confirm-order"]').click();
    cy.get('[data-testid="success-message"]').should('be.visible');
  });
});
```

**When to Write**:
- Critical user paths
- Multi-page flows
- Authentication flows
- Payment processing

### 4. Visual Regression Tests

**Purpose**: Ensure UI consistency across browsers and screen sizes

**Tools**: Playwright, Percy

**Example**:
```javascript
test('homepage visual consistency', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png');
});
```

**When to Write**:
- Component design changes
- Responsive layouts
- Design system updates
- UI refactorings

### 5. Accessibility Tests

**Purpose**: Ensure WCAG 2.1 AA compliance

**Tools**: axe-core, pa11y

**Example**:
```javascript
test('page has no accessibility violations', async ({ page }) => {
  await page.goto('/');
  const violations = await page.accessibility.snapshot();
  expect(violations).toHaveLength(0);
});
```

**When to Write**:
- All pages and components
- New features
- UI changes
- After refactorings

### 6. Performance Tests

**Purpose**: Monitor and maintain application performance

**Tools**: Lighthouse, Web Vitals

**Metrics**:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**When to Run**:
- Before releases
- After performance-related changes
- Regular intervals (automated)

## Setup and Installation

### Prerequisites

- Node.js 20.x or later
- npm or yarn

### Installation

```bash
# Navigate to workflows directory
cd .opencode/workflows

# Install dependencies
npm install

# Run setup script
npm run setup:env
```

### Environment Configuration

Create a `.env.test` file:

```env
NODE_ENV=test
BASE_URL=http://localhost:3000
MOCK_SERVER_URL=http://localhost:8080
CI=true
```

## Running Tests

### Run All Tests

```bash
npm run test:all
```

### Run Specific Test Suites

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Visual regression tests
npm run test:visual

# Accessibility tests
npm run test:accessibility

# Performance tests
npm run test:performance
```

### Watch Mode

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

### Test UI

```bash
npm run test:ui
```

## Writing Tests

### File Naming Conventions

- Unit tests: `*.test.js` or `*.spec.js`
- E2E tests: `*.cy.js`
- Playwright tests: `*.spec.ts`

### Test Organization

```
tests/
├── unit/
│   ├── utils/
│   │   ├── formatCurrency.test.js
│   │   └── formatDate.test.js
│   └── components/
│       └── Button.test.js
├── integration/
│   ├── cart.spec.ts
│   └── navigation.spec.ts
├── e2e/
│   ├── checkout.cy.js
│   └── authentication.cy.js
└── visual/
    └── pages/
        └── homepage.spec.ts
```

### Test Structure

```javascript
describe('FeatureName', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  test('should do something', () => {
    // Arrange - setup test data
    // Act - execute the code
    // Assert - verify the result
  });
});
```

### Best Practices

1. **Write Clear Test Names**
   ```javascript
   // Good
   test('user can add item to cart', () => {});

   // Bad
   test('test cart', () => {});
   ```

2. **Test One Thing at a Time**
   ```javascript
   // Good
   test('adds item to cart', () => {});
   test('removes item from cart', () => {});

   // Bad
   test('adds and removes items', () => {});
   ```

3. **Use Descriptive Assertions**
   ```javascript
   // Good
   expect(page.locator('.error')).toHaveText('Invalid email');

   // Bad
   expect(page.locator('.error').innerText).toBe('Invalid email');
   ```

4. **Avoid Testing Implementation Details**
   ```javascript
   // Bad - testing implementation
   expect(component.state().count).toBe(1);

   // Good - testing behavior
   expect(screen.getByText('1 item')).toBeInTheDocument();
   ```

5. **Use Fixtures for Test Data**
   ```javascript
   import { mockProduct } from '../fixtures/products';

   test('displays product details', () => {
     render(<Product data={mockProduct} />);
   });
   ```

## Test Coverage

### Coverage Requirements

- **Critical Code**: 90% minimum
- **Overall Code**: 80% minimum
- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

### Critical Files

The following files are considered critical and require 90% coverage:
- `js/script.js` - Main application logic
- `css/style.css` - Core styling (where applicable)

### Viewing Coverage Reports

```bash
# Generate coverage
npm run test:coverage

# View HTML report
open coverage/index.html
```

### Excluding Files

Edit `vitest.config.ts`:

```javascript
coverage: {
  exclude: [
    'node_modules/',
    'tests/',
    'coverage/',
    '**/*.config.js',
    'dist/',
    'build/',
  ],
}
```

## Best Practices

### General Testing Principles

1. **Test Behavior, Not Implementation**
2. **Keep Tests Independent**
3. **Use Descriptive Test Names**
4. **Test Edge Cases**
5. **Mock External Dependencies**
6. **Keep Tests Fast**
7. **Maintain Test Code Quality**

### Before Writing Tests

1. **Define What to Test**
   - User flows
   - Edge cases
   - Error handling
   - Performance expectations

2. **Identify Test Type**
   - Unit, integration, or E2E
   - Accessibility or performance
   - Visual regression

3. **Plan Test Structure**
   - Arrange-Act-Assert pattern
   - Test fixtures
   - Mock data

### After Writing Tests

1. **Run Tests Locally**
2. **Check Coverage**
3. **Review Test Quality**
4. **Document Complex Tests**
5. **Add to CI/CD Pipeline**

## Troubleshooting

### Common Issues

#### Tests Pass Locally but Fail in CI

**Possible Causes**:
- Environment differences
- Timing issues
- Browser differences

**Solutions**:
```javascript
// Add retries
test.retries(2);

// Increase timeouts
test.setTimeout(10000);

// Wait for elements
await expect(page.locator('.element')).toBeVisible();
```

#### Flaky Tests

**Possible Causes**:
- Race conditions
- Async timing issues
- External dependencies

**Solutions**:
```javascript
// Use explicit waits
await page.waitForSelector('.element');

// Use test retries
test.retries(3);

// Mock external APIs
nock('https://api.example.com').get('/data').reply(200, mockData);
```

#### Slow Tests

**Possible Causes**:
- Too many E2E tests
- Inefficient selectors
- External API calls

**Solutions**:
```javascript
// Use efficient selectors
// Good - data-testid
page.locator('[data-testid="submit"]')

// Bad - complex CSS selectors
page.locator('div > form > button[type="submit"]')

// Mock external services
nock('https://api.example.com').get('/data').reply(200, mockData);
```

### Debugging Tips

#### Debug Playwright Tests

```bash
# Run in headed mode
npx playwright test --headed

# Run with debugging
npx playwright test --debug

# Run specific test
npx playwright test --grep "test name"
```

#### Debug Cypress Tests

```bash
# Open Cypress Test Runner
npm run test:e2e:open

# Run specific test
npx cypress run --spec "cypress/e2e/test.cy.js"

# Run in headed mode
npx cypress run --headed
```

#### Debug Vitest Tests

```bash
# Run with UI
npm run test:ui

# Run specific test
npm run test -- --reporter=verbose --grep "test name"

# Run in watch mode
npm run test:watch
```

## Resources

### Documentation
- [Vitest Documentation](https://vitest.dev/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)

### Best Practices
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing JavaScript](https://javascript.info/testing)
- [Accessibility Testing](https://www.deque.com/axe/)

### Learning Resources
- [Testing JavaScript](https://testingjavascript.com/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

## Support

For testing-related questions or issues:
1. Check this documentation
2. Review troubleshooting section
3. Check test logs and reports
4. Open an issue with detailed information

---

**Last Updated**: January 3, 2026
