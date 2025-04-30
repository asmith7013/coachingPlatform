Here's the updated version of the Architecture Overview & Documentation Guide, removing the Examples folder reference and updating the Documentation Structure section to reflect that examples are now embedded within relevant documentation:

```markdown
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

Each documentation file contains embedded examples where relevant, providing immediate context for the concepts being described. This approach ensures examples are:
- Directly connected to the concepts they demonstrate
- More discoverable for developers
- Maintained alongside the documentation they support
- Presented in the most contextually appropriate format

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

##Code Advice Format Requirement:

When providing code advice or implementation guidance, almost always format the response as a Cursor prompt that follows our established Cursor prompt patterns. This should include:

1. A clear task description at the top
2. Reference to relevant documentation sections using our standard format: [document-id][section-id]
3. Scope boundaries (what's in/out of scope)
4. Implementation requirements
5. Code examples following our code example formatting guidelines 

Unless explicitly directed otherwise, assume that code advice is intended to be copy-pasted into Cursor as a prompt. Format your response accordingly, even for seemingly simple implementations.

Example:
Instead of directly providing code like this:

```typescript
function example() {
  // Code here
}
```
Format it as a Cursor prompt like this:
markdown# Implement Example Function

## SCOPE
- IN SCOPE: Create a basic example function
- OUT OF SCOPE: Complex error handling, advanced features

## COMPLETE CODE EXAMPLE

```typescript
// src/utils/example.ts
export function example() {
  // Code implementation
}
```
## Current Build Priorities

1. Daily Visit Page
2. Teacher & Admin Dashboards
3. Schedule Generator
4. Coaching Log Auto-fill + Monday.com Integration
5. Real-time Transcription + Insights (Phase 2)

## Using This Documentation

For AI tools like Cursor, this documentation is organized with section IDs:

[document-id][section-id] Section Title
```

Example: `[component-system][component-variants]` references the variants section of the component system documentation.
```