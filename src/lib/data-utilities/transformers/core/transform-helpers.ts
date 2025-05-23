import { ZodSchema } from 'zod';
import { transformDocument } from '@data-utilities/transformers/core/db-transformers';
import { validateSafe } from '@data-utilities/transformers/core/schema-validators';
import { CollectionResponse } from '@core-types/response';
import { PaginatedResponse } from '@core-types/pagination';
import { EntityResponse } from '@core-types/response';
import { handleClientError } from '@error/handlers/client';

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
 * Transforms a standard response
 * Transforms the items array while preserving the response structure
 */
export function transformResponse<T>(
  response: CollectionResponse<unknown> | null | undefined,
  schema: ZodSchema<T>
): CollectionResponse<T> {
  if (!response) {
    return { success: false, items: [], total: 0 };
  }
  
  try {
    // Transform the items array
    const transformedItems = transformItemsWithSchema(response.items || [], schema);
    
    return {
      ...response,
      items: transformedItems,
      total: response.total || transformedItems.length
    };
  } catch (error) {
    handleClientError(error, 'transformResponse');
    return {
      ...response,
      items: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Transforms a paginated response
 * Transforms the items array while preserving pagination metadata
 */
export function transformPaginatedResponse<T>(
  response: PaginatedResponse<unknown> | null | undefined,
  schema: ZodSchema<T>
): PaginatedResponse<T> {
  if (!response) {
    return { 
      success: false, 
      items: [], 
      total: 0, 
      page: 1, 
      limit: 10, 
      totalPages: 0,
      empty: true,
      hasMore: false
    };
  }
  
  try {
    // Transform the items array
    const transformedItems = transformItemsWithSchema(response.items || [], schema);
    
    return {
      ...response,
      items: transformedItems,
      total: response.total || transformedItems.length,
      empty: transformedItems.length === 0
    };
  } catch (error) {
    handleClientError(error, 'transformPaginatedResponse');
    return {
      ...response,
      items: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Transforms an entity response
 */
export function transformEntityResponse<T>(
  response: EntityResponse<unknown> | null | undefined,
  schema: ZodSchema<T>
): EntityResponse<T> {
  if (!response) {
    return { success: false, data: undefined as unknown as T };
  }
  
  try {
    // Use the 3-layer transformation system
    const validatedData = transformItemWithSchema(response.data, schema);
    
    return {
      ...response,
      data: validatedData as T,
      success: Boolean(validatedData)
    };
  } catch (error) {
    handleClientError(error, 'transformEntityResponse');
    return {
      success: false,
      data: undefined as unknown as T,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Transforms items and then applies a domain-specific transformation
 */
export function transformItemsWithDomainFn<T, R>(
  items: unknown[],
  schema: ZodSchema<T>,
  domainTransformer: (item: T) => R
): R[] {
  // First validate and transform with schema
  const validatedItems = transformItemsWithSchema(items, schema);
  
  // Then apply domain-specific transformation
  return validatedItems.map(domainTransformer);
} 