import { useQuery, UseQueryOptions, UseQueryResult, QueryFunction } from '@tanstack/react-query';
import { handleQueryError } from '@error/handlers/query';

/**
 * A specialized query hook that provides consistent error handling
 * 
 * @param queryKey - The query key array
 * @param queryFn - The query function
 * @param options - Optional query options
 * @param context - Optional context for error handling
 */
export function useErrorHandledQuery<TData = unknown, TError = Error>(
  queryKey: unknown[],
  queryFn: QueryFunction<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
  context?: string
): UseQueryResult<TData, TError> {
  // Let QueryClient handle the query error
  const result = useQuery<TData, TError>({
    queryKey,
    queryFn,
    ...options
  });
  
  // For manual error handling outside the QueryClient
  if (result.error && context) {
    const entityType = typeof queryKey[0] === 'string' ? queryKey[0] : undefined;
    handleQueryError(
      result.error,
      'query',
      entityType,
      { 
        context, 
        queryKey: JSON.stringify(queryKey),
        status: result.status,
        fetchStatus: result.fetchStatus
      }
    );
  }
  
  return result;
} 