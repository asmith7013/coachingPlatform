// src/lib/types/core/pagination.ts
import { FetchParams, DEFAULT_FETCH_PARAMS, getDefaultFetchParams } from './api';

// Re-export the core fetch types
export { DEFAULT_FETCH_PARAMS, getDefaultFetchParams };
export { type FetchParams };

/**
 * Base pagination options for DB queries
 */
export interface PaginationOptions {
  /** Page number (1-based) */
  page?: number;
  /** Number of items per page */
  limit?: number;
  /** Field to sort by */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: "asc" | "desc";
}

/**
 * Standard pagination result type that includes success flag
 */
export interface PaginatedResult<T> {
  /** Array of resources */
  items: T[];
  /** Total count of items */
  total: number;
  /** Whether the collection is empty */
  empty: boolean;
  /** Indicates if the operation was successful */
  success: boolean;
  /** Current page number */
  page?: number;
  /** Items per page */
  limit?: number;
  /** Total number of pages */
  totalPages?: number;
}

/**
 * Default pagination options
 */
export const DEFAULT_PAGINATION_OPTIONS: Required<PaginationOptions> = {
  page: DEFAULT_FETCH_PARAMS.page,
  limit: DEFAULT_FETCH_PARAMS.limit,
  sortBy: DEFAULT_FETCH_PARAMS.sortBy,
  sortOrder: DEFAULT_FETCH_PARAMS.sortOrder,
};