import { ZodSchema } from 'zod';
import { BaseDocument, WithDateObjects } from '@core-types/document';
import { 
  createTransformer, 
  TransformOptions 
} from '@transformers/unified-transformer';
import { EntitySelector, SelectorFunction } from '@query/client/selectors/selector-types';
import { handleClientError } from '@error/handlers/client';
import { CollectionResponse, EntityResponse } from '@core-types/response';

/**
 * Helper to handle selector errors consistently
 */
function withErrorHandling<R>(
  fn: () => R,
  fallback: R,
  context: string
): R {
  try {
    return fn();
  } catch (error) {
    handleClientError(error, context);
    return fallback;
  }
}

/**
 * Gets a label for an entity for reference selectors
 */
function getEntityLabel(item: BaseDocument): string {
  if (!item) return '';
  
  if ('name' in item && typeof item.name === 'string') return item.name;
  if ('title' in item && typeof item.title === 'string') return item.title;
  if ('schoolName' in item && typeof item.schoolName === 'string') return item.schoolName;
  if ('staffName' in item && typeof item.staffName === 'string') return item.staffName;
  
  return `Item ${item._id}`;
}

/**
 * Type guard for collection response
 */
function isCollectionResponse(data: unknown): data is CollectionResponse<unknown> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'items' in data &&
    Array.isArray((data as CollectionResponse<unknown>).items)
  );
}

/**
 * Type guard for entity response
 */
function isEntityResponse(data: unknown): data is EntityResponse<unknown> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'data' in data
  );
}

/**
 * Creates an entity selector using the unified transformer
 */
export function createEntitySelector<T extends BaseDocument>(
  entityType: string, 
  schema: ZodSchema<T>
): EntitySelector<T> {
  // Create a base transformer for this entity
  const baseTransformer = createTransformer<T>({
    schema,
    errorContext: `${entityType}Selector`
  });
  
  // Basic collection selector
  const basic: SelectorFunction<T, T[]> = (data) => {
    return withErrorHandling(
      () => baseTransformer.transformResponse(data as CollectionResponse<unknown>).items,
      [],
      `${entityType}.basic`
    );
  };
  
  // Detail selector for single entity
  const detail: SelectorFunction<T, T | null> = (data) => {
    return withErrorHandling(() => {
      if (!data) return null;
      
      // Handle entity response format
      if (isEntityResponse(data)) {
        return baseTransformer.transformSingle(data.data);
      }
      
      // Handle collection response format
      if (isCollectionResponse(data)) {
        const items = data.items;
        return items.length > 0 ? baseTransformer.transformSingle(items[0]) : null;
      }
      
      // Handle direct data
      return baseTransformer.transformSingle(data);
    }, null, `${entityType}.detail`);
  };
  
  // With dates selector
  const withDates: SelectorFunction<T, WithDateObjects<T>[]> = (data) => {
    return withErrorHandling(
      () => baseTransformer.transformResponse(data as CollectionResponse<unknown>, { handleDates: true }).items as WithDateObjects<T>[],
      [],
      `${entityType}.withDates`
    );
  };
  
  // Reference selector for dropdowns
  const reference: SelectorFunction<T, Array<{ value: string; label: string }>> = (data) => {
    return withErrorHandling(() => {
      return baseTransformer.transformResponse(data as CollectionResponse<unknown>).items.map(item => ({
        value: item._id,
        label: getEntityLabel(item)
      }));
    }, [], `${entityType}.reference`);
  };
  
  // Paginated selector that preserves pagination metadata
  const paginated = (data: unknown) => {
    return withErrorHandling(() => {
      const response = baseTransformer.transformResponse(data as CollectionResponse<unknown>);
      const items = response.items;
      
      // Extract pagination metadata if available
      const pagination = {
        total: isCollectionResponse(data) ? data.total || items.length : items.length,
        page: isCollectionResponse(data) ? (data as { page?: number }).page || 1 : 1,
        limit: isCollectionResponse(data) ? (data as { limit?: number }).limit || items.length : items.length,
        totalPages: isCollectionResponse(data) ? (data as { totalPages?: number }).totalPages || 1 : 1
      };
      
      return { items, pagination };
    }, { 
      items: [], 
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } 
    }, `${entityType}.paginated`);
  };
  
  // Custom transformation function
  const transform = <R>(transformFn: (item: T) => R): SelectorFunction<T, R[]> => {
    return (data) => {
      return withErrorHandling(() => {
        const items = baseTransformer.transformResponse(data as CollectionResponse<unknown>).items;
        return items.map(transformFn);
      }, [], `${entityType}.transform`);
    };
  };
  
  // Raw options selector
  const withOptions = (options: Partial<TransformOptions<T>>): SelectorFunction<T, T[]> => {
    return (data) => {
      return withErrorHandling(() => {
        return baseTransformer.transformResponse(data as CollectionResponse<unknown>, options).items;
      }, [], `${entityType}.withOptions`);
    };
  };
  
  // Schema validation
  const validate = (data: unknown): boolean => {
    return withErrorHandling(() => {
      return schema.safeParse(data).success;
    }, false, `${entityType}.validate`);
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