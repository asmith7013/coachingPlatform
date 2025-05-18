import { useMemo } from 'react';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { queryKeys } from '@query/core/keys';
import { 
  ReactQueryHookConfig, 
  PaginationQueryParams,
  ListQueryResult,
  createQueryErrorContext
} from '@core-types/query-factory';
import { 
  extractItems, 
  extractPagination,
  isCollectionResponse,
  isPaginatedResponse 
} from '@query/utilities/response-types';
import { useFiltersAndSorting } from '@hooks/ui/useFiltersAndSorting';
import { logError } from '@/lib/error';
import { CollectionResponse, PaginatedResponse } from '@core-types/response';

/**
 * Configuration for useList hook
 */
export interface UseListConfig<T> extends Omit<ReactQueryHookConfig, 'queryOptions'> {
  /** Function to fetch entities */
  fetcher: (params: PaginationQueryParams) => Promise<CollectionResponse<T> | PaginatedResponse<T>>;
  
  /** Custom query options */
  queryOptions?: Omit<UseQueryOptions<
    CollectionResponse<T> | PaginatedResponse<T>,
    Error,
    CollectionResponse<T> | PaginatedResponse<T>,
    readonly unknown[]
  >, 'queryKey' | 'queryFn'>;
}

/**
 * Hook for fetching and managing a list of entities with filtering and pagination
 */
export function useList<T>(config: UseListConfig<T>): ListQueryResult<T> {
  const {
    entityType,
    fetcher,
    defaultParams = {},
    validSortFields = ['createdAt'],
    persistFilters = true,
    storageKey = `${entityType}_filters`,
    staleTime = 60 * 1000,
    errorContextPrefix = entityType,
    queryOptions = {}
  } = config;
  
  // Setup filters and sorting with useFiltersAndSorting hook
  const filtersAndSorting = useFiltersAndSorting({
    storageKey: persistFilters ? storageKey : undefined,
    defaultFilters: defaultParams.filters || {},
    defaultSortBy: defaultParams.sortBy || 'createdAt',
    defaultSortOrder: (defaultParams.sortOrder as 'asc' | 'desc') || 'desc',
    defaultPage: defaultParams.page || 1,
    defaultPageSize: defaultParams.limit || 10,
    validSortFields,
    persist: persistFilters
  });
  
  // Build query parameters
  const queryParams = useMemo(() => ({
    page: filtersAndSorting.page,
    limit: filtersAndSorting.pageSize,
    sortBy: filtersAndSorting.sortBy,
    sortOrder: filtersAndSorting.sortOrder,
    search: filtersAndSorting.search || undefined,
    filters: filtersAndSorting.filters
  }), [
    filtersAndSorting.page,
    filtersAndSorting.pageSize,
    filtersAndSorting.sortBy,
    filtersAndSorting.sortOrder,
    filtersAndSorting.search,
    filtersAndSorting.filters
  ]);
  
  // Explicitly type the query key to ensure readonly type compatibility
  const queryKey = useMemo(() => {
    return queryKeys.entities.list(entityType, queryParams) as readonly unknown[];
  }, [entityType, queryParams]);
  
  // Use React Query for data fetching
  const query = useQuery<
    CollectionResponse<T> | PaginatedResponse<T>,
    Error, 
    CollectionResponse<T> | PaginatedResponse<T>,
    readonly unknown[]
  >({
    queryKey,
    queryFn: async () => {
      try {
        const response = await fetcher(queryParams);
        // Validate response
        if (!isCollectionResponse<T>(response)) {
          throw new Error(`Invalid response format from ${entityType} fetcher`);
        }
        return response;
      } catch (error) {
        // Create error context for better error reporting
        const errorContext = createQueryErrorContext(
          errorContextPrefix,
          'fetchList',
          { 
            metadata: { queryParams },
            tags: { entityType }
          }
        );
        logError(error as Error, errorContext);
        throw error;
      }
    },
    ...queryOptions,
    // Apply staleTime separately to avoid type conflicts
    staleTime: queryOptions.staleTime ?? staleTime,
  });
  
  // Safe extraction of items and pagination with proper type handling
  const items = useMemo(() => {
    if (!query.data) return [];
    
    // Since extractItems expects a specific type, we need to handle it safely
    try {
      return extractItems<T>(query.data);
    } catch (e) {
      console.error('Error extracting items from response:', e);
      return [];
    }
  }, [query.data]);
  
  // Extract pagination info safely
  const pagination = useMemo(() => {
    if (!query.data) {
      return {
        total: 0,
        page: filtersAndSorting.page,
        limit: filtersAndSorting.pageSize,
        totalPages: 0,
        hasMore: false
      };
    }
    
    if (isPaginatedResponse<T>(query.data)) {
      try {
        return extractPagination(query.data);
      } catch (e) {
        console.error('Error extracting pagination from response:', e);
      }
    }
    
    // Fallback pagination for CollectionResponse (non-paginated)
    return {
      total: query.data.total || 0,
      page: filtersAndSorting.page,
      limit: filtersAndSorting.pageSize,
      totalPages: Math.ceil((query.data.total || 0) / filtersAndSorting.pageSize),
      hasMore: false
    };
  }, [query.data, filtersAndSorting.page, filtersAndSorting.pageSize]);
  
  // Return combined API
  return {
    // Data
    items,
    
    // Pagination
    total: pagination.total,
    page: filtersAndSorting.page,
    pageSize: filtersAndSorting.pageSize,
    totalPages: pagination.totalPages,
    hasMore: pagination.hasMore,
    
    // Filtering and sorting
    filters: filtersAndSorting.filters,
    search: filtersAndSorting.search,
    sortBy: filtersAndSorting.sortBy,
    sortOrder: filtersAndSorting.sortOrder,
    
    // Query state
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    
    // Actions
    setPage: filtersAndSorting.setPage,
    setPageSize: filtersAndSorting.setPageSize,
    setSearch: filtersAndSorting.setSearch,
    applyFilters: filtersAndSorting.applyFilters,
    changeSorting: filtersAndSorting.changeSorting,
    
    // Query parameters for debugging/advanced usage
    queryParams
  };
}