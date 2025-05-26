import { ZodSchema } from 'zod';
import { BaseDocument, WithDateObjects, DocumentInput } from '@core-types/document';
import { CollectionResponse, EntityResponse, PaginatedResponse } from '@core-types/response';
import { ServerActions } from '@core-types/query-factory';

import { handleClientError } from '@error/handlers/client';
import { 
  transformData, 
  transformSingleItem, 
  transformResponseData, 
  transformEntityData,
  TransformOptions 
} from '@transformers/core/unified-transformer';
import { wrapServerActions as wrapServerActionsFactory } from '@transformers/factories/server-action-factory';

/**
 * Options for TransformationService configuration
 */
export interface TransformationOptions<T extends BaseDocument, R extends BaseDocument> {
  /** Entity type name (for error context) */
  entityType: string;
  
  /** Zod schema for validation */
  schema: ZodSchema<T>;
  
  /** Whether to handle date fields */
  handleDates?: boolean;
  
  /** Custom date fields to handle (defaults to createdAt and updatedAt) */
  dateFields?: (keyof T)[];
  
  /** Domain transformation function */
  domainTransform?: (item: T) => R;
  
  /** Error context prefix */
  errorContext?: string;
  
  /** Use strict validation */
  strictValidation?: boolean;
}

/**
 * Generic Transformation Service that centralizes all transformation logic
 * for a specific entity type, ensuring consistent transformations across
 * all data flows.
 * 
 * This service provides:
 * 1. Document transformation (ObjectId → string)
 * 2. Schema validation
 * 3. Date field handling
 * 4. Domain-specific transformations
 * 5. Response format handling
 */
export class TransformationService<
  T extends BaseDocument,
  R extends BaseDocument = WithDateObjects<T>
> {
  private options: TransformationOptions<T, R>;
  private transformOptions: TransformOptions<T, R>;
  
  constructor(options: TransformationOptions<T, R>) {
    this.options = {
      handleDates: true, // Enable date handling by default
      dateFields: ['createdAt', 'updatedAt'] as (keyof T)[],
      strictValidation: false,
      ...options,
      errorContext: options.errorContext || options.entityType
    };
    
    // Create unified transformer options
    this.transformOptions = {
      schema: options.schema,
      handleDates: options.handleDates ?? true,
      dateFields: options.dateFields,
      domainTransform: options.domainTransform,
      strictValidation: options.strictValidation ?? false,
      errorContext: options.errorContext || options.entityType,
      throwOnError: false
    };
  }
  
  /**
   * Transform an array of items using the unified transformer
   */
  transform(items: unknown[]): R[] {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return [];
    }
    
    try {
      // Use the unified transformer directly
      return transformData<T, R>(items, this.transformOptions);
    } catch (error) {
      handleClientError(error, `${this.options.errorContext}.transform`);
      return [];
    }
  }
  
  /**
   * Transform a single item using the unified transformer
   */
  transformSingle(item: unknown): R | null {
    if (!item) return null;
    
    try {
      // Use the unified transformer directly
      return transformSingleItem<T, R>(item, this.transformOptions);
    } catch (error) {
      handleClientError(error, `${this.options.errorContext}.transformSingle`);
      return null;
    }
  }
  
  /**
   * Transform a collection response
   */
  transformResponse(response: CollectionResponse<unknown> | unknown): CollectionResponse<R> {
    if (!response || typeof response !== 'object') {
      return { success: false, items: [], total: 0 };
    }
    
    try {
      // Use the unified transformer directly
      return transformResponseData<T, R>(
        response as CollectionResponse<unknown>,
        this.transformOptions
      );
    } catch (error) {
      handleClientError(error, `${this.options.errorContext}.transformResponse`);
      return {
        ...(response as object),
        items: [],
        total: 0,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      } as CollectionResponse<R>;
    }
  }
  
  /**
   * Transform a paginated response
   */
  transformPaginatedResponse(response: PaginatedResponse<unknown> | unknown): PaginatedResponse<R> {
    if (!response || typeof response !== 'object') {
      return { 
        success: false, 
        items: [], 
        total: 0, 
        page: 1, 
        limit: 10, 
        totalPages: 0,
        hasMore: false 
      };
    }
    
    try {
      // First transform using the unified transformer
      const transformed = transformResponseData<T, R>(
        response as CollectionResponse<unknown>,
        this.transformOptions
      );
      
      // Then add pagination metadata
      return {
        ...response,
        ...transformed,
        empty: transformed.items.length === 0
      } as PaginatedResponse<R>;
    } catch (error) {
      handleClientError(error, `${this.options.errorContext}.transformPaginatedResponse`);
      return {
        ...(response as object),
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasMore: false,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      } as PaginatedResponse<R>;
    }
  }
  
  /**
   * Transform an entity response
   */
  transformEntityResponse(response: EntityResponse<unknown> | unknown): EntityResponse<R> {
    if (!response || typeof response !== 'object') {
      return { success: false, data: null as unknown as R };
    }
    
    try {
      // Use the unified transformer directly
      const result = transformEntityData<T, R>(
        response as EntityResponse<unknown>,
        this.transformOptions
      );
      
      // Handle the case where transformEntityData might return null
      if (result.data === null) {
        return {
          ...result,
          data: null as unknown as R,
          success: false
        };
      }
      
      return {
        ...result,
        data: result.data as R,
        success: true
      } as EntityResponse<R>;
    } catch (error) {
      handleClientError(error, `${this.options.errorContext}.transformEntityResponse`);
      return {
        ...(response as object),
        data: null as unknown as R,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      } as EntityResponse<R>;
    }
  }
  
  /**
   * Create wrapped server actions that apply this transformation
   * 
   * This method uses the server-action-factory to ensure consistent handling
   * of different response types while preserving the transformation pipeline.
   */
  wrapServerActions<TInput extends Record<string, unknown>>(
    actions: ServerActions<T, TInput>
  ): ServerActions<R, DocumentInput<R>> {
    // Create a transformer function that the factory can use
    const transformerFn = (items: T[]): R[] => {
      return this.transform(items);
    };
    
    // Use the server action factory with our transformer
    return wrapServerActionsFactory<
      T,                         // Original document type
      R,                         // Transformed document type 
      TInput,                    // Original input type
      DocumentInput<R>           // Input type for transformed document
    >(
      actions,
      transformerFn
    );
  }
  
  /**
   * Get the configuration options (for debugging)
   */
  getOptions(): TransformationOptions<T, R> {
    return { ...this.options };
  }
  
  /**
   * Get the unified transformer options (for advanced usage)
   */
  getTransformOptions(): TransformOptions<T, R> {
    return { ...this.transformOptions };
  }
}

/**
 * Create a transformation service for a specific entity type
 */
export function createTransformationService<
  T extends BaseDocument,
  R extends BaseDocument = WithDateObjects<T>
>(options: TransformationOptions<T, R>): TransformationService<T, R> {
  return new TransformationService<T, R>(options);
} 