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