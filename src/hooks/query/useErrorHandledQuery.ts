import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { handleClientError } from '@error';
import { captureError, createErrorContext } from '@error';
import { useQueryErrorHandler } from '@query/utilities/error-handling';

/**
 * Hook for queries with standardized error handling
 * For use when more detailed error handling than useEntityQuery is needed
 * 
 * @param queryKey - The React Query cache key
 * @param queryFn - The data fetching function
 * @param errorContext - Context string for error reporting
 * @param options - Additional React Query options
 */
export function useErrorHandledQuery<
  TData,
  TError extends Error = Error,
  TQueryKey extends unknown[] = unknown[]
>(
  queryKey: TQueryKey,
  queryFn: () => Promise<TData>,
  errorContext: string,
  options?: Omit<UseQueryOptions<TData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'>
) {
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        return await queryFn();
      } catch (err) {
        // Format error message using our standard handler
        const errorMessage = handleClientError(err, errorContext);
        
        // Capture error for monitoring
        captureError(err, createErrorContext('Query', errorContext));
        
        // Log error in development
        console.error(`❌ ${errorContext} failed:`, errorMessage);
        
        // Rethrow formatted error
        throw new Error(errorMessage);
      }
    },
    // Default options based on your current SWR configuration
    staleTime: 10000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: 2,
    ...options
  });

  // Use our error handler hook to capture errors
  useQueryErrorHandler(query.error, query.isError, errorContext);

  return query;
} 