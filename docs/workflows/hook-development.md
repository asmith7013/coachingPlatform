# Hook Development Guidelines

## Overview

This document outlines best practices for developing and organizing custom React hooks in our application.

[RULE] Follow these guidelines when creating new hooks to maintain consistency across the codebase.

## Hook Categorization

When creating new hooks:

1. **Categorize appropriately**: Place hooks in the correct category based on their primary purpose.
   - If a hook fetches or manages data for a specific entity type, it belongs in `domain/`
   - If it's a general data fetching/management utility, it belongs in `data/`
   - If it manages UI state, it belongs in `ui/`
   - If it handles errors, it belongs in `error/`
   - If it's for development-only debugging, it belongs in `debugging/`

[RULE] Always place hooks in the appropriate category folder.

## Naming Conventions

Follow consistent naming patterns for all hooks:

- Domain hooks should be named `use[EntityName]` (e.g., `useSchools`)
- Data hooks should describe their data operation (e.g., `useCrudOperations`)
- UI hooks should describe their UI function (e.g., `usePagination`)
- Error hooks should clearly indicate their error-handling purpose

[RULE] Use clear, descriptive names that indicate the hook's purpose.

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
  const { data, error, isLoading } = useSafeSWR<School[]>('/api/schools');
  const { mutate } = useErrorHandledMutation();
  
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
```

[RULE] Maintain proper separation of concerns in hook implementations.

## Hook Exports

All hooks should be exported through the barrel file (index.ts) for convenient imports:

```typescript
// src/hooks/index.ts
export * from './data/useCrudOperations';
export * from './domain/useSchools';
export * from './ui/usePagination';
export * from './error/useErrorHandledMutation';
```

This enables clean imports in components:

```typescript
import { useSchools, usePagination } from '@/hooks';
```

[RULE] Export all hooks through the barrel file for consistent imports.

## Domain Hook Organization Patterns

Our application organizes domain hooks by business domain rather than flat structure, improving maintainability and discoverability.

### New Domain Structure

```
src/hooks/domain/
├── staff/                  # Staff-related domain hooks
│   ├── useNYCPSStaff.ts
│   ├── useTeachingLabStaff.ts
│   └── useUserStaff.ts
├── schedule/              # Schedule-related domain hooks
│   ├── useBellSchedules.ts
│   └── useTeacherSchedules.ts
├── useSchools.ts          # Core entity hooks (root level)
├── useLookFors.ts
├── useVisits.ts
└── index.ts               # Barrel exports for all hooks
```

### Domain Hook Implementation Pattern

All domain hooks use the CRUD factory for consistency:

```typescript
// src/hooks/domain/staff/useNYCPSStaff.ts
import { createCrudHooks } from '@query/client/factories/crud-factory';
import { NYCPSStaffZodSchema } from '@zod-schema/core/staff';
import { 
  fetchNYCPSStaff, 
  createNYCPSStaff, 
  updateNYCPSStaff, 
  deleteNYCPSStaff 
} from '@actions/staff/operations';

const nycpsStaffHooks = createCrudHooks({
  entityType: 'nycps-staff',
  schema: NYCPSStaffZodSchema,
  serverActions: {
    fetch: fetchNYCPSStaff,
    create: createNYCPSStaff,
    update: updateNYCPSStaff,
    delete: deleteNYCPSStaff
  },
  validSortFields: ['staffName', 'email', 'createdAt'],
  relatedEntityTypes: ['schools']
});

// Export with domain-specific names
export const useNYCPSStaffList = nycpsStaffHooks.useList;
export const useNYCPSStaffById = nycpsStaffHooks.useDetail;
export const useNYCPSStaffMutations = nycpsStaffHooks.useMutations;
export const useNYCPSStaff = nycpsStaffHooks.useManager;
```

### Barrel Export Pattern

The domain index maintains backward compatibility:

```typescript
// src/hooks/domain/index.ts
// Staff hooks - organized in subdirectories
export * from './staff/useNYCPSStaff';
export * from './staff/useTeachingLabStaff';

