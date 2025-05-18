// src/lib/query/cache-sync/client-sync.ts
import { queryClient } from '@/lib/query/core/client';
import { CacheSyncConfig } from '@/lib/types/core/cache';
import { createEntityCacheOperations } from './cache-operations';

/**
 * Synchronize client-side cache after server mutations
 * This function should be called from components after server action completion
 * 
 * @param config - Configuration for cache synchronization
 * @param entityId - ID of the entity that was modified (for update/delete operations)
 */
export async function syncClientCache(
  config: CacheSyncConfig,
  entityId?: string
): Promise<void> {
  // Only run on client side
  if (typeof window === 'undefined') {
    return;
  }
  
  const { entityType, operationType, additionalInvalidateKeys = [] } = config;
  const cacheOps = createEntityCacheOperations(queryClient, entityType);

  // Handle each operation type differently
  switch (operationType) {
    case 'create':
    case 'bulkCreate':
      // For creation, invalidate list queries to fetch fresh data
      await cacheOps.invalidateList();
      break;
      
    case 'update':
      // For updates, invalidate both the specific entity and lists
      if (entityId) {
        await cacheOps.invalidateDetail(entityId);
      }
      await cacheOps.invalidateList();
      break;
      
    case 'bulkUpdate':
      // For bulk updates, just invalidate lists
      await cacheOps.invalidateList();
      break;
      
    case 'delete':
      // For deletion, remove the entity from cache and invalidate lists
      if (entityId) {
        await cacheOps.removeEntity(entityId);
      }
      await cacheOps.invalidateList();
      break;
      
    case 'bulkDelete':
      // For bulk deletion, just invalidate lists
      await cacheOps.invalidateList();
      break;
  }
  
  // Invalidate any additional query keys
  if (additionalInvalidateKeys.length > 0) {
    for (const key of additionalInvalidateKeys) {
      await queryClient.invalidateQueries({ queryKey: key });
    }
  }
}