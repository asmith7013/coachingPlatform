/**
 * Base pagination options for DB queries
 */
export interface BasePaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Extended pagination options with mock data support
 */
export interface MockAwarePaginationOptions extends BasePaginationOptions {
  mockFile?: string;
}

/**
 * Common paginated result type
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
} 