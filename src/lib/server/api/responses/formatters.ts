// src/lib/server/api/responses/formatters.ts
import { ZodSchema } from 'zod';
import { CollectionResponse, EntityResponse } from '@core-types/response';
import { BaseDocument } from '@core-types/document';
import { 
  transformResponseData, 
  createTransformer,
  TransformOptions 
} from '@transformers/core/unified-transformer';
import { ensureBaseDocumentCompatibility } from '@zod-schema/base-schemas';
import { handleClientError } from '@error/handlers/client';

/**
 * Standardizes API responses using unified transformation system
 * Now leverages the centralized transformer instead of custom logic
 */
export function collectionizeResponse<T extends BaseDocument>(
  data: unknown,
  schema?: ZodSchema<T>
): CollectionResponse<T> {
  // Handle undefined or null
  if (data === undefined || data === null) {
    return {
      items: [],
      total: 0,
      success: false,
      message: 'No data returned',
    };
  }

  // Convert to standard CollectionResponse format first
  let standardizedResponse: CollectionResponse<unknown>;

  if (Array.isArray(data)) {
    // Direct array
    standardizedResponse = {
      items: data,
      total: data.length,
      success: true,
    };
  } else if (typeof data === 'object' && 'items' in (data as object)) {
    // Already in collection format
    standardizedResponse = data as CollectionResponse<unknown>;
  } else if (typeof data === 'object') {
    const objectData = data as Record<string, unknown>;
    
    // Check if there's any array property that could be items
    const arrayProps = Object.entries(objectData)
      .filter(([_, value]) => Array.isArray(value));
      
    if (arrayProps.length > 0) {
      // Use the first array property as items
      const [propName, propValue] = arrayProps[0];
      standardizedResponse = {
        items: propValue as unknown[],
        total: (propValue as unknown[]).length,
        success: true,
        message: `Auto-converted "${propName}" to items array`,
      };
    } else {
      // Single object - wrap in collection
      standardizedResponse = {
        items: [objectData],
        total: 1,
        success: true,
      };
    }
  } else {
    // Primitive or unsupported type
    return {
      items: [],
      total: 0,
      success: false,
      message: `Unsupported response type: ${typeof data}`,
    };
  }

  // Apply unified transformation if schema provided
  if (schema) {
    try {
      return transformResponseData<T, T>(standardizedResponse, {
        schema: ensureBaseDocumentCompatibility<T>(schema),
        handleDates: true,
        errorContext: 'collectionizeResponse'
      });
    } catch (error) {
      handleClientError(error, 'collectionizeResponse');
      // Return standardized response without validation if transformation fails
      return {
        ...standardizedResponse,
        items: [],
        success: false,
        error: error instanceof Error ? error.message : 'Transformation failed'
      } as CollectionResponse<T>;
    }
  }

  return standardizedResponse as CollectionResponse<T>;
}

/**
 * Creates a response transformer factory for a specific schema
 * Uses unified transformation system for consistency
 */
export function createResponseFormatter<T extends BaseDocument>(schema: ZodSchema<T>) {
  const transformer = createTransformer<T, T>({
    schema: ensureBaseDocumentCompatibility<T>(schema),
    handleDates: true,
    errorContext: 'ResponseFormatter'
  });

  return {
    formatResponse: (data: unknown) => collectionizeResponse(data, schema),
    formatCollection: (response: CollectionResponse<unknown>) => 
      transformer.transformResponse(response),
    formatEntity: (response: EntityResponse<unknown>) => 
      transformer.transformEntity(response),
    formatPaginated: (response: CollectionResponse<unknown> & { page?: number; limit?: number; totalPages?: number; hasMore?: boolean }) => {
      const transformed = transformer.transformResponse(response);
      return {
        ...transformed,
        page: response.page || 1,
        limit: response.limit || 10,
        totalPages: response.totalPages || Math.ceil((response.total || 0) / (response.limit || 10)),
        hasMore: response.hasMore || false,
        empty: transformed.items.length === 0
      };
    }
  };
}

/**
 * Use this wrapper for API route handlers to ensure standardized responses
 * Now uses unified transformation system
 */
export function withCollectionResponse<T extends BaseDocument, Args extends unknown[]>(
  handler: (...args: Args) => Promise<T | Response> | T | Response,
  schema?: ZodSchema<T>
) {
  return async (...args: Args) => {
    try {
      const result = await handler(...args);
      
      // If result is already a Response, return it directly
      if (result instanceof Response) {
        return result;
      }
      
      // Standardize the result using the updated collectionizeResponse
      const standardized = collectionizeResponse(result, schema);
      
      // Return as Response
      return Response.json(standardized);
    } catch (error) {
      handleClientError(error, 'withCollectionResponse');
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Return standardized error response
      return Response.json({
        items: [],
        total: 0,
        success: false,
        error: errorMessage,
      }, { status: 500 });
    }
  };
}

/**
 * Domain-specific response formatter with transformation
 * Supports custom domain transformations through the unified system
 */
export function createDomainResponseFormatter<
  T extends BaseDocument, 
  R extends Record<string, unknown>
>(
  schema: ZodSchema<T>,
  domainTransform: (item: T) => R,
  options?: Partial<TransformOptions<T, R>>
) {
  const transformer = createTransformer<T, R>({
    schema: ensureBaseDocumentCompatibility<T>(schema),
    handleDates: true,
    domainTransform,
    errorContext: 'DomainResponseFormatter',
    ...options
  });

  return {
    formatResponse: (data: unknown) => {
      // First standardize to collection format
      const standardized = collectionizeResponse(data as T[], schema);
      // Then apply domain transformation
      return transformer.transformResponse(standardized);
    },
    transformer // Expose transformer for advanced use cases
  };
}