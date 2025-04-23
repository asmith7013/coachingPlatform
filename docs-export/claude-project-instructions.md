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
  - [design token system](#design-token-system)
  - [domain components](#domain-components)
  - [styling patterns](#styling-patterns)
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
  - [implementation workflow](#implementation-workflow)
- [Examples](#examples)
  - [component examples](#component-examples)
  - [prompt examples](#prompt-examples)
  - [schema examples](#schema-examples)


<a id="architecture-overview"></a>

# Architecture Overview

# Architecture Overview & Documentation Guide

## Purpose of This Document

This document provides a comprehensive overview of the AI Coaching Platform architecture. It's designed to help both developers and AI tools understand the system architecture, documentation organization, and implementation patterns.

## Core Architecture

Our application follows these key architectural principles:

1. **Schema-Driven Design**: Zod schemas serve as the canonical source of truth for all data structures
2. **Atomic Component Hierarchy**: Components follow core → composed → domain → features pattern
3. **Token-First Design System**: All styling uses design tokens for consistency (built on Tailwind CSS v4)
4. **Standardized Patterns**: Common patterns for data fetching, forms, error handling, and API responses

## Design Token System

Our design system is built on tokens that act as a bridge between Tailwind classes and component styling:

### 1. Primitive Tokens
Located in `src/lib/ui/tokens/`, these define semantic values:

```typescript
// Example token usage
export const textColors = {
  primary: "text-blue-600 dark:text-blue-400",
  secondary: "text-gray-600 dark:text-gray-300",
  // More color tokens...
};
```

### 2. Component-Specific Variants
Using Tailwind Variants (tv()) to create type-safe component styling:

```typescript
// Example component variant
const button = tv({
  base: "inline-flex items-center justify-center",
  variants: {
    variant: {
      primary: `bg-blue-600 text-white hover:bg-blue-700`,
      secondary: `bg-gray-200 text-gray-800 hover:bg-gray-300`,
    },
    // More variants...
  }
});
```

### 3. Shared Behavior Variants
Reusable UI behavior patterns like disabled states, loading indicators, etc.

## Data Layer Architecture

### Schema, Model, UI Connection

Our system follows a specific flow from schema definition to UI:

1. **Zod Schema Definition**: The canonical source of truth
2. **MongoDB Model Creation**: Derived from the schema
3. **Field Configuration**: Defines UI representation
4. **Form Component Integration**: Auto-generates forms
5. **Server Action Implementation**: Handles data operations

## Main System Components

### 1. Data Layer
- **Zod Schemas**: Define all data structures (`src/lib/data-schema/zod-schema/`)
- **MongoDB Models**: Database models derived from schemas (`src/lib/data-schema/mongoose-schema/`)
- **API Routes**: Endpoints for data access (`src/app/api/`)
- **Server Actions**: Direct server operations (`src/app/actions/`)

### 2. UI Layer
- **Core Components**: Primitive UI elements (`src/components/core/`)
- **Composed Components**: Combinations of core components (`src/components/composed/`)
- **Domain Components**: Business-specific components (`src/components/domain/`)
- **Feature Components**: Complete features (`src/components/features/`)

### 3. Data Flow
- **Custom Hooks**: Data fetching and state management (`src/hooks/`)
- **Field Configurations**: Form field definitions (`src/lib/ui/forms/fieldConfig/`)
- **Form Overrides**: Context-specific form modifications (`src/lib/ui/forms/formOverrides/`)

### 4. Utilities
- **Error Handling**: Standardized error processing (`src/lib/core/error/`)
- **Sanitization**: Data cleaning and validation (`src/lib/data-utilities/transformers/`)
- **Development Tools**: Developer experience enhancements (`src/lib/dev/`)

## Documentation Structure

The documentation is organized into these sections:

### Architecture (`/docs/architecture/`)
- Core Principles, Design Patterns, Import Patterns, Project Structure

### Components (`/docs/components/`)
- Component System, Design Token System, Styling Patterns, Core Components, Domain Components

### Data Flow (`/docs/data-flow/`)
- API Patterns, Error Handling, MongoDB Integration, Schema System, Server Actions

### Workflows (`/docs/workflows/`)
- Common Tasks, Cursor Integration, Dev Utilities, Development Workflow

### Examples (`/docs/examples/`)
- Component Examples, Prompt Examples, Schema Examples

## Project Structure

```
src/
├── app/                # Next.js app router pages and API routes
├── components/         # React components (core, composed, domain, features)
├── hooks/              # Custom React hooks
├── lib/                # Core utilities and modules
│   ├── data-schema/    # Zod and Mongoose schemas
│   ├── ui/             # UI utilities and tokens
│   └── [other utils]   # Various utilities
├── providers/          # React context providers
└── styles/             # Global styles
```

## Design Philosophy

- **Structured, DRY, and scalable**: Avoids manual duplication
- **Mock data for development**: Full-featured development without a database
- **Schema-driven**: All data structures flow from Zod schemas
- **Token-first styling**: All UI components use design tokens

## Current Build Priorities

1. Daily Visit Page
2. Teacher & Admin Dashboards
3. Schedule Generator
4. Coaching Log Auto-fill + Monday.com Integration
5. Real-time Transcription + Insights (Phase 2)

## Using This Documentation

For AI tools like Cursor, this documentation is organized with section IDs:

```
[document-id][section-id] Section Title
```

Example: `[component-system][component-variants]` references the variants section of the component system documentation.

---

<a id="architecture"></a>

# Architecture

<a id="core-principles"></a>

## core principles

<doc id="core-principles">

# Core Architecture Principles

<section id="architecture-overview">

## Overview

Our AI Coaching Platform is built on a set of foundational architectural principles that guide all development decisions. These high-level principles establish the "why" behind our technical choices and ensure the application remains maintainable, scalable, and aligned with our goals.

[RULE] All development decisions should align with these core principles.

</section>

<section id="schema-driven-philosophy">

## Schema-Driven Philosophy

We adopt a schema-first approach where data definitions precede implementation. This philosophy:

- Establishes a **single source of truth** for all data structures
- Ensures **consistency** across frontend, backend, and database
- Drives **automated code generation** and validation
- Provides a **clear contract** between system components

See `data-flow/schema-system.md` for detailed implementation guidelines.

[RULE] Data structures should be defined abstractly before specific implementations.

</section>

<section id="atomic-composition">

## Atomic Composition

We build complex interfaces from simple, composable parts following progressive levels of complexity. This principle:

- Promotes **reusability** through composition over inheritance
- Establishes **clear boundaries** between layers of abstraction
- Enables **independent testing** of isolated components
- Creates a **shared vocabulary** for UI elements

See `components/component-system.md` for the component hierarchy implementation.

[RULE] Build complex systems from simple, composable parts with clear boundaries.

</section>

<section id="design-token-centralization">

## Design Token Centralization

We centralize design decisions in tokens rather than distributing them throughout the codebase. This principle:

- Creates a **unified design language** across the application
- Simplifies **theme customization** and brand adjustments
- Enforces **consistency** in the user experience
- Reduces **design drift** over time

See `components/styling-patterns.md` for token implementation details.

[RULE] Centralize design decisions in a single source of truth.

</section>

<section id="standardized-interfaces">

## Standardized Interfaces

We establish consistent patterns for communication between system components. This principle:

- Creates **predictable contracts** between modules
- Enables **interchangeable implementations**
- Simplifies **testing and debugging**
- Reduces **cognitive load** for developers

See `data-flow/api-patterns.md` for API standardization guidelines.

[RULE] Define clear, consistent interfaces between system components.

</section>

<section id="developer-efficiency">

## Developer Efficiency

We optimize for developer productivity and code maintainability. This principle:

- Reduces **repetitive tasks** through automation
- Improves **code comprehension** through consistent patterns
- Accelerates **onboarding** of new developers
- Enables **rapid iteration** on features

See `workflows/development-workflow.md` for developer experience best practices.

[RULE] Value developer efficiency as a foundation for product quality.

</section>

</doc>

---

<a id="design-patterns"></a>

## design patterns

<doc id="core-principles">

# Core Architecture Principles

<section id="architecture-overview">

## Overview

Our AI Coaching Platform is built on a set of foundational architectural principles that guide all development decisions. These high-level principles establish the "why" behind our technical choices and ensure the application remains maintainable, scalable, and aligned with our goals.

[RULE] All development decisions should align with these core principles.

</section>

<section id="schema-driven-philosophy">

## Schema-Driven Philosophy

We adopt a schema-first approach where data definitions precede implementation. This philosophy:

- Establishes a **single source of truth** for all data structures
- Ensures **consistency** across frontend, backend, and database
- Drives **automated code generation** and validation
- Provides a **clear contract** between system components

See `data-flow/schema-system.md` for detailed implementation guidelines.

[RULE] Data structures should be defined abstractly before specific implementations.

</section>

<section id="atomic-composition">

## Atomic Composition

We build complex interfaces from simple, composable parts following progressive levels of complexity. This principle:

- Promotes **reusability** through composition over inheritance
- Establishes **clear boundaries** between layers of abstraction
- Enables **independent testing** of isolated components
- Creates a **shared vocabulary** for UI elements

See `components/component-system.md` for the component hierarchy implementation.

[RULE] Build complex systems from simple, composable parts with clear boundaries.

</section>

<section id="design-token-centralization">

## Design Token Centralization

We centralize design decisions in tokens rather than distributing them throughout the codebase. This principle:

- Creates a **unified design language** across the application
- Simplifies **theme customization** and brand adjustments
- Enforces **consistency** in the user experience
- Reduces **design drift** over time

See `components/styling-patterns.md` for token implementation details.

[RULE] Centralize design decisions in a single source of truth.

</section>

<section id="standardized-interfaces">

## Standardized Interfaces

We establish consistent patterns for communication between system components. This principle:

- Creates **predictable contracts** between modules
- Enables **interchangeable implementations**
- Simplifies **testing and debugging**
- Reduces **cognitive load** for developers

See `data-flow/api-patterns.md` for API standardization guidelines.

[RULE] Define clear, consistent interfaces between system components.

</section>

<section id="developer-efficiency">

## Developer Efficiency

We optimize for developer productivity and code maintainability. This principle:

- Reduces **repetitive tasks** through automation
- Improves **code comprehension** through consistent patterns
- Accelerates **onboarding** of new developers
- Enables **rapid iteration** on features

See `workflows/development-workflow.md` for developer experience best practices.

[RULE] Value developer efficiency as a foundation for product quality.

</section>

</doc>
design-patterns.md (Revised)
markdown<doc id="design-patterns">

# Cross-Cutting Design Patterns

<section id="patterns-overview">

## Overview

This document describes cross-cutting patterns that apply across multiple domains in our application. It focuses on general approaches rather than specific implementation details, which are covered in domain-specific documentation.

[RULE] Apply these patterns consistently across different application domains.

</section>

<section id="boundary-patterns">

## Component Boundary Patterns

### Single Responsibility

Components should have a single responsibility and minimal dependencies:

```typescript
// Good: Single responsibility
function UserAvatar({ src, alt }) {
  return <img src={src} alt={alt} className="rounded-full" />;
}

// Bad: Mixed concerns
function UserCard({ user, onEdit, onDelete }) {
  // Combines display, editing, and data fetching
}
Prop Forwarding
Use destructuring and prop forwarding for component flexibility:
typescriptfunction Button({ variant, size, className, ...props }) {
  return (
    <button 
      className={getButtonClasses(variant, size, className)}
      {...props} 
    />
  );
}
See components/component-system.md for detailed component implementation guidelines.
[RULE] Establish clear boundaries between components with minimal coupling.
</section>
<section id="composition-patterns">
Component Composition Patterns
Feature Component Structure
Feature components should compose domain components rather than implementing business logic directly:
typescriptfunction CoachingDashboard() {
  return (
    <DashboardLayout>
      <SchoolSummaryCard />
      <CoachingMetricsDisplay />
      <UpcomingVisitsList />
    </DashboardLayout>
  );
}
Content vs. Container Separation
Separate data-fetching containers from presentational components:
typescript// Container with data concerns
function SchoolListContainer() {
  const { schools, loading, error } = useSchools();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  
  return <SchoolList schools={schools} />;
}

// Presentation with no data concerns
function SchoolList({ schools }) {
  return (
    <div>
      {schools.map(school => (
        <SchoolCard key={school.id} school={school} />
      ))}
    </div>
  );
}
See components/composed-components.md for detailed composition patterns.
[RULE] Compose feature components from domain-specific building blocks.
</section>
<section id="data-flow-patterns">
Data Flow Patterns
Unidirectional Data Flow
Data should flow down through props, with changes flowing up through callbacks:
typescriptfunction ParentComponent() {
  const [value, setValue] = useState('');
  
  return (
    <ChildComponent 
      value={value}
      onChange={(newValue) => setValue(newValue)}
    />
  );
}
Prop Drilling Avoidance
Use composition to avoid excessive prop drilling:
typescript// Instead of drilling props through multiple levels
function Toolbar({ onSave, onDelete, onPublish }) {
  return (
    <div>
      <SaveButton onClick={onSave} />
      <DeleteButton onClick={onDelete} />
      <PublishButton onClick={onPublish} />
    </div>
  );
}

// Compose the buttons directly in the parent
function Editor() {
  const { save, delete, publish } = useActions();
  
  return (
    <Toolbar>
      <SaveButton onClick={save} />
      <DeleteButton onClick={delete} />
      <PublishButton onClick={publish} />
    </Toolbar>
  );
}
See data-flow/schema-system.md for detailed data flow guidelines.
[RULE] Maintain clear, unidirectional data flow throughout the application.
</section>
<section id="state-management-patterns">
State Management Patterns
Local vs. Global State
Keep state as local as possible, lifting it only when necessary:
typescript// Local state for component-specific concerns
function Accordion() {
  const [isOpen, setIsOpen] = useState(false);
  // ...
}

// Lifted state for shared concerns
function Form() {
  const [values, setValues] = useState({});
  
  return (
    <>
      <FormInput 
        value={values.name}
        onChange={(name) => setValues({...values, name})}
      />
      <FormInput 
        value={values.email}
        onChange={(email) => setValues({...values, email})}
      />
    </>
  );
}
State Derivation
Derive state from props when possible instead of duplicating:
typescript// Deriving state from props
function FilteredList({ items, filter }) {
  // Derive filtered items instead of storing in state
  const filteredItems = useMemo(() => {
    return items.filter(item => item.matches(filter));
  }, [items, filter]);
  
  return <List items={filteredItems} />;
}
See data-flow/schema-system.md for state management guidelines.
[RULE] Keep state as local as possible and derive computed values.
</section>
<section id="optimization-patterns">
Optimization Patterns
Memoization Boundaries
Use memoization strategically at component boundaries:
typescript// Memoize expensive component
const ExpensiveList = memo(function ExpensiveList({ items }) {
  return (
    <div>
      {items.map(item => (
        <ExpensiveItem key={item.id} item={item} />
      ))}
    </div>
  );
});

// Memoize callback to prevent unnecessary rerenders
function Parent() {
  const handleClick = useCallback(() => {
    // Handler implementation
  }, [/* dependencies */]);
  
  return <Child onClick={handleClick} />;
}
Code-Splitting
Split code at feature boundaries for optimized loading:
typescript// Lazy-load feature components
const Settings = lazy(() => import('./pages/Settings'));
const Analytics = lazy(() => import('./pages/Analytics'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/settings" element={<Settings />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Suspense>
  );
}
See workflows/performance-optimization.md for detailed optimization strategies.
[RULE] Apply optimization techniques thoughtfully at appropriate boundaries.
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
        // Base path
        "@/*": ["./src/*"],

        // Core component and hook paths
        "@components/*": ["./src/components/*"],
        "@hooks/*": ["./src/hooks/*"],

        // Server-side and data paths
        "@actions/*": ["./src/app/actions/*"],
        "@models/*": ["./src/lib/data-schema/mongoose-schema/*"],
        "@zod-schema/*": ["./src/lib/data-schema/zod-schema/*"],
        "@data-schema/*": ["./src/lib/data-schema/*"],
        "@data-server/*": ["./src/lib/data-server/*"],
        "@data-utilities/*": ["./src/lib/data-utilities/*"],

        // Library and utility paths
        "@lib/*": ["./src/lib/*"],
        "@utils/*": ["./src/lib/utils/*"],
        "@styles/*": ["./src/styles/*"],
        "@core/*": ["./src/lib/core/*"],
        "@api/*": ["./src/lib/api/*"],
        "@types/*": ["./src/lib/types/*"],

        // UI-specific paths
        "@ui/*": ["./src/lib/ui/*"],
        "@ui-tokens/*": ["./src/lib/ui/tokens/*"],
        "@ui-variants/*": ["./src/lib/ui/variants/*"],
        "@ui-forms/*": ["./src/lib/ui/forms/*"],
        
        // Domain-specific paths
        "@domain/*": ["./src/lib/domain/*"],
        
        // Testing utilities
        "@testing/*": ["./src/lib/testing/*"],
        "@mocks/*": ["./src/lib/dev/mocks/*"]
    },
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
├── api/                # API utilities and helpers
│   ├── handlers/       # API route handlers
│   ├── responses/      # Response formatting utilities
│   └── validation/     # API input validation
├── core/               # Essential core functionality
│   ├── error/          # Error handling utilities
│   ├── types/          # Core type definitions
│   └── utils/          # Core utility functions
├── data-schema/        # Data schema definitions
│   ├── mongoose-schema/ # MongoDB models
│   └── zod-schema/     # Zod schema definitions
├── data-server/        # Server-side data operations
│   ├── crud/           # CRUD operation utilities
│   ├── db/             # Database connection
│   └── file-handling/  # File upload and processing
├── data-utilities/     # Data processing utilities
│   ├── pagination/     # Pagination utilities
│   └── transformers/   # Data transformation helpers
├── dev/                # Development utilities
│   ├── debugging/      # Debug tools and monitors
│   ├── mocks/          # Mock data for development
│   └── testing/        # Testing utilities
├── domain/             # Domain-specific functionality
├── hooks/              # Custom React hooks
├── json/               # Static JSON data files
├── types/              # Global type definitions
└── ui/                 # UI utilities
├── constants/      # UI-related constants
├── forms/          # Form configuration and helpers
│   ├── fieldConfig/  # Field configurations by domain
│   └── formOverrides/ # Field overrides by context
├── tokens/         # Design system tokens
└── variants/       # Component variants


This structure:
- Separates concerns clearly between data, UI, and core functionality
- Organizes schemas and models together in data-schema
- Keeps server operations in data-server
- Centralizes UI-related code in the ui directory
- Provides dedicated spaces for development and testing utilities

[RULE] Place utilities in the appropriate subdirectory within lib based on their purpose and domain.

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

Our component system follows an atomic design pattern, starting with primitive core components and building up to complex feature implementations. All components use design tokens for styling consistency, with Tailwind Variants (`tv()`) for component-specific variants.

[RULE] Follow the atomic design pattern: core → composed → domain → features.

</section>

<section id="component-organization">

## Component Organization

Components are organized by their level of complexity:
components/
├── core/               # Primitive UI elements
│   ├── feedback/       # Feedback indicators (Badge, etc.)
│   ├── fields/         # Form input components
│   ├── layout/         # Layout primitives
│   └── typography/     # Text elements (Heading, Text)
├── composed/           # Combinations of core components
│   ├── cards/          # Card components
│   ├── dialogs/        # Dialog components
│   ├── forms/          # Form components
│   ├── tables/         # Table components
│   └── tabs/           # Tab components
├── domain/             # Business domain specific components
│   ├── imRoutine/      # Implementation routine components
│   ├── lookFors/       # Look-for components
│   ├── rubrics/        # Rubric components
│   ├── schools/        # School components
│   ├── staff/          # Staff components
│   └── visits/         # Visit components
├── features/           # Complete feature implementations
├── layouts/            # Page layout components
├── shared/             # Cross-cutting components
└── utility/            # Helper components

Each component type serves a specific purpose:

1. **Core Components**: Building blocks with minimal dependencies
2. **Composed Components**: Combinations of core components for common patterns
3. **Domain Components**: Business-specific implementations
4. **Feature Components**: Complete features combining multiple domain components

[RULE] Place new components in the appropriate directory based on their complexity and purpose.

</section>

<section id="styling-approach">

## Styling Approach

Our project uses a clear approach to styling that separates concerns:

### Design Tokens

Tokens are primitive style values defined in `@/lib/ui/tokens/*`:

```typescript
// Example token usage in components
import { textColors, radii } from '@/lib/ui/tokens';

function Alert() {
  return (
    <div className={cn(
      "p-4 border",
      textColors.danger,
      radii.md
    )}>
      {children}
    </div>
  );
}
Component-Specific Variants
For component-level styling variations, use Tailwind Variants:
typescriptconst button = tv({
  base: "inline-flex items-center justify-center",
  variants: {
    variant: {
      primary: textColors.primary,
      secondary: textColors.secondary,
    },
    size: {
      sm: "text-sm p-2",
      md: "text-base p-4",
    }
  },
  defaultVariants: {
    variant: "primary",
    size: "md"
  }
});
Shared Behavior Variants
For common UI behaviors that appear across many components, use shared variants:
typescriptimport { disabledVariant, loadingVariant } from '@/lib/ui/variants';

const myComponent = tv({
  // ...
  variants: {
    // Use shared behavior variants
    disabled: disabledVariant.variants.disabled,
    loading: loadingVariant.variants.loading,
    
    // Component-specific variants
    // ...
  }
});
[RULE] Use tokens directly in atomic components, component-specific variants for styling variations, and shared variants for common behaviors.
</section>
<section id="component-tokens">
Design System Tokens
Our design system provides tokens for:

Typography: Text sizes, weights, and colors
Spacing: Padding, margins, and gaps
Colors: Semantic color mapping
Shapes: Border radius and shadows
Layout: Grid and flex utilities

typescript// Token imports
import { 
  textSize, 
  textColors, 
  weight,
  paddingX,
  paddingY,
  radii
} from '@/lib/ui/tokens';
[RULE] Always import tokens directly from their respective files, not through intermediate helpers.
</section>
<section id="atomic-vs-shared">
Atomic Components vs Shared Variants
Our system uses a hybrid approach:
Atomic Components

Self-contained with explicit styling
Use tokens directly for predictable rendering
Define component-specific variants
Handle internal state and interactions

typescript// Example atomic component
function Button({ variant, size, disabled, ...props }) {
  return (
    <button 
      className={buttonStyles({ variant, size, disabled })}
      disabled={disabled}
      {...props}
    />
  );
}

// Component-specific variants
const buttonStyles = tv({
  base: "inline-flex...",
  variants: {
    variant: { /* ... */ },
    size: { /* ... */ },
    disabled: disabledVariant.variants.disabled
  }
});
Shared Variants

Used for one-off styling needs
Provide common UI behaviors (disabled, loading, error states)
Used directly in JSX for quick styling

tsx// Example one-off styling
import { flexVariant, disabledVariant } from '@/lib/ui/variants';

<div className={cn(
  flexVariant({ direction: 'col', align: 'center' }),
  isDisabled && 'opacity-50 pointer-events-none'
)}>
  Content
</div>
[RULE] Use atomic components for reused UI elements and shared variants for one-off styling and common behaviors.
</section>
<section id="component-form">
Form Components
Form components use the schema-driven approach:
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
  <div className={cn(textColors.danger, "text-sm mt-1")}>
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

<a id="design-token-system"></a>

## design token system

<doc id="design-token-system">
Design Token System
<section id="token-overview">
Overview
Our design token system creates a clear separation between raw Tailwind CSS classes and semantic styling values. This approach ensures consistent visual design while maintaining flexibility for developers.
[RULE] Always use the token system rather than hardcoded Tailwind classes.
</section>
<section id="token-architecture">
Token Architecture
Primitive Tokens
Located in src/lib/ui/tokens/, these define the foundational design values:
typescript// src/lib/ui/tokens/colors.ts
export const textColors = {
  primary: "text-blue-600 dark:text-blue-400",
  secondary: "text-gray-600 dark:text-gray-300",
  danger: "text-red-600 dark:text-red-400",
  white: "text-white",
  dark: "text-gray-900 dark:text-white",
};

// src/lib/ui/tokens/spacing.ts
export const padding = {
  xs: "p-1",
  sm: "p-2",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
};

export const paddingX = {
  xs: "px-1",
  sm: "px-2",
  md: "px-4",
  lg: "px-6",
  xl: "px-8",
};
[RULE] Define all primitive design values as tokens in the appropriate token files.
</section>
<section id="component-variants">
Component-Specific Variants
These use Tailwind Variants (tv()) to create type-safe component styling:
typescript// Example: Button component variants
import { tv } from "tailwind-variants";
import { textColors, paddingX, paddingY, radii } from '@/lib/ui/tokens';

const button = tv({
  base: "inline-flex items-center justify-center transition-colors",
  variants: {
    variant: {
      primary: `bg-blue-600 ${textColors.white} hover:bg-blue-700`,
      secondary: `bg-gray-200 ${textColors.dark} hover:bg-gray-300`,
      outline: `border border-gray-300 ${textColors.dark} hover:bg-gray-50`,
    },
    size: {
      sm: `${paddingX.sm} ${paddingY.xs} text-sm`,
      md: `${paddingX.md} ${paddingY.sm} text-base`,
      lg: `${paddingX.lg} ${paddingY.md} text-lg`,
    },
    rounded: {
      none: "",
      sm: radii.sm,
      md: radii.md,
      lg: radii.lg,
      full: radii.full,
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
    rounded: "md",
  },
});
[RULE] Define component-specific styling using Tailwind Variants and primitive tokens.
</section>
<section id="shared-variants">
Shared Behavior Variants
Reusable UI behavior patterns located in src/lib/ui/variants/:
typescript// src/lib/ui/variants/shared-variants.ts
import { tv } from "tailwind-variants";

export const disabledVariant = tv({
  variants: {
    disabled: {
      true: "opacity-50 pointer-events-none cursor-not-allowed",
      false: "",
    }
  },
  defaultVariants: {
    disabled: false
  }
});

export const loadingVariant = tv({
  variants: {
    loading: {
      true: "relative text-transparent pointer-events-none",
      false: "",
    }
  },
  defaultVariants: {
    loading: false
  }
});

export const flexVariant = tv({
  variants: {
    direction: {
      row: "flex-row",
      col: "flex-col",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
    },
    wrap: {
      true: "flex-wrap",
      false: "flex-nowrap",
    },
  },
  defaultVariants: {
    direction: "row",
    align: "start",
    justify: "start",
    wrap: false,
  },
  compoundVariants: [
    {
      direction: "row",
      class: "flex"
    },
    {
      direction: "col",
      class: "flex"
    }
  ]
});
[RULE] Use shared variants for common UI behaviors across multiple components.
</section>
<section id="usage-guidelines">
Usage Guidelines
When to Use Tokens Directly
Use tokens directly in these scenarios:

Building atomic components (basic UI elements)
Defining explicit styling that shouldn't change
Creating component-specific variants

typescriptimport { textColors, radii } from '@/lib/ui/tokens';

function Alert({ children }) {
  return (
    <div className={cn(
      "p-4 border",
      textColors.danger,
      radii.md
    )}>
      {children}
    </div>
  );
}
When to Use Component Variants
Use component variants when:

Defining styling options for a component
Creating a component with multiple visual presentations
Building complex compositions of styles

typescriptfunction Button({ variant, size, disabled, children, ...props }) {
  return (
    <button
      className={button({ variant, size, disabled })}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
When to Use Shared Variants
Use shared variants when:

Adding common behaviors (disabled, loading, error states)
Quickly styling one-off elements without creating a component
Applying consistent patterns across unrelated components

tsximport { flexVariant, disabledVariant } from '@/lib/ui/variants';

// In a component
<div className={cn(
  flexVariant({ direction: 'col', align: 'center' }),
  disabledVariant({ disabled: isDisabled })
)}>
  {children}
</div>
[RULE] Choose the appropriate token approach based on the specific use case.
</section>
<section id="tailwind-integration">
Tailwind Integration
Our token system sits on top of Tailwind CSS v4, providing a semantic layer between raw utility classes and component styling. This allows us to:

Maintain consistent design values across the application
Change the underlying styling without modifying component code
Support dark mode and other themes with minimal effort
Ensure type safety with TypeScript integration

[RULE] Leverage the token system to abstract away direct Tailwind class dependencies.
</section>
</doc>

---

<a id="domain-components"></a>

## domain components



---

<a id="styling-patterns"></a>

## styling patterns

<doc id="styling-patterns">
Component Styling Patterns
<section id="styling-overview">
Overview
This guide explains our approach to styling components using the token system. For detailed information about our token architecture, refer to the Design Token System documentation.
[RULE] Always use the appropriate styling approach based on the component type and usage context.
</section>
<section id="core-principles">
Core Principles
Our styling system is based on three key concepts:

Design Tokens: Primitive values (colors, spacing, typography) defined in @/lib/ui/tokens/*
Component-Specific Variants: Style variations for a specific component using Tailwind Variants
Shared Behavior Variants: Common UI behaviors (disabled, loading, etc.) reused across components

This separation ensures consistency while maintaining flexibility across the application.
[RULE] Understand the difference between tokens (primitive values) and variants (reusable patterns).
</section>
<section id="when-to-use-tokens">
Using Design Tokens
For detailed token usage guidelines, refer to the Design Token System documentation.
[RULE] Always import tokens directly from their respective modules, not through intermediate helpers.
</section>
<section id="best-practices">
Best Practices

Atomic Components: Define complete, self-contained styling using tokens
Composed Components: Compose from atomic components instead of duplicating styles
Page Components: Use shared variants for one-off styling needs
Documentation: Document component variants in component files

This hybrid approach balances consistency with flexibility while avoiding duplication.
[RULE] Follow these best practices to maintain a clean, maintainable styling system.
</section>
<section id="example-implementation">
Example Implementation
tsx// Button.tsx - An atomic component
import { cn } from '@/lib/utils';
import { tv } from 'tailwind-variants';
import { textColors, radii } from '@/lib/ui/tokens';
import { disabledVariant, loadingVariant } from '@/lib/ui/variants';

// Component-specific variants using tokens
const button = tv({
  base: [
    "inline-flex items-center justify-center transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
  ],
  variants: {
    // Import shared behavior variants
    disabled: disabledVariant.variants.disabled,
    loading: loadingVariant.variants.loading,
    
    // Component-specific variants
    variant: {
      primary: `bg-primary ${textColors.white} hover:bg-primary-600`,
      secondary: `bg-gray-200 ${textColors.dark} hover:bg-gray-300`,
      outline: `border border-gray-300 ${textColors.dark} hover:bg-gray-50`,
    },
    size: {
      sm: "text-sm px-2 py-1",
      md: "text-base px-4 py-2",
      lg: "text-lg px-6 py-3",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

export function Button({
  variant,
  size,
  disabled,
  loading,
  className,
  children,
  ...props
}) {
  return (
    <button
      className={cn(button({ variant, size, disabled, loading }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoadingSpinner /> : children}
    </button>
  );
}
[RULE] Use this pattern as a reference for implementing components in the system.
</section>
</doc>

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
typescript 
import { createItem, updateItem, deleteItem } from "@/lib/utils/server/crud";

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
typescript
import { buildPaginatedQuery, executePaginatedQuery } from "@/lib/utils/server/pagination";

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

<doc id="schema-system">

# Data Flow & Schema System

<section id="data-overview">

## Overview

Our platform uses a schema-driven architecture where Zod schemas serve as the definitive source of truth for all data structures. This approach ensures consistency across the frontend, backend, and database layers.

[RULE] Always use Zod schemas as the canonical source of truth for data structures.

</section>

<section id="data-schemas">

## Zod Schema Architecture

Schemas are organized in `src/lib/data-schema/zod-schema/` by domain:

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
<section id="data-model-integration">
MongoDB Model Integration
MongoDB models are defined using the Zod schemas and stored in src/lib/data-schema/mongoose-schema/:
typescriptimport { SchoolZodSchema } from "@/lib/data-schema/zod-schema/core/school";
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
<section id="data-form-config">
Field Configuration System
Field configurations in src/lib/ui/forms/fieldConfig/ define how form fields should be rendered and validated:
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
Form overrides (src/lib/ui/forms/formOverrides/) allow customization of form behavior for specific contexts:
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
  const { data, error, isLoading } = useSafeSWR<School[]>('/api/schools');
  
  // Additional CRUD functions...
  
  return {
    schools: data?.items || [],
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
Server actions in src/app/actions/ provide a way to perform server-side operations directly from client components:
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
<section id="data-flow-diagram">
Data Flow Diagram
The data flows through our system in this sequence:

Zod Schema Definition: Define data structure and validation (/lib/data-schema/zod-schema/)
MongoDB Model Creation: Create database models based on schema (/lib/data-schema/mongoose-schema/)
Field Configuration: Define UI representation of data (/lib/ui/forms/fieldConfig/)
Server Actions/API Routes: Implement data operations (/app/actions/ or /app/api/)
React Hooks: Create data fetching and management hooks (/hooks/)
UI Components: Render data and handle user interactions (/components/)

[RULE] Follow this data flow sequence when implementing new features.
</section>
<section id="data-transformers">
Data Transformers
Data transformation utilities in src/lib/data-utilities/transformers/ help sanitize and validate data:
typescript// Sanitize a MongoDB document for client-side use
const safeDoc = sanitizeDocument(mongooseDoc, MyZodSchema);

// Validate against a schema and return null on error
const result = safeParseAndLog(MyZodSchema, data);

// Parse data and throw a formatted error if validation fails
const result = parseOrThrow(MyZodSchema, data);
[RULE] Use appropriate transformers when moving data between server and client.
</section>
<section id="data-consistency">
Maintaining Data Consistency
To ensure data consistency across the application:

Start with the Zod schema as the single source of truth
Generate TypeScript types from schemas using z.infer<typeof SchemaName>
Define MongoDB models that mirror the schema structure
Create field configurations and overrides based on the schema
Use transformers to sanitize data when crossing boundaries
Validate inputs against schemas at every entry point

[RULE] Apply these consistency practices at every layer of the application.
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
import { SchoolInputZodSchema } from "@/lib/data-schema/zod-schema/core/school";
import { SchoolModel } from "@/lib/data-schema/mongoose-schema/core/school.model";
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
import { tv } from "tailwind-variants";
import { colors, spacing } from "@/lib/ui/tokens";
// For shared behavior, import specific variants
import { interactive } from "@/lib/ui/variants";

const componentName = tv({
  base: "base-styles-here",
  variants: {
    // Primitive UI tokens for direct styling
    color: colors,
    padding: spacing,
    // Optional shared behaviors when needed
    interactive: interactive.variants.interactive,
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
jsx
// ❌ Bad
<div className="text-blue-500 p-4 rounded-md">Content</div>

// ✅ Good for atomic components
<div className={cn(colors.primary, spacing.md, shape.rounded)}>Content</div>

// ✅ Good for components with shared behaviors
<div className={cn(colors.primary, spacing.md, shape.rounded, interactive({ hover: true }))}>
  Interactive Content
</div>

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
3. Use tokens directly for basic visual styling and shared variants for common behaviors:
   - Direct token usage for colors, spacing, typography in atomic components
   - Shared variants for interactive states, loading states, etc.
   - Combine both approaches when appropriate
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

<a id="implementation-workflow"></a>

## implementation workflow

<doc id="implementation-workflow">

# Implementation Workflow

<section id="workflow-overview">

## Overview

This guide outlines the specific steps to implement new features in our application, following our schema-driven architecture.

[RULE] Follow this implementation sequence for all new features.

</section>

<section id="schema-implementation">

## 1. Implement Zod Schemas

Start by defining the Zod schemas in `src/lib/data-schema/zod-schema/`:

```typescript
// src/lib/data-schema/zod-schema/domain/entity.ts
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
[RULE] Define all required fields with appropriate validations.
</section>
<section id="model-implementation">
2. Create MongoDB Models
Create MongoDB models in src/lib/data-schema/mongoose-schema/:
typescript// src/lib/data-schema/mongoose-schema/domain/entity.model.ts
import mongoose from "mongoose";
import { EntityZodSchema } from "@/lib/data-schema/zod-schema/domain/entity";

const schemaFields = {
  name: { type: String, required: true },
  description: { type: String, required: true },
  // Additional fields...
};

const EntitySchema = new mongoose.Schema(schemaFields, { timestamps: true });

export const EntityModel = mongoose.models.Entity || 
  mongoose.model("Entity", EntitySchema);
[RULE] Ensure model fields match the Zod schema structure.
</section>
<section id="field-config-implementation">
3. Define Field Configurations
Create field configurations in src/lib/ui/forms/fieldConfig/:
typescript// src/lib/ui/forms/fieldConfig/domain/entity.ts
import { Field } from "@/lib/ui/forms/types";
import { EntityInput } from "@/lib/data-schema/zod-schema/domain/entity";

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
[RULE] Define configurations for all fields in the schema.
</section>
<section id="server-action-implementation">
4. Implement Server Actions
Create server actions in src/app/actions/:
typescript// src/app/actions/domain/entity.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { EntityInputZodSchema } from "@/lib/data-schema/zod-schema/domain/entity";
import { EntityModel } from "@/lib/data-schema/mongoose-schema/domain/entity.model";
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
[RULE] Implement validation and error handling for all operations.
</section>
<section id="hook-implementation">
5. Create Data Hooks
Create custom hooks in src/hooks/:
typescript// src/hooks/useEntityData.ts
import { useState } from "react";
import { Entity } from "@/lib/data-schema/zod-schema/domain/entity";
import { useSafeSWR } from "@/hooks/utils/useSafeSWR";
import { handleClientError } from "@/lib/core/error/handleClientError";

export function useEntityData() {
  const { data, error, isLoading } = useSafeSWR<Entity[]>('/api/entities');
  
  // Additional CRUD functions...
  
  return {
    entities: data?.items || [],
    error,
    isLoading,
    // CRUD operations...
  };
}
[RULE] Include proper error handling and loading states.
</section>
<section id="component-implementation">
6. Develop UI Components
Create domain components in src/components/domain/:
typescript// src/components/domain/entity/EntityCard.tsx
import { Card } from "@/components/composed/cards";
import { Entity } from "@/lib/data-schema/zod-schema/domain/entity";

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
[RULE] Create components based on the component hierarchy pattern.
</section>
<section id="page-implementation">
7. Create Pages
Finally, implement pages in src/app/:
typescript// src/app/dashboard/entityList/page.tsx
import { useEntityData } from "@/hooks/useEntityData";
import { EntityCard } from "@/components/domain/entity/EntityCard";
import { PageHeader } from "@/components/shared";

export default function EntityListPage() {
  const { entities, error, isLoading } = useEntityData();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <PageHeader title="Entities" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {entities.map(entity => (
          <EntityCard key={entity._id} entity={entity} />
        ))}
      </div>
    </div>
  );
}
[RULE] Follow this complete implementation workflow for all new features.
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

