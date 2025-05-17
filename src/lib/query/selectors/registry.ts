import { CollectionResponse } from '@core-types/response';
import { handleClientError } from '@error/handle-client-error';
import { BaseDocument } from '@core-types/document';

/**
 * Type for selector functions that transform API responses
 */
export type SelectorFunction<T extends BaseDocument, R = T[]> = (data: CollectionResponse<T>) => R;

/**
 * Registry to store entity-specific selectors
 */
const selectorRegistry: Record<string, SelectorFunction<BaseDocument>> = {};

/**
 * Register a selector function for an entity type
 * 
 * @param entityType The entity type (e.g., 'schools', 'staff')
 * @param selector The selector function to register
 */
export function registerEntitySelector<T extends BaseDocument, R = T[]>(
  entityType: string,
  selector: SelectorFunction<T, R>
): void {
  selectorRegistry[entityType] = selector as unknown as SelectorFunction<BaseDocument>;
}

/**
 * Get a selector function for an entity type
 * Falls back to default selector if none registered
 * 
 * @param entityType The entity type to get selector for
 * @returns The registered selector function or default
 */
export function getEntitySelector<T extends BaseDocument, R = T[]>(
  entityType: string
): SelectorFunction<T, R> {
  return (selectorRegistry[entityType] || defaultSelector) as unknown as SelectorFunction<T, R>;
}

/**
 * Default selector that extracts items from a standard response
 * 
 * @param data The standard response data
 * @returns The items array from the response
 */
export function defaultSelector<T extends BaseDocument>(data: CollectionResponse<T>): T[] {
  try {
    return data?.items || [];
  } catch (error) {
    // Handle any transformation errors
    handleClientError(error, 'DefaultSelector');
    return [];
  }
}

/**
 * Safely execute a selector function with error handling
 * 
 * @param data The input data
 * @param selector The selector function to use
 * @param entityType The entity type (for error context)
 * @returns The transformed data or empty array on error
 */
export function safelyApplySelector<T extends BaseDocument, R = T[]>(
  data: CollectionResponse<T>,
  selector: SelectorFunction<T, R>,
  entityType: string
): R {
  try {
    return selector(data);
  } catch (error) {
    handleClientError(error, `${entityType}Selector`);
    // Return empty array as fallback
    return ([] as unknown) as R;
  }
}

// Export registry for testing/debugging
export { selectorRegistry }; 