// src/lib/server/api/responses/formatters.ts
import { ZodSchema } from 'zod';
import { CollectionResponse, EntityResponse } from '@core-types/response';
import { BaseDocument } from '@core-types/document';
import { handleClientError } from '@error/handlers/client';

/**
 * Simple document sanitization functions
 */
export function sanitizeDocument<T>(doc: unknown): T {
  if (!doc || typeof doc !== 'object') return doc as T;
  
  const obj = doc as Record<string, unknown>;
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (key === '__v' || key.startsWith('__')) continue;
    
    if (value instanceof Date) {
      sanitized[key] = value.toISOString();
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => sanitizeDocument(item));
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeDocument(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}

export function sanitizeDocuments<T>(docs: unknown[]): T[] {
  if (!Array.isArray(docs)) return [];
  return docs.map(doc => sanitizeDocument<T>(doc));
}

/**
 * Simple response formatter without complex transformations
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
  let standardizedResponse: CollectionResponse<T>;

  if (Array.isArray(data)) {
    // Direct array
    const sanitized = sanitizeDocuments<T>(data);
    standardizedResponse = {
      items: sanitized,
      total: sanitized.length,
      success: true,
    };
  } else if (typeof data === 'object' && 'items' in (data as object)) {
    // Already in collection format
    const collectionData = data as CollectionResponse<unknown>;
    const sanitized = sanitizeDocuments<T>(collectionData.items || []);
    standardizedResponse = {
      ...collectionData,
      items: sanitized,
      success: true
    } as CollectionResponse<T>;
  } else if (typeof data === 'object') {
    const objectData = data as Record<string, unknown>;
    
    // Check if there's any array property that could be items
    const arrayProps = Object.entries(objectData)
      .filter(([_, value]) => Array.isArray(value));
      
    if (arrayProps.length > 0) {
      // Use the first array property as items
      const [propName, propValue] = arrayProps[0];
      const sanitized = sanitizeDocuments<T>(propValue as unknown[]);
      standardizedResponse = {
        items: sanitized,
        total: sanitized.length,
        success: true,
        message: `Auto-converted "${propName}" to items array`,
      };
    } else {
      // Single object - wrap in collection
      const sanitized = sanitizeDocument<T>(objectData);
      standardizedResponse = {
        items: [sanitized],
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

  // Apply schema validation if provided
  if (schema) {
    try {
      const validatedItems = standardizedResponse.items.map(item => {
        const result = schema.safeParse(item);
        return result.success ? result.data : item;
      });
      
      return {
        ...standardizedResponse,
        items: validatedItems
      };
    } catch (error) {
      handleClientError(error, 'collectionizeResponse');
      return {
        ...standardizedResponse,
        items: [],
        success: false,
        error: error instanceof Error ? error.message : 'Validation failed'
      };
    }
  }

  return standardizedResponse;
}

/**
 * Simple response formatter factory
 */
export function createResponseFormatter<T extends BaseDocument>(schema: ZodSchema<T>) {
  return {
    formatResponse: (data: unknown) => collectionizeResponse(data, schema),
    formatCollection: (response: CollectionResponse<unknown>): CollectionResponse<T> => {
      const sanitized = sanitizeDocuments<T>(response.items || []);
      return { ...response, items: sanitized } as CollectionResponse<T>;
    },
    formatEntity: (response: EntityResponse<unknown>): EntityResponse<T> => {
      const sanitized = sanitizeDocument<T>(response.data);
      return { ...response, data: sanitized } as EntityResponse<T>;
    },
    formatPaginated: (response: CollectionResponse<unknown> & { page?: number; limit?: number; totalPages?: number; hasMore?: boolean }): CollectionResponse<T> & { page: number; limit: number; totalPages: number; hasMore: boolean; empty: boolean } => {
      const sanitized = sanitizeDocuments<T>(response.items || []);
      return {
        ...response,
        items: sanitized,
        page: response.page || 1,
        limit: response.limit || 10,
        totalPages: response.totalPages || Math.ceil((response.total || 0) / (response.limit || 10)),
        hasMore: response.hasMore || false,
        empty: sanitized.length === 0
      };
    }
  };
}

/**
 * Simple wrapper for API route handlers
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
      
      // Standardize the result using simple collectionizeResponse
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