// import { Types } from 'mongoose';

/**
 * Base response interface for all API responses
 */
export interface BaseResponse {
  /** Indicates if the operation was successful */
  success: boolean;
  /** Optional message for additional information */
  message?: string;
  /** Optional error message if success is false (legacy field) */
  error?: string;
  /** Optional array of detailed errors */
  errors?: Array<{
    item?: unknown;
    error: string;
    field?: string;
  }>;
}

/**
 * Standard response type with items array for collection data
 */
export type StandardResponse<T = Record<string, unknown>> = {
  items: T[];
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
  success: boolean;
};

/**
 * Response interface for collections of resources
 */
export interface ResourceResponse<T = unknown> extends BaseResponse {
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
export interface PaginatedResponse<T = unknown> extends ResourceResponse<T> {
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
export interface SingleResourceResponse<T = unknown> extends BaseResponse {
  /** The resource data */
  data: T;
}

/**
 * Response interface for file upload operations
 */
export interface UploadResponse {
  success: boolean;
  message: string;
  uploaded?: number;
}
