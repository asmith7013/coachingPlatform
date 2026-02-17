// src/lib/query/utilities/cache-sync/cache-operations.ts
import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/query/core/keys";
import { CollectionResponse } from "@core-types/response";
import { BaseDocument } from "@core-types/document";
import { EntityCacheOperations } from "@core-types/cache";
import { handleClientError } from "@error/handlers/client";

/**
 * Create entity-specific cache operations
 *
 * @param queryClient - The React Query client instance
 * @param entityType - The type of entity to create operations for
 * @returns Object with cache operations for the entity
 */
export function createEntityCacheOperations(
  queryClient: QueryClient,
  entityType: string,
): EntityCacheOperations {
  /**
   * Invalidate all list queries for the entity
   */
  const invalidateList = async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.entities.list(entityType),
    });
  };

  /**
   * Invalidate a specific entity by ID
   */
  const invalidateDetail = async (id: string) => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.entities.detail(entityType, id),
      exact: true,
    });
  };

  /**
   * Update entity in cache with simple transformation
   */
  const updateEntity = async <T extends BaseDocument>(
    id: string,
    updater: (old: T) => T,
  ) => {
    // Update in detail query
    queryClient.setQueryData(
      queryKeys.entities.detail(entityType, id),
      (old: CollectionResponse<T> | undefined) => {
        if (!old || !old.items || old.items.length === 0) return old;

        try {
          const entity = old.items[0];
          if (!entity) return old;

          const updated = updater(entity);

          return {
            ...old,
            items: [updated],
          };
        } catch (error) {
          handleClientError(error, `${entityType}CacheUpdate`);
          return old;
        }
      },
    );

    // Update in list queries
    queryClient.setQueriesData(
      { queryKey: queryKeys.entities.list(entityType) },
      (old: CollectionResponse<T> | undefined) => {
        if (!old || !old.items) return old;

        try {
          const updatedItems = old.items.map((item: T) => {
            if (
              item._id === id ||
              (item as Record<string, unknown>).id === id
            ) {
              return updater(item);
            }
            return item;
          });

          return {
            ...old,
            items: updatedItems,
          };
        } catch (error) {
          handleClientError(error, `${entityType}CacheListUpdate`);
          return old;
        }
      },
    );
  };

  /**
   * Add entity to list cache
   */
  const addEntity = async <T extends BaseDocument>(entity: T) => {
    queryClient.setQueriesData(
      { queryKey: queryKeys.entities.list(entityType) },
      (old: CollectionResponse<T> | undefined) => {
        try {
          if (!old)
            return {
              items: [entity],
              success: true,
              total: 1,
            };

          const exists = old.items.some((item: T) => item._id === entity._id);
          if (exists) return old;

          return {
            ...old,
            items: [...old.items, entity],
            total: (old.total || 0) + 1,
          };
        } catch (error) {
          handleClientError(error, `${entityType}CacheAdd`);
          return old;
        }
      },
    );
  };

  /**
   * Remove entity from list cache
   */
  const removeEntity = async (id: string) => {
    queryClient.removeQueries({
      queryKey: queryKeys.entities.detail(entityType, id),
      exact: true,
    });

    queryClient.setQueriesData(
      { queryKey: queryKeys.entities.list(entityType) },
      (old: CollectionResponse<unknown> | undefined) => {
        if (!old || !old.items) return old;

        try {
          const filteredItems = old.items.filter((item: unknown) => {
            const typedItem = item as Record<string, unknown>;
            return typedItem._id !== id && typedItem.id !== id;
          });

          return {
            ...old,
            items: filteredItems,
            total: filteredItems.length,
          };
        } catch (error) {
          handleClientError(error, `${entityType}CacheRemove`);
          return old;
        }
      },
    );
  };

  return {
    invalidateList,
    invalidateDetail,
    updateEntity,
    addEntity,
    removeEntity,
  };
}
