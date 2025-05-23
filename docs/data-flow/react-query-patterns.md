
```markdown
<doc id="react-query-patterns">

# React Query Patterns

<section id="rq-overview">

## Overview

Our application uses React Query with a factory-based architecture for DRY, type-safe server state management.

[RULE] Use React Query following our factory-based pattern.

</section>

<section id="query-architecture">

## Query System Architecture

Our React Query implementation follows a layered architecture:

- **Core Layer**: Query keys, client configuration, error handling
- **Factory Layer**: Hook generators for CRUD operations
- **Utility Layer**: Selectors, cache synchronization, responses
- **Domain Layer**: Business-specific hooks

```
src/lib/query/
├── core/                # Foundation components
├── factories/           # Hook generation factories
├── cache-sync/          # Cache synchronization
├── selectors/           # Response transformation
├── utilities/           # Helper utilities
├── hooks/               # Primitive hook implementations
├── hydration.ts         # SSR hydration utilities
└── initialization.ts    # Query system initialization
```

[RULE] Follow the layered architecture for all React Query implementations.

</section>

<section id="factory-pattern">

## Factory Pattern for Hooks

Our factory system follows a three-tier structure:

1. **`crud-hooks.ts`**: Base CRUD operations
2. **`entity-hooks.ts`**: Entity-specific extensions
3. **`resource-hooks.ts`**: Domain-specific terminology

```typescript
// 1. Base CRUD hooks
const crudHooks = createCrudHooks<School, SchoolInput>({
  entityType: 'schools',
  serverActions: schoolActions,
  validSortFields: ['schoolName', 'district']
});

// 2. Entity hooks with more configuration
const entityHooks = createEntityHooks<School, SchoolInput>({
  entityType: 'schools',
  serverActions: schoolActions,
  relatedEntityTypes: ['staff', 'visits']
});

// 3. Resource hooks with domain terminology
const resourceHooks = createResourceHooks<School, SchoolInput>({
  resourceType: 'schools', // Domain-specific terminology
  serverActions: schoolActions,
  relatedResourceTypes: ['staff', 'visits']
});
```

### CRUD Hook Factory

The base factory produces a complete set of hooks for CRUD operations:

```typescript
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

[RULE] Choose the appropriate factory level based on your needs.

</section>

<section id="query-keys">

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

[RULE] Use query key factories for consistent cache management.

</section>

<section id="cache-sync-system">

## Cache Synchronization System

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

[RULE] Use appropriate cache sync utilities based on the context.

</section>

<section id="selector-system">

## Selector System

The selector system transforms API responses consistently:

```typescript
// Register a selector
registerEntitySelector<School, SchoolTransformed>('schools', (data) => {
  return data.items.map(school => ({
    ...school,
    fullName: `${school.district} - ${school.schoolName}`,
    hasStaff: school.staffList.length > 0,
    formattedCreatedAt: formatDate(school.createdAt)
  }));
});

// Get and use the selector
const schoolSelector = getEntitySelector<School, SchoolTransformed>('schools');
const transformedData = schoolSelector(apiResponse);
```

[RULE] Register selectors for all entity types for consistent data transformation.

</section>

<section id="response-types">

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

// Create selectors
const schoolsSelector = collectionSelector<School, SchoolDTO>(transformSchool);
```

[RULE] Use these utilities for consistent API response handling.

</section>

<section id="hydration-system">

## Hydration System

Utilities for server-side rendering support:

```typescript
// Server: Prefetch and dehydrate
async function MyPage() {
  const queryClient = new QueryClient();
  
  await prefetchQueries(queryClient, [
    { queryKey: queryKeys.schools.list(), queryFn: fetchSchools }
  ]);
  
  const dehydratedState = dehydrateClient(queryClient);
  
  // Pass to client...
}

// Client: Hydrate from server data
export function Providers({ children }) {
  hydrateQueryClient(); // Automatic hydration
  return <QueryProvider>{children}</QueryProvider>;
}
```

[RULE] Use hydration utilities for SSR scenarios.

</section>

<section id="primitive-hooks">

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

[RULE] Use primitive hooks as building blocks for domain hooks.

</section>

<section id="error-handling">

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

[RULE] Use standardized error handling for all queries and mutations.

</section>

<section id="centralized-client">

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

[RULE] Import the centralized client instead of creating instances.

</section>

<section id="query-initialization">

## Query System Initialization

Centralized initialization system:

```typescript
export function initializeQuerySystem(): boolean {
  if (isInitialized) return true;
  
  try {
    // Register standard selectors
    registerStandardSelectors();
    
    // Additional initialization...
    
    isInitialized = true;
    return true;
  } catch (error) {
    captureError(error, /* context */);
    return false;
  }
}
```

[RULE] Use initialization system to set up query configurations.

</section>

<section id="domain-hooks">

## Domain-Specific Hooks

Built using the factory system:

### Entity-Specific Hooks

```typescript
// Create hooks factory for schools
export const schoolHooks = createEntityHooks<School, SchoolInput>({
  entityType: 'schools',
  serverActions: schoolActions,
  // Configuration...
});

// Export convenient hooks
export const useSchools = schoolHooks.useList;
export const useSchoolById = schoolHooks.useById;
export const useSchoolMutations = schoolHooks.useMutations;
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

[RULE] Use domain hooks to encapsulate business logic for components.

</section>

<section id="feature-flag-integration">

## Feature Flag Integration

For gradual migration from SWR to React Query:

```typescript
import { useReactQuery } from '@query/utilities/feature-flags';

function useSchoolData() {
  // Check if React Query should be used
  if (useReactQuery('schools')) {
    return useSchoolsRQ(); // React Query implementation
  }
  
  return useSchoolsSWR(); // SWR implementation
}
```

[RULE] Use feature flags for safe migration to React Query.

</section>

<section id="data-integration">

## Data Flow Integration

Our query system integrates with the application's data flow:

```
Zod Schema → Factory Hooks → UI Components
    ↕            ↕              ↕
MongoDB Models ← Server Actions ← Cache Sync
```

### Integration with Server Actions

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
const schoolHooks = createEntityHooks
  z.infer<typeof SchoolZodSchema>,
  z.infer<typeof SchoolInputZodSchema>
>({
  entityType: 'schools',
  serverActions: schoolActions
});
```

[RULE] Use factory hooks as the interface between server and UI.

</section>

</doc>
```
