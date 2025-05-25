// src/lib/query/hooks/usePaginatedQuery.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { PaginatedResponse } from '@core-types/pagination';
import { queryKeys } from '@query/core/keys';
import { handleClientError } from '@error/handlers/client';
import { isPaginatedResponse } from '@/lib/data-utilities/transformers/utils/response-utils';
import { QueryParams } from '@core-types/query';
import { ZodSchema } from 'zod';
import { transformItemsWithSchema } from '@/lib/data-utilities/transformers/utils/transform-helpers';
import { ListQueryResult } from '@core-types/query-factory';
import { useQueryState } from '@query/client/hooks/core/useQueryState';

export interface UsePaginatedQueryOptions<T> {
  entityType: string;
  params?: QueryParams;
  fetcher: (params: QueryParams) => Promise<PaginatedResponse<T>>;
  schema: ZodSchema<T>;
  options?: Omit<UseQueryOptions<PaginatedResponse<T>, Error>, 'queryKey' | 'queryFn'>;
}

/**
 * Hook for fetching paginated data with filtering, sorting, and full type safety
 * Returns a standardized ListQueryResult interface compatible with other entity hooks
 */
export function usePaginatedQuery<T>({
  entityType,
  params,
  fetcher,
  schema,
  options = {},
}: UsePaginatedQueryOptions<T>): ListQueryResult<T> {
  // Use our shared query state management hook
  const { 
    queryParams,
    setPage,
    setPageSize,
    setSearch,
    applyFilters,
    changeSorting
  } = useQueryState(params);
  
  const { page, limit, sortBy, sortOrder, filters, search } = queryParams;

  // Generate query key based on all parameters
  const fullQueryKey = queryKeys.entities.list(entityType, {
    page,
    limit,
    sortBy,
    sortOrder,
    search,
    filters: Object.keys(filters || {})
      .sort()
      .reduce((acc, key) => ({ ...acc, [key]: (filters || {})[key] }), {}),
  });

  // Execute the query
  const query = useQuery({
    queryKey: fullQueryKey,
    queryFn: async () => {
      try {
        const response = await fetcher(queryParams);
        
        // Ensure we have a valid PaginatedResponse
        if (!isPaginatedResponse<T>(response)) {
          // Convert to paginated response format if needed
          const convertedResponse: PaginatedResponse<T> = {
            items: Array.isArray(response) ? response : 
                   (response && typeof response === 'object' && 'items' in response) ? 
                   (response as PaginatedResponse<T>).items || [] : [],
            total: (response && typeof response === 'object' && 'total' in response) ? 
                   (response as PaginatedResponse<T>).total : 0,
            page,
            limit,
            totalPages: 0,
            hasMore: false,
            success: true,
            empty: false
          };
          
          // Calculate totalPages if not provided
          convertedResponse.totalPages = Math.ceil(convertedResponse.total / limit);
          convertedResponse.hasMore = page < convertedResponse.totalPages;
          convertedResponse.empty = convertedResponse.items.length === 0;
          
          return convertedResponse;
        }
        
        return response;
      } catch (error) {
        throw error instanceof Error 
          ? error 
          : new Error(handleClientError(error, `Fetch ${entityType} list`));
      }
    },
    select: (data) => {
      if (!data?.items) return data;
      
      try {
        // Use the shared helper function for consistency
        const transformedItems = transformItemsWithSchema(data.items, schema);
        
        return {
          ...data,
          items: transformedItems
        };
      } catch (error) {
        console.error('Error transforming paginated data:', error);
        return data; // Fallback to original data
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });

  const { data, isLoading, error, refetch } = query;

  // Extract data or provide defaults
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? Math.ceil(total / limit);
  const hasNextPage = (data?.page ?? page) < totalPages;

  // Return result that conforms to ListQueryResult interface
  return {
    // Data
    items,
    
    // Pagination
    total,
    page: data?.page ?? page,
    pageSize: data?.limit ?? limit,
    totalPages,
    hasMore: hasNextPage,
    
    // Filtering and sorting
    filters: filters || {},
    search: search || '',
    sortBy: sortBy || 'createdAt',
    sortOrder: sortOrder || 'desc',
    
    // Query state
    isLoading,
    isError: !!error,
    error: error as Error | null,
    refetch,
    
    // Actions
    setPage,
    setPageSize,
    setSearch,
    applyFilters,
    changeSorting,
    
    // Query parameters for debugging
    queryParams: queryParams as Record<string, unknown>,
    
    // Raw query for advanced use cases
    query: {
      data,
      isLoading,
      isError: !!error,
      error: error as Error | null,
      refetch
    }
  };
}

