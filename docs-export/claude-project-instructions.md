# AI Coaching Platform Documentation

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Architecture](#architecture)
  - [core principles](#core-principles)
  - [design patterns](#design-patterns)
  - [import patterns](#import-patterns)
  - [project structure](#project-structure)
- [Components](#components)
  - [component system](#component-system)
  - [composed components](#composed-components)
  - [core components](#core-components)
  - [domain components](#domain-components)
- [Data-flow](#data-flow)
  - [api patterns](#api-patterns)
  - [error handling](#error-handling)
  - [mongodb integration](#mongodb-integration)
  - [sanitization system](#sanitization-system)
  - [schema system](#schema-system)
  - [server actions](#server-actions)
- [Workflows](#workflows)
  - [common tasks](#common-tasks)
  - [cursor integration](#cursor-integration)
  - [dev utilities](#dev-utilities)
  - [development workflow](#development-workflow)
- [Examples](#examples)
  - [component examples](#component-examples)
  - [prompt examples](#prompt-examples)
  - [schema examples](#schema-examples)


<a id="architecture-overview"></a>

# Architecture Overview

# Architecture Overview & Documentation Guide

## Purpose of This Document

This document provides a comprehensive overview of the AI Coaching Platform architecture and serves as a guide to the documentation structure. It's designed to help both developers and AI tools (Cursor, Claude) understand the system architecture, documentation organization, and implementation patterns.

The documentation in these folders contains detailed information about specific aspects of the system, while this document provides the high-level context necessary to navigate and understand those details.

## Core Architecture

Our application follows these key architectural principles:

1. **Schema-Driven Design**: Zod schemas serve as the canonical source of truth for all data structures
2. **Atomic Component Hierarchy**: Components follow core → composed → domain → features pattern
3. **Token-First Design System**: All styling uses design tokens for consistency
4. **Standardized Patterns**: Common patterns for data fetching, forms, error handling, and API responses

## Tech Stack

- **Frontend**: Next.js with Tailwind CSS (token-first design system)
- **Backend**: Node.js, MongoDB
- **Validation**: Zod schemas (canonical source of truth)
- **Forms**: Generated dynamically from Zod schemas
- **Styling**: Tailwind Variants (tv()) for component styling
- **State Management**: React hooks with SWR for data fetching
- **Error Handling**: Specialized handlers for client, server, and validation errors

## Main System Components

The system consists of these primary components:

### 1. Data Layer
- **Zod Schemas**: Define all data structures (`src/lib/data/schemas/`)
- **MongoDB Models**: Database models derived from schemas (`src/models/`)
- **API Routes**: Endpoints for data access (`src/app/api/`)
- **Server Actions**: Direct server operations (`src/app/actions/`)

### 2. UI Layer
- **Core Components**: Primitive UI elements (`src/components/core/`)
- **Composed Components**: Combinations of core components (`src/components/composed/`)
- **Domain Components**: Business-specific components (`src/components/domain/`)
- **Feature Components**: Complete features (`src/components/features/`)

### 3. Data Flow
- **Custom Hooks**: Data fetching and state management (`src/hooks/`)
- **Field Configurations**: Form field definitions (`src/lib/ui-schema/fieldConfig/`)
- **Form Overrides**: Context-specific form modifications (`src/lib/ui-schema/formOverrides/`)

### 4. Utilities
- **Error Handling**: Standardized error processing (`src/lib/core/error/`)
- **Sanitization**: Data cleaning and validation (`src/lib/utils/server/`)
- **Development Tools**: Developer experience enhancements (`src/lib/utils/dev/`)

## How It All Fits Together

1. Data flows from Zod schemas → MongoDB models → API/Server Actions → React hooks → UI components
2. UI components use a hierarchy from simple to complex (core → composed → domain → features)
3. Forms are generated from field configurations that refer to Zod schemas
4. Error handling is standardized across all layers

## Documentation Structure

The remainder of the documentation is organized into these sections:

### Architecture (`/docs/architecture/`)
- **Core Principles**: Foundational architectural principles
- **Design Patterns**: Common patterns used throughout the application
- **Import Patterns**: Conventions for organizing imports
- **Project Structure**: Organization of the codebase

### Components (`/docs/components/`)
- **Component System**: Overview of the component architecture
- **Composed Components**: Patterns for building composite components
- **Core Components**: Basic building blocks
- **Domain Components**: Business-specific implementations

### Data Flow (`/docs/data-flow/`)
- **API Patterns**: Standardized API response formats and error handling
- **Error Handling**: Comprehensive error handling system
- **MongoDB Integration**: Patterns for database interaction
- **Sanitization System**: Data cleaning and validation
- **Schema System**: Zod schema architecture
- **Server Actions**: Next.js server action implementation

### Workflows (`/docs/workflows/`)
- **Common Tasks**: Step-by-step guides for frequent development tasks
- **Cursor Integration**: Best practices for using the Cursor AI code editor
- **Dev Utilities**: Developer experience enhancement tools
- **Development Workflow**: Overall development process

### Examples (`/docs/examples/`)
- **Component Examples**: Real-world component implementations
- **Prompt Examples**: Effective prompts for Cursor AI
- **Schema Examples**: Example Zod schema implementations

## Development Workflow

### Adding a New Entity

1. Create the Zod schema in the appropriate domain directory
2. Create the MongoDB model derived from the schema
3. Create field configuration for form generation
4. Implement server actions or API routes for CRUD operations
5. Build UI components for entity display and manipulation

### Creating Components

Components follow the atomic design pattern:

1. Core components (Button, Input, Text)
2. Composed components (Card, Form, Table)
3. Domain components (StaffCard, RubricViewer)
4. Feature components (SchoolDirectory, CoachingLog)

All components use the Tailwind Variants library for styling with design tokens.

### Data Fetching

Data is fetched using custom hooks built around SWR:

```typescript
function useResources() {
  const { data, error, isLoading } = useSafeSWR('/api/resources');
  
  return {
    resources: data?.items || [],
    error,
    isLoading,
    // CRUD operations...
  };
}
```

## Project Structure

```
src/
├── app/                # Next.js app router pages and API routes
│   ├── actions/        # Server actions for form submissions
│   ├── api/            # API routes for data access
│   └── [routes]/       # Page components
├── components/         # React components
│   ├── core/           # Primitive UI elements
│   ├── composed/       # Combinations of core components
│   ├── domain/         # Business domain specific components
│   ├── features/       # Complete feature implementations
│   ├── layouts/        # Page layout components
│   ├── shared/         # Cross-cutting components
│   └── utility/        # Helper components
├── hooks/              # Custom React hooks
│   ├── debugging/      # Hooks for development and debugging
│   ├── utils/          # Utility hooks for common operations
│   └── [domain hooks]  # Resource-specific hooks
├── lib/                # Core utilities and modules
│   ├── core/           # Essential core functionality
│   ├── data/           # Data handling utilities
│   ├── domains/        # Domain-specific functionality
│   ├── ui/             # UI utilities
│   └── utils/          # General utilities
├── models/             # MongoDB models
│   ├── core/           # Core entity models
│   ├── look-fors/      # Look For related models
│   ├── scheduling/     # Scheduling related models
│   └── visits/         # Visit related models
└── providers/          # React context providers
```

## Design Philosophy

- **Structured, DRY, and scalable**: The codebase is designed to avoid manual duplication
- **Mock data for development**: Full-featured development is possible without a database connection
- **Schema-driven**: All data structures flow from Zod schemas
- **Token-first styling**: All UI components use design tokens for consistent styling

## Current Build Priorities

1. Daily Visit Page
2. Teacher & Admin Dashboards
3. Schedule Generator
4. Coaching Log Auto-fill + Monday.com Integration
5. Real-time Transcription + Insights (Phase 2)

## Using This Documentation

When working with this codebase or documentation:

1. Start with understanding the schema architecture for your target domain
2. Follow the established patterns for implementation
3. Reference the appropriate documentation sections based on your task
4. Use the section IDs to locate specific guidance (e.g., `[component-system][component-variants]`)

For AI tools like Cursor, this documentation is organized with section IDs that can be directly referenced:

```
[document-id][section-id] Section Title
```

For example:
- `[component-system][component-variants]` - References the variants section of the component system
- `[error-handling][error-hooks]` - References the hooks section of error handling
- `[data-flow][data-schemas]` - References the schemas section of data flow

This structure enables precise contextual guidance when developing with AI assistance.

---

<a id="architecture"></a>

# Architecture

<a id="core-principles"></a>

## core principles

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

---

<a id="design-patterns"></a>

## design patterns

<doc id="design-patterns">

# Core Design Patterns

<section id="patterns-overview">

## Overview

Our application employs a set of consistent design patterns that solve common problems and promote code quality. These patterns provide a shared vocabulary and approach for the development team.

[RULE] Use these established patterns to solve common problems rather than creating one-off solutions.

</section>

<section id="hook-patterns">

## React Hook Patterns

### Resource Hooks

For data fetching and management, we use a consistent resource hook pattern:

```typescript
function useSchools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch implementation...
  
  return {
    schools,
    error,
    isLoading,
    createSchool,
    updateSchool,
    deleteSchool,
  };
}
These hooks:

Provide CRUD operations for a resource
Handle loading and error states
Maintain consistent return shapes
Support optimistic updates

Safe Data Fetching
For safer data fetching with SWR, we use the useSafeSWR hook:
typescriptfunction useSafeSWR<T>(key: string, fetcher?: Fetcher<T>) {
  // Implementation with error handling...
}

// Usage
const { data, error, isLoading } = useSafeSWR('/api/schools');
[RULE] Use appropriate hook patterns for data fetching and management.
</section>
<section id="component-patterns">
Component Patterns
Variant Pattern
Components use the variant pattern with Tailwind Variants:
typescriptconst button = tv({
  base: "inline-flex items-center justify-center font-medium",
  variants: {
    color: {
      primary: "bg-blue-600 text-white",
      secondary: "bg-gray-200 text-gray-800",
    },
    size: {
      sm: "text-sm px-3 py-1",
      md: "text-base px-4 py-2",
    },
  },
  defaultVariants: {
    color: "primary",
    size: "md",
  }
});

export function Button({ color, size, ...props }) {
  return (
    <button className={button({ color, size })} {...props} />
  );
}
Compound Components
For complex components, we use the compound component pattern:
typescriptfunction Table({ children, ...props }) {
  // Implementation...
}

Table.Header = function TableHeader({ children, ...props }) {
  // Implementation...
};

Table.Row = function TableRow({ children, ...props }) {
  // Implementation...
};

Table.Cell = function TableCell({ children, ...props }) {
  // Implementation...
};

// Usage
<Table>
  <Table.Header>...</Table.Header>
  <Table.Row>
    <Table.Cell>...</Table.Cell>
  </Table.Row>
</Table>
[RULE] Use variant and compound component patterns for flexible, reusable components.
</section>
<section id="form-patterns">
Form Patterns
Schema-Driven Forms
Forms are generated from Zod schemas and field configurations:
typescript// Field configuration derived from schema
const SchoolFieldConfig: Field<SchoolInput>[] = [
  {
    name: 'schoolNumber',
    label: 'School Number',
    type: 'text',
    required: true,
  },
  // Additional fields...
];

// Form component uses configuration
function SchoolForm() {
  return (
    <ResourceForm
      title="Add School"
      fields={SchoolFieldConfig}
      onSubmit={handleSubmit}
    />
  );
}
Field Overrides
Field configurations can be overridden for specific use cases:
typescriptconst SchoolOverrides: FieldOverrideMap<SchoolInput> = {
  district: {
    type: 'reference',
    label: 'District',
    url: '/api/districts',
    multiple: false,
  },
};

function SchoolFormWithOverrides() {
  return (
    <ResourceForm
      title="Add School"
      fields={SchoolFieldConfig}
      overrides={SchoolOverrides}
      onSubmit={handleSubmit}
    />
  );
}
[RULE] Use schema-driven forms with field configurations and overrides.
</section>
<section id="error-patterns">
Error Handling Patterns
Error Handler Functions
Error handling is standardized with specialized handlers:
typescript// Client-side error handling
try {
  // Client-side operation
} catch (error) {
  const errorMessage = handleClientError(error);
  // Display to user
}

// Server-side error handling
try {
  // Server-side operation
} catch (error) {
  if (error instanceof z.ZodError) {
    return handleValidationError(error);
  }
  return handleServerError(error);
}
Error Boundaries
For component-level error handling, we use error boundaries:
tsx<ErrorBoundary
  fallback={<ErrorFallback />}
  onError={handleError}
>
  <ComponentThatMightError />
</ErrorBoundary>
[RULE] Use the appropriate error handling pattern based on the context.
</section>
<section id="api-patterns">
API Patterns
Standard Response
API responses follow a consistent structure:
typescriptinterface StandardResponse<T = Record<string, unknown>> {
  items: T[];
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
  success: boolean;
}

// Example success response
{
  "items": [{ id: "1", name: "Item 1" }],
  "total": 1,
  "success": true
}

// Example error response
{
  "items": [],
  "success": false,
  "message": "Error message"
}
API Route Handler
API routes use the withStandardResponse wrapper:
typescriptexport const GET = withStandardResponse(async (request) => {
  // Implementation...
  return {
    items: await fetchItems(),
    total: items.length
  };
});
[RULE] Use the standard response format and API patterns for all server endpoints.
</section>
</doc>

---

<a id="import-patterns"></a>

## import patterns

<doc id="import-patterns">

# Import Patterns

<section id="barrel-files">

## Barrel Files

Barrel files (index.ts/js files) consolidate and re-export components or modules from a directory, simplifying imports throughout the application.

```typescript
// Example barrel file: src/components/core/index.ts
export * from './Button';
export * from './Input';
export * from './Text';
export * from './Card';
This allows consumers to import from the directory instead of specific files:
typescript// Without barrel files
import { Button } from '@/components/core/Button';
import { Input } from '@/components/core/Input';

// With barrel files
import { Button, Input } from '@/components/core';
Benefits of barrel files:

Simplified imports
Cleaner code
Easier refactoring
Logical grouping of exports

[RULE] Create barrel files (index.ts) for directories with multiple related exports.
</section>
<section id="path-aliases">
Path Aliases
Path aliases provide shorthand references to commonly used directories, avoiding lengthy relative paths.
Our project uses the following path aliases:
typescript// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@lib/*": ["src/lib/*"],
      "@hooks/*": ["src/hooks/*"],
      "@models/*": ["src/models/*"]
    }
  }
}
Example usage:
typescript// Avoid relative paths
import { Button } from '../../../components/core/Button';

// Use path aliases instead
import { Button } from '@components/core/Button';
// or 
import { Button } from '@/components/core/Button';
Benefits of path aliases:

Shorter, more readable imports
Avoids complex relative paths
Makes refactoring easier
Improves code maintainability

[RULE] Always use path aliases instead of deeply nested relative imports.
</section>
<section id="import-organization">
Import Organization
Keep imports organized in a consistent order:

External libraries
Path aliases
Relative imports

typescript// Example of organized imports
import { useState, useEffect } from 'react';
import { z } from 'zod';

import { Button } from '@/components/core';
import { useSchools } from '@/hooks/useSchools';
import { SchoolZodSchema } from '@/lib/zod-schema';

import { renderField } from './utils';
import styles from './styles.module.css';
Additionally:

Group imports logically
Leave a blank line between groups
Alphabetize imports within groups (optional)
Use destructuring when appropriate

[RULE] Group and order imports consistently in every file.
</section>
<section id="import-best-practices">
Import Best Practices
Import Only What You Need
typescript// ❌ Bad - imports entire library
import * as React from 'react';

// ✅ Good - imports only what's needed
import { useState, useEffect } from 'react';
Use Consistent Import Style
Choose either named imports or default imports consistently:
typescript// Named imports (preferred for most libraries)
import { Button, Input } from '@/components/core';

// Default imports (when appropriate)
import Button from '@/components/core/Button';
Handle Dynamic Imports
For code splitting and lazy loading:
typescript// Lazy load component
const DynamicComponent = React.lazy(() => import('@/components/heavy-component'));

// Dynamic import in server action
const csv = await import('csv-parser');
[RULE] Follow import best practices for cleaner, more maintainable code.
</section>
<section id="avoiding-circular-dependencies">
Avoiding Circular Dependencies
Circular dependencies occur when two or more modules depend on each other:
typescript// fileA.ts
import { functionB } from './fileB';
export function functionA() {
  return functionB();
}

// fileB.ts 
import { functionA } from './fileA';
export function functionB() {
  return functionA(); // Circular dependency!
}
To avoid circular dependencies:

Refactor Common Logic: Extract shared functionality to a separate module
Use Interface Segregation: Split interfaces to avoid unnecessary dependencies
Apply Dependency Injection: Pass dependencies as arguments rather than importing
Create Hub Modules: Use intermediate modules that import from both modules

[RULE] Actively refactor to avoid circular dependencies in your import structure.
</section>
</doc>

---

<a id="project-structure"></a>

## project structure

<doc id="project-structure">

# Project Structure

<section id="structure-overview">

## Overview

Our AI Coaching Platform follows a carefully organized project structure that supports our architectural principles and development workflow. This structure promotes discoverability, maintainability, and scalability.

[RULE] Follow the established project structure for all new development.

</section>

<section id="root-directories">

## Root Directories
├── docs/               # Documentation
├── public/             # Static assets
├── scripts/            # Build and utility scripts
├── src/                # Application source code
└── .cursor/            # Cursor AI helper files

### Documentation (`/docs`)

Organized documentation that follows a clear structure:
- Architecture principles and patterns
- Component documentation
- Data flow documentation
- Workflow guides
- Examples and best practices

### Scripts (`/scripts`)

Utility scripts for common tasks:
- Seeding the database with test data
- Generating theme CSS from tokens
- Updating import statements
- Other build and development utilities

[RULE] Place all scripts that aren't part of the application code in the scripts directory.

</section>

<section id="src-structure">

## Source Structure
src/
├── app/                # Next.js app router pages and API routes
├── components/         # React components
├── hooks/              # Custom React hooks
├── lib/                # Core utilities and modules
├── models/             # MongoDB models
├── providers/          # React context providers
└── styles/             # Global styles

### App Directory (`/src/app`)

Next.js app router structure with:
- Page components for each route
- API routes for server-side operations
- Server actions for form submissions
- Layouts for page composition

### Components Directory (`/src/components`)

Components organized by complexity:
components/
├── core/               # Primitive UI elements
├── composed/           # Combinations of core components
├── domain/             # Business domain specific components
├── features/           # Complete feature implementations
├── layouts/            # Page layout components
├── shared/             # Cross-cutting components
└── utility/            # Helper components

### Hooks Directory (`/src/hooks`)

Custom React hooks organized by purpose:
hooks/
├── debugging/          # Hooks for development and debugging
├── utils/              # Utility hooks for common operations
└── domain hooks        # Hooks for specific domains (useSchools, etc.)

[RULE] Group related hooks together and provide barrel files for exports.

</section>

<section id="lib-structure">

## Library Structure

The `lib` directory contains core utilities and modules:
lib/
├── core/               # Essential core functionality
│   ├── error/          # Error handling utilities
│   ├── performance/    # Performance monitoring
│   └── types/          # Core type definitions
├── data/               # Data handling utilities
│   ├── forms/          # Form configurations and utilities
│   ├── hooks/          # Data-specific hooks
│   ├── schemas/        # Zod schemas
│   └── server-actions/ # Server action implementations
├── domains/            # Domain-specific functionality
├── ui/                 # UI utilities
│   ├── tokens/         # Design system tokens
│   ├── variants/       # Component variants
│   └── helpers/        # UI helper functions
└── utils/              # General utilities
├── dev/            # Development utilities
├── general/        # General-purpose utilities
└── server/         # Server-side utilities

This structure:
- Groups related functionality
- Creates clear boundaries between concerns
- Provides intuitive import paths
- Scales with application growth

[RULE] Place utilities in the appropriate subdirectory within lib.

</section>

<section id="models-structure">

## Models Structure

MongoDB models are organized by domain:
models/
├── core/               # Core entity models (School, Staff, Cycle)
├── look-fors/          # Look For related models
├── scheduling/         # Scheduling related models
├── shared/             # Shared model utilities
└── visits/             # Visit related models

Each domain directory contains:
- Model definitions for each entity
- Index files with barrel exports
- Types specific to that domain

[RULE] Organize models by domain and provide barrel exports.

</section>

<section id="import-conventions">

## Import Conventions

We follow consistent import conventions:

- **Path Aliases**: Use `@/` and other aliases instead of relative paths
- **Barrel Imports**: Import from index files when possible
- **Import Grouping**: Group imports by external, internal, and relative
- **Destructuring**: Destructure imports when appropriate

```typescript
// External library imports
import { useState, useEffect } from 'react';
import { z } from 'zod';

// Internal imports using path aliases
import { Button } from '@/components/core';
import { useSchools } from '@/hooks';
import { SchoolZodSchema } from '@/lib/data/schemas';

// Relative imports for closely related files
import { renderField } from './utils';
import styles from './styles.module.css';
[RULE] Follow established import conventions for all files.
</section>
</doc>

---

<a id="components"></a>

# Components

<a id="component-system"></a>

## component system

<doc id="component-system">

# Component System Guide

<section id="component-overview">

## Overview

Our component system follows an atomic design pattern, starting with primitive core components and building up to complex feature implementations. All components use the Tailwind Variants (`tv()`) library for styling.

[RULE] Follow the atomic design pattern: core → composed → domain → features.

</section>

<section id="component-organization">

## Component Organization

Components are organized by their level of complexity:
src/components/
├── core/         # Primitive UI elements (Button, Input, Text)
├── composed/     # Combinations of core components (Card, Form)
├── domain/       # Business domain specific components
├── features/     # Complete feature implementations
├── shared/       # Cross-cutting components
└── utility/      # Helper components

[RULE] Place new components in the appropriate directory based on their complexity and purpose.

</section>

<section id="component-tokens">

## Design System Tokens

Our design system uses tokens for consistent styling:

```typescript
// src/lib/ui/tokens.ts
export const colors = {
  primary: "text-blue-600",
  secondary: "text-gray-600",
  accent: "text-purple-600",
  danger: "text-red-600",
  // Additional colors...
};

export const typography = {
  textSize: {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    // Additional sizes...
  },
  // Additional typography tokens...
};
[RULE] Always use tokens instead of hardcoded values for styling.
</section>
<section id="component-variants">
Tailwind Variants
Components use the tv() utility for creating variants:
typescript// Button.tsx
import { tv } from 'tailwind-variants';
import { textSizeVariant, paddingVariant } from '@/lib/ui/sharedVariants';
import { colors } from '@/lib/ui/tokens';

const button = tv({
  base: "inline-flex items-center justify-center font-medium transition-colors",
  variants: {
    textSize: textSizeVariant.variants.textSize,
    padding: paddingVariant.variants.padding,
    color: colors,
  },
  defaultVariants: {
    textSize: 'base',
    padding: 'md',
    color: 'primary',
  }
});

export function Button({ 
  textSize, 
  padding, 
  color, 
  className, 
  ...props 
}: ButtonProps) {
  return (
    <button
      className={button({ textSize, padding, color, className })}
      {...props}
    />
  );
}
[RULE] Split size into separate textSize and padding variants.
</section>
<section id="component-fields">
Form Fields
Form fields (src/components/core/fields/) include standard inputs as well as specialized components:
Standard Fields

Input: Text, email, password inputs
Select: Dropdown selection
Checkbox: Boolean selection
Textarea: Multi-line text input

Specialized Fields

ReferenceSelect: Asynchronous dropdown using useReferenceOptions

typescript// ReferenceSelect.tsx
export function ReferenceSelect({
  url,
  label,
  value,
  onChange,
  multiple = true,
  disabled = false,
}: ReferenceSelectProps) {
  const { options, error, isLoading } = useReferenceOptions(url);
  
  // Component implementation...
}
[RULE] Use appropriate field components based on the data type and input requirements.
</section>
<section id="component-form">
Form Components
Form components (src/components/composed/forms/) provide consistent form rendering:
typescript// ResourceForm.tsx
export function ResourceForm<T extends Record<string, unknown>>({
  title,
  fields,
  onSubmit,
  defaultValues,
}: ResourceFormProps<T>) {
  // Form implementation...
  
  return (
    <form onSubmit={handleSubmit}>
      {fields.map(field => renderField(field))}
      <Button type="submit">Save</Button>
    </form>
  );
}
[RULE] Use the ResourceForm component for all resource creation and editing.
</section>
<section id="component-error-display">
Error Display
Components should display errors in a consistent manner:
tsx// Form field error
{error && (
  <div className="text-sm text-red-500 mt-1">
    {error}
  </div>
)}

// API operation error
{error && (
  <Alert variant="error">
    <AlertTitle>Operation Failed</AlertTitle>
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}
[RULE] Always display errors using the appropriate error component.
</section>
</doc>

---

<a id="composed-components"></a>

## composed components



---

<a id="core-components"></a>

## core components



---

<a id="domain-components"></a>

## domain components



---

<a id="data-flow"></a>

# Data-flow

<a id="api-patterns"></a>

## api patterns

<doc id="api-patterns">

# API Patterns

<section id="api-overview">

## Overview

Our application implements a consistent pattern for API route development, response formatting, and error handling. These patterns ensure a predictable experience for frontend developers and maintain data consistency across the application.

[RULE] All API routes should follow these standard patterns.

</section>

<section id="response-format">

## Standard Response Format

All API responses follow a standardized structure:

```typescript
interface StandardResponse<T = Record<string, unknown>> {
  items: T[];
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
  success: boolean;
}
Example successful response:
json{
  "items": [
    { "id": "1", "name": "Item 1" },
    { "id": "2", "name": "Item 2" }
  ],
  "total": 2,
  "success": true
}
Example error response:
json{
  "items": [],
  "success": false,
  "message": "Error message details"
}
[RULE] Always use the standard response format for consistency across the application.
</section>
<section id="standardize-response">
Response Standardization
To ensure all API responses follow the standard format, use the standardizeResponse utility:
typescriptimport { standardizeResponse, withStandardResponse } from "@/lib/utils/server/standardizeResponse";

// Convert any data type to the standard format
const standardized = standardizeResponse(data);

// Use the decorator pattern for entire API route handlers
export const GET = withStandardResponse(async (request) => {
  // Implementation returns data directly
  // withStandardResponse will format it
  return {
    items: await fetchItems(),
    total: items.length
  };
});
The standardizeResponse utility handles:

Array responses (converts to items array)
Object responses with items property
Object responses without items property (wraps in array)
Error handling for invalid input

[RULE] Use withStandardResponse for all API route handlers to ensure consistent formatting.
</section>
<section id="pagination">
Pagination Patterns
For paginated resources, use the fetchPaginatedResource utility:
typescriptimport { fetchPaginatedResource } from "@/lib/utils/server/fetchPaginatedResource";

export const GET = withStandardResponse(async (request) => {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  
  return fetchPaginatedResource(
    SchoolModel,
    SchoolZodSchema,
    {
      page,
      limit,
      filters: { /* Query filters */ },
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc"
    }
  );
});
The pagination utility:

Handles pagination calculation
Applies proper sorting
Validates and sanitizes filters
Returns metadata about the query (total, page, limit)

[RULE] Use fetchPaginatedResource for all paginated API endpoints.
</section>
<section id="bulk-operations">
Bulk Operations
For bulk operations such as uploading multiple items, use the bulkUploadToDB utility:
typescriptimport { bulkUploadToDB } from "@/lib/utils/server/bulkUpload";

export const POST = withStandardResponse(async (request) => {
  const data = await request.json();
  
  return bulkUploadToDB(
    data,
    SchoolModel,
    SchoolZodSchema,
    ["/dashboard/schoolList"] // Paths to revalidate
  );
});
The bulk upload utility:

Validates all items against the schema
Inserts valid items into the database
Revalidates specified paths
Returns detailed success/error information

[RULE] Use bulkUploadToDB for all bulk upload operations.
</section>
<section id="api-vs-server-actions">
API Routes vs Server Actions
Our application uses both API routes and server actions, each with specific use cases:
When to use API Routes:

External API integrations
Complex filtering, sorting, and pagination
File uploads
Operations that need custom request/response handling
Endpoints that need to be called from multiple places

When to use Server Actions:

Form submissions
Simple CRUD operations
Operations closely tied to specific UI components
Operations that benefit from React Server Components optimizations

[RULE] Choose the appropriate pattern based on the specific requirements of the operation.
</section>
</doc>

---

<a id="error-handling"></a>

## error handling

<doc id="error-handling">

# Error Handling System

<section id="error-overview">

## Overview

Our application implements a comprehensive error handling architecture that ensures consistent error processing across client, server, and validation layers. This system provides standardized error messages, appropriate status codes, and useful debugging information while maintaining good user experience.

[RULE] Always use the appropriate error handler for the context of your operation.

</section>

<section id="error-types">

## Error Types

The system handles three primary types of errors:

1. **Client Errors** - Errors that occur in browser context, often related to network requests, SWR, or UI interactions
2. **Server Errors** - Errors that occur in server components, API routes, or server actions
3. **Validation Errors** - Errors from Zod schema validation failures

Each error type has a dedicated handler function to standardize error formatting.

</section>

<section id="error-handlers">

## Error Handler Functions

### handleClientError

Used in hooks, UI event handlers, and other client-side code:

```typescript
import { handleClientError } from "@/lib/core/error/handleClientError";

try {
  // Client-side operation
} catch (error) {
  // Returns standardized error message
  const errorMessage = handleClientError(error);
  // Display error to user
}
handleServerError
Used in API routes, server actions, and other server-side code:
typescriptimport { handleServerError } from "@/lib/core/error/handleServerError";

try {
  // Server-side operation
} catch (error) {
  // Format and return error response
  return Response.json({
    success: false,
    error: handleServerError(error)
  });
}
handleValidationError
Specifically for Zod validation errors:
typescriptimport { handleValidationError } from "@/lib/core/error/handleValidationError";
import { z } from "zod";

try {
  const result = schema.parse(data);
} catch (error) {
  if (error instanceof z.ZodError) {
    // Format validation errors
    return Response.json({
      success: false,
      error: handleValidationError(error)
    });
  }
}
[RULE] Validation errors should always be handled separately from general server errors.
</section>
<section id="error-display">
Error Display
Errors should be displayed to users in a consistent manner:

Form field errors: Display inline below the relevant field
Operation errors: Use the Alert component with appropriate variant
Fatal errors: Use ErrorBoundary components to catch and display unhandled errors

tsx// Form field error
{error && (
  <div className="text-sm text-red-500 mt-1">
    {error}
  </div>
)}

// API operation error
{error && (
  <Alert variant="error">
    <AlertTitle>Operation Failed</AlertTitle>
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}
[RULE] Always provide users with clear error messages that suggest the next steps when possible.
</section>
<section id="error-hooks">
Error Handling Hooks
Our system provides specialized hooks to streamline error handling:
useErrorHandledMutation
typescriptconst { mutate, isLoading, error } = useErrorHandledMutation(
  async (data) => {
    const response = await fetch('/api/resource', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    return response.json();
  }
);
useSafeSWR
typescriptconst { data, error, isLoading } = useSafeSWR('/api/resource', fetcher);
[RULE] Always use the error-handling hooks instead of raw fetch or SWR when fetching data.
</section>
</doc>

---

<a id="mongodb-integration"></a>

## mongodb integration

<doc id="mongodb-integration">

# MongoDB Integration Patterns

<section id="mongodb-overview">

## Overview

Our application implements a consistent pattern for MongoDB integration, with a focus on type safety, validation, and data integrity. This system bridges the gap between MongoDB's document model and our application's TypeScript types.

[RULE] All database interactions should follow these patterns.

</section>

<section id="model-definition">

## Model Definition

MongoDB models are defined using a consistent pattern that integrates with our Zod schemas:

```typescript
import { SchoolZodSchema } from "@/lib/data/schemas/core/school";
import mongoose from "mongoose";

// Define schema fields, mirroring Zod schema structure
const schemaFields = {
  schoolNumber: { type: String, required: true },
  district: { type: String, required: true },
  schoolName: { type: String, required: true },
  address: { type: String, required: false },
  gradeLevelsSupported: [{ type: String, required: true }],
  staffList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }],
  owners: [{ type: String, required: true }],
};

// Create schema with timestamps
const SchoolSchema = new mongoose.Schema(schemaFields, { timestamps: true });

// Create model, checking for existing models
export const SchoolModel = mongoose.models.School || 
  mongoose.model("School", SchoolSchema);
[RULE] MongoDB schema fields should mirror the structure of the corresponding Zod schema.
</section>
<section id="crud-operations">
CRUD Operations
Our system provides standardized CRUD operations through the crud.ts utility:
typescriptimport { createItem, updateItem, deleteItem } from "@/lib/utils/server/crud";

// Create a new item
const result = await createItem(
  SchoolModel,
  SchoolZodSchema,
  data,
  ["/dashboard/schoolList"] // Paths to revalidate
);

// Update an existing item
const result = await updateItem(
  SchoolModel,
  SchoolZodSchema,
  id,
  data,
  ["/dashboard/schoolList"]
);

// Delete an item
const result = await deleteItem(
  SchoolModel,
  SchoolZodSchema,
  id,
  ["/dashboard/schoolList"]
);
These utilities:

Ensure database connection
Validate data against Zod schemas
Handle type conversions
Manage revalidation of specified paths
Provide consistent error handling

[RULE] Use the CRUD utilities for all standard database operations.
</section>
<section id="object-id-handling">
ObjectId Handling
MongoDB uses ObjectId for document IDs, but our client-side code works with string IDs. Our system handles this conversion automatically:
Server to Client
When sending documents to the client:

ObjectIds are converted to strings
Documents include both _id and id fields with the same string value
Timestamps are properly formatted as Date objects

Client to Server
When receiving data from the client:

String IDs are converted to ObjectIds when needed for database operations
The system handles references and nested document IDs

[RULE] Never manually convert between ObjectId and string; use the sanitization utilities.
</section>
<section id="query-sanitization">
Query Sanitization
User-provided query parameters are sanitized before use in MongoDB operations:
typescriptimport { sanitizeFilters } from "@/lib/utils/server/sanitizeFilters";
import { buildTextSearchQuery, buildDateRangeQuery } from "@/lib/utils/server/sanitizeFilters";

// Sanitize filters
const safeFilters = sanitizeFilters({
  // Remove empty values
  name: userProvidedName
});

// Build complex queries
const textSearchQuery = buildTextSearchQuery(
  ["name", "description"], // Fields to search
  searchTerm
);

const dateRangeQuery = buildDateRangeQuery(
  "createdAt", // Field to query
  startDate,
  endDate
);

// Combine queries
const combinedQuery = {
  ...safeFilters,
  ...textSearchQuery,
  ...dateRangeQuery
};
[RULE] Always sanitize user-provided queries before using them in database operations.
</section>
<section id="pagination-queries">
Pagination Queries
For paginated database queries, use the pagination utilities:
typescriptimport { buildPaginatedQuery, executePaginatedQuery } from "@/lib/utils/server/pagination";

// Build a paginated query
const query = buildPaginatedQuery(
  SchoolModel,
  filters,
  { page, limit, sortBy, sortOrder }
);

// Execute the query with metadata
const result = await executePaginatedQuery(
  SchoolModel,
  filters,
  SchoolZodSchema,
  { page, limit, sortBy, sortOrder }
);
The pagination utilities:

Apply proper skip/limit for pagination
Handle sorting with validation
Count total documents matching filters
Calculate total pages
Include metadata in the response

[RULE] Use pagination utilities for all list or collection API endpoints.
</section>
</doc>

---

<a id="sanitization-system"></a>

## sanitization system

<doc id="sanitization-system">

# Data Sanitization System

<section id="sanitization-overview">

## Overview

Our application implements a robust sanitization system to ensure data safety, consistency, and security across the platform. This system handles the transformation of data between MongoDB and client-side code, with particular attention to document IDs, timestamps, and user input.

[RULE] Always sanitize data when moving between MongoDB and client-side code.

</section>

<section id="sanitization-functions">

## Sanitization Functions

### Document Sanitization

```typescript
import { sanitizeDocument, sanitizeDocuments } from "@/lib/utils/server/sanitize";

// Sanitize a single document
const safeDoc = sanitizeDocument(mongooseDoc, MyZodSchema);

// Sanitize an array of documents
const safeDocs = sanitizeDocuments(mongooseDocs);
The sanitization process:

Converts MongoDB ObjectIds to strings
Ensures timestamps are in proper Date format
Adds an id field that mirrors the _id field
Validates the output against the provided Zod schema

Filter Sanitization
typescriptimport { sanitizeFilters } from "@/lib/utils/server/sanitizeFilters";

// Clean up user-provided filter values before using in MongoDB queries
const safeFilters = sanitizeFilters({
  name: userProvidedName,
  tags: userProvidedTags,
  // Empty strings and arrays will be removed
  emptyValue: ""
});
The filter sanitization removes:

Empty strings
Whitespace-only strings
Empty arrays
null and undefined values

Other Sanitization Utilities

sanitizeString: Trims whitespace and removes empty strings
sanitizeStringArray: Trims whitespace and converts to lowercase
sanitizeSortBy: Ensures sort field is valid and not a direction term

[RULE] Always validate and sanitize user-provided query parameters before using them in database operations.
</section>
<section id="deep-sanitize">
Deep Sanitization
For complex nested objects, the deepSanitize function recursively processes the entire object tree:
typescriptfunction deepSanitize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(deepSanitize);
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = k === '_id'
        ? (typeof v === 'string' ? v : (v as object)?.toString?.() ?? v)
        : deepSanitize(v);
    }
    return out;
  }
  return value;
}
This function handles:

Arrays of objects
Deeply nested objects
ObjectIds at any level of nesting
Mixed data types

[RULE] Use deep sanitization for complex data structures with unpredictable nesting.
</section>
<section id="safe-parsing">
Safe Parsing
In addition to sanitization, our system includes safe parsing utilities that combine validation and error handling:
typescriptimport { 
  safeParseAndLog,
  parseOrThrow,
  parsePartialOrThrow
} from "@/lib/utils/server/safeParse";

// Parse data without throwing (returns null on error)
const result = safeParseAndLog(MyZodSchema, data);

// Parse data and throw a formatted error if validation fails
const result = parseOrThrow(MyZodSchema, data);

// Parse partial data (for updates) and throw if validation fails
const result = parsePartialOrThrow(MyZodSchema, partialData);
[RULE] Use the appropriate parsing function based on the error handling requirements of your context.
</section>
</doc>

---

<a id="schema-system"></a>

## schema system

<doc id="data-flow">

# Data Flow & Schema System

<section id="data-overview">

## Overview

Our platform uses a schema-driven architecture where Zod schemas serve as the definitive source of truth for all data structures. This approach ensures consistency across the frontend, backend, and database layers.

[RULE] Always use Zod schemas as the canonical source of truth for data structures.

</section>

<section id="data-schemas">

## Zod Schema Architecture

Schemas are organized in `src/lib/zod-schema/` by domain:

- `core/`: Base schemas for common entities (School, Staff, Cycle)
- `shared/`: Reusable schema parts (notes, enums, date helpers)
- Domain-specific directories: `visits/`, `look-fors/`, etc.

```typescript
// Example: School schema
export const SchoolZodSchema = z.object({
  _id: z.string(),
  schoolNumber: z.string(),
  district: z.string(),
  schoolName: z.string(),
  address: z.string().optional(),
  gradeLevelsSupported: z.array(GradeLevelsSupportedZod),
  staffList: z.array(z.string()),
  owners: z.array(z.string()),
  createdAt: zDateField.optional(),
  updatedAt: zDateField.optional(),
});
[RULE] When adding new fields, always start by updating the Zod schema first.
</section>
<section id="data-form-config">
Field Configuration System
Field configurations in src/lib/ui-schema/fieldConfig/ define how form fields should be rendered and validated:
typescriptexport const SchoolFieldConfig: Field<SchoolInput>[] = [
  {
    name: 'schoolNumber',
    label: 'School Number',
    type: 'text',
    required: true,
  },
  {
    name: 'district',
    label: 'District',
    type: 'text',
    required: true,
  },
  // Additional fields...
];
[RULE] Field configs should reference schema properties rather than redefining them.
</section>
<section id="data-form-overrides">
Form Overrides
Form overrides (src/lib/ui-schema/formOverrides/) allow customization of form behavior for specific contexts:
typescriptexport const SchoolOverrides: FieldOverrideMap<SchoolInput> = {
  district: {
    type: 'reference',
    label: 'District',
    url: '/api/districts',
    multiple: false,
  },
  // Additional overrides...
};
[RULE] Use form overrides to customize field behavior without modifying the base schema.
</section>
<section id="data-hooks">
Data Fetching Hooks
Custom hooks for data fetching provide a consistent interface across the application:
typescriptfunction useSchools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Implementation...
  
  return {
    schools,
    error,
    isLoading,
    createSchool,
    updateSchool,
    deleteSchool,
  };
}
[RULE] Always return error and loading states from data hooks.
</section>
<section id="data-reference-hook">
Reference Data Hook
The useReferenceOptions hook handles fetching options for select components:
typescriptfunction useReferenceOptions(url: string, searchQuery: string = "") {
  // Using SWR with proper error handling
  const { data, error, isLoading } = useSWR(
    searchQuery ? `${url}?search=${searchQuery}` : url,
    fetcher
  );
  
  // Safely transform data to options format using memoization
  const options = useMemo(() => {
    if (!data?.items) return [];
    
    return data.items.map(item => ({
      value: item._id,
      label: item.name || item.title || item.label || item.staffName || item.schoolName || String(item._id)
    }));
  }, [data]);
  
  return { options, error, isLoading };
}
[RULE] Use useReferenceOptions for all dropdown and multi-select inputs that fetch data.
[RULE] All API endpoints that serve reference data must return a standardized format with { items: [], total, success }.
</section>
<section id="data-server-actions">
Server Actions
Server actions provide a way to perform server-side operations directly from client components:
typescriptexport async function createSchool(data: SchoolInput) {
  try {
    // Validate against schema
    const validated = SchoolInputZodSchema.parse(data);
    
    // Create in database
    const school = await SchoolModel.create(validated);
    
    // Return success response
    return { success: true, data: school };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error);
    }
    return handleServerError(error, "Failed to create school");
  }
}
[RULE] Always validate data with Zod schemas before database operations.
</section>
<section id="data-model-integration">
MongoDB Model Integration
MongoDB models are defined using the Zod schemas:
typescriptimport { SchoolZodSchema } from "@/lib/zod-schema/core/school";
import mongoose from "mongoose";

const schemaFields = {
  schoolNumber: { type: String, required: true },
  district: { type: String, required: true },
  schoolName: { type: String, required: true },
  // Additional fields...
};

const SchoolSchema = new mongoose.Schema(schemaFields, { timestamps: true });

export const SchoolModel = mongoose.models.School || 
  mongoose.model("School", SchoolSchema);
[RULE] MongoDB models should reflect the structure defined in Zod schemas.
</section>
</doc>

---

<a id="server-actions"></a>

## server actions

<doc id="server-actions">

# Server Actions

<section id="server-actions-overview">

## Overview

Our application uses Next.js Server Actions for server-side operations that need to be triggered from client components. Server Actions provide a type-safe, direct way to invoke server-side code without creating separate API endpoints.

[RULE] Use Server Actions for form submissions and operations closely tied to specific UI components.

</section>

<section id="server-actions-structure">

## Server Action Structure

Server Actions follow a consistent pattern:

```typescript
// src/app/actions/schools/schools.ts
'use server'

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { SchoolInputZodSchema } from "@/lib/data/schemas/core/school";
import { SchoolModel } from "@/models/core/school.model";
import { handleValidationError } from "@/lib/core/error/handleValidationError";
import { handleServerError } from "@/lib/core/error/handleServerError";

export async function createSchool(data: unknown) {
  try {
    // Validate input against schema
    const validated = SchoolInputZodSchema.parse(data);
    
    // Perform database operation
    const school = await SchoolModel.create(validated);
    
    // Revalidate relevant paths
    revalidatePath('/dashboard/schoolList');
    
    // Return success response
    return { success: true, data: school };
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return { success: false, error: handleValidationError(error) };
    }
    
    // Handle other errors
    return { success: false, error: handleServerError(error, "Failed to create school") };
  }
}
Key components:

'use server' directive at the top of the file
Input validation using Zod schemas
Database operations
Cache revalidation
Standardized error handling
Consistent response format

[RULE] Follow the standard pattern for all Server Actions.
</section>
<section id="server-actions-organization">
Organization
Server Actions are organized by domain in the src/app/actions/ directory:
src/app/actions/
├── cycles/                # Cycle-related actions
├── lookFors/              # Look For related actions
├── schedules/             # Schedule-related actions
├── schools/               # School-related actions
├── staff/                 # Staff-related actions
└── visits/                # Visit-related actions
Each domain directory contains action files with related functionality:
typescript// src/app/actions/schools/schools.ts
export async function createSchool(data: unknown) { /* ... */ }
export async function updateSchool(id: string, data: unknown) { /* ... */ }
export async function deleteSchool(id: string) { /* ... */ }
[RULE] Organize Server Actions by domain and group related actions together.
</section>
<section id="server-actions-usage">
Client-Side Usage
Server Actions can be used directly in client components:
tsx'use client'

import { createSchool } from "@/app/actions/schools/schools";

export function SchoolForm() {
  const handleSubmit = async (formData: FormData) => {
    const result = await createSchool(Object.fromEntries(formData));
    
    if (result.success) {
      // Handle success
    } else {
      // Handle error
    }
  };
  
  return (
    <form action={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
For more complex interactions, use the useErrorHandledMutation hook:
tsx'use client'

import { createSchool } from "@/app/actions/schools/schools";
import { useErrorHandledMutation } from "@/hooks/utils/useErrorHandledMutation";

export function SchoolForm() {
  const { mutate, isLoading, error } = useErrorHandledMutation(createSchool);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutate(Object.fromEntries(formData));
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
[RULE] Use the form action attribute for simple cases and useErrorHandledMutation for complex interactions.
</section>
<section id="server-actions-vs-api">
Server Actions vs. API Routes
When to use Server Actions:

Form submissions
Simple CRUD operations
Operations closely tied to specific UI components
When you need built-in progressive enhancement

When to use API Routes:

External API integrations
Complex operations requiring middleware
Custom request/response handling
Endpoints that need to be called from multiple places

[RULE] Choose the appropriate approach based on the operation's requirements.
</section>
<section id="server-actions-security">
Security Considerations
Server Actions automatically handle CSRF protection, but additional security measures should be implemented:

Input Validation: Always validate inputs using Zod schemas
Authentication: Verify user credentials and permissions
Rate Limiting: Implement rate limiting for public-facing actions
Error Handling: Don't expose sensitive information in error messages

typescriptexport async function updateSchool(id: string, data: unknown) {
  // Get the current user
  const session = await getSession();
  
  // Check permissions
  if (!session || !session.user.canEditSchool) {
    return { success: false, error: "Unauthorized" };
  }
  
  // Validate input
  const validated = SchoolInputZodSchema.parse(data);
  
  // Proceed with operation
  // ...
}
[RULE] Implement appropriate security measures for all Server Actions.
</section>
</doc>

---

<a id="workflows"></a>

# Workflows

<a id="common-tasks"></a>

## common tasks

<doc id="common-tasks">

# Common Development Tasks

<section id="tasks-overview">

## Overview

This guide provides step-by-step instructions for common development tasks in our project. Following these standardized approaches ensures consistency and maintainability across the codebase.

[RULE] Follow these established patterns for common development tasks.

</section>

<section id="adding-entity">

## Adding a New Entity

To add a new entity to the system (e.g., a new resource type):

1. **Create the Zod Schema**
   ```typescript
   // src/lib/data/schemas/domain/entity.ts
   import { z } from "zod";
   import { zDateField } from "../shared/dateHelpers";
   
   export const EntityInputZodSchema = z.object({
     name: z.string(),
     description: z.string(),
     // Additional fields...
   });
   
   export const EntityZodSchema = EntityInputZodSchema.extend({
     _id: z.string(),
     createdAt: zDateField.optional(),
     updatedAt: zDateField.optional(),
   });
   
   export type EntityInput = z.infer<typeof EntityInputZodSchema>;
   export type Entity = z.infer<typeof EntityZodSchema>;

Create the MongoDB Model
typescript// src/models/domain/entity.model.ts
import mongoose from "mongoose";
import { EntityZodSchema } from "@/lib/data/schemas/domain/entity";

const schemaFields = {
  name: { type: String, required: true },
  description: { type: String, required: true },
  // Additional fields...
};

const EntitySchema = new mongoose.Schema(schemaFields, { timestamps: true });

export const EntityModel = mongoose.models.Entity || 
  mongoose.model("Entity", EntitySchema);

Create Field Configuration
typescript// src/lib/data/forms/config/domain/entity.ts
import { Field } from "@/lib/data/forms/types";
import { EntityInput } from "@/lib/data/schemas/domain/entity";

export const EntityFieldConfig: Field<EntityInput>[] = [
  {
    name: "name",
    label: "Name",
    type: "text",
    required: true,
  },
  {
    name: "description",
    label: "Description",
    type: "text",
    required: true,
  },
  // Additional fields...
];

Create API Routes or Server Actions
typescript// src/app/actions/domain/entity.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { EntityInputZodSchema } from "@/lib/data/schemas/domain/entity";
import { EntityModel } from "@/models/domain/entity.model";
import { handleValidationError } from "@/lib/core/error/handleValidationError";
import { handleServerError } from "@/lib/core/error/handleServerError";

export async function createEntity(data: unknown) {
  try {
    const validated = EntityInputZodSchema.parse(data);
    const entity = await EntityModel.create(validated);
    revalidatePath("/dashboard/entityList");
    return { success: true, data: entity };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: handleValidationError(error) };
    }
    return { success: false, error: handleServerError(error) };
  }
}

// Additional CRUD functions...

Implement UI Components
typescript// src/components/domain/entity/EntityCard.tsx
import { Card } from "@/components/composed/cards";
import { Entity } from "@/lib/data/schemas/domain/entity";

interface EntityCardProps {
  entity: Entity;
}

export function EntityCard({ entity }: EntityCardProps) {
  return (
    <Card>
      <Card.Header>{entity.name}</Card.Header>
      <Card.Body>{entity.description}</Card.Body>
    </Card>
  );
}


[RULE] Always follow this sequence when adding a new entity.
</section>
<section id="adding-field">
Adding a Field to an Existing Entity
To add a new field to an existing entity:

Update the Zod Schema
typescript// Update schema with new field
export const EntityInputZodSchema = z.object({
  name: z.string(),
  description: z.string(),
  newField: z.string().optional(), // Add new field
});

Update the MongoDB Model
typescriptconst schemaFields = {
  name: { type: String, required: true },
  description: { type: String, required: true },
  newField: { type: String, required: false }, // Add new field
};

Update Field Configuration
typescriptexport const EntityFieldConfig: Field<EntityInput>[] = [
  // Existing fields...
  {
    name: "newField",
    label: "New Field",
    type: "text",
    required: false,
  },
];

Update Components (if necessary)
typescriptexport function EntityCard({ entity }: EntityCardProps) {
  return (
    <Card>
      <Card.Header>{entity.name}</Card.Header>
      <Card.Body>
        {entity.description}
        {entity.newField && (
          <div className="mt-2">{entity.newField}</div>
        )}
      </Card.Body>
    </Card>
  );
}


[RULE] When adding fields, always update the schema first, then flow through to models, configurations, and UI.
</section>
<section id="creating-component">
Creating a New Component
To create a new UI component:

Determine Component Type

Core: Primitive UI elements
Composed: Combinations of core components
Domain: Business domain specific components
Feature: Complete feature implementations


Create Component File
typescript// src/components/[type]/ComponentName.tsx
import { useState } from "react";
import { tv } from "tailwind-variants";
import { colors, spacing } from "@/lib/ui/tokens";

interface ComponentNameProps {
  // Props definition
}

const componentName = tv({
  base: "base-styles-here",
  variants: {
    color: colors,
    padding: spacing,
  },
  defaultVariants: {
    color: "primary",
    padding: "md",
  }
});

export function ComponentName({ 
  color,
  padding,
  ...props 
}: ComponentNameProps) {
  // Component implementation
  return (
    <div className={componentName({ color, padding })}>
      {/* Component content */}
    </div>
  );
}

Create Index Export
typescript// src/components/[type]/index.ts
export * from './ComponentName';

Add Component Tests (if applicable)
typescript// tests/components/[type]/ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import { ComponentName } from '@/components/[type]/ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    // Assertions
  });
});


[RULE] Follow the component hierarchy and use variants for styling.
</section>
<section id="data-fetching">
Implementing Data Fetching
To create a new data fetching hook:

Create the Hook File
typescript// src/hooks/useEntityData.ts
import { useState } from "react";
import { Entity } from "@/lib/data/schemas/domain/entity";
import { useSafeSWR } from "@/hooks/utils/useSafeSWR";
import { handleClientError } from "@/lib/core/error/handleClientError";

export function useEntityData() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [mutationError, setMutationError] = useState<Error | null>(null);
  
  // Fetch data
  const { data, error, isLoading, mutate } = useSafeSWR<Entity[]>('/api/entities');
  
  // Create function
  async function createEntity(entityData: Omit<Entity, "_id">) {
    try {
      const response = await fetch('/api/entities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entityData),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Update cache
      mutate();
      
      return result.data;
    } catch (err) {
      const errorMessage = handleClientError(err);
      setMutationError(new Error(errorMessage));
      throw err;
    }
  }
  
  // Additional CRUD functions...
  
  return {
    entities: data?.items || [],
    error: error || mutationError,
    isLoading,
    createEntity,
    // Other functions...
  };
}

Export from Index
typescript// src/hooks/index.ts
export * from './useEntityData';

Use in Components
typescript// src/components/features/EntityList.tsx
import { useEntityData } from "@/hooks";

export function EntityList() {
  const { entities, error, isLoading, createEntity } = useEntityData();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {entities.map(entity => (
        <EntityCard key={entity._id} entity={entity} />
      ))}
    </div>
  );
}


[RULE] All data fetching hooks should handle loading and error states consistently.
</section>
</doc>

---

<a id="cursor-integration"></a>

## cursor integration

<doc id="cursor-integration">

# Cursor Integration Guide

<section id="cursor-overview">

## Overview

Our project leverages Cursor, an AI-native code editor, to accelerate development through AI assistance. This guide outlines best practices for using Cursor effectively with our project structure and documentation.

[RULE] Use Cursor to accelerate development while maintaining code quality standards.

</section>

<section id="cursor-setup">

## Setting Up Cursor

When setting up Cursor for this project:

1. Ensure you have the latest version of Cursor installed
2. Enable the `.cursor` directory in your project root
3. Configure Cursor to use our documentation system:
   - Add pointers to our documentation in `.cursor/rules`
   - Set appropriate model settings for our project

```bash
# Example rule file: .cursor/rules/component-system-pointer.md
# Component System Reference
See: /docs/components/component-system.md

Key section IDs:
- component-overview
- component-organization
- component-tokens
- component-variants
- component-fields
- component-form
- component-error-display
```

[RULE] Make sure Cursor can access our documentation system for better assistance.

</section>

<section id="cursor-prompting">

## Effective Prompting

Cursor works best with specific, well-structured prompts. Follow these guidelines:

### Structure Your Prompts

```markdown
[Task Description]
Create a new component that [purpose].

[Reference Documentation]
- [component-system][component-variants] Component Variants
- [data-flow][data-hooks] Data Fetching Hooks

[Implementation Requirements]
1. Follow the [specific pattern]
2. Implement [specific feature]
3. Handle [specific edge cases]
```

### Include Examples

```markdown
[Example Usage]
The component should be used like this:

<MyComponent
  prop1="value"
  prop2={data}
  onEvent={handler}
/>
```

[RULE] Structure prompts with clear tasks, references, and requirements.

</section>

<section id="cursor-focus">

## Maintaining Focus

To prevent Cursor from going on tangents and keep it focused on the primary task:

### Define Clear Boundaries

```markdown
## SCOPE
- IN SCOPE: [list of specific tasks that should be done]
- OUT OF SCOPE: [list of distractions to avoid]
```

### Provide Explicit Exit Conditions

```markdown
## EXIT CRITERIA
- Stop when [specific condition is met]
- Move to next step after [specific milestone]
- Ignore [specific distractions] if encountered
```

### Use Priority Markers

```markdown
## PRIORITY TASKS (Execute in this order)
1. [HIGH] Essential task that must be completed first
2. [MEDIUM] Important but secondary task
3. [LOW] Optional enhancement if time permits
```

### Step-by-Step Structure

```markdown
## STEP-BY-STEP IMPLEMENTATION
### STEP 1: [First Task]
- Specific action to take
- CHECK: Verification step
- EXIT: When to move to the next step

### STEP 2: [Second Task]
...
```

[RULE] Include explicit focus mechanisms in complex prompts to prevent tangents.

</section>

<section id="cursor-reference">

## Documentation References

When referencing our documentation in prompts, use the standardized format:

```
[document-id][section-id] Section Title
```

For example:

- `[component-system][component-variants]` - References the variants section of the component system
- `[error-handling][error-hooks]` - References the hooks section of error handling
- `[data-flow][data-schemas]` - References the schemas section of data flow

This allows Cursor to quickly find and apply the relevant guidance.

[RULE] Use consistent documentation references in all Cursor prompts.

</section>

<section id="cursor-workflow">

## Cursor Workflow

The optimal workflow with Cursor follows these steps:

1. **Plan**: Define what you want to build
2. **Prompt**: Create a specific prompt referencing documentation
3. **Review**: Carefully review the generated code
4. **Refine**: Iteratively improve the code with follow-up prompts
5. **Test**: Verify the code works as expected
6. **Integrate**: Merge the code into the broader codebase

For complex features, break them down into smaller parts and prompt for each:

```markdown
# First prompt
Implement the data model for the feature...

# Second prompt
Now create the UI components using the model...

# Third prompt
Connect the components with the data hooks...
```

[RULE] Use an iterative, step-by-step approach with Cursor for complex features.

</section>

<section id="cursor-limitations">

## Working with Limitations

Cursor works best when you:

- **Limit Scope**: Focus on discrete, well-defined tasks
- **Provide Context**: Include relevant project context
- **Handle Edge Cases**: Explicitly prompt for error handling
- **Review Critically**: Always review generated code for quality

When Cursor struggles:

- Break the problem down further
- Provide more specific examples
- Reference more specific documentation sections
- Take an iterative approach

[RULE] Understand Cursor's limitations and adjust your workflow accordingly.

</section>

<section id="cursor-refocus">

## Redirecting When Off Track

If Cursor begins to go off track:

1. **Interrupt**: Don't let Cursor continue down an unproductive path
2. **Refocus**: Explicitly state that you want to refocus on the primary task
3. **Reframe**: Provide a clearer, more focused prompt

Example refocusing prompt:

```markdown
Let's refocus on the original task: [restate the primary objective].

Please stop the current exploration of [tangent topic] and instead:
1. Complete [specific next step]
2. Focus specifically on [core requirement]
3. Ignore [distracting elements] for now
```

[RULE] Actively redirect Cursor when it goes on tangents rather than letting it continue.

</section>

<section id="cursor-examples">

## Example Prompts

### Good Example: Focused Prompt

```markdown
# TypeScript Error Fixing Plan

## SCOPE
- IN SCOPE: Fix import paths, create missing utility files, fix card component props
- OUT OF SCOPE: Investigating data structures, adding new features, refactoring logic

## PRIORITY TASKS
1. [HIGH] Run path fixing scripts to update imports
2. [HIGH] Create missing utility files and directories
3. [MEDIUM] Fix card component prop type issues
4. [LOW] Add type annotations to improve type safety

## STEP-BY-STEP IMPLEMENTATION
### STEP 1: Run Path Fixing Scripts
- Execute the following scripts in sequence:
  - fix-server-paths.sh
  - fix-type-paths.sh
  - fix-misc-paths.sh
- CHECK: After each script, verify error reduction
- EXIT: Move to next step after all scripts complete

### STEP 2: Create Missing Files
- Create required utility files:
  - src/lib/utils/general/cn.ts
  - src/lib/data/hooks/useItemToGroupMap.ts
- EXIT: Move to next step once files are created

### STEP 3: Fix Component Props
- Update Card component props to fix type errors
- EXIT: When Card component can be used without type errors
```

### Poor Example: Unfocused Prompt

```markdown
Fix all the TypeScript errors in the project. Also, can you improve the performance and add some new features while you're at it? Maybe look at how we handle data loading and suggest improvements. Also, check for any security issues.
```

[RULE] Learn from these examples to craft focused, effective prompts.

</section>
</doc>

---

<a id="dev-utilities"></a>

## dev utilities

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
javascript// In .eslintrc.js
module.exports = {
  rules: {
    '@local/no-hardcoded-tailwind-classes': 'warn'
  }
}
This rule detects hardcoded Tailwind classes that should use design tokens:
jsx// ❌ Bad
<div className="text-blue-500 p-4 rounded-md">Content</div>

// ✅ Good
<div className={cn(colors.primary, spacing.md, shape.rounded)}>Content</div>
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
typescriptimport { mockSchools, mockNYCPSStaff, mockTLStaff } from "@/lib/utils/dev/mockData";

// Use mock data in development
const schools = process.env.NODE_ENV === 'development' 
  ? mockSchools 
  : await fetchSchools();
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
typescript// Detect render loops
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
[RULE] Use debugging hooks to identify and fix performance issues and bugs.
</section>
<section id="performance-monitoring">
Performance Monitoring
Our application includes a performance monitoring system for optimizing user experience:
typescriptimport { usePerformanceMonitoring } from "@/lib/core/performance/usePerformanceMonitoring";

function MyComponent() {
  usePerformanceMonitoring("MyComponent");
  // Component implementation
}
The monitoring system:

Tracks component render times
Identifies slow operations
Logs performance metrics in development
Can be integrated with Sentry or other monitoring tools

[RULE] Use performance monitoring for critical user-facing components.
</section>
</doc>

---

<a id="development-workflow"></a>

## development workflow

<doc id="dev-workflow">

# Development Workflow

<section id="workflow-overview">

## Overview

Our development workflow uses a combination of tools and practices to ensure consistent, high-quality code. We use Claude for planning and reasoning, and Cursor (an AI-native code editor) for implementation.

[RULE] Follow established patterns and workflows for all development tasks.

</section>

<section id="workflow-cursor">

## Working with Cursor

Cursor is our primary code editor for implementation. When creating prompts for Cursor:

- Use detailed, specific instructions
- Reference documentation sections explicitly
- Include code snippets and examples

Example prompt:
Implement a new hook for fetching teacher schedules, following our error handling standards.
Reference documentation:

[error-handling][error-hooks] Custom Hook Error Requirements
[data-flow][data-reference-hook] Reference Data Hook

Create a new file at src/hooks/useTeacherSchedule.ts that:

Uses useSafeSWR for data fetching
Includes proper error handling with handleClientError
Returns the standard { data, error, isLoading } structure
Includes appropriate TypeScript types


[RULE] Always reference specific documentation sections in Cursor prompts.

</section>

<section id="workflow-tasks">

## Common Development Tasks

### Adding a New Field

1. Update the Zod schema first
2. Add the field to the field configuration
3. Add any necessary overrides
4. Update the MongoDB model if needed

### Creating a New Component

1. Start with core/primitive components
2. Compose them into more complex components
3. Use tokens and variants for styling
4. Include proper error handling

### Implementing a New Feature

1. Define the data schema
2. Create the form configuration
3. Implement the server actions
4. Build the UI components
5. Connect everything together

[RULE] Follow the established sequence for development tasks.

</section>

<section id="workflow-principles">

## Development Principles

When developing new features or components, prioritize:

- **Clarity**: Code should be easy to understand
- **Maintainability**: Future developers should be able to work with your code
- **Scalability**: Solutions should work at scale
- **Consistency**: Follow established patterns

[RULE] Prioritize clarity, maintainability, scalability, and consistency.

</section>

</doc>

---

<a id="examples"></a>

# Examples

<a id="component-examples"></a>

## component examples



---

<a id="prompt-examples"></a>

## prompt examples



---

<a id="schema-examples"></a>

## schema examples



---

