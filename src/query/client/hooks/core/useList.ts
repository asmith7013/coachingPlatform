import { useMemo } from 'react';
import { ZodSchema } from 'zod';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { queryKeys } from '@query/core/keys';
import { getSelector } from '@query/client/selectors/selector-registry';

import { ReactQueryHookConfig, ListQueryResult, createQueryErrorContext } from '@core-types/query-factory';
import { CollectionResponse } from '@core-types/response';
import { PaginatedResponse } from '@core-types/pagination';
import { QueryParams } from '@core-types/query';
import { BaseDocument } from '@core-types/document';

import { isCollectionResponse, isPaginatedResponse, extractItems, extractPagination } from '@/lib/data-utilities/transformers/utils/response-utils';
import { transformItemsWithSchema } from '@/lib/data-utilities/transformers/utils/transform-helpers';
import { useFiltersAndSorting } from '@hooks/ui/useFiltersAndSorting';
import { logError } from "@error/core/logging"; 



/**
 * Enhanced configuration for useList hook
 */
export interface UseListConfig<T extends BaseDocument> extends Omit<ReactQueryHookConfig, 'queryOptions'> {
  /** Function to fetch entities */
  fetcher: (params: QueryParams) => Promise<CollectionResponse<T> | PaginatedResponse<T>>;
  
  /** Zod schema for validation and transformation */
  schema: ZodSchema<T>;
  
  /** Whether to use the selector system instead of direct schema validation */
  useSelector?: boolean;
  
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
 * This is the unified implementation that supports both direct schema validation
 * and the selector system for data transformation.
 */
export function useList<T extends BaseDocument>(config: UseListConfig<T>): ListQueryResult<T> {
  const {
    entityType,
    fetcher,
    schema,
    useSelector = false,
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
        if (!isCollectionResponse(response)) {
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
    select: (data) => {
      if (!data?.items) return data;
      
      try {
        // Choose transformation strategy based on useSelector flag
        if (useSelector) {
          // Use selector system for transformation
          const selector = getSelector<T>(entityType, schema);
          return {
            ...data,
            items: selector.basic(data)
          };
        } else {
          // Use direct schema transformation
          const transformedItems = transformItemsWithSchema(data.items, schema);
          return {
            ...data,
            items: transformedItems
          };
        }
      } catch (error) {
        console.error('Error transforming list data:', error);
        return data; // Fallback to original data
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
    
    if (isPaginatedResponse(query.data)) {
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
    queryParams,
    
    // Include the raw query for advanced use cases
    query
  };
}