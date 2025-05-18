import type { QueryBase } from './base-types';
import { DEFAULT_PAGINATION_PARAMS } from './pagination';

/**
 * Extended query parameters including filtering and search
 */
export interface QueryParams extends QueryBase {
  /** Record of filters to apply to the query */
  filters?: Record<string, unknown>;
  /** Legacy filter property (deprecated) */
  filter?: Record<string, unknown>;
  /** Search query string */
  search?: string;
  /** Fields to search within */
  searchFields?: string[];
  /** Additional implementation-specific options */
  options?: Record<string, unknown>;
}

/**
 * Default values for query parameters
 */
export const DEFAULT_QUERY_PARAMS: Required<Omit<QueryParams, 'filter'>> & { filter: Record<string, unknown> } = {
  ...DEFAULT_PAGINATION_PARAMS,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  filters: {},
  filter: {},
  search: '',
  searchFields: [],
  options: {}
};

/**
 * Creates query parameters with defaults and safety features
 */
export function buildQueryParams(
  params: Partial<QueryParams> = {}
): QueryParams & {
  page: number;
  limit: number;
  filters: Record<string, unknown>;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
} {
  // Destructure with defaults
  const {
    page = DEFAULT_PAGINATION_PARAMS.page,
    limit = DEFAULT_PAGINATION_PARAMS.limit,
    filters = {},
    filter,
    sortBy: rawSortBy = DEFAULT_QUERY_PARAMS.sortBy,
    sortOrder = DEFAULT_QUERY_PARAMS.sortOrder,
    search,
    searchFields,
    options
  } = params;

  // Prevent sort directions as sortBy values
  const invalidSortByValues = ['asc', 'desc', 'ascending', 'descending'];
  const safeSortBy = invalidSortByValues.includes(String(rawSortBy).toLowerCase())
    ? DEFAULT_QUERY_PARAMS.sortBy
    : rawSortBy;

  // Consolidate filters - prefer filter if both are provided for backward compatibility
  const consolidatedFilters = filter && Object.keys(filter).length > 0 ? filter : filters;

  return {
    page,
    limit,
    filters: consolidatedFilters,
    filter: consolidatedFilters,  // Legacy support
    sortBy: safeSortBy,
    sortOrder,
    search,
    searchFields,
    options
  };
}

/**
 * Create MongoDB query options from query parameters
 */
export function createMongoDBQueryOptions(params: Required<QueryParams>): {
  skip: number;
  limit: number;
  sort: Record<string, 1 | -1>;
  filter: Record<string, unknown>;
} {
  const { page, limit, sortBy, sortOrder, filters } = params;
  
  return {
    skip: (page - 1) * limit, // Calculate skip
    limit,
    sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 },
    filter: filters
  };
}

// Backwards compatibility
/** @deprecated Use QueryParams instead */
export type FetchParams = QueryParams;
/** @deprecated Use QueryParams instead */
export type QueryParameters = QueryParams;
/** @deprecated Use DEFAULT_QUERY_PARAMS instead */
export const DEFAULT_FETCH_PARAMS = DEFAULT_QUERY_PARAMS;
/** @deprecated Use buildQueryParams instead */
export const createQueryParams = buildQueryParams;
/** @deprecated Use buildQueryParams instead */
export const getDefaultFetchParams = buildQueryParams;