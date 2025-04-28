/**
 * Base pagination options for DB queries
 */
export interface PaginationOptions {
  /** Page number (1-based) */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Field to sort by */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: "asc" | "desc";
}

/**
 * Query parameters for fetching data
 */
export interface FetchParams {
  /** Page number (1-based) */
  page?: number;
  /** Number of items per page */
  limit?: number;
  /** Field to sort by */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: "asc" | "desc";
  /** Filter criteria */
  filters?: Record<string, unknown>;
  /** Fields to search in */
  searchFields?: string[];
  /** Search term */
  search?: string;
}

/**
 * Default pagination and filter parameters
 */
export const DEFAULT_FETCH_PARAMS: Required<Pick<FetchParams, 'page' | 'limit'>> = {
  page: 1,
  limit: 20
};

/**
 * Get default fetch params with optional overrides
 */
export function getDefaultFetchParams(
  params: Partial<FetchParams> = {}
): Required<Pick<FetchParams, 'page' | 'limit'>> & Omit<FetchParams, 'page' | 'limit'> {
  return {
    ...DEFAULT_FETCH_PARAMS,
    ...params,
    page: Math.max(1, params.page ?? DEFAULT_FETCH_PARAMS.page),
    limit: Math.max(1, params.limit ?? DEFAULT_FETCH_PARAMS.limit)
  };
}