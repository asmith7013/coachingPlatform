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

<section id="hooks-structure">
## Hooks Organization

Our custom React hooks are organized by their functional purpose:

src/hooks/
├── data/                  # Data fetching and management hooks
│   ├── useCrudOperations.ts     # CRUD operations with standardized error handling
│   ├── useOptimisticResource.ts # Optimistic UI updates
│   ├── useReferenceData.ts      # Reference data for select components
│   ├── useResourceManager.ts    # Resource management abstraction
│   └── useSafeSWR.ts            # Error-managed SWR wrapper
│
├── ui/                    # UI interaction and state hooks
│   ├── useFiltersAndSorting.ts  # Filter and sort state management
│   └── usePagination.ts         # Pagination state and logic
│
├── error/                 # Error handling hooks
│   ├── useErrorBoundary.ts      # React error boundary hook
│   └── useErrorHandledMutation.ts # Error-wrapped mutation hook
│
├── domain/                # Domain-specific data hooks
│   ├── useLookFors.ts           # LookFor entity management
│   ├── useNYCPSStaff.ts         # NYCPS Staff entity management
│   ├── useSchools.ts            # School entity management
│   └── useTeacherSchedules.ts   # Teacher schedule management
│
├── debugging/             # Development and debugging hooks
│   ├── checkRenderLoopInTools.tsx # Tool for detecting render loops
│   ├── useComponentTester.tsx   # Isolated component testing
│   └── useRenderTracking.ts     # Component render tracking
│
└── index.ts               # Barrel file that re-exports all hooks
</section>
<section id="lib-structure">

## Library Structure
src/
├── app/                # Next.js app router pages and API routes
├── components/         # React components (core, composed, domain, features)
├── hooks/              # Custom React hooks
├── lib/                # Core utilities and modules
│   ├── api/            # API utilities for fetchers, handlers, and responses
│   ├── data-schema/    # Schema definitions (Zod and Mongoose)
│   │   ├── mongoose-schema/ # MongoDB models derived from Zod schemas
│   │   ├── zod-schema/      # Source of truth for data structures
│   │   └── enum/            # Shared enumerations
│   ├── data-server/    # Server-side data operations
│   │   ├── crud/       # Generic CRUD operations
│   │   ├── db/         # Database connection management
│   │   └── file-handling/ # File upload and processing
│   ├── data-utilities/ # Data processing utilities
│   │   ├── pagination/ # Pagination utilities
│   │   └── transformers/ # Data sanitization and transformation
│   ├── dev/            # Development and testing utilities
│   ├── domain/         # Domain-specific library functions
│   ├── error/          # Centralized error handling
│   ├── hooks/          # Shared hooks for data management
│   ├── json/           # Static JSON data files
│   ├── types/          # Type definitions
│   │   ├── core/       # Core system types (API, CRUD, responses)
│   │   ├── domain/     # Business domain types
│   │   └── ui/         # UI-specific types
│   └── ui/             # UI utilities
│       ├── constants/  # UI-related constants
│       ├── forms/      # Form configuration and helpers
│       │   ├── fieldConfig/  # Field configurations by domain
│       │   └── formOverrides/ # Field overrides by context
│       ├── tokens/     # Design system tokens
│       └── variants/   # Component variants
├── providers/          # React context providers
└── styles/             # Global styles

This structure:
- Organizes schemas and models together in `data-schema`, with Zod schemas as the source of truth
- Centralizes server operations in `data-server` for consistent data access
- Provides dedicated utilities in `data-utilities` for transformations and pagination
- Maintains a comprehensive type system in `types` organized by domain
- Centralizes error handling in the `error` directory
- Structures UI utilities in a hierarchical system with tokens, variants, and form configurations

This folder organization supports our schema-driven approach where data definitions flow from Zod schemas to MongoDB models to UI components.

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

<section id="file-organization-patterns">

## File Organization Patterns

Follow these precise guidelines when creating new files to maintain a consistent project structure.

### Domain Types and Interfaces

**Location**: `src/lib/types/domain/{domain-name}.ts`

