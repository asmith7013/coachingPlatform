import { dehydrate, hydrate, QueryClient } from '@tanstack/react-query';

/**
 * Prepares a query client for server-side rendering
 * @param client The query client to prepare
 * @param preloadedQueries List of queries to preload
 * @returns A promise that resolves when all queries are prefetched
 */
export async function prefetchQueries(
  client: QueryClient,
  preloadedQueries: Array<{
    queryKey: unknown[];
    queryFn: () => Promise<unknown>;
  }>
): Promise<void> {
  await Promise.all(
    preloadedQueries.map(({ queryKey, queryFn }) =>
      client.prefetchQuery({
        queryKey,
        queryFn,
      })
    )
  );
}

/**
 * Creates a dehydrated state from a query client
 * @param client The query client to dehydrate
 * @returns The dehydrated state as a serializable object
 */
export function dehydrateClient(client: QueryClient): string {
  return JSON.stringify(dehydrate(client));
}

/**
 * Hydrates a query client with previously dehydrated state
 * @param client The query client to hydrate
 * @param dehydratedState The dehydrated state to hydrate with
 */
export function hydrateClient(client: QueryClient, dehydratedState: string): void {
  const parsedState = JSON.parse(dehydratedState);
  hydrate(client, parsedState);
}

/**
 * Hook to hydrate the query client on the client side
 * To be used in app/providers.tsx for Next.js App Router
 * 
 * @example
 * // Create a file at src/app/providers.tsx
 * 'use client'
 * 
 * import { hydrateQueryClient } from '@/lib/query/hydration'
 * import { QueryProvider } from '@/lib/query/provider'
 * 
 * export function Providers({ children }: { children: React.ReactNode }) {
 *   hydrateQueryClient()
 *   return <QueryProvider>{children}</QueryProvider>
 * }
 */
export function hydrateQueryClient(): void {
  if (typeof window !== 'undefined') {
    // Look for the dehydrated state from the server
    const dehydratedState = window.__NEXT_DATA__?.props?.pageProps?.dehydratedState;
    
    if (dehydratedState) {
      const queryClient = new QueryClient();
      hydrate(queryClient, dehydratedState);
    }
  }
}

// Extend Next.js's built-in types
declare module 'next' {
  interface PageProps {
    dehydratedState?: unknown;
  }
} 