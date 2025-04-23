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