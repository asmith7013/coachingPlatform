// src/query/client/utilities/hook-helpers.ts

import { ZodSchema } from 'zod';
import { BaseDocument } from '@core-types/document';
import { CollectionResponse, PaginatedResponse, EntityResponse } from '@core-types/response';
import { EntitySelector } from '@query/client/selectors/selector-types';
import { isPaginatedResponse } from '@data-processing/transformers/utils/response-utils';
import { normalizeVisitPurposes } from '@data-processing/transformers/purpose-normalizer';
import { Visit } from '@zod-schema/visits/visit';

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
 * Normalize data before validation to fix common issues
 */
function normalizeData(item: unknown): unknown {
  if (!item || typeof item !== 'object') return item;
  
  // Special handling for visit data with purpose/eventType normalization
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>;
    
    // Check if this looks like visit data (has events array)
    if (Array.isArray(obj.events)) {
      return normalizeVisitPurposes(item as Visit);
    }
  }
  
  return item;
}

/**
 * Simple schema validation for items
 */
function validateWithSchema<T>(items: unknown[], schema: ZodSchema<T>): T[] {
  
  const results = items.map((item, index) => {
    try {
      // Normalize data before validation
      const normalizedItem = normalizeData(item);
      const validated = schema.parse(normalizedItem);
      return { index, success: true, item: validated, error: null };
    } catch (error) {
      console.warn(`❌ VALIDATE SCHEMA: Item ${index} failed validation:`, {
        item: item,
        error: error instanceof Error ? error.message : String(error)
      });
      return { index, success: false, item: null, error };
    }
  });
  
  const validItems = results
    .filter(result => result.success && result.item !== null)
    .map(result => result.item as T);
  
  return validItems;
}

/**
 * Simple schema validation for single item
 */
function validateSingleWithSchema<T>(item: unknown, schema: ZodSchema<T>): T | null {
  try {
    // Normalize data before validation
    const normalizedItem = normalizeData(item);
    return schema.parse(normalizedItem);
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
  const context = options?.errorContext || 'unknown';
  
  try {
    const items = extractNormalizedItems(data);

    
    const validated = validateWithSchema<T>(items, schema);
    
    return validated;
  } catch (error) {
    console.error(`📝 TRANSFORM ITEMS: Error for ${context}:`, error);
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
  const context = options?.errorContext || 'unknown';
  
  if (!response || typeof response !== 'object') {
    console.log(`🔧 TRANSFORM PAGINATED ❌: No valid response for ${context}, returning empty`);
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
    const isPaginated = isPaginatedResponse<T>(response);

    
    // Handle non-paginated response
    if (!isPaginated) {
      const items = transformItems<T>(response, schema, options);
      console.log(`🔧 TRANSFORM PAGINATED: Non-paginated result for ${context}:`, {
        transformedItemsCount: items.length
      });
      
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
    console.error(`🔧 TRANSFORM PAGINATED ❌: Error for ${context}:`, error);
    
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