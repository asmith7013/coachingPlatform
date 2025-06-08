import { ZodSchema } from 'zod';
import { BaseDocument, WithDateObjects } from '@core-types/document';
import { EntitySelector, SelectorFunction } from '@query/client/selectors/selector-types';
import { handleClientError } from '@error/handlers/client';
import { getEntityLabel, normalizeToArray, validateWithSchema } from '@query/client/utilities/selector-helpers';
import { isCollectionResponse } from "@transformers/utils/response-utils";

/**
 * Creates an entity selector with simple data operations
 */
export function createEntitySelector<T extends BaseDocument>(
  entityType: string, 
  schema: ZodSchema<T>
): EntitySelector<T> {
  // Basic collection selector
  const basic: SelectorFunction<T, T[]> = (data) => {
    try {
      const items = normalizeToArray<unknown>(data);
      return validateWithSchema(items, schema);
    } catch (error) {
      handleClientError(error, `${entityType}.basic`);
      return [];
    }
  };
  
  // Detail selector for single entity
  const detail: SelectorFunction<T, T | null> = (data) => {
    try {
      if (!data) return null;
      
      const items = normalizeToArray<unknown>(data);
      if (items.length === 0) return null;
      
      const result = schema.safeParse(items[0]);
      return result.success ? result.data : items[0] as T;
    } catch (error) {
      handleClientError(error, `${entityType}.detail`);
      return null;
    }
  };
  
  // With dates selector - same as basic for now (dates are handled by sanitization)
  const withDates: SelectorFunction<T, WithDateObjects<T>[]> = (data) => {
    try {
      const items = normalizeToArray<unknown>(data);
      return validateWithSchema(items, schema) as WithDateObjects<T>[];
    } catch (error) {
      handleClientError(error, `${entityType}.withDates`);
      return [];
    }
  };
  
  // Reference selector for dropdowns
  const reference: SelectorFunction<T, Array<{ value: string; label: string }>> = (data) => {
    try {
      const items = normalizeToArray<unknown>(data);
      const validatedItems = validateWithSchema(items, schema);
      
      return validatedItems.map(item => ({
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
      
      const items = normalizeToArray<unknown>(data);
      const validatedItems = validateWithSchema(items, schema);
      
      // Extract pagination metadata if available
      const dataObj = data as Record<string, unknown>;
      const pagination = {
        total: (dataObj.total as number) || validatedItems.length,
        page: (dataObj.page as number) || 1,
        limit: (dataObj.limit as number) || validatedItems.length,
        totalPages: (dataObj.totalPages as number) || 1
      };
      
      return { items: validatedItems, pagination };
    } catch (error) {
      handleClientError(error, `${entityType}.paginated`);
      return { 
        items: [], 
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } 
      };
    }
  };
  
  // Custom transformation function
  const transform = <R extends Record<string, unknown>>(
    transformFn: (item: T) => R
  ): SelectorFunction<T, R[]> => {
    return (data) => {
      try {
        const items = normalizeToArray<unknown>(data);
        const validatedItems = validateWithSchema(items, schema);
        
        return validatedItems.map(transformFn);
      } catch (error) {
        handleClientError(error, `${entityType}.transform`);
        return [];
      }
    };
  };
  
  // Options selector - just validates with schema
  const withOptions = (_options: Record<string, unknown>): SelectorFunction<T, T[]> => {
    return (data) => {
      try {
        const items = normalizeToArray<unknown>(data);
        return validateWithSchema(items, schema);
      } catch (error) {
        handleClientError(error, `${entityType}.withOptions`);
        return [];
      }
    };
  };
  
  // Schema validation
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
    const selector = createEntitySelector(entityType, schema);
    this.selectors.set(entityType, selector as EntitySelector<BaseDocument>);
    return selector;
  }
  
  /**
   * Get a registered selector
   */
  get<T extends BaseDocument>(
    entityType: string,
    schema?: ZodSchema<T>
  ): EntitySelector<T> {
    const existing = this.selectors.get(entityType);
    if (existing) {
      return existing as EntitySelector<T>;
    }
    
    if (!schema) {
      throw new Error(`No schema provided for unregistered entity type: ${entityType}`);
    }
    
    return this.register(entityType, schema);
  }
}

// Global registry instance
const registry = new SelectorRegistry();

/**
 * Register a selector for an entity type
 */
export function registerSelector<T extends BaseDocument>(
  entityType: string,
  schema: ZodSchema<T>
): EntitySelector<T> {
  return registry.register(entityType, schema);
}

/**
 * Get a selector for an entity type
 */
export function getSelector<T extends BaseDocument>(
  entityType: string,
  schema?: ZodSchema<T>
): EntitySelector<T> {
  return registry.get(entityType, schema);
}
