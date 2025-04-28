// src/lib/types/core/api.ts
/**
 * Standardized parameters for data fetching operations across the application
 * Used for pagination, filtering, sorting, and searching
 */
export interface FetchParams {
  /** Current page number (1-based indexing) */
  page?: number;
  
  /** Number of items per page */
  limit?: number;
  
  /** Record of filters to apply to the query (preferred naming) */
  filters?: Record<string, unknown>;
  
  /** Record of filters to apply to the query (legacy naming) */
  filter?: Record<string, unknown>;
  
  /** Field to sort results by */
  sortBy?: string;
  
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
  
  /** Search query string */
  search?: string;
  
  /** Fields to search within */
  searchFields?: string[];
}

/**
* Default values for fetch parameters
*/
export const DEFAULT_FETCH_PARAMS = {
  page: 1,
  limit: 10,
  filters: {},
  filter: {},  // Include both for backward compatibility
  sortBy: 'createdAt',
  sortOrder: 'desc' as const,
};

/**
* Get default fetch params with optional overrides
*/
export function getDefaultFetchParams(
  params: Partial<FetchParams> = {}
): Required<Pick<FetchParams, 'page' | 'limit' | 'filters' | 'filter' | 'sortBy' | 'sortOrder'>> & 
 Pick<FetchParams, 'search' | 'searchFields'> {
  const { 
      page = DEFAULT_FETCH_PARAMS.page,
      limit = DEFAULT_FETCH_PARAMS.limit,
      filters = DEFAULT_FETCH_PARAMS.filters,
      filter = DEFAULT_FETCH_PARAMS.filter,
      sortBy = DEFAULT_FETCH_PARAMS.sortBy,
      sortOrder = DEFAULT_FETCH_PARAMS.sortOrder,
      search,
      searchFields
  } = params;

  // Prevent using sort directions as sortBy values
  const invalidSortByValues = ['asc', 'desc', 'ascending', 'descending'];
  const safeSortBy = invalidSortByValues.includes(sortBy?.toLowerCase() || '')
      ? 'createdAt' // Safe default if someone mistakenly uses a sort direction
      : sortBy;

  // Consolidate filters - prefer filter if both are provided for backward compatibility
  const combinedFilters = filter && Object.keys(filter).length > 0 ? filter : filters;

  return {
      page,
      limit,
      filters: combinedFilters,
      filter: combinedFilters,  // Keep both in sync
      sortBy: safeSortBy,
      sortOrder,
      search,
      searchFields
  };
}