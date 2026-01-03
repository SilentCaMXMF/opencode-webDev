# Frontend Design Agent System Usage Examples

This document provides practical examples of how to use the Frontend Design Agent System for various frontend development scenarios.

## Example 1: Starting a New Project

### Prompt to Frontend Design Orchestrator:
```
I'm starting a new e-commerce web application with the following requirements:
- React/Next.js with TypeScript
- Need a comprehensive design system
- Must be fully accessible (WCAG 2.1 AA)
- Target performance: LCP < 2.5s on 3G
- Support for desktop, tablet, and mobile
- Integration with existing e-commerce API

Please provide an architectural recommendation and implementation plan.
```

### Expected Workflow:
1. Orchestrator analyzes requirements
2. Delegates to design-system-specialist for design system architecture
3. Delegates to performance-optimizer for performance strategy
4. Delegates to accessibility-specialist for accessibility planning
5. Delegates to cross-platform-specialist for compatibility strategy
6. Provides comprehensive implementation plan

## Example 2: Optimizing Existing Application

### Prompt to Performance Optimizer:
```
My Next.js application is slow on mobile devices. Lighthouse scores:
- Performance: 45
- Largest Contentful Paint: 6.2s
- First Input Delay: 280ms
- Cumulative Layout Shift: 0.35

The app has:
- Large JavaScript bundles (2.3MB initial)
- Unoptimized images
- Server-side rendering for all pages
- No code splitting implemented

Please analyze and provide optimization recommendations.
```

### Expected Workflow:
1. Performance analysis and bottleneck identification
2. Bundle optimization strategy
3. Image optimization implementation
4. Code splitting and lazy loading
5. Performance monitoring setup
6. Implementation of optimizations

## Example 3: Creating Accessible Components

### Prompt to Accessibility Specialist:
```
I need to create an accessible data table component with the following features:
- Sortable columns
- Row selection with checkboxes
- Pagination
- Keyboard navigation
- Screen reader support
- Works with both mouse and touch input

Please provide implementation guidelines and accessibility requirements.
```

### Expected Workflow:
1. Accessibility requirements analysis
2. ARIA implementation guidelines
3. Keyboard navigation patterns
4. Screen reader optimization
5. Testing strategy with assistive technologies
6. Component implementation review

## Example 4: Cross-Platform Compatibility

### Prompt to Cross-Platform Specialist:
```
My React application works perfectly in Chrome but has issues in:
- Safari: CSS Grid layout breaks
- Firefox: Custom scrollbars not working
- Mobile: Touch events not properly handled
- Edge: Some ES6+ features not supported

The application uses:
- CSS Grid for layouts
- Custom scrollbars styling
- Touch gestures for mobile
- Modern JavaScript features

Please provide compatibility solutions and fallback strategies.
```

### Expected Workflow:
1. Browser compatibility analysis
2. Feature detection implementation
3. Polyfill and fallback strategies
4. Responsive design optimization
5. Touch and mouse input handling
6. Cross-browser testing recommendations

## Example 5: Design System Implementation

### Prompt to Design System Specialist:
```
I need to create a design system for a banking application with:
- Professional color palette
- Accessible typography
- Form components with validation
- Data visualization components
- Dark mode support
- Comprehensive documentation

The design should convey:
- Trust and security
- Professionalism
- Clarity and usability
- Accessibility for all users

Please create a design system architecture and component plan.
```

### Expected Workflow:
1. Design token definition
2. Color palette creation with accessibility testing
3. Typography system design
4. Component architecture planning
5. Documentation strategy
6. Implementation guidelines

## Example 6: Component Development

### Prompt to Component Developer:
```
I need to implement a reusable search component with the following features:
- Debounced search input
- Search suggestions dropdown
- Keyboard navigation
- Loading states
- Error handling
- Accessibility compliance
- TypeScript interfaces

The component should:
- Integrate with our existing API
- Follow our design system
- Be fully tested
- Include comprehensive documentation

Please implement this component following our established patterns.
```

### Expected Workflow:
1. Component API and interface design
2. State management implementation
3. Accessibility features integration
4. Performance optimization
5. Comprehensive testing
6. Documentation creation

## Integration Patterns

### Context7 Integration Examples:
```
# Automatic Context7 usage for documentation
"How do I implement React Query for data fetching?"
"What's the API for Next.js middleware?"
"Show me examples of TypeScript advanced types"
"What are the best practices for Redux Toolkit?"
```

### DevTools Integration Examples:
```
# Browser DevTools for performance analysis
"Analyze the performance of this page and identify bottlenecks"
"Audit this page for accessibility violations"
"Test responsive design across different viewport sizes"
"Monitor network requests and optimize loading performance"
```

### Subagent Delegation Examples:
```
# Orchestrator delegating to specialists
"Delegate the design system creation to the design-system-specialist"
"Have the performance-optimizer analyze bundle size and suggest optimizations"
"Ask the accessibility-specialist to review our form implementation"
"Get the cross-platform-specialist to test our app on Safari and mobile devices"
```

## Best Practices for Using the Agent System

### 1. Clear Requirements
- Provide specific, detailed requirements
- Include constraints and technical specifications
- Mention target browsers, devices, and performance goals
- Specify accessibility requirements and compliance levels

### 2. Context Sharing
- Share relevant code examples and existing implementations
- Provide design mockups or Figma links when available
- Include performance metrics or current issues
- Mention any existing design system or component library

### 3. Iterative Development
- Start with high-level architecture and planning
- Implement features incrementally with testing
- Review and optimize based on feedback
- Document decisions and implementation patterns

### 4. Quality Focus
- Prioritize accessibility and performance from the start
- Implement comprehensive testing strategies
- Follow established coding standards and patterns
- Create clear documentation and examples

### 5. Tool Utilization
- Let Context7 provide up-to-date documentation
- Use Browser DevTools for analysis and debugging
- Leverage subagent expertise for specialized tasks
- Follow the established workflow processes

These examples demonstrate how the Frontend Design Agent System can handle various frontend development scenarios while maintaining high standards for performance, accessibility, and code quality.