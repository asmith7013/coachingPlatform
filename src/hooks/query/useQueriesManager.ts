import { useQueries, useQueryClient } from '@tanstack/react-query';
import { handleClientError } from '@/lib/error';
import { CollectionResponse, EntityResponse } from '@core-types/response';
import { isEntityResponse, isCollectionResponse } from '@/lib/query/utilities/response-types';

// Response can be either collection or entity
type ResponseType<T> = CollectionResponse<T> | EntityResponse<T>;

export interface QueryConfig<T> {
  /** Query key for the main entity */
  queryKey: unknown[];
  
  /** Function to fetch the main entity */
  queryFn: () => Promise<ResponseType<T>>;
  
  /** Related queries to fetch */
  relatedQueries?: Array<{
    /** Query key for the related entity */
    queryKey: unknown[];
    
    /** Function to fetch the related entity */
    queryFn: () => Promise<ResponseType<unknown>>;
    
    /** Whether this query is enabled */
    enabled?: boolean;
  }>;
  
  /** Error context for error reporting */
  errorContext?: string;
}

/**
 * Extract entity data from a response regardless of format
 */
function extractEntityData<T>(response: ResponseType<T> | undefined): T | undefined {
  if (!response) return undefined;
  
  if (isEntityResponse<T>(response)) {
    return response.data;
  } else if (isCollectionResponse<T>(response)) {
    return response.items[0];
  }
  
  return undefined;
}

/**
 * Extract collection data from a response regardless of format
 */
function extractCollectionData<T>(response: ResponseType<T> | undefined): T[] {
  if (!response) return [];
  
  if (isEntityResponse<T>(response)) {
    return [response.data];
  } else if (isCollectionResponse<T>(response)) {
    return response.items;
  }
  
  return [];
}

/**
 * Hook for managing multiple related queries with React Query
 */
export function useQueriesManager<T>({
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
    // Main query data - works with both EntityResponse and CollectionResponse
    data: extractEntityData<T>(mainQuery.data as ResponseType<T>),
    
    // Also provide raw items for backward compatibility
    items: isCollectionResponse<T>(mainQuery.data as ResponseType<T>) ? (mainQuery.data as CollectionResponse<T>).items : 
           isEntityResponse<T>(mainQuery.data as ResponseType<T>) ? [(mainQuery.data as EntityResponse<T>).data] : [],
    
    // Related query data
    relatedData: relatedResults.map(result => extractCollectionData(result.data)),
    
    // Loading and error states
    isLoading,
    error,
    
    // Query invalidation
    invalidateQueries,
    
    // Individual query results
    queries,
    
    // Full response object for direct access
    response: mainQuery.data
  };
}