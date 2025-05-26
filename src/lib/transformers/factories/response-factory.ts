import { ZodSchema } from 'zod';
import { CollectionResponse, EntityResponse } from '@core-types/response';
import { PaginatedResponse } from '@core-types/response';
import { handleClientError } from '@error/handlers/client';
import { transformData, transformSingleItem } from '@transformers/core/unified-transformer';
import { BaseDocument } from '@core-types/document';
import { ensureBaseDocumentCompatibility } from '@zod-schema/base-schemas';

/**
 * Creates a transformer for collection responses
 * 
 * @param schema The Zod schema to validate against
 * @returns A function that transforms collection responses
 */
export function createResponseTransformer<T extends BaseDocument>(schema: ZodSchema<T>) {
  return function transformResponse(
    response: CollectionResponse<unknown> | null | undefined
  ): CollectionResponse<T> {
    if (!response) {
      return { success: false, items: [], total: 0 };
    }
    
    try {
      // Transform the items array using the unified transformer
      const transformedItems = transformData<T, T>(response.items || [], {
        schema: ensureBaseDocumentCompatibility<T>(schema),
        handleDates: true,
        errorContext: 'transformResponse'
      });
      
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
export function createPaginatedResponseTransformer<T extends BaseDocument>(schema: ZodSchema<T>) {
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
      // Transform the items array using the unified transformer
      const transformedItems = transformData<T, T>(response.items || [], {
        schema: ensureBaseDocumentCompatibility<T>(schema),
        handleDates: true,
        errorContext: 'transformPaginatedResponse'
      });
      
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
export function createEntityResponseTransformer<T extends BaseDocument>(schema: ZodSchema<T>) {
  return function transformEntityResponse(
    response: EntityResponse<unknown> | null | undefined
  ): EntityResponse<T> {
    if (!response) {
      return { success: false, data: undefined as unknown as T };
    }
    
    try {
      // Use the unified transformer
      const validatedData = transformSingleItem<T, T>(response.data, {
        schema: ensureBaseDocumentCompatibility<T>(schema),
        handleDates: true,
        errorContext: 'transformEntityResponse'
      });
      
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
export function createDomainResponseTransformer<T extends BaseDocument, R extends Record<string, unknown>>(
  schema: ZodSchema<T>,
  domainTransformer: (item: T) => R
) {
  return function transformWithDomain(items: unknown[]): R[] {
    // Use the unified transformer with domain transformation
    return transformData<T, R>(items, {
      schema: ensureBaseDocumentCompatibility<T>(schema),
      handleDates: true,
      domainTransform: domainTransformer,
      errorContext: 'transformWithDomain'
    });
  };
}

/**
 * Creates a full response transformation system for an entity type
 * 
 * @param schema The Zod schema to validate against
 * @returns An object with transformers for different response types
 */
export function createResponseTransformers<T extends BaseDocument>(schema: ZodSchema<T>) {
  return {
    transformResponse: createResponseTransformer(schema),
    transformPaginatedResponse: createPaginatedResponseTransformer(schema),
    transformEntityResponse: createEntityResponseTransformer(schema),
    transformWithDomain: <R extends Record<string, unknown>>(domainTransformer: (item: T) => R) => 
      createDomainResponseTransformer(schema, domainTransformer)
  };
}