// src/lib/query/core/client.ts
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { captureError, classifyError } from '@error';

/**
 * Creates a QueryClient with standardized error handling
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        captureError(error, {
          component: 'ReactQuery',
          operation: 'query',
          category: classifyError(error).category,
          metadata: { 
            queryKey: JSON.stringify(query.queryKey)
          }
        });
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, variables, context, mutation) => {
        captureError(error, {
          component: 'ReactQuery',
          operation: 'mutation',
          category: classifyError(error).category,
          metadata: { 
            mutationKey: mutation.options.mutationKey 
              ? JSON.stringify(mutation.options.mutationKey)
              : undefined,
            variables: typeof variables === 'object' ? '[Object]' : String(variables)
          }
        });
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
      },
    },
  });
}

// Global instance for use outside of React components
export const queryClient = createQueryClient();

/**
 * Get the global QueryClient instance
 * @deprecated Import queryClient directly instead
 */
export function getGlobalQueryClient(): QueryClient {
  return queryClient;
}