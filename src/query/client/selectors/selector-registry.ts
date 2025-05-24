import { ZodSchema } from 'zod';
import { BaseDocument } from '@core-types/document';
import { EntitySelector } from '@query/client/selectors/selector-types';
import { createEntitySelector } from '@query/client/selectors/selector-factory';

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