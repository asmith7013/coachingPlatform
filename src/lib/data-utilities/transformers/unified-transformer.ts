import { ZodSchema } from 'zod';
import { BaseDocument, WithDateObjects } from '@core-types/document';
import { CollectionResponse, EntityResponse } from '@core-types/response';
import { transformDocument } from '@transformers/core/document';
import { 
  validateSafe, 
  validateStrict 
} from '@transformers/core/validation';
import { 
  applyDomainTransform, 
  createDomainPipeline 
} from '@transformers/factories/domain-factory';
import { handleClientError } from '@error/handlers/client';

/**
 * Options for the unified transformation utility
 */
export interface TransformOptions<T extends BaseDocument, R = T> {
  // Schema validation options
  schema?: ZodSchema<T>;
  strictValidation?: boolean;
  
  // Date handling options
  handleDates?: boolean;
  dateFields?: (keyof T)[];
  
  // Domain transformation options
  domainTransform?: (item: T) => R;
  
  // Error handling options
  throwOnError?: boolean;
  errorContext?: string;
  
  // Cache options
  skipCache?: boolean;
}

/**
 * Memoization cache for transformed collections
 * Uses WeakMap to avoid memory leaks
 */
export const transformCache = new WeakMap<object[], unknown[]>();

/**
 * Processes dates in an entity according to options
 * Extracted for better separation of concerns
 */
function processDateFields<T extends BaseDocument>(
  entity: T, 
  options: Pick<TransformOptions<T>, 'handleDates' | 'dateFields'>
): T {
  if (!options.handleDates) return entity;
  
  const dateFields = options.dateFields || ['createdAt', 'updatedAt'];
  const result = { ...entity } as T;
  
  for (const field of dateFields) {
    const value = entity[field as keyof T];
    if (value !== undefined && typeof value === 'string') {
      (result as Record<keyof T, unknown>)[field] = new Date(value);
    } else if (value !== undefined && value instanceof Date) {
      (result as Record<keyof T, unknown>)[field] = value;
    }
  }
  
  return result;
}

/**
 * Core transformation function that applies the layered transformation pipeline:
 * 1. MongoDB document transformation
 * 2. Schema validation (if schema provided)
 * 3a. Date field processing (if requested)
 * 3b. Domain-specific transformation (if provided)
 */
function transformItem<T extends BaseDocument, R = T>(
  item: unknown,
  options: TransformOptions<T, R>
): R | null {
  try {
    // Layer 1: MongoDB document transformation
    const dbTransformed = transformDocument(item) as T;
    
    // Layer 2: Schema validation (if schema provided)
    let validated: T | null = dbTransformed;
    if (options.schema) {
      validated = options.strictValidation
        ? validateStrict(options.schema, dbTransformed)
        : validateSafe(options.schema, dbTransformed);
      
      if (!validated) return null;
    }
    
    // Layer 3a: Date transformation (if requested)
    const withDates = processDateFields(validated, options);
    
    // Layer 3b: Domain-specific transformation (if provided)
    if (options.domainTransform) {
      if (options.schema) {
        // Use the existing domain transformer infrastructure when schema is available
        const pipeline = createDomainPipeline(options.schema, options.domainTransform);
        return applyDomainTransform(withDates, pipeline) as R;
      }
      // Fall back to direct transformation when no schema is provided
      return options.domainTransform(withDates);
    }
    
    return withDates as unknown as R;
  } catch (error) {
    // Handle item-level errors
    if (options.throwOnError) {
      throw error;
    }
    handleClientError(error, options.errorContext || 'itemTransform');
    return null;
  }
}

/**
 * Unified transformation utility that handles all transformation cases
 */
export function transformData<
  T extends BaseDocument, 
  R extends Record<string, unknown> = T
>(
  data: unknown[] | undefined | null,
  options: TransformOptions<T, R>
): R[] {
  try {
    // Handle empty case
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [] as R[];
    }
    
    // Check cache first (if not disabled)
    if (!options.skipCache) {
      const itemsArray = data as object[];
      if (transformCache.has(itemsArray)) {
        return transformCache.get(itemsArray) as R[];
      }
    }
    
    // Transform each item using the core transformation pipeline
    const result = data
      .map(item => transformItem<T, R>(item, options))
      .filter((item): item is R => item !== null);
    
    // Cache the result if caching isn't disabled
    if (!options.skipCache && result.length > 0) {
      transformCache.set(data as object[], result);
    }
    
    return result;
  } catch (error) {
    // Handle collection-level errors
    if (options.throwOnError) {
      throw error;
    }
    handleClientError(error, options.errorContext || 'dataTransform');
    return [] as R[];
  }
}

