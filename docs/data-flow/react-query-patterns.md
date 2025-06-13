# React Query Patterns

## Overview

Our application uses React Query with a factory-based architecture for DRY, type-safe server state management.

**[RULE]** Use React Query following our factory-based pattern.

## CRUD Factory Pattern

Our factory system provides a standardized approach to creating hooks for CRUD operations:

```typescript
// Create standard CRUD hooks
const schoolHooks = createCrudHooks<School, SchoolInput>({
  entityType: 'schools',
  serverActions: schoolActions,
  validSortFields: ['schoolName', 'district', 'createdAt'],
  defaultParams: { sortBy: 'schoolName', sortOrder: 'asc' }
});

// Generated hooks:
// schoolHooks.useList() - Fetching with filtering/pagination
// schoolHooks.useById() - Detail fetching
// schoolHooks.useMutations() - CRUD operations
// schoolHooks.useManager() - Combined functionality
```

The factory generates a complete set of hooks for CRUD operations with consistent interfaces across all entities.

**[RULE]** Use `createCrudHooks()` for all domain data management.

## Query Key Management

Type-safe query key factories for consistent cache management:

```typescript
export const queryKeys = {
  entities: {
    all: ['entities'] as const,
    list: (entity: string, filters?: Record<string, unknown>) => 
      [...queryKeys.entities.all, 'list', entity, { ...(filters || {}) }] as const,
    detail: (entity: string, id: string) => 
      [...queryKeys.entities.all, 'detail', entity, id] as const,
    
    // Type-safe factory method
    forEntity: <TFilters = Record<string, unknown>>(entity: string) => ({
      all: [entity] as const,
      list: (filters?: TFilters) => [...queryKeys.entities.all, 'list', entity, { ...(filters || {}) }] as const,
      detail: (id: string) => [...queryKeys.entities.all, 'detail', entity, id] as const,
    }),
  },
  
  // Pre-configured entity keys
  schools: queryKeys.entities.forEntity<{ district?: string }>('schools'),
  staff: queryKeys.entities.forEntity<{ role?: string }>('staff'),
};
```

**[RULE]** Use query key factories for consistent cache management.

## Cache Synchronization

Three components for cache management:

### Cache Operations

Entity-specific cache operations:

```typescript
const schoolCacheOps = createEntityCacheOperations(queryClient, 'schools');

// Usage
await schoolCacheOps.invalidateList(); // Invalidate all lists
await schoolCacheOps.invalidateDetail(schoolId); // Invalidate specific entity
await schoolCacheOps.updateEntity(schoolId, updater); // Update in cache
await schoolCacheOps.addEntity(newSchool); // Add to cache
await schoolCacheOps.removeEntity(schoolId); // Remove from cache
```

### Client-Side Synchronization

High-level synchronization for server mutations:

```typescript
// In server action
await syncClientCache({
  entityType: 'schools',
  operationType: 'update',
  additionalInvalidateKeys: [['staff', 'list']]
}, schoolId);
```

### Invalidation Utilities

Hook for manual cache invalidation:

```typescript
const { invalidateEntity, invalidateList } = useInvalidation();

// Usage
await invalidateEntity('schools', schoolId);
```

**[RULE]** Use appropriate cache sync utilities based on the context.

## Domain Hook Generation

Built using the factory system:

### Entity-Specific Hooks

```typescript
// Create hooks factory for schools
export const schoolHooks = createCrudHooks<School, SchoolInput>({
  entityType: 'schools',
  serverActions: schoolActions,
  validSortFields: ['schoolName', 'district'],
  relatedEntityTypes: ['staff', 'visits'] // Auto-invalidates related caches
});

// Export convenient hooks
export const useSchools = schoolHooks.useList;
export const useSchoolById = schoolHooks.useById;
export const useSchoolMutations = schoolHooks.useMutations;
export const useSchoolManager = schoolHooks.useManager; // Combined functionality
```

### Business Domain Hooks

```typescript
export function useDashboardData() {
  // Use entity hooks
  const { items: schools, isLoading: schoolsLoading } = useSchools();
  const { items: visits, isLoading: visitsLoading } = useVisits();
  
  // Combined state
  const isLoading = schoolsLoading || visitsLoading;
  
  // Computed data
  const dashboardData = useMemo(() => {
    if (isLoading) return null;
    
    return {
      totalSchools: schools.length,
      totalVisits: visits.length,
      // Additional metrics...
    };
  }, [schools, visits, isLoading]);
  
  return { data: dashboardData, isLoading };
}
```

### Toast Integration with Domain Hooks

Our domain hooks support optional toast notifications through a clean composition pattern that maintains separation of concerns.

### Basic Toast Integration

```typescript
// Domain hook with toast support
export function useSchoolsWithNotifications() {
  const notifications = useNotifications();
  const toastConfig = createDefaultToastConfig('schools');
  const enableToasts = FEATURE_FLAGS?.ENABLE_TOASTS !== false;
  const mutations = useSchoolsMutations();

  // Fail fast if required mutations aren't available
  if (!mutations.createAsync || !mutations.updateAsync || !mutations.deleteAsync) {
    throw new Error('Required CRUD mutations not available for schools');
  }

  return {
    ...mutations,
    createWithToast: (data: Parameters<typeof mutations.createAsync>[0]) => {
      return notifications.withToast(
        () => mutations.createAsync(data),
        toastConfig.create!,
        enableToasts
      );
    },
    updateWithToast: (id: string, data: Partial<School>) => {
      return notifications.withToast(
        () => mutations.updateAsync(id, data),
        toastConfig.update!,
        enableToasts
      );
    },
    deleteWithToast: (id: string) => {
      return notifications.withToast(
        () => mutations.deleteAsync(id),
        toastConfig.delete!,
        enableToasts
      );
    }
  };
}
```

