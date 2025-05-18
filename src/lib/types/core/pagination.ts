import type { PaginationBase } from './base-types';
import type { CollectionResponse } from './response';

/**
 * Basic pagination parameters
 * Extends PaginationBase to maintain type hierarchy while allowing for future extensions
 */
export interface PaginationParams extends PaginationBase {
  /** Current page number (1-based) */
  page?: number;
  /** Number of items per page */
  limit?: number;
}

/**
 * Default values for pagination parameters
 */
export const DEFAULT_PAGINATION_PARAMS: Required<PaginationParams> = {
  page: 1,
  limit: 10,
};

/**
 * Paginated response extending the collection response
 */
export interface PaginatedResponse<T = unknown> extends CollectionResponse<T> {
  /** Current page number */
  page: number;
  /** Items per page */
  limit: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there are more pages */
  hasMore: boolean;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  /** Current page number */
  page: number;
  /** Items per page */
  limit: number;
  /** Total count of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there are more pages */
  hasMore: boolean;
  /** Whether the collection is empty */
  isEmpty: boolean;
}

/**
 * Creates pagination parameters with defaults
 */
export function buildPaginationParams(
  params: Partial<PaginationParams> = {}
): Required<PaginationParams> {
  const {
    page = DEFAULT_PAGINATION_PARAMS.page,
    limit = DEFAULT_PAGINATION_PARAMS.limit,
  } = params;

  return {
    page,
    limit,
  };
}

/**
 * Calculate pagination metadata from results
 */
export function calculatePaginationMeta(
  total: number,
  params: Required<PaginationParams>
): PaginationMeta {
  const { page, limit } = params;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
    isEmpty: total === 0
  };
}

/**
 * Calculate MongoDB skip value from pagination parameters
 */
export function calculateSkip(page: number, limit: number): number {
  return (Math.max(1, page) - 1) * limit;
}

// Backwards compatibility
/** @deprecated Use PaginationParams instead */
export type PaginationOptions = PaginationParams;
/** @deprecated Use DEFAULT_PAGINATION_PARAMS instead */
export const DEFAULT_PAGINATION_OPTIONS = DEFAULT_PAGINATION_PARAMS;