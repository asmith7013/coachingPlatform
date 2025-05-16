```markdown
<doc id="react-query-patterns">

# React Query Patterns

<section id="rq-overview">

## Overview

Our application uses React Query for server state management with a consistent pattern-based approach. This ensures predictable data fetching, efficient caching, and optimized state management.

[RULE] Use React Query for all server state management.

</section>

<section id="query-foundation">

## Foundation Components

The React Query foundation consists of several key utilities that provide a consistent approach:

### Query Key Factory

The query key factory provides type-safe query keys for consistent cache management:

```typescript
// Core query keys structure
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
  // Domain-specific keys
  schools: queryKeys.entities.forEntity<{ district?: string }>('schools'),
  staff: queryKeys.entities.forEntity<{ role?: string }>('staff'),
};

// Usage examples
const schoolList = queryKeys.schools.list({ district: 'D9' });
const staffDetail = queryKeys.staff.detail('staff-123');
```

### Cache Invalidation

For consistent cache management, use the invalidation utilities:

```typescript
import { useInvalidation } from '@/lib/query/utilities/invalidation';

// In a component or hook
const { invalidateEntity, invalidateList } = useInvalidation();

// After a mutation
await invalidateEntity('schools', schoolId);
```

### Error Handling

Error handling utilities ensure consistent error management:

```typescript
import { handleQueryError, useQueryErrorHandler } from '@/lib/query/utilities/errorHandling';

// In query functions
const data = await handleQueryError(fetchData(), 'SchoolQuery');

// In components
useQueryErrorHandler(error, isError, 'SchoolComponent');
```

[RULE] Always use the foundation components to ensure consistent patterns across the application.

</section>

<section id="primitive-hooks-pattern">

## Primitive Hooks Pattern

The primitive hooks pattern creates focused hooks for single API operations:

```typescript
export function useSchools() {
  return useQuery({
    queryKey: queryKeys.schools.list(),
    queryFn: async () => {
      const response = await fetch('/api/schools');
      if (!response.ok) throw new Error('Failed to fetch schools');
      return await response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

Primitive hooks:
- Handle single API operations
- Return React Query result objects directly
- Use query keys from our factory
- Include appropriate cache settings

[RULE] Create primitive hooks for each API operation.

</section>

<section id="composition-pattern">

## Composition Pattern

Complex operations use composition of primitive hooks:

```typescript
export function useDashboardData() {
  const schoolsQuery = useSchools();
  const visitsQuery = useVisits();
  
  const isLoading = schoolsQuery.isLoading || visitsQuery.isLoading;
  const error = schoolsQuery.error || visitsQuery.error;
  
  const dashboardData = useMemo(() => {
    if (!schoolsQuery.data || !visitsQuery.data) return null;
    
    return {
      schools: schoolsQuery.data,
      visits: visitsQuery.data,
      // Derived data...
    };
  }, [schoolsQuery.data, visitsQuery.data]);
  
  return { data: dashboardData, isLoading, error, refetch: /* ... */ };
}
```

[RULE] Compose primitive hooks rather than duplicating logic.

</section>

<section id="mutation-patterns">

## Mutation Patterns

Server mutations follow consistent patterns:

```typescript
export function useCreateSchool() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newSchool) => {
      const response = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchool),
      });
      
      if (!response.ok) throw new Error('Failed to create school');
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schools.list() });
    },
  });
}
```

For optimistic updates, use the optimistic mutation utility:

```typescript
import { useOptimisticMutation } from '@/hooks/query/useOptimisticMutationRQ';

const { mutate } = useOptimisticMutation(
  updateSchool,
  {
    invalidateQueries: [queryKeys.schools.list()],
    onMutate: async (newData) => {
      // Optimistic update logic
    }
  }
);
```

[RULE] Include proper cache invalidation in mutations.

</section>

<section id="pagination-pattern">

## Pagination Pattern

For paginated resources, use the `usePaginatedQuery` hook:

```typescript
function SchoolList() {
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    sortBy: 'schoolName',
    sortOrder: 'asc' as const
  });
  
  const { 
    items: schools, 
    isLoading,
    pagination
  } = usePaginatedQuery({
    entityType: 'schools',
    params,
    fetcher: fetchSchools
  });
  
  // Component implementation...
}
```

[RULE] Use the pagination hook for all paginated API resources.

</section>

<section id="error-handling">

## Error Handling

React Query hooks implement consistent error handling:

```typescript
export function useResource() {
  return useQuery({
    queryKey: queryKeys.entities.list('resource'),
    queryFn: async () => {
      try {
        // Implementation...
      } catch (error) {
        throw error instanceof Error 
          ? error 
          : new Error(handleClientError(error, 'Resource Fetch'));
      }
    },
  });
}
```

For mutations, use the `useErrorHandledMutation` utility:

```typescript
export function useResourceMutation() {
  return useErrorHandledMutation(
    async (data) => {
      // Implementation...
    },
    {
      errorContext: "ResourceOperation",
      defaultErrorMessage: "Failed to update resource"
    }
  );
}
```

[RULE] Use standardized error handling across all query and mutation hooks.

</section>

<section id="cache-configuration">

## Cache Configuration

Configure caching behavior appropriately:

```typescript
// Frequently changing data
staleTime: 30 * 1000, // 30 seconds
refetchInterval: 60 * 1000, // Refetch every minute

// Rarely changing data
staleTime: 24 * 60 * 60 * 1000, // 24 hours
```

[RULE] Configure cache settings based on data volatility.

</section>

<section id="feature-flag-integration">

## Feature Flag Integration

To facilitate gradual migration from SWR to React Query, use the feature flag system:

```typescript
import { useReactQuery } from '@/lib/query/utilities/feature-flags';

function useSchoolData() {
  // Check if React Query should be used for schools
  if (useReactQuery('schools')) {
    // Use React Query implementation
    return useSchoolsRQ();
  }
  
  // Fall back to SWR implementation
  return useSchoolsSWR();
}
```

This approach allows for progressive migration, A/B testing, quick rollback if issues are discovered, and a smooth transition for users.

[RULE] Use feature flags to safely migrate from SWR to React Query.

</section>

</doc>
```