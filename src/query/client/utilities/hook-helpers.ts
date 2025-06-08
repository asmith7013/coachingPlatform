// src/query/client/utilities/hook-helpers.ts

import { ZodSchema } from 'zod';
import { BaseDocument } from '@core-types/document';
import { CollectionResponse, PaginatedResponse, EntityResponse } from '@core-types/response';
import { EntitySelector } from '@/query/client/selectors/selector-types';
import { isPaginatedResponse } from '@/lib/transformers/utils/response-utils';

/**
 * Simple transformation options interface
 */
export interface TransformationOptions<T extends BaseDocument> {
  /** Entity type for selector lookup */
  entityType?: string;
  
  /** Whether to use the selector system */
  useSelector?: boolean;
  
  /** Optional pre-created selector to use */
  selector?: EntitySelector<T>;
  
  /** Error context for better debugging */
  errorContext?: string;
}

/**
 * Extract items from various response formats
 */
export function extractNormalizedItems(data: unknown): unknown[] {
  if (!data || typeof data !== 'object') return [];
  
  const response = data as Record<string, unknown>;
  
  // Handle array directly
  if (Array.isArray(data)) return data;
  
  // Handle response with items array
  if (Array.isArray(response.items)) return response.items;
  
  // Handle single item responses
  if (response.data) return [response.data];
  
  // Handle MongoDB-style responses
  if (response._id) return [response];
  
  return [];
}

/**
 * Extract single item from various response formats
 */
export function extractSingleItem(data: unknown): unknown | null {
  if (!data || typeof data !== 'object') return null;
  
  const response = data as Record<string, unknown>;
  
  // Handle direct object with _id
  if (response._id) return response;
  
  // Handle response with data property
  if (response.data) return response.data;
  
  // Handle response with items array (take first)
  if (Array.isArray(response.items) && response.items.length > 0) {
    return response.items[0];
  }
  
  return null;
}

/**
 * Simple schema validation for items
 */
function validateWithSchema<T>(items: unknown[], schema: ZodSchema<T>): T[] {
  return items
    .map(item => {
      try {
        return schema.parse(item);
      } catch {
        return null;
      }
    })
    .filter((item): item is T => item !== null);
}

/**
 * Simple schema validation for single item
 */
function validateSingleWithSchema<T>(item: unknown, schema: ZodSchema<T>): T | null {
  try {
    return schema.parse(item);
  } catch {
    return null;
  }
}

/**
 * Transform array of items using simple schema validation
 */
export function transformItems<T extends BaseDocument>(
  data: unknown,
  schema: ZodSchema<T>,
  options?: TransformationOptions<T>
): T[] {
  try {
    const items = extractNormalizedItems(data);
    return validateWithSchema<T>(items, schema);
  } catch (error) {
    console.error(`Error in transformItems: ${options?.errorContext || ''}`, error);
    return [];
  }
}

/**
 * Transform a single item using simple schema validation
 */
export function transformSingleItem<T extends BaseDocument>(
  data: unknown,
  schema: ZodSchema<T>,
  options?: TransformationOptions<T>
): T | null {
  try {
    const item = extractSingleItem(data);
    if (!item) return null;
    return validateSingleWithSchema<T>(item, schema);
  } catch (error) {
    console.error(`Error in transformSingleItem: ${options?.errorContext || ''}`, error);
    return null;
  }
}

/**
 * Transform a paginated response while preserving pagination metadata
 */
export function transformPaginatedResponse<T extends BaseDocument>(
  response: PaginatedResponse<T> | unknown,
  schema: ZodSchema<T>,
  options?: TransformationOptions<T>
): PaginatedResponse<T> {
  if (!response || typeof response !== 'object') {
    return {
      items: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      hasMore: false,
      success: false
    };
  }
  
  try {
    // Handle non-paginated response
    if (!isPaginatedResponse<T>(response)) {
      const items = transformItems<T>(response, schema, options);
      
      return {
        items,
        total: items.length,
        page: 1,
        limit: items.length || 10,
        totalPages: 1,
        hasMore: false,
        success: true
      };
    }
    
    // Transform paginated response
    const paginatedResponse = response as PaginatedResponse<T>;
    const items = transformItems<T>(paginatedResponse.items, schema, options);
    
    return {
      ...paginatedResponse,
      items
    };
  } catch (error) {
    console.error(`Error in transformPaginatedResponse: ${options?.errorContext || ''}`, error);
    
    return {
      ...(typeof response === 'object' ? response : {}),
      items: [],
      success: false,
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      hasMore: false
    } as PaginatedResponse<T>;
  }
}

/**
 * Transform a collection response while preserving metadata
 */
export function transformCollectionResponse<T extends BaseDocument>(
  response: CollectionResponse<T> | unknown,
  schema: ZodSchema<T>,
  options?: TransformationOptions<T>
): CollectionResponse<T> {
  if (!response || typeof response !== 'object') {
    return {
      items: [],
      total: 0,
      success: false
    };
  }
  
  try {
    const items = transformItems<T>(response, schema, options);
    
    return {
      ...(response as CollectionResponse<T>),
      items
    };
  } catch (error) {
    console.error(`Error in transformCollectionResponse: ${options?.errorContext || ''}`, error);
    
    return {
      ...(typeof response === 'object' ? response : {}),
      items: [],
      success: false,
      total: 0
    } as CollectionResponse<T>;
  }
}

/**
 * Transform an entity response while preserving metadata
 */
export function transformEntityResponse<T extends BaseDocument>(
  response: EntityResponse<T> | unknown,
  schema: ZodSchema<T>,
  options?: TransformationOptions<T>
): EntityResponse<T | null> {
  if (!response || typeof response !== 'object') {
    return {
      data: null,
      success: false
    };
  }
  
  try {
    const data = transformSingleItem<T>(response, schema, options);
    
    return {
      ...(response as EntityResponse<T>),
      data
    };
  } catch (error) {
    console.error(`Error in transformEntityResponse: ${options?.errorContext || ''}`, error);
    
    return {
      ...(typeof response === 'object' ? response : {}),
      data: null,
      success: false
    } as EntityResponse<T | null>;
  }
}