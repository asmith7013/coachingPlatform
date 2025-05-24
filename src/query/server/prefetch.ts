/**
 * Server-side prefetching utilities for React Query
 */
import { QueryClient } from '@tanstack/react-query';
import { dehydrateState } from '@query/shared/serialize';
import { 
  prefetchEntityData,
  prefetchQueriesForSSR
} from '@query/hydration/core';
import { createQueryClient } from '@query/core/client';
import { CollectionResponse } from '@core-types/response';
import { captureError, createErrorContext } from '@error';

/**
 * Create a query client for server-side operations
 * Each request should create a new instance
 */
export function createServerQueryClient(): QueryClient {
  return createQueryClient();
}

/**
 * Prefetches data for server rendering and returns the dehydrated state
 * 
 * @param prefetchFunctions Array of async functions that prefetch data
 * @returns The dehydrated state to pass to client components
 * 
 * @example
 * async function Page() {
 *   const state = await prefetchData([
 *     async (queryClient) => {
 *       const data = await fetchSchools();
 *       queryClient.setQueryData(['schools', 'list'], data);
 *     }
 *   ]);
 *   
 *   return (
 *     <HydrationBoundary state={state}>
 *       <ClientComponent />
 *     </HydrationBoundary>
 *   );
 * }
 */
export async function prefetchData(
  prefetchFunctions: Array<(queryClient: QueryClient) => Promise<void>>
): Promise<unknown> {
  const queryClient = createServerQueryClient();
  
  try {
    // Execute all prefetch functions in parallel
    await Promise.all(
      prefetchFunctions.map(fn => fn(queryClient))
    );
    
    // Return the dehydrated state
    return dehydrateState(queryClient);
  } catch (error) {
    captureError(error, createErrorContext('ServerPrefetch', 'prefetchData'));
    throw error;
  } finally {
    // Clean up the query client
    queryClient.clear();
  }
}

/**
 * Prefetches multiple queries and returns the dehydrated state
 * 
 * @param queries Array of query definitions
 * @returns The dehydrated state to pass to client components
 */
export async function prefetchQueries(
  queries: Array<{
    queryKey: unknown[];
    queryFn: () => Promise<unknown>;
  }>
): Promise<unknown> {
  const queryClient = createServerQueryClient();
  
  try {
    // Use the prefetchQueriesForSSR function from hydration
    await prefetchQueriesForSSR(queryClient, queries);
    return dehydrateState(queryClient);
  } catch (error) {
    captureError(error, createErrorContext('ServerPrefetch', 'prefetchQueries'));
    throw error;
  } finally {
    queryClient.clear();
  }
}

/**
 * Prefetches data for a specific entity using the CRUD factory pattern
 * 
 * @param queryClient The server query client
 * @param entityType The type of entity to prefetch
 * @param fetchFn The server action to fetch data
 * @param params Optional query parameters
 */
export async function prefetchEntityList<T>(
  queryClient: QueryClient,
  entityType: string,
  fetchFn: (params: Record<string, unknown>) => Promise<CollectionResponse<T>>,
  params: Record<string, unknown> = {}
): Promise<void> {
  return prefetchEntityData(queryClient, entityType, fetchFn, params);
} 