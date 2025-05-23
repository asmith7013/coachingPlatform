// src/lib/data-utilities/transformers/utilities/response-utils.ts

import { PaginatedResponse } from "@core-types/pagination";
import { CollectionResponse } from "@core-types/response";
import { EntityResponse } from "@core-types/response";

/**
 * Extracts items from a response
 */
export function extractItems<T>(response: CollectionResponse<T> | null | undefined): T[] {
  return response?.items || [];
}

/**
 * Extracts pagination information from a response
 */
export function extractPagination<T>(response: PaginatedResponse<T> | null | undefined): {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  empty: boolean;
} {
  return {
    total: response?.total || 0,
    page: response?.page || 1,
    limit: response?.limit || 10,
    totalPages: response?.totalPages || 1,
    hasMore: response?.hasMore || false,
    empty: response?.empty || (response?.items?.length === 0)
  };
}

/**
 * Extracts data from an entity response
 */
export function extractData<T>(response: EntityResponse<T> | null | undefined): T | null {
  return response?.data || null;
}

/**
 * Type guard for collection responses
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

/**
 * Type guard for paginated responses
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
 * Type guard for entity responses
 */
export function isEntityResponse<T>(response: unknown): response is EntityResponse<T> {
  return Boolean(
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    'success' in response
  );
} 