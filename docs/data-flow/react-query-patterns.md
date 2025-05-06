
```markdown
<doc id="react-query-patterns">

# React Query Patterns

<section id="rq-overview">

## Overview

Our application uses React Query for server state management with a consistent pattern-based approach. This ensures predictable data fetching, efficient caching, and optimized state management.

[RULE] Use React Query for all server state management.

</section>

<section id="primitive-hooks-pattern">

## Primitive Hooks Pattern

The primitive hooks pattern creates focused hooks for single API operations:

```typescript
export function useSchools() {
  return useQuery({
    queryKey: queryKeys.entities.list('schools'),
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

<section id="query-key-factory">

## Query Key Factory

All hooks use the centralized query key factory for consistent cache invalidation:

```typescript
export const queryKeys = {
  entities: {
    all: ['entities'] as const,
    lists: () => [...queryKeys.entities.all, 'list'] as const,
    list: (entity: string, filters?: Record<string, unknown>) => 
      [...queryKeys.entities.lists(), entity, { ...(filters || {}) }] as const,
    details: () => [...queryKeys.entities.all, 'detail'] as const,
    detail: (entity: string, id: string) => 
      [...queryKeys.entities.details(), entity, id] as const,
  },
  
  // Domain-specific keys
  monday: {
    all: ['monday'] as const,
    connection: () => [...queryKeys.monday.all, 'connection'] as const,
    // Additional keys...
  },
};
```

This factory ensures consistent cache keys across the application.

[RULE] Always use the query key factory.

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
  
  return {
    data: dashboardData,
    isLoading,
    error,
    refetch: async () => {
      await Promise.all([
        schoolsQuery.refetch(),
        visitsQuery.refetch(),
      ]);
    }
  };
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
      queryClient.invalidateQueries({ queryKey: queryKeys.entities.list('schools') });
    },
  });
}
```

[RULE] Include proper cache invalidation in mutations.

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

</doc>
```
