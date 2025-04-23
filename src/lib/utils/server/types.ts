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
  page: number;
  limit: number;
  success: boolean;
  message?: string;
}

/**
 * Common paginated result type
 */
export interface PaginatedResult<T> extends ResourceResponse<T> {
  page: number;
  limit: number;
}

export interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: Record<string, unknown>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export const getDefaultFetchParams = (): FetchParams => ({
  page: 1,
  limit: 10,
  search: '',
  filters: {},
  sort: {
    field: 'createdAt',
    direction: 'desc'
  }
}); 