/**
 * Transform a collection response using the unified transformer
 */
export function transformResponseData<
  T extends BaseDocument, 
  R extends Record<string, unknown> = T
>(
  response: CollectionResponse<unknown> | undefined | null,
  options: TransformOptions<T, R>
): CollectionResponse<R> {
  if (!response) {
    return { success: false, items: [], total: 0 };
  }
  
  try {
    // Transform the items
    const transformedItems = transformData<T, R>(response.items, options);
    
    // Return the transformed response
    return {
      ...response,
      items: transformedItems,
      total: response.total || transformedItems.length
    };
  } catch (error) {
    handleClientError(error, options.errorContext || 'responseTransform');
    return {
      ...response,
      items: [] as R[],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Transform an entity response using the unified transformer
 */
  export function transformEntityData<
    T extends BaseDocument, 
    R extends Record<string, unknown> = T
  >(
    response: EntityResponse<unknown> | undefined | null,
    options: TransformOptions<T, R>
  ): EntityResponse<R | null> {
  if (!response) {
    return { success: false, data: null as unknown as R };
  }
  
  try {
    // Transform the entity
    const transformed = transformSingleItem<T, R>(response.data, options);
    
    // Return the transformed response
    return {
      ...response,
      data: transformed as R,
      success: Boolean(transformed)
    };
  } catch (error) {
    handleClientError(error, options.errorContext || 'entityTransform');
    return {
      ...response,
      data: null as unknown as R,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Transform a single item using the unified transformer
 */
export function transformSingleItem<
  T extends BaseDocument, 
  R extends Record<string, unknown> = T
>(
  item: unknown,
  options: TransformOptions<T, R>
): R | null {
  if (!item) return null;
  
  return transformItem<T, R>(item, options);
}

/**
 * Convenience function for date transformation
 */
export function withDates<T extends BaseDocument>(item: T): WithDateObjects<T> {
  return transformSingleItem(item, { 
    handleDates: true,
    errorContext: 'withDates'
  }) as WithDateObjects<T>;
}

/**
 * Create a transformer with fixed options
 */
export function createTransformer<
  T extends BaseDocument, 
  R extends Record<string, unknown> = T
>(
  baseOptions: TransformOptions<T, R>
): {
  transform: (data: unknown[] | undefined | null, additionalOptions?: Partial<TransformOptions<T, R>>) => R[];
  transformResponse: (response: CollectionResponse<unknown> | undefined | null, additionalOptions?: Partial<TransformOptions<T, R>>) => CollectionResponse<R>;
  transformEntity: (response: EntityResponse<unknown> | undefined | null, additionalOptions?: Partial<TransformOptions<T, R>>) => EntityResponse<R | null>;
  transformSingle: (item: unknown, additionalOptions?: Partial<TransformOptions<T, R>>) => R | null;
} {
  return {
    transform: (data, additionalOptions = {}) => 
      transformData<T, R>(data, { ...baseOptions, ...additionalOptions }),
      
    transformResponse: (response, additionalOptions = {}) => 
      transformResponseData<T, R>(response, { ...baseOptions, ...additionalOptions }),
      
    transformEntity: (response, additionalOptions = {}) => 
      transformEntityData<T, R>(response, { ...baseOptions, ...additionalOptions }),
      
    transformSingle: (item, additionalOptions = {}) => 
      transformSingleItem<T, R>(item, { ...baseOptions, ...additionalOptions })
  };
}

/**
 * Usage Examples:
 * 
 * Basic usage with schema:
 * ```typescript
 * const items = transformData(data, { schema: MySchema });
 * ```
 * 
 * With date handling:
 * ```typescript
 * const items = transformData(data, { 
 *   schema: MySchema, 
 *   handleDates: true 
 * });
 * ```
 * 
 * With domain transformation:
 * ```typescript
 * const items = transformData(data, { 
 *   schema: MySchema, 
 *   domainTransform: (item) => ({
 *     ...item,
 *     fullName: `${item.firstName} ${item.lastName}`
 *   })
 * });
 * ```
 * 
 * Creating a reusable transformer:
 * ```typescript
 * const schoolTransformer = createTransformer({
 *   schema: SchoolZodSchema,
 *   handleDates: true,
 *   errorContext: 'SchoolTransformer'
 * });
 * 
 * // Then use it like this:
 * const schools = schoolTransformer.transform(data);
 * const schoolResponse = schoolTransformer.transformResponse(response);
 * ```
 */ 