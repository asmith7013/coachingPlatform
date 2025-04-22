<doc id="core-principles">

# Core Architecture Principles

<section id="architecture-overview">

## Overview

Our AI Coaching Platform is built on a set of core architectural principles that guide all development decisions. These principles ensure the application remains maintainable, scalable, and aligned with our goal of modernizing coaching and implementation tracking.

[RULE] All development decisions should align with these core principles.

</section>

<section id="schema-driven">

## Schema-Driven Design

We follow a schema-driven architecture where Zod schemas serve as the canonical source of truth for all data structures:

```typescript
// Define schema first
const SchoolZodSchema = z.object({
  schoolNumber: z.string(),
  district: z.string(),
  schoolName: z.string(),
  // Additional fields...
});

// Types are derived from schema
type School = z.infer<typeof SchoolZodSchema>;

// MongoDB model aligns with schema
const SchoolSchema = new mongoose.Schema({
  schoolNumber: { type: String, required: true },
  district: { type: String, required: true },
  // Fields mirror schema definition...
});
This approach ensures:

Type safety across the entire application
Consistent validation between client and server
Single source of truth for data structures
Automatic TypeScript type generation

[RULE] Always define Zod schemas first, then derive types and models from them.
</section>
<section id="component-hierarchy">
Atomic Component Hierarchy
Our component system follows an atomic design pattern:

Core Components: Primitive UI elements (Button, Input, Text)
Composed Components: Combinations of core components (Card, Form, Table)
Domain Components: Business-specific components (StaffCard, RubricViewer)
Feature Components: Complete features (SchoolDirectory, CoachingLog)

This structure promotes:

Reusability through composition
Consistent UI patterns
Clear separation of concerns
Testability at each level

[RULE] Follow the atomic design pattern for all component development.
</section>
<section id="token-first">
Token-First Design System
Our design system uses tokens as the foundation for all styling:
typescript// Define tokens in a central location
export const colors = {
  primary: "text-blue-600",
  secondary: "text-gray-600",
  // More color tokens...
};

// Use tokens instead of hardcoded values
function Button({ variant = "primary", children }) {
  return (
    <button className={cn(colors[variant])}>
      {children}
    </button>
  );
}
Benefits include:

Consistent visual language
Easy theme customization
Reduced duplication
Enforced design constraints

[RULE] Always use design tokens instead of hardcoded values.
</section>
<section id="standardized-patterns">
Standardized Patterns
We employ consistent patterns across the application:

Data Fetching: All data fetching uses custom hooks with error handling
Form Handling: Forms are generated from schemas and field configurations
Error Handling: Specialized handlers for client, server, and validation errors
API Responses: Standardized response formats with consistent structure

These patterns:

Reduce cognitive load for developers
Ensure consistent user experience
Minimize duplication
Make the codebase more predictable

[RULE] Follow established patterns rather than creating one-off solutions.
</section>
<section id="development-efficiency">
Development Efficiency
We prioritize developer experience through:

Path Aliases: Short, readable import paths
Barrel Files: Centralized exports to simplify imports
Generated Code: Automatic generation of repetitive code
Utility Functions: Common operations abstracted into reusable utilities
Development Tooling: Custom ESLint rules, debugging hooks, and more

These practices:

Speed up development
Reduce boilerplate
Improve code quality
Enable rapid iteration

[RULE] Value developer efficiency as a key architectural concern.
</section>
</doc>