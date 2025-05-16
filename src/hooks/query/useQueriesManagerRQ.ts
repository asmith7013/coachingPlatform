import { useQueries, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/query-keys';
import { handleClientError } from '@/lib/error';
import { StandardResponse } from '@core-types/response';

export interface QueryConfig<T> {
  /** Query key for the main entity */
  queryKey: unknown[];
  
  /** Function to fetch the main entity */
  queryFn: () => Promise<StandardResponse<T>>;
  
  /** Related queries to fetch */
  relatedQueries?: Array<{
    /** Query key for the related entity */
    queryKey: unknown[];
    
    /** Function to fetch the related entity */
    queryFn: () => Promise<StandardResponse<unknown>>;
    
    /** Whether this query is enabled */
    enabled?: boolean;
  }>;
  
  /** Error context for error reporting */
  errorContext?: string;
}

/**
 * Hook for managing multiple related queries with React Query
 */
export function useQueriesManagerRQ<T>({
  queryKey,
  queryFn,
  relatedQueries = [],
  errorContext = 'entity'
}: QueryConfig<T>) {
  const queryClient = useQueryClient();
  
  // Combine main query with related queries
  const queries = useQueries({
    queries: [
      {
        queryKey,
        queryFn: async () => {
          try {
            return await queryFn();
          } catch (error) {
            throw error instanceof Error
              ? error
              : new Error(handleClientError(error, `Fetch ${errorContext}`));
          }
        }
      },
      ...relatedQueries.map(query => ({
        queryKey: query.queryKey,
        queryFn: async () => {
          try {
            return await query.queryFn();
          } catch (error) {
            throw error instanceof Error
              ? error
              : new Error(handleClientError(error, `Fetch related ${errorContext}`));
          }
        },
        enabled: query.enabled
      }))
    ]
  });
  
  // Extract main query result
  const [mainQuery, ...relatedResults] = queries;
  
  // Check if any query is loading
  const isLoading = queries.some(query => query.isLoading);
  
  // Check if any query has an error
  const error = queries.find(query => query.error)?.error;
  
  // Function to invalidate all queries
  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey });
    relatedQueries.forEach(query => {
      queryClient.invalidateQueries({ queryKey: query.queryKey });
    });
  };
  
  return {
    // Main query data
    data: mainQuery.data?.items?.[0] as T | undefined,
    
    // Related query data
    relatedData: relatedResults.map(result => result.data?.items),
    
    // Loading and error states
    isLoading,
    error,
    
    // Query invalidation
    invalidateQueries,
    
    // Individual query results
    queries
  };
} 