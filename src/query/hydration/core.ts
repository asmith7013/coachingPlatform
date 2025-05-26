import { QueryClient } from '@tanstack/react-query';
import { 
  dehydrateState, 
  hydrateState, 
  prefetchMultipleQueries 
} from '@/query/shared-utils/hydration-utils';
import { captureError, createErrorContext } from '@error';
import { CollectionResponse } from '@core-types/response';

/**
 * Core hydration primitives for React Query
 * Providing Next.js-specific serialization on top of shared utilities
 */

/**
 * Prepares queries for server-side rendering in Next.js
 * @param client The query client to use
 * @param queries List of queries to prefetch
 */
export async function prefetchQueriesForSSR(
  client: QueryClient,
  queries: Array<{
    queryKey: unknown[];
    queryFn: () => Promise<unknown>;
  }>
): Promise<void> {
  return prefetchMultipleQueries(client, queries);
}

/**
 * Dehydrates a query client for serialization in Next.js
 * Returns a string representation for Next.js props
 */
export function dehydrateClientToString(client: QueryClient): string {
  try {
    return JSON.stringify(dehydrateState(client));
  } catch (error) {
    captureError(
      error, 
      createErrorContext('QueryHydration', 'dehydrateClientToString')
    );
    // Return empty state on error to prevent crashes
    return '{}';
  }
}

/**
 * Hydrates a query client from a string in Next.js
 */
export function hydrateClientFromString(client: QueryClient, serializedState: string): void {
  try {
    const parsedState = JSON.parse(serializedState);
    hydrateState(client, parsedState);
  } catch (error) {
    captureError(
      error, 
      createErrorContext('QueryHydration', 'hydrateClientFromString')
    );
    // Error already captured, don't throw to prevent crashes
  }
}

/**
 * Prefetches data for an entity and stores in query cache
 */
export async function prefetchEntityData<T>(
  client: QueryClient,
  entityType: string,
  fetchFn: (params: Record<string, unknown>) => Promise<CollectionResponse<T>>,
  params: Record<string, unknown> = {}
): Promise<void> {
  try {
    const data = await fetchFn(params);
    client.setQueryData([entityType, 'list', params], data);
  } catch (error) {
    captureError(
      error, 
      createErrorContext('QueryHydration', 'prefetchEntityData', {
        metadata: { entityType, params }
      })
    );
    // Don't throw - we want to continue with other prefetches even if one fails
  }
}

// Add Next.js type extension
declare module 'next' {
  interface PageProps {
    dehydratedState?: unknown;
  }
} 