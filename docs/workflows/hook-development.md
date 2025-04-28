<doc id="hook-development">

# Hook Development Guidelines

<section id="hook-development-overview">

## Overview

This document outlines best practices for developing and organizing custom React hooks in our application.

[RULE] Follow these guidelines when creating new hooks to maintain consistency across the codebase.

</section>

<section id="hook-categorization">

## Hook Categorization

When creating new hooks:

1. **Categorize appropriately**: Place hooks in the correct category based on their primary purpose.
   - If a hook fetches or manages data for a specific entity type, it belongs in `domain/`
   - If it's a general data fetching/management utility, it belongs in `data/`
   - If it manages UI state, it belongs in `ui/`
   - If it handles errors, it belongs in `error/`
   - If it's for development-only debugging, it belongs in `debugging/`

[RULE] Always place hooks in the appropriate category folder.

</section>

<section id="hook-naming">

## Naming Conventions

Follow consistent naming patterns for all hooks:

- Domain hooks should be named `use[EntityName]` (e.g., `useSchools`)
- Data hooks should describe their data operation (e.g., `useCrudOperations`)
- UI hooks should describe their UI function (e.g., `usePagination`)
- Error hooks should clearly indicate their error-handling purpose

[RULE] Use clear, descriptive names that indicate the hook's purpose.

</section>

<section id="hook-abstractions">

## Maintaining Proper Abstractions

Hooks should follow our abstraction principles:

- Domain hooks should use data hooks internally
- UI hooks should be pure state management without domain knowledge
- Error hooks should handle specific error patterns consistently
- Debugging hooks should be isolated from production code

Example of proper abstraction:

```typescript
// Domain hook using data hooks internally
export function useSchools() {
  // Use general data hooks for the implementation
  const { data, error, isLoading } = useSafeSWR<School[]>('/api/schools');
  const { mutate } = useErrorHandledMutation();
  
  // Implement domain-specific operations
  const createSchool = async (school: SchoolInput) => {
    return mutate('/api/schools', {
      method: 'POST',
      body: JSON.stringify(school)
    });
  };
  
  return {
    schools: data?.items || [],
    error,
    isLoading,
    createSchool
  };
}
[RULE] Maintain proper separation of concerns in hook implementations.
</section>
<section id="hook-exports">
Hook Exports
All hooks should be exported through the barrel file (index.ts) for convenient imports:
typescript// src/hooks/index.ts
// Data hooks
export * from './data/useCrudOperations';
export * from './data/useSafeSWR';
// ...

// Domain hooks
export * from './domain/useSchools';
export * from './domain/useNYCPSStaff';
// ...

// UI hooks
export * from './ui/usePagination';
export * from './ui/useFiltersAndSorting';
// ...

// Error hooks
export * from './error/useErrorHandledMutation';
export * from './error/useErrorBoundary';
// ...
This enables clean imports in components:
typescriptimport { useSchools, usePagination } from '@/hooks';
[RULE] Export all hooks through the barrel file for consistent imports.
</section>
<section id="hook-documentation">
Hook Documentation
Document all hooks with JSDoc comments:
typescript/**
 * Hook for managing school data and operations
 * 
 * @returns {Object} School data and operations
 * @property {School[]} schools - Array of schools
 * @property {Error|null} error - Error if fetch failed
 * @property {boolean} isLoading - Loading state
 * @property {Function} createSchool - Create a new school
 * @property {Function} updateSchool - Update an existing school
 * @property {Function} deleteSchool - Delete a school
 */
export function useSchools() {
  // Implementation...
}
[RULE] Document all hooks with clear JSDoc comments.
</section>
</doc>