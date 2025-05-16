import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';
import { StandardResponse } from '@core-types/response';
import { EntityCacheOperations } from './types';

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
  const updateEntity = async <T>(id: string, updater: (old: T) => T) => {
    // Update in detail query
    queryClient.setQueryData(
      queryKeys.entities.detail(entityType, id),
      (old: StandardResponse<T> | undefined) => {
        if (!old || !old.items || old.items.length === 0) return old;
        
        return {
          ...old,
          items: [updater(old.items[0] as T)] as any
        };
      }
    );

    // Update in list queries
    queryClient.setQueriesData(
      { queryKey: queryKeys.entities.list(entityType) },
      (old: StandardResponse<T> | undefined) => {
        if (!old || !old.items) return old;
        
        return {
          ...old,
          items: old.items.map((item: any) => {
            if ((item._id === id || item.id === id)) {
              return updater(item as T);
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
  const addEntity = async <T>(entity: T) => {
    queryClient.setQueriesData(
      { queryKey: queryKeys.entities.list(entityType) },
      (old: StandardResponse<T> | undefined) => {
        if (!old) return { 
          items: [entity] as any, 
          success: true,
          total: 1
        };
        
        // Handle entities with _id or id property
        const entityId = (entity as any)._id || (entity as any).id;
        
        // Check if entity already exists to avoid duplicates
        const exists = old.items?.some((item: any) => 
          (item._id === entityId || item.id === entityId)
        );
        
        if (exists) return old;
        
        return {
          ...old,
          items: [...(old.items || []), entity] as any,
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
      (old: StandardResponse<unknown> | undefined) => {
        if (!old || !old.items) return old;
        
        const filteredItems = old.items.filter((item: any) => 
          item._id !== id && item.id !== id
        );
        
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