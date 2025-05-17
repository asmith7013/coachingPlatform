// src/lib/query/utilities/cache-sync/cache-operations.ts
import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@query/core/keys';
import { CollectionResponse } from '@core-types/response';
import { EntityCacheOperations } from '../../../types/core/cache';
import { BaseDocument } from '@core-types/document';
import { getEntityId, matchesId } from '@data-utilities/transformers/entity-utils';

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
   * Update entity in cache
   */
  const updateEntity = async <T extends BaseDocument>(id: string, updater: (old: T) => T) => {
    // Update in detail query
    queryClient.setQueryData(
      queryKeys.entities.detail(entityType, id),
      (old: CollectionResponse<T> | undefined) => {
        if (!old || !old.items || old.items.length === 0) return old;
        
        return {
          ...old,
          items: [updater(old.items[0] as T)] as unknown[]
        };
      }
    );

    // Update in list queries
    queryClient.setQueriesData(
      { queryKey: queryKeys.entities.list(entityType) },
      (old: CollectionResponse<T> | undefined) => {
        if (!old || !old.items) return old;
        
        return {
          ...old,
          items: old.items.map((item) => {
            const entityItem = item as T;
            // Check if this is the item we want to update
            if (matchesId(entityItem._id, id) || entityItem.id === id) {
              return updater(entityItem);
            }
            return item;
          })
        };
      }
    );
  };

  /**
   * Add entity to list cache
   */
  const addEntity = async <T extends BaseDocument>(entity: T) => {
    queryClient.setQueriesData(
      { queryKey: queryKeys.entities.list(entityType) },
      (old: CollectionResponse<T> | undefined) => {
        if (!old) return { 
          items: [entity] as unknown[], 
          success: true,
          total: 1
        };
        
        // Get entity ID as string
        const entityId = getEntityId(entity);
        
        // Check if entity already exists to avoid duplicates
        const exists = entityId && old.items?.some((item) => {
          const itemId = getEntityId(item as T);
          return itemId === entityId;
        });
        
        if (exists) return old;
        
        return {
          ...old,
          items: [...(old.items || []), entity] as unknown[],
          total: (old.total || 0) + 1
        };
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
        
        const filteredItems = old.items.filter((item) => {
          const entityItem = item as BaseDocument;
          // Remove if neither _id nor id matches
          return !matchesId(entityItem._id, id) && entityItem.id !== id;
        });
        
        return {
          ...old,
          items: filteredItems,
          total: filteredItems.length
        };
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