import { 
  StandardResponse, 
  PaginatedResponse,
  SingleResourceResponse, 
} from '@core-types/response';

/**
 * Type-safe transformers for working with different response types in React Query
 */

/**
 * Default selector for StandardResponse
 * Use in query options to automatically extract items
 */
export function standardResponseSelector<T, R = T[]>(
  data: StandardResponse<T>,
  selector?: (items: T[]) => R
): R {
  const items = data?.items || [];
  return selector ? selector(items) : items as unknown as R;
}

/**
 * Extracts items from a StandardResponse
 * @param response The standard response object
 * @returns The items array from the response
 */
export function extractItems<T>(response: StandardResponse<T>): T[] {
  return standardResponseSelector(response);
}

/**
 * Default selector for PaginatedResponse
 * Use in query options to automatically extract items and pagination info
 */
export function paginatedResponseSelector<T>(
  data: PaginatedResponse<T>
): { items: T[], pagination: Omit<PaginatedResponse<T>, 'items' | 'success' | 'message'> } {
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
  Omit<PaginatedResponse<T>, 'items' | 'success' | 'message'> {
  return paginatedResponseSelector(response).pagination;
}

/**
 * Extracts a single item from a SingleResourceResponse
 * @param response The single resource response object
 * @returns The data from the response
 */
export function extractData<T>(response: SingleResourceResponse<T>): T {
  return response?.data as T;
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
 * Type guard to check if a response is a StandardResponse
 * @param response The response to check
 * @returns True if the response is a StandardResponse
 */
export function isStandardResponse<T>(response: unknown): response is StandardResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'items' in response &&
    'success' in response &&
    Array.isArray((response as StandardResponse<T>).items)
  );
}

/**
 * Type guard to check if a response is a PaginatedResponse
 * @param response The response to check
 * @returns True if the response is a PaginatedResponse
 */
export function isPaginatedResponse<T>(response: unknown): response is PaginatedResponse<T> {
  return (
    isStandardResponse<T>(response) &&
    'page' in response &&
    'limit' in response &&
    'totalPages' in response
  );
}

/**
 * Type guard to check if a response is a SingleResourceResponse
 * @param response The response to check
 * @returns True if the response is a SingleResourceResponse
 */
export function isSingleResourceResponse<T>(response: unknown): response is SingleResourceResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    'success' in response
  );
} 