// Schedule hooks - organized in subdirectories  
export * from './schedule/useBellSchedules';
export * from './schedule/useTeacherSchedules';

// Core entity hooks - remain at root level
export * from './useSchools';
export * from './useLookFors';
export * from './useVisits';
```

### Benefits of Domain Organization

This structure provides:

- **Domain Separation**: Related hooks are co-located
- **Namespace Clarity**: Clear ownership of hook responsibilities
- **Easier Navigation**: Developers can find hooks by domain
- **Backward Compatibility**: Existing imports continue to work
- **Scalability**: New domains can be added without cluttering root

[RULE] Organize domain hooks by business domain and maintain backward compatibility through barrel exports.

## Feature Context Hooks

For complex features with shared state across multiple components, create context-based hooks that provide selective access to prevent unnecessary re-renders.

### Context Hook Implementation

Feature context hooks follow a specific pattern:

```typescript
// Base context hook for internal use
function useFeatureContext(): FeatureContextType {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('Feature hooks must be used within FeatureProvider');
  }
  return context;
}

// Selective hooks for specific state slices
export function useFeatureSelection() {
  const context = useFeatureContext();
  return {
    selectedItem: context.selectedItem,
    handleSelect: context.handleSelect
  };
}

export function useFeatureData() {
  const context = useFeatureContext();
  return {
    data: context.data,
    isLoading: context.isLoading,
    error: context.error
  };
}
```

### Benefits of Selective Context Hooks

This approach provides:

- **Performance**: Components only re-render when their specific state changes
- **Clarity**: Clear separation of concerns for different UI responsibilities  
- **Maintainability**: Easier to understand what state each component depends on
- **Testability**: Individual hooks can be tested in isolation

[RULE] Create selective context hooks for features with complex shared state to optimize performance and maintainability.

## Authentication Hook Development Patterns

When developing authentication-related hooks, follow these patterns to maintain consistency with our auth system.

### Domain-Specific Auth Hooks

Create domain-specific authentication hooks that build on `useAuthenticatedUser`:

```typescript
// Example: Teacher-specific authentication
export function useTeacherData(): TeacherData {
  const { metadata, hasPermission, hasRole } = useAuthenticatedUser();
  
  return useMemo(() => ({
    isTeacher: hasRole('Teacher'),
    teacherId: metadata.staffId,
    canViewSchedules: hasPermission('schedule.view'),
    assignedClasses: metadata.classIds || []
  }), [metadata, hasPermission, hasRole]);
}
```

### Capability-Based Hooks

Create hooks that focus on specific capabilities rather than roles:

```typescript
// Focus on what the user can do, not what they are
export function useVisitCapabilities() {
  const { hasPermission } = useAuthenticatedUser();
  
  return useMemo(() => ({
    canCreate: hasPermission('visit.create'),
    canEdit: hasPermission('visit.edit'),
    canDelete: hasPermission('visit.delete'),
    canViewAll: hasPermission('visit.view_all')
  }), [hasPermission]);
}
```

### Authentication Hook Guidelines

When creating authentication hooks:

1. **Build on Base Hooks**: Always use `useAuthenticatedUser` as the foundation
2. **Use Memoization**: Wrap computations in `useMemo` for performance
3. **Focus on Capabilities**: Prefer capability-based over role-based logic
4. **Clear Naming**: Use descriptive names that indicate the hook's purpose
5. **Single Responsibility**: Each hook should serve one authentication concern

[RULE] Follow these patterns when creating authentication hooks to ensure consistency and maintainability.

## Hook Documentation

Document all hooks with JSDoc comments:

```typescript
/**
 * Hook for managing school data and operations
 * 
 * @returns {Object} School data and operations
 * @property {School[]} schools - Array of schools
 * @property {Error|null} error - Error if fetch failed
 * @property {boolean} isLoading - Loading state
 * @property {Function} createSchool - Create a new school
 */
export function useSchools() {
  // Implementation...
}
```

[RULE] Document all hooks with clear JSDoc comments.