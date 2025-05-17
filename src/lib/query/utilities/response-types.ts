// src/lib/query/utilities/response-types.ts
import { 
  CollectionResponse, 
  PaginatedResponse,
  EntityResponse
} from '@core-types/response';

/**
 * Type-safe transformers for working with different response types in React Query
 */

/**
 * Default selector for CollectionResponse
 * Use in query options to automatically extract items
 */
export function collectionResponseSelector<T, R = T[]>(
  data: CollectionResponse<T>,
  selector?: (items: T[]) => R
): R {
  const items = data?.items || [];
  return selector ? selector(items) : items as unknown as R;
}

// Keep old function with deprecation notice
/**
 * @deprecated Use collectionResponseSelector instead
 */
export function standardResponseSelector<T, R = T[]>(
  data: CollectionResponse<T>,
  selector?: (items: T[]) => R
): R {
  return collectionResponseSelector(data, selector);
}

/**
 * Extracts items from a CollectionResponse
 * @param response The standard response object
 * @returns The items array from the response
 */
export function extractItems<T>(response: CollectionResponse<T>): T[] {
  return response?.items || [];
}

/**
 * Default selector for PaginatedResponse
 * Use in query options to automatically extract items and pagination info
 */
export function paginatedResponseSelector<T>(
  data: PaginatedResponse<T>
): { items: T[], pagination: Omit<PaginatedResponse<T>, 'items' | 'success' | 'message' | 'error' | 'errors'> } {
  return {
    items: data?.items || [],
    pagination: {
      page: data?.page || 1,
      limit: data?.limit || 10,
      total: data?.total || 0,
      totalPages: data?.totalPages || 1,
      hasMore: data?.hasMore || false,
      empty: data?.empty || false,
    },
  };
}

/**
 * Extracts pagination metadata from a PaginatedResponse
 * @param response The paginated response object
 * @returns Object with pagination metadata
 */
export function extractPagination<T>(response: PaginatedResponse<T>): 
  Omit<PaginatedResponse<T>, 'items' | 'success' | 'message' | 'error' | 'errors'> {
  return paginatedResponseSelector(response).pagination;
}

/**
 * Extracts a single item from an EntityResponse
 * @param response The entity response object
 * @returns The data from the response
 */
export function extractData<T>(response: EntityResponse<T>): T {
  return response?.data as T;
}

/**
 * @deprecated Use extractData instead
 * Extracts a single item from a SingleResourceResponse
 */
export function extractSingleResourceData<T>(response: EntityResponse<T>): T {
  return extractData(response);
}

/**
 * Convenience function to extract both items and pagination info
 * @param response The paginated response object
 * @returns Object with items array and pagination metadata
 */
export function extractPaginatedData<T>(response: PaginatedResponse<T>) {
  return paginatedResponseSelector(response);
}

/**
 * Type guard to check if a response is a CollectionResponse
 * @param response The response to check
 * @returns True if the response is a CollectionResponse
 */
export function isCollectionResponse<T>(response: unknown): response is CollectionResponse<T> {
  return Boolean(
    typeof response === 'object' &&
    response !== null &&
    'items' in response &&
    'success' in response &&
    Array.isArray((response as CollectionResponse<T>).items)
  );
}

// Keep old function with deprecation notice
/**
 * @deprecated Use isCollectionResponse instead
 */
export function isStandardResponse<T>(response: unknown): response is CollectionResponse<T> {
  return isCollectionResponse(response);
}

/**
 * Type guard to check if a response is a PaginatedResponse
 * @param response The response to check
 * @returns True if the response is a PaginatedResponse
 */
export function isPaginatedResponse<T>(response: unknown): response is PaginatedResponse<T> {
  return Boolean(
    isCollectionResponse<T>(response) &&
    'page' in response &&
    'limit' in response &&
    'totalPages' in response
  );
}

/**
 * Type guard to check if a response is an EntityResponse
 * @param response The response to check
 * @returns True if the response is an EntityResponse
 */
export function isEntityResponse<T>(response: unknown): response is EntityResponse<T> {
  return Boolean(
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    'success' in response
  );
}

/**
 * @deprecated Use isEntityResponse instead
 * Type guard to check if a response is a SingleResourceResponse
 */
export function isSingleResourceResponse<T>(response: unknown): response is EntityResponse<T> {
  return isEntityResponse<T>(response);
}