// src/lib/types/core/response.ts

import type { ResponseBase } from './base-types';

/**
 * Base response interface for all API responses
 */
export interface BaseResponse extends ResponseBase {
  /** Indicates if the operation was successful */
  success: boolean;
  /** Optional message for additional information */
  message?: string;
  /** Optional error message if success is false */
  error?: string;
  /** Optional array of detailed errors */
  errors?: Array<{
    item?: unknown;
    error: string;
    field?: string;
  }>;
}

/**
 * Response interface for collections of resources
 */
export interface CollectionResponse<T = unknown> extends BaseResponse {
  /** Array of resources */
  items: T[];
  /** Total count of items (useful for pagination) */
  total: number;
  /** Whether the collection is empty */
  empty?: boolean;
}

/**
 * Response interface for paginated resources
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
 * Response interface for single resource operations
 */
export interface EntityResponse<T = unknown> extends BaseResponse {
  /** The resource data */
  data: T;
}

/**
 * @deprecated Use CollectionResponse instead
 * Maintained for backward compatibility
 */
export type StandardResponse<T = unknown> = CollectionResponse<T>;

/**
 * @deprecated Use EntityResponse instead
 * Maintained for backward compatibility
 */
export type SingleResourceResponse<T = unknown> = EntityResponse<T>;
