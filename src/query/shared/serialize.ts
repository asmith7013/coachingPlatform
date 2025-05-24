import { dehydrate, hydrate, QueryClient } from '@tanstack/react-query';
import { captureError, createErrorContext } from '@error';

/**
 * Core serialization utilities shared between client and server code
 */

/**
 * Creates a dehydrated state from a query client
 * @param client The query client to dehydrate
 * @returns The dehydrated state as a serializable object
 */
export function dehydrateState(client: QueryClient): unknown {
  try {
    return dehydrate(client);
  } catch (error) {
    captureError(error, createErrorContext('QuerySerialization', 'dehydrateState'));
    throw error;
  }
}

/**
 * Hydrates a query client with previously dehydrated state
 * @param client The query client to hydrate
 * @param dehydratedState The dehydrated state to hydrate with
 */
export function hydrateState(client: QueryClient, dehydratedState: unknown): void {
  try {
    hydrate(client, dehydratedState);
  } catch (error) {
    captureError(error, createErrorContext('QuerySerialization', 'hydrateState'));
    throw error;
  }
}

/**
 * Prepares multiple queries for prefetching
 * @param client The query client to use
 * @param queries List of queries to prefetch
 * @returns A promise that resolves when all queries are prefetched
 */
export async function prefetchMultipleQueries(
  client: QueryClient,
  queries: Array<{
    queryKey: unknown[];
    queryFn: () => Promise<unknown>;
  }>
): Promise<void> {
  try {
    await Promise.all(
      queries.map(({ queryKey, queryFn }) =>
        client.prefetchQuery({
          queryKey,
          queryFn,
        })
      )
    );
  } catch (error) {
    captureError(error, createErrorContext('QuerySerialization', 'prefetchMultipleQueries'));
    throw error;
  }
} 