Domain-specific type definitions belong in the domain subdirectory of the types folder, organized by domain area.

Examples:
- `src/lib/types/domain/monday.ts` - Monday.com related types
- `src/lib/types/domain/school.ts` - School entity types
- `src/lib/types/domain/staff.ts` - Staff entity types

### Core Types and Interfaces

**Location**: `src/lib/types/core/{type-category}.ts`

System-wide, core types that aren't specific to a business domain belong here.

Examples:
- `src/lib/types/core/response.ts` - API response types
- `src/lib/types/core/pagination.ts` - Pagination types

### API Integration Queries

**Location**: `src/lib/api/integrations/{service-name}-queries.ts`

GraphQL queries or other external API query definitions belong here.

Examples:
- `src/lib/api/integrations/monday-queries.ts` - Monday.com GraphQL queries

### API Clients

**Location**: `src/app/api/integrations/{service-name}/client.ts`

API client implementations for external services belong here.

Examples:
- `src/app/api/integrations/monday/client.ts` - Monday.com API client

### API Route Handlers

**Location**: `src/app/api/{resource-name}/route.ts`

API routes defined using Next.js App Router conventions go here.

Examples:
- `src/app/api/schools/route.ts` - Schools API endpoints
- `src/app/api/staff/route.ts` - Staff API endpoints

### Server Actions

**Location**: `src/app/actions/{domain-name}/{resource-name}.ts`

Server actions implementing business logic with "use server" directives go here.

Examples:
- `src/app/actions/schools/schools.ts` - School-related server actions
- `src/app/actions/integrations/monday.ts` - Monday.com integration actions

### React Components

**Location**: Based on component type:

1. **Core Components**: `src/components/core/{component-name}.tsx`
   - Basic UI elements with minimal dependencies

2. **Composed Components**: `src/components/composed/{component-category}/{component-name}.tsx`
   - Components composed from core components

3. **Domain Components**: `src/components/domain/{domain-name}/{component-name}.tsx`
   - Domain-specific components

4. **Feature Components**: `src/components/features/{feature-name}/{component-name}.tsx`
   - Complete feature implementations

Examples:
- `src/components/core/Button.tsx` - Core button component
- `src/components/composed/cards/Card.tsx` - Composed card component
- `src/components/domain/monday/BoardFinder.tsx` - Domain-specific Monday board finder
- `src/components/features/schoolManagement/SchoolCreator.tsx` - Feature component

### React Hooks

**Location**: Based on hook type:

1. **Data Hooks**: `src/hooks/data/{hook-name}.ts`
   - Hooks for data fetching and management

2. **Domain Hooks**: `src/hooks/domain/{hook-name}.ts`
   - Domain-specific business logic hooks

3. **UI Hooks**: `src/hooks/ui/{hook-name}.ts`
   - UI-related state management hooks

Examples:
- `src/hooks/data/useSafeSWR.ts` - Generic data fetching hook
- `src/hooks/domain/useMondayBoard.ts` - Monday.com board hook
- `src/hooks/ui/usePagination.ts` - UI pagination hook

### Pages

**Location**: `src/app/{path}/page.tsx`

Page components for the Next.js App Router go here, organized by route structure.

Examples:
- `src/app/dashboard/page.tsx` - Dashboard page
- `src/app/tools/monday/page.tsx` - Monday.com tools page

### Schema Definitions

**Location**: `src/lib/data-schema/zod-schema/{domain}/{resource-name}.ts`

Zod schema definitions, which serve as the source of truth for data structures.

Examples:
- `src/lib/data-schema/zod-schema/core/school.ts` - School schema
- `src/lib/data-schema/zod-schema/visits/visit.ts` - Visit schema

### MongoDB Models

**Location**: `src/lib/data-schema/mongoose-schema/{domain}/{resource-name}.model.ts`

Mongoose models derived from Zod schemas.

Examples:
- `src/lib/data-schema/mongoose-schema/core/school.model.ts` - School model
- `src/lib/data-schema/mongoose-schema/visits/visit.model.ts` - Visit model

[RULE] Always follow these file organization patterns to maintain a consistent, scalable codebase.

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