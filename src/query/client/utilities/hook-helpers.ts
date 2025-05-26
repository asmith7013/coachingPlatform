// src/query/client/utilities/hook-helpers.ts

import { ZodSchema } from 'zod';
import { BaseDocument } from '@core-types/document';
import { EntitySelector } from '@query/client/selectors/selector-types';
import { getSelector } from '@query/client/selectors/selector-factory';
import { isCollectionResponse, isPaginatedResponse, isEntityResponse } from '@transformers/utils/response-utils';
import { CollectionResponse, EntityResponse, PaginatedResponse } from '@core-types/response';
import {
  transformData,
  transformSingleItem as transformSingleItemUnified,
  transformResponseData,
  transformEntityData,
  transformItemsWithSchema,
  transformItemWithSchema,
  TransformOptions
} from '@transformers/core/unified-transformer';
import { ensureBaseDocumentCompatibility } from '@zod-schema/base-schemas';

/**
 * Options for transformation operations
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
 * Extract and normalize items from various response formats
 * 
 * @param data - The data to extract items from
 * @returns Array of items or empty array if none found
 */
export function extractNormalizedItems<T>(data: unknown): unknown[] {
  if (isCollectionResponse<T>(data) || isPaginatedResponse<T>(data)) {
    return (data as { items: unknown[] }).items || [];
  }
  
  if (Array.isArray(data)) {
    return data;
  }
  
  if (isEntityResponse<T>(data)) {
    return [(data as { data: unknown }).data];
  }
  
  if (data && typeof data === 'object' && 'items' in data && Array.isArray((data as { items: unknown[] }).items)) {
    return (data as { items: unknown[] }).items;
  }
  
  // For single item, wrap in array
  return data ? [data] : [];
}

/**
 * Extract a single item from various response formats
 * 
 * @param data - The data to extract an item from
 * @returns The extracted item or null if none found
 */
export function extractSingleItem<T>(data: unknown): unknown | null {
  if (isEntityResponse<T>(data)) {
    return (data as { data: unknown }).data;
  }
  
  if (isCollectionResponse<T>(data) || isPaginatedResponse<T>(data)) {
    const items = (data as { items: unknown[] }).items;
    return items && items.length > 0 ? items[0] : null;
  }
  
  if (Array.isArray(data)) {
    return data.length > 0 ? data[0] : null;
  }
  
  if (data && typeof data === 'object') {
    if ('data' in data) {
      return (data as { data: unknown }).data;
    }
    
    if ('items' in data && Array.isArray((data as { items: unknown[] }).items)) {
      const items = (data as { items: unknown[] }).items;
      return items.length > 0 ? items[0] : null;
    }
  }
  
  return data || null;
}

/**
 * Convert transformation options to unified transformer options
 * Updated to use the compatibility helper
 */
function convertToUnifiedOptions<T extends BaseDocument, R extends Record<string, unknown> = T>(
  schema: ZodSchema<T>,
  options?: TransformationOptions<T>
): TransformOptions<T, R> {
  // Create base unified options from schema and options
  const unifiedOptions: TransformOptions<T, R> = {
    schema: ensureBaseDocumentCompatibility<T>(schema),
    handleDates: true, // Always handle dates by default
    errorContext: options?.errorContext || 'transform',
    strictValidation: false // Use safe validation by default
  };
  
  // Handle selector-based transformations
  if (options?.useSelector && (options.entityType || options.selector)) {
    try {
      // Get the selector
      const selector = options.selector || 
        (options.entityType ? getSelector<T>(options.entityType, schema) : undefined);
      
      if (selector) {
        // Use the selector's transform function as the domain transform
        unifiedOptions.domainTransform = (item: T) => {
          const transformed = selector.transform(item => item)([item])[0];
          return transformed as unknown as R;
        };
      }
    } catch (error) {
      console.error(`Error setting up selector-based transform: ${options.errorContext || ''}`, error);
      // Continue without domain transform if selector setup fails
    }
  }
  
  return unifiedOptions;
}

/**
 * Transform array of items using the unified transformer
 * Simplified to use transformItemsWithSchema when appropriate
 * 
 * @param data - The data containing items to transform
 * @param schema - Zod schema for validation
 * @param options - Transformation options
 * @returns Transformed array of items
 */
export function transformItems<T extends BaseDocument, R extends Record<string, unknown> = T>(
  data: unknown,
  schema: ZodSchema<T>,
  options?: TransformationOptions<T>
): R[] {
  try {
    // Extract items from the data
    const items = extractNormalizedItems<T>(data);
    
    // If no selector is needed, use the simplified helper
    if (!options?.useSelector) {
      return transformItemsWithSchema<T>(items, schema) as unknown as R[];
    }
    
    // Otherwise use the full options approach
    const unifiedOptions = convertToUnifiedOptions<T, R>(schema, options);
    return transformData<T, R>(items, unifiedOptions);
  } catch (error) {
    // Log error with context for debugging
    console.error(`Error in transformItems: ${options?.errorContext || ''}`, error);
    return [] as unknown as R[];
  }
}

/**
 * Transform a single item using the unified transformer
 * Simplified to use transformItemWithSchema when appropriate
 * 
 * @param data - The data containing the item to transform
 * @param schema - Zod schema for validation
 * @param options - Transformation options
 * @returns Transformed item or null if transformation fails
 */
