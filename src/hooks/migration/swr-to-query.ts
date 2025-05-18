import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@query/core/keys';

/**
 * Utility to help migrate from SWR to React Query
 * This provides compatibility helpers to ease the transition
 */
export const SwrToQueryUtils = {
  /**
   * Convert SWR cache key to React Query key pattern
   */
  convertCacheKey: (swrKey: string | readonly unknown[] | null): unknown[] => {
    if (swrKey === null) return [];
    if (typeof swrKey === 'string') return [swrKey];
    return swrKey as unknown[];
  },
  
  /**
   * Create a mutation wrapper that invalidates both SWR and React Query caches
   */
  createDualInvalidator: (queryClient: ReturnType<typeof useQueryClient>) => {
    return (resourceKey: string, params?: Record<string, unknown>) => {
      // Invalidate React Query cache
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.entities.list(resourceKey, params) 
      });
      
      // Note: SWR cache invalidation would go here if needed
      // But since we're migrating away, we're focusing on React Query
    };
  }
};

/**
 * Creates a mutation function that works with both SWR and React Query
 * to help with the migration process.
 */
export function useDualMutation() {
  const queryClient = useQueryClient();
  
  const invalidateBoth = useCallback((resourceKey: string, params?: Record<string, unknown>) => {
    // Invalidate React Query cache
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.entities.list(resourceKey, params) 
    });
    
    // Note: SWR cache invalidation would go here if needed during migration
  }, [queryClient]);
  
  return { invalidateBoth };
} 