import { ZodSchema } from 'zod';
import { BaseDocument, WithDateObjects } from '@core-types/document';
import { EntitySelector, SelectorFunction } from '@query/client/selectors/selector-types';
import { handleClientError } from '@error/handlers/client';
import { transformData, transformSingleItem, TransformOptions } from '@transformers/core/unified-transformer';
import { isCollectionResponse } from '@transformers/utils/response-utils';
import { normalizeToArray, getEntityLabel } from '@query/client/utilities/selector-helpers';

/**
 * Creates an entity selector using the unified transformer
 * 
 * This implementation fully leverages the unified transformer system
 * to provide consistent transformations across all selector functions.
 */
export function createEntitySelector<T extends BaseDocument>(
  entityType: string, 
  schema: ZodSchema<T>
): EntitySelector<T> {
  // Basic collection selector - uses unified transformer directly
  const basic: SelectorFunction<T, T[]> = (data) => {
    try {
      // Use normalizeToArray utility to handle response formats
      const items = normalizeToArray<unknown>(data);
      return transformData<T>(items, {
        schema,
        errorContext: `${entityType}.basic`
      });
    } catch (error) {
      handleClientError(error, `${entityType}.basic`);
      return [];
    }
  };
  
  // Detail selector for single entity - uses unified transformer directly
  const detail: SelectorFunction<T, T | null> = (data) => {
    try {
      if (!data) return null;
      
      // Use normalizeToArray utility and get first item if available
      const items = normalizeToArray<unknown>(data);
      if (items.length === 0) return null;
      
      return transformSingleItem<T>(items[0], {
        schema,
        errorContext: `${entityType}.detail`
      });
    } catch (error) {
      handleClientError(error, `${entityType}.detail`);
      return null;
    }
  };
  
  // With dates selector - explicitly enables date handling
  const withDates: SelectorFunction<T, WithDateObjects<T>[]> = (data) => {
    try {
      // Use normalizeToArray utility to handle response formats
      const items = normalizeToArray<unknown>(data);
      return transformData<T, WithDateObjects<T>>(items, {
        schema,
        handleDates: true, // Enable date handling
        errorContext: `${entityType}.withDates`
      });
    } catch (error) {
      handleClientError(error, `${entityType}.withDates`);
      return [];
    }
  };
  
  // Reference selector for dropdowns - adds label and value properties
  const reference: SelectorFunction<T, Array<{ value: string; label: string }>> = (data) => {
    try {
      // Use normalizeToArray utility to handle response formats
      const items = normalizeToArray<unknown>(data);
      
      // Transform the data with the unified transformer
      const transformedItems = transformData<T>(items, {
        schema,
        errorContext: `${entityType}.reference`
      });
      
      // Map to reference format
      return transformedItems.map(item => ({
        value: item._id,
        label: getEntityLabel(item)
      }));
    } catch (error) {
      handleClientError(error, `${entityType}.reference`);
      return [];
    }
  };
  
  // Paginated selector that preserves pagination metadata
  const paginated = (data: unknown) => {
    try {
      if (!isCollectionResponse(data)) {
        return { items: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
      }
      
      // Use the unified transformer to transform items
      const items = normalizeToArray<unknown>(data);
      const transformedItems = transformData<T>(items, {
        schema,
        errorContext: `${entityType}.paginated`
      });
      
      // Extract pagination metadata if available
      const pagination = {
        total: data.total || transformedItems.length,
        page: (data as { page?: number }).page || 1,
        limit: (data as { limit?: number }).limit || transformedItems.length,
        totalPages: (data as { totalPages?: number }).totalPages || 1
      };
      
      return { items: transformedItems, pagination };
    } catch (error) {
      handleClientError(error, `${entityType}.paginated`);
      return { 
        items: [], 
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } 
      };
    }
  };
  
  // Custom transformation function - uses unified transformer with domain transform
  const transform = <R extends Record<string, unknown>>(
    transformFn: (item: T) => R
  ): SelectorFunction<T, R[]> => {
    return (data) => {
      try {
        // Use normalizeToArray utility to handle response formats
        const items = normalizeToArray<unknown>(data);
        
        // Use the unified transformer with custom domain transform
        return transformData<T, R>(items, {
          schema,
          domainTransform: transformFn,
          errorContext: `${entityType}.transform`
        });
      } catch (error) {
        handleClientError(error, `${entityType}.transform`);
        return [];
      }
    };
  };
  
  // Options selector - passes options directly to unified transformer
  const withOptions = (options: Partial<TransformOptions<T>>): SelectorFunction<T, T[]> => {
    return (data) => {
      try {
        // Use normalizeToArray utility to handle response formats
        const items = normalizeToArray<unknown>(data);
        
        // Use the unified transformer with provided options
        return transformData<T>(items, {
          schema,
          ...options,
          errorContext: options.errorContext || `${entityType}.withOptions`
        });
      } catch (error) {
        handleClientError(error, `${entityType}.withOptions`);
        return [];
      }
    };
  };
  
  // Schema validation - uses the schema directly
  const validate = (data: unknown): boolean => {
    try {
      return schema.safeParse(data).success;
    } catch (error) {
      handleClientError(error, `${entityType}.validate`);
      return false;
    }
  };
  
  return {
    basic,
    detail,
    withDates,
    reference,
    paginated,
    transform,
    withOptions,
    validate
  };
}

/**
 * Registry for entity selectors
 */
class SelectorRegistry {
  private selectors = new Map<string, EntitySelector<BaseDocument>>();
  
  /**
   * Register a selector for an entity type
   */
  register<T extends BaseDocument>(
    entityType: string,
    schema: ZodSchema<T>
  ): EntitySelector<T> {
    const selector = createEntitySelector<T>(entityType, schema);
    this.selectors.set(entityType, selector as EntitySelector<BaseDocument>);
    return selector;
  }
  
  /**
   * Get a selector for an entity type
   */
  get<T extends BaseDocument>(
    entityType: string,
    schema?: ZodSchema<T>
  ): EntitySelector<T> {
    if (this.selectors.has(entityType)) {
      return this.selectors.get(entityType) as EntitySelector<T>;
    }
    
    if (!schema) {
      throw new Error(`No selector registered for "${entityType}" and no schema provided`);
    }
    
    return this.register(entityType, schema);
  }
}

// Export a singleton instance
export const selectorRegistry = new SelectorRegistry();

/**
 * Register a selector for an entity type
 */
export function registerSelector<T extends BaseDocument>(
  entityType: string,
  schema: ZodSchema<T>
): EntitySelector<T> {
  return selectorRegistry.register(entityType, schema);
}

/**
 * Get a selector for an entity type
 */
export function getSelector<T extends BaseDocument>(
  entityType: string,
  schema?: ZodSchema<T>
): EntitySelector<T> {
  return selectorRegistry.get(entityType, schema);
}

// Export for cache-sync usage
export const getSelectors = getSelector;