export function transformSingleItem<T extends BaseDocument, R extends Record<string, unknown> = T>(
  data: unknown,
  schema: ZodSchema<T>,
  options?: TransformationOptions<T>
): R | null {
  try {
    // Extract single item from the data
    const item = extractSingleItem<T>(data);
    
    if (!item) return null;
    
    // If no selector is needed, use the simplified helper
    if (!options?.useSelector) {
      return transformItemWithSchema<T>(item, schema) as unknown as R;
    }
    
    // Otherwise use the full options approach
    const unifiedOptions = convertToUnifiedOptions<T, R>(schema, options);
    return transformSingleItemUnified<T, R>(item, unifiedOptions);
  } catch (error) {
    // Log error with context for debugging
    console.error(`Error in transformSingleItem: ${options?.errorContext || ''}`, error);
    return null;
  }
}

/**
 * Transform a paginated response while preserving pagination metadata
 * using the unified transformer
 * 
 * @param response - The paginated response to transform
 * @param schema - Zod schema for validation
 * @param options - Transformation options
 * @returns Transformed paginated response
 */
export function transformPaginatedResponse<T extends BaseDocument, R extends Record<string, unknown> = T>(
  response: PaginatedResponse<T> | unknown,
  schema: ZodSchema<T>,
  options?: TransformationOptions<T>
): PaginatedResponse<R> {
  if (!response || typeof response !== 'object') {
    // Return empty paginated response if input is invalid
    return {
      items: [] as unknown as R[],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      hasMore: false,
      success: false
    } as PaginatedResponse<R>;
  }
  
  try {
    // Convert to unified transformer options
    const unifiedOptions = convertToUnifiedOptions<T, R>(schema, options);
    
    // Handle non-paginated response
    if (!isPaginatedResponse<T>(response)) {
      // Transform using the unified transformer
      const items = transformData<T, R>(
        extractNormalizedItems(response),
        unifiedOptions
      );
      
      return {
        items,
        total: items.length,
        page: 1,
        limit: items.length || 10,
        totalPages: 1,
        hasMore: false,
        success: true
      } as PaginatedResponse<R>;
    }
    
    // Use the unified transformer for collection response
    const result = transformResponseData<T, R>(
      response as CollectionResponse<unknown>,
      unifiedOptions
    );
    
    // Add pagination metadata
    return {
      ...response,
      ...result,
      items: result.items
    } as PaginatedResponse<R>;
  } catch (error) {
    // Log error with context for debugging
    console.error(`Error in transformPaginatedResponse: ${options?.errorContext || ''}`, error);
    
    // Return safe fallback
    return {
      ...(typeof response === 'object' ? response : {}),
      items: [] as unknown as R[],
      success: false
    } as PaginatedResponse<R>;
  }
}

/**
 * Transform a collection response while preserving metadata
 * using the unified transformer
 * 
 * @param response - The collection response to transform
 * @param schema - Zod schema for validation
 * @param options - Transformation options
 * @returns Transformed collection response
 */
export function transformCollectionResponse<T extends BaseDocument, R extends Record<string, unknown> = T>(
  response: CollectionResponse<T> | unknown,
  schema: ZodSchema<T>,
  options?: TransformationOptions<T>
): CollectionResponse<R> {
  if (!response || typeof response !== 'object') {
    // Return empty collection response if input is invalid
    return {
      items: [] as unknown as R[],
      total: 0,
      success: false
    } as CollectionResponse<R>;
  }
  
  try {
    // Convert to unified transformer options
    const unifiedOptions = convertToUnifiedOptions<T, R>(schema, options);
    
    // Handle non-collection response
    if (!isCollectionResponse<T>(response)) {
      // Transform using the unified transformer
      const items = transformData<T, R>(
        extractNormalizedItems(response),
        unifiedOptions
      );
      
      return {
        items,
        total: items.length,
        success: true
      } as CollectionResponse<R>;
    }
    
    // Use the unified transformer
    return transformResponseData<T, R>(
      response as CollectionResponse<unknown>,
      unifiedOptions
    );
  } catch (error) {
    // Log error with context for debugging
    console.error(`Error in transformCollectionResponse: ${options?.errorContext || ''}`, error);
    
    // Return safe fallback
    return {
      ...(typeof response === 'object' ? response : {}),
      items: [] as unknown as R[],
      success: false
    } as CollectionResponse<R>;
  }
}

/**
 * Transform an entity response while preserving metadata
 * using the unified transformer
 * 
 * @param response - The entity response to transform
 * @param schema - Zod schema for validation
 * @param options - Transformation options
 * @returns Transformed entity response
 */
export function transformEntityResponse<T extends BaseDocument, R extends Record<string, unknown> = T>(
  response: EntityResponse<T> | unknown,
  schema: ZodSchema<T>,
  options?: TransformationOptions<T>
): EntityResponse<R | null> {
  if (!response || typeof response !== 'object') {
    // Return empty entity response if input is invalid
    return {
      data: null,
      success: false
    } as EntityResponse<R | null>;
  }
  
  try {
    // Convert to unified transformer options
    const unifiedOptions = convertToUnifiedOptions<T, R>(schema, options);
    
    // Handle non-entity response
    if (!isEntityResponse<T>(response)) {
      // Transform using the unified transformer
      const item = transformSingleItemUnified<T, R>(
        extractSingleItem(response),
        unifiedOptions
      );
      
      return {
        data: item,
        success: !!item
      } as EntityResponse<R | null>;
    }
    
    // Use the unified transformer
    return transformEntityData<T, R>(
      response as EntityResponse<unknown>,
      unifiedOptions
    );
  } catch (error) {
    // Log error with context for debugging
    console.error(`Error in transformEntityResponse: ${options?.errorContext || ''}`, error);
    
    // Return safe fallback
    return {
      ...(typeof response === 'object' ? response : {}),
      data: null,
      success: false
    } as EntityResponse<R | null>;
  }
}