### Unified Domain Hook Interface

All domain hooks follow a consistent pattern for progressive enhancement:

```typescript
export const useSchools = {
  list: useSchoolsList,                    // Basic data fetching
  byId: useSchoolById,                     // Single entity
  mutations: useSchoolsMutations,          // Pure CRUD operations
  manager: useSchoolManager,               // Enhanced CRUD with cache management
  withInvalidation: useSchoolManagerWithInvalidation,  // + Manual cache control
  withNotifications: useSchoolsWithNotifications       // + Toast feedback
};
```

### Component Usage Patterns

Components can compose functionality based on their specific needs:

```typescript
// Basic CRUD operations
function AdminPanel() {
  const schools = useSchools.manager();
  
  const handleCreate = async (data: SchoolInput) => {
    await schools.createAsync(data); // No toast, silent operation
  };
}

// User-facing operations with feedback
function SchoolForm() {
  const schoolsWithToasts = useSchools.withNotifications();
  
  const handleCreate = async (data: SchoolInput) => {
    await schoolsWithToasts.createWithToast(data); // Shows success/error toast
  };
}

// Advanced operations with cache control
function DataManagement() {
  const schoolsWithInvalidation = useSchools.withInvalidation();
  
  const handleBulkImport = async (schools: SchoolInput[]) => {
    await schoolsWithInvalidation.bulkUpdateSchools(schools);
    await schoolsWithInvalidation.refreshAllSchools(); // Manual cache refresh
  };
}

// Combined usage when both features are needed
function SchoolEditor() {
  const schoolsWithToasts = useSchools.withNotifications();
  const schoolsWithInvalidation = useSchools.withInvalidation();
  
  const handleComplexUpdate = async (id: string, data: Partial<School>) => {
    // Use toast for user feedback
    const result = await schoolsWithToasts.updateWithToast(id, data);
    
    // Manual invalidation for related data
    if (result.success) {
      await schoolsWithInvalidation.refreshSchool(id);
    }
  };
}
```

**[RULE]** Use progressive enhancement - start with basic hooks and add features (notifications, invalidation) only when needed by the specific component context.

## Integration with Server Actions

Our query system integrates seamlessly with server actions:

```typescript
export async function updateSchool(id: string, data: unknown) {
  "use server";
  
  try {
    const result = await SchoolModel.findByIdAndUpdate(id, data);
    
    // Sync client cache
    await syncClientCache({
      entityType: 'schools',
      operationType: 'update'
    }, id);
    
    return { success: true, data: result };
  } catch (error) {
    // Error handling...
  }
}
```

### Integration with Zod Schemas

```typescript
// Create hooks from Zod schema types
const schoolHooks = createCrudHooks<
  z.infer<typeof SchoolZodSchema>,
  z.infer<typeof SchoolInputZodSchema>
>({
  entityType: 'schools',
  serverActions: schoolActions
});
```

**[RULE]** Use factory hooks as the interface between server and UI.

## Error Handling

Integrated error handling for queries and mutations:

```typescript
// In query function
async function fetchData() {
  try {
    return await handleQueryError(apiCall(), 'DataFetch');
  } catch (error) {
    throw error; // Already handled
  }
}

// In component
function MyComponent() {
  const { data, error, isError } = useQuery(/* config */);
  
  // Handle errors with hook
  useQueryErrorHandler(error, isError, 'ComponentQuery');
  
  // Component implementation...
}

// For mutations
function useUpdateResource() {
  return useErrorHandledMutation(
    updateResource,
    { errorContext: "ResourceUpdate" }
  );
}
```

**[RULE]** Use standardized error handling for all queries and mutations.

## Response Type Processing

Utilities for standardized API response handling:

```typescript
// Extract data from responses
const items = extractItems<School>(response);
const pagination = extractPagination(response);
const entity = extractData<School>(response);

// Type guards
if (isPaginatedResponse<School>(response)) {
  // Handle paginated response
}

// Transform responses
const transformed = transformResponse<School, SchoolDTO>(
  response,
  (items) => items.map(transformSchoolToDTO)
);
```

**[RULE]** Use these utilities for consistent API response handling.

## Primitive Hook Implementations

Base hooks for common operations:

```typescript
const {
  // Data
  items: schools,
  isLoading,
  error,
  
  // Pagination
  page, pageSize, setPage, setPageSize,
  
  // Filtering & Sorting
  filters, search, setSearch, applyFilters,
  sortBy, sortOrder, changeSorting
} = useList<School>({
  entityType: 'schools',
  fetcher: fetchSchools,
  validSortFields: ['schoolName', 'district']
});
```

**[RULE]** Use primitive hooks as building blocks for domain hooks.

## Centralized Query Client

Singleton instance for consistent configuration:

```typescript
// src/lib/query/core/client.ts
export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => captureError(error, /* context */)
    }),
    // Standard configuration...
  });
}

// Global instance
export const queryClient = createQueryClient();
```

**[RULE]** Import the centralized client instead of creating instances.

## Data Flow Integration

Our query system integrates with the application's data flow:

```
Zod Schema → Factory Hooks → UI Components
    ↕            ↕              ↕
MongoDB Models ← Server Actions ← Cache Sync
```

This architecture ensures:
- **Type Safety**: Full TypeScript support throughout the chain
- **Cache Management**: Automatic cache invalidation for related entities
- **Consistency**: All domain hooks have the same interface
- **Extensibility**: Easy to add domain-specific functionality

**[RULE]** Use the CRUD factory for all new domain hooks to ensure consistency and proper cache management.