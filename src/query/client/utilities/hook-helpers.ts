// src/query/client/utilities/hook-helpers.ts

import { ZodSchema, ZodError } from 'zod';
import { BaseDocument } from '@core-types/document';
import { CollectionResponse, PaginatedResponse, EntityResponse } from '@core-types/response';
import { EntitySelector } from '@query/client/selectors/selector-types';
import { isPaginatedResponse } from '@data-processing/transformers/utils/response-utils';
import { normalizeVisitPurposes } from '@data-processing/transformers/purpose-normalizer';
import { Visit } from '@zod-schema/visits/visit';
import { handleValidationError } from '@error/handlers/validation';
import { logError } from '@error/core/logging';

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
 * Enhanced schema validation with detailed error reporting using existing error system
 */
function validateWithSchema<T>(items: unknown[], schema: ZodSchema<T>): T[] {
  // console.log('🔍 SCHEMA VALIDATION DEBUG - START:', {
  //   itemsToValidate: items.length,
  //   schemaName: schema.constructor.name,
  //   firstItemKeys: items[0] ? Object.keys(items[0] as object) : 'NONE'
  // });
  
  const results = items.map((item, index) => {
    try {
      // Normalize data before validation
      const normalizedItem = normalizeData(item);
      
      // console.log(`🔍 VALIDATION ATTEMPT ${index}:`, {
      //   original: item,
      //   normalized: normalizedItem,
      //   itemType: typeof item,
      //   hasId: !!(item && typeof item === 'object' && '_id' in item)
      // });
      
      const validated = schema.parse(normalizedItem);
      // console.log(`✅ VALIDATION SUCCESS ${index}:`, { validated });
      return { index, success: true, item: validated, error: null };
      
    } catch (error) {
      // Use existing error system for detailed validation reporting
      if (error instanceof ZodError) {
        const detailedErrorMessage = handleValidationError(error, {
          component: 'Schema Validation',
          operation: `validateItem_${index}`,
          metadata: {
            itemIndex: index,
            itemData: item,
            schemaName: schema.constructor.name,
            failedPaths: error.errors.map(e => e.path.join('.')),
            detailedErrors: error.errors.map(e => ({
              path: e.path.join('.'),
              message: e.message,
              code: e.code,
              received: 'received' in e ? e.received : undefined,
              expected: 'expected' in e ? e.expected : undefined
            }))
          }
        });
        
        console.error(`❌ VALIDATION FAILED ${index} - DETAILED:`, {
          errorMessage: detailedErrorMessage,
          zodError: error.errors,
          item: item,
          itemKeys: item && typeof item === 'object' ? Object.keys(item as object) : 'NOT_OBJECT',
          missingFields: error.errors.filter(e => e.code === 'invalid_type' && e.received === 'undefined'),
          typeErrors: error.errors.filter(e => e.code === 'invalid_type' && e.received !== 'undefined'),
          invalidValues: error.errors.filter(e => e.code !== 'invalid_type')
        });
        
        return { index, success: false, item: null, error: detailedErrorMessage };
      } else {
        // Handle non-Zod errors
        const errorMessage = logError(error, {
          component: 'Schema Validation',
          operation: `validateItem_${index}`,
          severity: 'error',
          metadata: { itemIndex: index, itemData: item }
        });
        
        console.error(`❌ VALIDATION ERROR ${index}:`, { error, errorMessage });
        return { index, success: false, item: null, error: errorMessage };
      }
    }
  });
  
  const validItems = results
    .filter(result => result.success && result.item !== null)
    .map(result => result.item as T);
  
  const failedItems = results.filter(result => !result.success);
  
  // console.log('🔍 SCHEMA VALIDATION DEBUG - RESULT:', {
  //   inputCount: items.length,
  //   validCount: validItems.length,
  //   failedCount: failedItems.length,
  //   successRate: `${Math.round((validItems.length / items.length) * 100)}%`,
  //   failureDetails: failedItems.map(f => ({ index: f.index, error: f.error }))
  // });
  
  // Log summary if there are failures
  if (failedItems.length > 0) {
    logError(new Error(`Schema validation failed for ${failedItems.length}/${items.length} items`), {
      component: 'Schema Validation',
      operation: 'validateWithSchema',
      severity: 'warning',
      category: 'validation',
      metadata: {
        totalItems: items.length,
        failedItems: failedItems.length,
        successRate: Math.round((validItems.length / items.length) * 100),
        failureDetails: failedItems.map(f => ({ index: f.index, error: f.error }))
      }
    });
  }
  
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
  const _context = options?.errorContext || 'unknown';
  
  try {
    const items = extractNormalizedItems(data);

    
    const validated = validateWithSchema<T>(items, schema);
    
    return validated;
  } catch (error) {
    const _error = error
    // console.error(`📝 TRANSFORM ITEMS: Error for ${context}:`, error);
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
  
  // console.log('🔧 TRANSFORM PAGINATED DEBUG - START:', {
  //   context,
  //   hasResponse: !!response,
  //   responseType: typeof response,
  //   responseKeys: response && typeof response === 'object' ? Object.keys(response as object) : 'NOT_OBJECT'
  // });
  
  // if (!response || typeof response !== 'object') {
  //   console.log(`🔧 TRANSFORM PAGINATED ❌: No valid response for ${context}, returning empty`);
  //   return {
  //     items: [],
  //     total: 0,
  //     page: 1,
  //     limit: 10,
  //     totalPages: 0,
  //     hasMore: false,
  //     success: false
  //   };
  // }
  
  try {
    const isPaginated = isPaginatedResponse<T>(response);
    // console.log(`🔧 TRANSFORM PAGINATED: isPaginated check:`, {
    //   context,
    //   isPaginated,
    //   responseStructure: {
    //     hasItems: !!(response && typeof response === 'object' && 'items' in response),
    //     itemsLength: (response && typeof response === 'object' && 'items' in response && Array.isArray(response.items)) ? response.items.length : 'NOT_ARRAY',
    //     hasTotal: (response && typeof response === 'object' && 'total' in response && typeof response.total === 'number'),
    //     total: (response && typeof response === 'object' && 'total' in response) ? response.total : 'NONE'
    //   }
    // });
    
    // Handle non-paginated response
    if (!isPaginated) {
      const items = transformItems<T>(response, schema, options);
      // console.log(`🔧 TRANSFORM PAGINATED: Non-paginated result for ${context}:`, {
      //   transformedItemsCount: items.length
      // });
      
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
    // console.log(`🔧 TRANSFORM PAGINATED: About to transform items:`, {
    //   context,
    //   itemsToTransform: paginatedResponse.items?.length || 0,
    //   originalTotal: paginatedResponse.total
    // });
    
    const items = transformItems<T>(paginatedResponse.items, schema, options);
    
    // console.log(`🔧 TRANSFORM PAGINATED: Transform complete:`, {
    //   context,
    //   originalItemsCount: paginatedResponse.items?.length || 0,
    //   transformedItemsCount: items.length,
    //   dataLoss: (paginatedResponse.items?.length || 0) - items.length,
    //   preservedTotal: paginatedResponse.total
    // });

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