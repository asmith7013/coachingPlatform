import { ZodSchema } from 'zod';
import { transformDocument } from '@transformers/core/document';
import { validateSafe } from '@transformers/core/validation';
import { PaginatedResponse } from "@core-types/pagination";
import { CollectionResponse, EntityResponse } from "@core-types/response";

/**
 * Helper function for transforming items with schema validation
 * This ensures consistent transformation across all hooks
 * 
 * @param items - The items to transform
 * @param schema - The Zod schema to validate against
 * @returns Array of validated items (invalid items are filtered out)
 */
export function transformItemsWithSchema<T>(
  items: unknown[], 
  schema: ZodSchema<T>
): T[] {
  if (!items || !Array.isArray(items)) {
    return [];
  }
  
  return items
    .map(item => {
      // Layer 1: DB transformation (MongoDB → clean JS object)
      const dbTransformed = transformDocument(item);
      // Layer 2: Schema validation
      return validateSafe(schema, dbTransformed);
    })
    .filter((item): item is T => item !== null);
}

/**
 * Helper function for transforming a single item with schema validation
 * 
 * @param item - The item to transform
 * @param schema - The Zod schema to validate against
 * @returns Validated item or null if validation fails
 */
export function transformItemWithSchema<T>(
  item: unknown,
  schema: ZodSchema<T>
): T | null {
  if (!item) {
    return null;
  }
  
  try {
    // Layer 1: DB transformation
    const dbTransformed = transformDocument(item);
    // Layer 2: Schema validation
    return validateSafe(schema, dbTransformed);
  } catch (error) {
    console.error('Error transforming item:', error);
    return null;
  }
}

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