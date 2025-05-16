
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

<section id="centralized-query-client">


## Centralized Query Client Management

Our application maintains a centralized query client management system to ensure consistent configuration and prevent subtle bugs from mismatched client settings.

```typescript
// src/lib/query/client.ts
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { captureError, createErrorContext } from '@/lib/error';

// Create and export a singleton query client
export function createQueryClientWithErrorHandling(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
        refetchOnWindowFocus: process.env.NODE_ENV === 'production',
      },
    },
    queryCache: new QueryCache({
      onError: (error) => {
        captureError(error, createErrorContext('ReactQuery', 'query'));
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        captureError(error, createErrorContext('ReactQuery', 'mutation'));
      },
    }),
  });
}

// Export a singleton instance
export const queryClient = createQueryClientWithErrorHandling();
```

The query client is provided to the application through a dedicated provider:

```typescript
// src/providers/query-provider.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/query/client';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV !== 'production' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}
```

This centralized approach ensures consistent configuration across the application and prevents subtle bugs that could arise from multiple client instances with mismatched settings.

[RULE] Always import the query client from the centralized source rather than creating new instances.

</section>

<section id="query-initialization-pattern">

## Query System Initialization Pattern

Our application implements a separation of concerns pattern for initializing the React Query system, keeping provider components focused on their primary responsibility.

```typescript
// src/lib/query/initialization.ts
import { registerStandardSelectors } from './selectors/common-selectors';

/**
 * Initialization state tracking
 */
let isInitialized = false;

/**
 * Initialize all query-related configurations
 */
export function initializeQuerySystem(): boolean {
  // Skip if already initialized
  if (isInitialized) {
    return true;
  }
  
  try {
    // Register standard selectors
    registerStandardSelectors();
    
    // Mark as initialized
    isInitialized = true;
    return true;
  } catch (error) {
    // Error handling
    return false;
  }
}
```

This initialization module is called during the provider's mount phase:

```typescript
// src/lib/query/provider.tsx
import { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { initializeQuerySystem } from './initialization';

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => createQueryClientWithErrorHandling());
  
  // Initialize query system once when provider mounts
  useEffect(() => {
    initializeQuerySystem();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV !== 'production' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}
```

### Benefits of the Initialization Pattern

This pattern provides several key benefits:

- **Separation of Concerns**: The provider focuses solely on providing the React Query context
- **Testability**: Each module can be tested independently
- **Maintainability**: Initialization logic can evolve separately from the provider
- **Reusability**: Initialization can be called from different contexts if needed
- **Resilience**: Error handling is isolated, preventing provider failures

### Common Initialization Tasks

The query system initialization typically handles:

- Registration of entity selectors for data transformation
- Setup of standardized response processors
- Initialization of persistence adapters (if used)
- Configuration of global error handlers
- Registration of default query configurations

[RULE] Always separate initialization logic from provider components to maintain clean separation of concerns.

</section>


<section id="cache-synchronization">


## Cache Synchronization Layer

Our application implements a structured cache synchronization layer that ensures React Query's cache stays in sync with server-side changes, particularly for operations happening outside React Query's direct control.

```typescript
import { queryClient } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";

export const cacheSyncService = {
  synchronize: (
    entityType: string, 
    operation: 'create' | 'update' | 'delete',
    ids?: string[]
  ) => {
    // Always invalidate the list queries for this entity
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.entities.list(entityType)
    });
    
    // For update/delete operations with specific IDs, also invalidate detail queries
    if (ids && (operation === 'update' || operation === 'delete')) {
      ids.forEach(id => {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.entities.detail(entityType, id)
        });
      });
    }
  }
};
```

This synchronization system integrates with server actions to ensure data consistency:

```typescript
// In server action
export async function updateSchool(id: string, data: unknown) {
  "use server";
  
  try {
    const result = await SchoolModel.findByIdAndUpdate(id, data, { new: true });
    // Synchronize the cache on the client
    await syncCache('schools', 'update', [id]);
    return { success: true, data: result };
  } catch (error) {
    // Error handling...
  }
}
```

[RULE] Always use the cache synchronization layer when performing server operations that modify data.

</section>

<section id="standardized-selector-registry">


## Standardized Selector Implementation

Our application implements a standardized selector registry that automatically transforms API responses based on entity type, creating consistent data structures throughout the application.

```typescript
// src/lib/query/selectors/registry.ts
import { EntityTypes } from '@/lib/types/core/entity-types';
import { transformSchool } from './transforms/school';
import { transformVisit } from './transforms/visit';
import { transformCoachingLog } from './transforms/coaching-log';

// Registry of selector functions by entity type
export const selectorRegistry = {
  [EntityTypes.SCHOOL]: transformSchool,
  [EntityTypes.VISIT]: transformVisit,
  [EntityTypes.COACHING_LOG]: transformCoachingLog,
  // Additional entity transformers...
};

// Utility to get a selector for a specific entity type
export function getSelector<T, R = T>(entityType: EntityTypes) {
  return selectorRegistry[entityType] as (data: T) => R;
}
```

Each entity has a standardized transformation function:

```typescript
// src/lib/query/selectors/transforms/visit.ts
import { Visit, VisitTransformed } from '@/lib/types/domain/visit';
import { formatDate } from '@/lib/utils/date';

export function transformVisit(visit: Visit): VisitTransformed {
  if (!visit) return null;
  
  return {
    ...visit,
    // Add computed properties
    formattedDate: formatDate(visit.date),
    isComplete: Boolean(visit.coachingLog),
    // Transform nested objects
    events: visit.events?.map(event => ({
      ...event,
      formattedDuration: `${event.duration} minutes`,
    })) || [],
  };
}
```

Selectors are automatically applied in data hooks:

```typescript
// src/hooks/domain/useVisits.ts
export function useVisits() {
  // Get the appropriate selector
  const visitSelector = getSelector(EntityTypes.VISIT);
  
  return useQuery({
    queryKey: queryKeys.entities.list('visits'),
    queryFn: fetchVisits,
    // Apply the selector to transform the data
    select: (data) => ({
      ...data,
      items: data.items.map(visitSelector),
    }),
  });
}
```

This standardized selector approach creates consistent data structures throughout the application, centralizes transformation logic, and simplifies component development by providing pre-processed data.

[RULE] Use the selector registry for all entity transformations to ensure consistent data structures.

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