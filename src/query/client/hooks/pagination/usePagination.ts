// src/query/client/hooks/core/useQueryPagination.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { queryKeys } from '@query/core/keys';
import { usePaginationState } from './usePaginationState';
import { ListQueryResult } from '@core-types/query-factory';
import { QueryParams } from '@core-types/query';
import { PaginatedResponse } from '@core-types/response';
import { BaseDocument } from '@core-types/document';

/**
 * Transformation function type that properly handles the response structure
 */
export type ResponseTransformer<T, R> = (data: PaginatedResponse<T> | undefined) => PaginatedResponse<R>;

export interface PaginatedDataOptions<T extends BaseDocument, R = T> {
  /** Entity type for query key generation */
  entityType: string;
  
  /** Initial query parameters */
  initialParams?: Partial<QueryParams>;
  
  /** Function to fetch paginated data */
  queryFn: (params: QueryParams) => Promise<PaginatedResponse<T>>;
  
  /** Function to transform response data with correct typing */
  transformFn: ResponseTransformer<T, R>;
  
  /** Additional React Query options */
  queryOptions?: Omit<UseQueryOptions<PaginatedResponse<T>, Error, PaginatedResponse<R>>, 'queryKey' | 'queryFn' | 'select'>;
  
  /** Stale time for cache in milliseconds */
  staleTime?: number;
}

/**
 * Base hook for paginated data fetching with filtering and sorting
 * This provides the foundational pagination functionality used by entity-specific hooks
 * 
 * @returns ListQueryResult<R> - Standardized result object that follows the ListQueryResult interface
 */
export function usePagination<T extends BaseDocument, R = T>({
  entityType,
  initialParams = {},
  queryFn,
  transformFn,
  queryOptions = {},
  staleTime = 5 * 60 * 1000, // 5 minutes
}: PaginatedDataOptions<T, R>): ListQueryResult<R> {
  // Shared state management through useQueryState hook
  const { 
    queryParams,
    setPage,
    setPageSize,
    setSearch,
    applyFilters,
    changeSorting
  } = usePaginationState(initialParams);
  
  const { page, limit, sortBy, sortOrder, filters, search } = queryParams;

  // Generate stable query key based on all parameters
  const fullQueryKey = queryKeys.entities.list(entityType, {
    page,
    limit,
    sortBy,
    sortOrder,
    search,
    // Sort filter keys for stable query keys
    filters: Object.keys(filters || {})
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        if (filters) {
          acc[key] = filters[key];
        }
        return acc;
      }, {})
  });

  // Execute the query with proper typing and error handling
  const query = useQuery<PaginatedResponse<T>, Error, PaginatedResponse<R>>({
    queryKey: fullQueryKey,
    queryFn: async () => {
      try {
        return await queryFn(queryParams);
      } catch (error) {
        throw error instanceof Error 
          ? error 
          : new Error(`Fetch ${entityType} list failed: ${String(error)}`);
      }
    },
    select: transformFn, // Apply the transformer function
    staleTime,
    ...queryOptions,
  });

  const { data, isLoading, error, refetch } = query;

  // Extract data with safe fallbacks for null/undefined values
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? Math.ceil(total / limit);
  const hasNextPage = (data?.page ?? page) < totalPages;

  // Create and return a result object that explicitly follows the ListQueryResult interface
  const result: ListQueryResult<R> = {
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
  
  return result;
}