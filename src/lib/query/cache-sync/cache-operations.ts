// src/lib/query/utilities/cache-sync/cache-operations.ts
import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@query/core/keys';
import { CollectionResponse } from '@core-types/response';
import { BaseDocument } from '@core-types/document';
import { EntityCacheOperations } from '@core-types/cache';
import { handleClientError } from '@error/handlers/client';
import { getSelectors } from '@query/selectors/selector-registry';

/**
 * Create entity-specific cache operations
 * 
 * @param queryClient - The React Query client instance
 * @param entityType - The type of entity to create operations for
 * @returns Object with cache operations for the entity
 */
export function createEntityCacheOperations(
  queryClient: QueryClient,
  entityType: string
): EntityCacheOperations {
  // Get selectors for this entity type
  const selectors = getSelectors(entityType);
  
  /**
   * Invalidate all list queries for the entity
   */
  const invalidateList = async () => {
    await queryClient.invalidateQueries({ 
      queryKey: queryKeys.entities.list(entityType)
    });
  };

  /**
   * Invalidate a specific entity by ID
   */
  const invalidateDetail = async (id: string) => {
    await queryClient.invalidateQueries({ 
      queryKey: queryKeys.entities.detail(entityType, id),
      exact: true
    });
  };

  /**
   * Update entity in cache with consistent transformation
   */
  const updateEntity = async <T extends BaseDocument>(
    id: string, 
    updater: (old: T) => T
  ) => {
    // Update in detail query
    queryClient.setQueryData(
      queryKeys.entities.detail(entityType, id),
      (old: CollectionResponse<T> | undefined) => {
        if (!old || !old.items || old.items.length === 0) return old;
        
        try {
          // Use the detail selector to transform the entity consistently
          const entity = selectors.detail(old);
          if (!entity) return old;
          
          // Apply the update
          const updated = updater(entity as T);
          
          return {
            ...old,
            items: [updated]
          };
        } catch (error) {
          handleClientError(error, `${entityType}CacheUpdate`);
          return old; // Return original data on error
        }
      }
    );

    // Update in list queries
    queryClient.setQueriesData(
      { queryKey: queryKeys.entities.list(entityType) },
      (old: CollectionResponse<T> | undefined) => {
        if (!old || !old.items) return old;
        
        try {
          // Use the basic selector to transform the list consistently
          const items = selectors.basic(old) as T[];
          
          // Apply the update to the matching item
          const updatedItems = items.map(item => {
            if (item._id === id || item.id === id) {
              return updater(item);
            }
            return item;
          });
          
          return {
            ...old,
            items: updatedItems
          };
        } catch (error) {
          handleClientError(error, `${entityType}CacheListUpdate`);
          return old; // Return original data on error
        }
      }
    );
  };

  /**
   * Add entity to list cache with consistent transformation
   */
  const addEntity = async <T extends BaseDocument>(entity: T) => {
    queryClient.setQueriesData(
      { queryKey: queryKeys.entities.list(entityType) },
      (old: CollectionResponse<T> | undefined) => {
        try {
          // If no existing data, create a new response
          if (!old) return { 
            items: [entity], 
            success: true,
            total: 1
          };
          
          // Use the selector to transform existing items
          const items = selectors.basic(old) as T[];
          
          // Check if entity already exists to avoid duplicates
          const exists = items.some(item => item._id === entity._id);
          if (exists) return old;
          
          // Add the new entity to the list
          return {
            ...old,
            items: [...old.items, entity],
            total: (old.total || 0) + 1
          };
        } catch (error) {
          handleClientError(error, `${entityType}CacheAdd`);
          return old; // Return original data on error
        }
      }
    );
  };

  /**
   * Remove entity from list cache
   */
  const removeEntity = async (id: string) => {
    // Remove from detail cache
    queryClient.removeQueries({ 
      queryKey: queryKeys.entities.detail(entityType, id),
      exact: true 
    });

    // Update list caches
    queryClient.setQueriesData(
      { queryKey: queryKeys.entities.list(entityType) },
      (old: CollectionResponse<unknown> | undefined) => {
        if (!old || !old.items) return old;
        
        try {
          // Use the selector to transform the items
          const items = selectors.basic(old);
          
          // Filter out the item to remove
          const filteredItems = items.filter(item => 
            item._id !== id && item.id !== id
          );
          
          return {
            ...old,
            items: filteredItems,
            total: filteredItems.length
          };
        } catch (error) {
          handleClientError(error, `${entityType}CacheRemove`);
          return old; // Return original data on error
        }
      }
    );
  };

  return {
    invalidateList,
    invalidateDetail,
    updateEntity,
    addEntity,
    removeEntity
  };
}