import { ZodSchema } from 'zod';
import { CollectionResponse, EntityResponse } from '@core-types/response';
import { PaginatedResponse } from '@core-types/pagination';
import { handleClientError } from '@error/handlers/client';
import { transformItemsWithSchema, transformItemWithSchema } from '@transformers/utils/response-utils';

/**
 * Creates a transformer for collection responses
 * 
 * @param schema The Zod schema to validate against
 * @returns A function that transforms collection responses
 */
export function createResponseTransformer<T>(schema: ZodSchema<T>) {
  return function transformResponse(
    response: CollectionResponse<unknown> | null | undefined
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
  };
}

/**
 * Creates a transformer for paginated responses
 * 
 * @param schema The Zod schema to validate against
 * @returns A function that transforms paginated responses
 */
export function createPaginatedResponseTransformer<T>(schema: ZodSchema<T>) {
  return function transformPaginatedResponse(
    response: PaginatedResponse<unknown> | null | undefined
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
  };
}

/**
 * Creates a transformer for entity responses
 * 
 * @param schema The Zod schema to validate against
 * @returns A function that transforms entity responses
 */
export function createEntityResponseTransformer<T>(schema: ZodSchema<T>) {
  return function transformEntityResponse(
    response: EntityResponse<unknown> | null | undefined
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
  };
}

/**
 * Creates a domain-specific transformer for items
 * 
 * @param schema The Zod schema to validate against
 * @param domainTransformer The domain-specific transformation function
 * @returns A function that transforms and then applies domain logic
 */
export function createDomainResponseTransformer<T, R>(
  schema: ZodSchema<T>,
  domainTransformer: (item: T) => R
) {
  return function transformWithDomain(items: unknown[]): R[] {
    // First validate and transform with schema
    const validatedItems = transformItemsWithSchema(items, schema);
    
    // Then apply domain-specific transformation
    return validatedItems.map(domainTransformer);
  };
}

/**
 * Creates a full response transformation system for an entity type
 * 
 * @param schema The Zod schema to validate against
 * @returns An object with transformers for different response types
 */
export function createResponseTransformers<T>(schema: ZodSchema<T>) {
  return {
    transformResponse: createResponseTransformer(schema),
    transformPaginatedResponse: createPaginatedResponseTransformer(schema),
    transformEntityResponse: createEntityResponseTransformer(schema),
    transformWithDomain: <R>(domainTransformer: (item: T) => R) => 
      createDomainResponseTransformer(schema, domainTransformer)
  };
}