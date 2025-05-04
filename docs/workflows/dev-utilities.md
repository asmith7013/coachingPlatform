```markdown
<doc id="dev-utilities">

# Development Utilities

<section id="dev-utils-overview">

## Overview

Our application includes specialized utilities designed to improve the development experience, enforce code quality, and provide safeguards against common issues. These tools help maintain consistency and quality across the codebase.

[RULE] Leverage development utilities to improve code quality and development efficiency.

</section>

<section id="schema-config-alignment">

## Schema-Config Alignment

The `checkFieldConfigCoverage` utility ensures that field configurations align with Zod schemas:

```typescript
import { checkFieldConfigCoverage } from "@/lib/utils/dev/checkFieldConfigCoverage";
import { SchoolZodSchema } from "@/lib/data/schemas/core/school";
import { SchoolFieldConfig } from "@/lib/data/forms/config/core/school";

// Check if field config covers all schema fields
checkFieldConfigCoverage(
  SchoolZodSchema,
  SchoolFieldConfig,
  "SchoolZodSchema",
  "SchoolFieldConfig"
);
```
This utility:

Identifies missing fields in the configuration
Identifies extra fields in the configuration
Logs warnings in development environments
Helps prevent divergence between schemas and UI

[RULE] Run schema-config alignment checks when implementing new features or modifying existing ones.
</section>

<section id="tailwind-enforcement">
Tailwind Design System Enforcement
Our ESLint configuration includes a custom rule for enforcing Tailwind design tokens:

```javascript
// In .eslintrc.js
module.exports = {
  rules: {
    '@local/no-hardcoded-tailwind-classes': 'warn'
  }
}
```
This rule detects hardcoded Tailwind classes that should use design tokens:
```jsx
// ❌ Bad
<div className="text-blue-500 p-4 rounded-md">Content</div>

// ✅ Good for atomic components
<div className={cn(colors.primary, spacing.md, shape.rounded)}>Content</div>

// ✅ Good for components with shared behaviors
<div className={cn(colors.primary, spacing.md, shape.rounded, interactive({ hover: true }))}>
  Interactive Content
</div>
```
The rule:

Identifies patterns like color classes, spacing units, and shape properties
Suggests appropriate token replacements
Can be configured with allowed exceptions
Supports both JSX className attributes and utility functions like cn()

[RULE] Always use design tokens instead of hardcoded Tailwind classes.
</section>

<section id="mock-data">
Mock Data System
Our development environment includes a mock data system for rapid prototyping:

```typescript
import { mockSchools, mockNYCPSStaff, mockTLStaff } from "@/lib/utils/dev/mockData";

// Use mock data in development
const schools = process.env.NODE_ENV === 'development' 
  ? mockSchools 
  : await fetchSchools();
  ```
The mock data:

Mirrors the structure of real database documents
Includes realistic relationships between entities
Can be used for UI development without database connection
Provides consistent test data across all features

[RULE] Use the mock data system for rapid UI development and testing.
</section>

<section id="debugging-hooks">
Debugging Hooks
For complex component debugging, use the specialized debugging hooks:

```typescript
// Detect render loops
import { useRenderTracking } from "@/hooks/debugging/useRenderTracking";

function MyComponent() {
  useRenderTracking("MyComponent");
  // Component implementation
}

// Test component in isolation
import { useComponentTester } from "@/hooks/debugging/useComponentTester";

function TestPage() {
  const { result, error } = useComponentTester(
    MyComponent,
    { prop1: "value1" }
  );
  
  return (
    <div>
      <h1>Component Test</h1>
      {error ? (
        <div className="error">{error.message}</div>
      ) : (
        <div className="result">{result}</div>
      )}
    </div>
  );
}
```
[RULE] Use debugging hooks to identify and fix performance issues and bugs.
</section>

<section id="performance-monitoring">
Performance Monitoring
Our application includes a performance monitoring system for optimizing user experience:

```typescript
import { usePerformanceMonitoring } from "@/lib/core/performance/usePerformanceMonitoring";

function MyComponent() {
  usePerformanceMonitoring("MyComponent");
  // Component implementation
}
```
The monitoring system:

Tracks component render times
Identifies slow operations
Logs performance metrics in development
Can be integrated with Sentry or other monitoring tools

[RULE] Use performance monitoring for critical user-facing components.
</section>
</doc>
```
