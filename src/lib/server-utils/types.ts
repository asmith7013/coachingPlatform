/**
 * Base pagination options for DB queries
 */
export interface BasePaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Common resource response type for useResourceManager
 */
export interface ResourceResponse<T> {
  items: T[];
  total: number;
  empty: boolean;
}

/**
 * Common paginated result type
 */
export interface PaginatedResult<T> extends ResourceResponse<T> {
  page: number;
  limit: number;
} 