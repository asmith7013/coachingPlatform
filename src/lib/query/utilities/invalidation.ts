// src/lib/query/utilities/invalidation.ts
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/query-keys';

/**
 * Type-safe interface for cache invalidation operations
 */
export interface InvalidationHelpers {
  /** Invalidate an entity list and optionally a specific entity */
  invalidateEntity: (entityType: string, id?: string) => Promise<void>;
  
  /** Invalidate all entity lists */
  invalidateList: (entityType: string) => Promise<void>;
  
  /** Invalidate all queries */
  invalidateAll: () => Promise<void>;
  
  /** Invalidate a specific query key */
  invalidateQuery: (queryKey: unknown[]) => Promise<void>;
  
  /** Reset a specific query key's cache to its initial state */
  resetQuery: (queryKey: unknown[]) => void;
}

/**
 * Creates a set of cache invalidation helpers for the application
 * 
 * @param queryClient The React Query client instance
 * @returns Object with invalidation utilities
 */
export function createInvalidationHelper(queryClient: QueryClient): InvalidationHelpers {
  return {
    /**
     * Invalidate an entity by type and optionally by ID
     * 
     * @param entityType The entity type (e.g., 'schools', 'staff')
     * @param id Optional ID for a specific entity
     */
    invalidateEntity: async (entityType: string, id?: string) => {
      const promises: Promise<void>[] = [];
      
      // If ID is provided, invalidate the specific entity
      if (id) {
        promises.push(
          queryClient.invalidateQueries({
            queryKey: queryKeys.entities.detail(entityType, id)
          })
        );
      }
      
      // Always invalidate the entity list
      promises.push(
        queryClient.invalidateQueries({
          queryKey: queryKeys.entities.list(entityType),
          // Only invalidate the exact list query, not all queries that start with this key
          exact: false,
          // Refetch all matching queries automatically
          refetchType: 'active'
        })
      );
      
      await Promise.all(promises);
    },
    
    /**
     * Invalidate all entity lists
     * 
     * @param entityType The entity type to invalidate
     */
    invalidateList: async (entityType: string) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.entities.lists(),
        refetchType: 'active'
      });
    },
    
    /**
     * Invalidate all queries in the cache
     */
    invalidateAll: async () => {
      await queryClient.invalidateQueries();
    },
    
    /**
     * Invalidate a specific query key
     * 
     * @param queryKey The query key to invalidate
     */
    invalidateQuery: async (queryKey: unknown[]) => {
      await queryClient.invalidateQueries({
        queryKey: queryKey as readonly unknown[],
        refetchType: 'active'
      });
    },
    
    /**
     * Reset a specific query to its initial state
     * 
     * @param queryKey The query key to reset
     */
    resetQuery: (queryKey: unknown[]) => {
      queryClient.resetQueries({ queryKey: queryKey as readonly unknown[] });
    }
  };
}

/**
 * Hook for using invalidation helpers within components
 * 
 * @returns Invalidation utility functions
 */
export function useInvalidation(): InvalidationHelpers {
  const queryClient = useQueryClient();
  return createInvalidationHelper(queryClient);
}