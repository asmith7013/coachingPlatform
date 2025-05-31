// src/lib/query/core/client.ts
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { handleQueryError } from '@error/handlers/query';

/**
 * Creates a QueryClient with standardized error handling
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Get entity type from first part of query key if available
        const entityType = Array.isArray(query.queryKey) && typeof query.queryKey[0] === 'string'
          ? query.queryKey[0]
          : undefined;
          
        handleQueryError(
          error,
          'query',
          entityType,
          { 
            queryKey: JSON.stringify(query.queryKey),
            queryHash: query.queryHash
          }
        );
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, variables, context, mutation) => {
        // Get entity type from mutation key if available
        const entityType = mutation.options.mutationKey && 
          Array.isArray(mutation.options.mutationKey) && 
          typeof mutation.options.mutationKey[0] === 'string'
            ? mutation.options.mutationKey[0]
            : undefined;
            
        handleQueryError(
          error,
          'mutation',
          entityType,
          { 
            mutationKey: mutation.options.mutationKey 
              ? JSON.stringify(mutation.options.mutationKey)
              : undefined,
            variables: typeof variables === 'object' 
              ? '[Object]' 
              : String(variables)
          }
        );
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
