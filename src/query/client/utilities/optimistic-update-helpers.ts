import { BaseDocument } from '@core-types/document';
import { PaginatedResponse } from '@core-types/pagination';
import { CollectionResponse } from '@core-types/response';
import { extractItems, isPaginatedResponse } from '@/lib/data-utilities/transformers/utils/response-utils';
import { QueryClient } from '@tanstack/react-query';

/**
 * Helper functions for optimistic updates in React Query mutations
 */
export const optimisticUpdateHelpers = {
  /**
   * Prepares the context for an optimistic update by canceling relevant queries
   * and storing previous data for potential rollback
   */
  prepareOptimisticContext: async <T extends BaseDocument>(
    queryClient: QueryClient,
    entityType: string,
    id?: string
  ) => {
    // Cancel list queries
    await queryClient.cancelQueries({ queryKey: [entityType, 'list'] });
    
    // Also cancel the specific item query if an ID is provided
    if (id) {
      await queryClient.cancelQueries({ 
        queryKey: [entityType, 'detail', id]
      });
    }
    
    // Store previous data for potential rollback
    const previousData = queryClient.getQueryData<PaginatedResponse<T>>(
      [entityType, 'list']
    );
    
    return { previousData };
  },
  
  /**
   * Optimistically adds a new item to the list cache
   */
  optimisticCreate: <T extends BaseDocument, TInput extends Record<string, unknown>>(
    queryClient: QueryClient,
    entityType: string,
    newData: TInput
  ) => {
    queryClient.setQueryData(
      [entityType, 'list'],
      (old: unknown) => {
        if (!old || !isPaginatedResponse<T>(old)) return old;
        
        // Create a temporary item with a generated ID
        const tempItem = {
          ...newData,
          _id: `temp_${Date.now()}`,
          id: `temp_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as unknown as T;
        
        return {
          ...old,
          items: [...old.items, tempItem],
          total: old.total + 1
        };
      }
    );
  },
  
  /**
   * Optimistically updates an item in both list and detail caches
   */
  optimisticUpdate: <T extends BaseDocument, D extends Record<string, unknown>>(
    queryClient: QueryClient,
    entityType: string,
    id: string,
    data: D
  ) => {
    // Update the list cache
    queryClient.setQueryData(
      [entityType, 'list'],
      (old: unknown) => {
        if (!old || !isPaginatedResponse<T>(old)) return old;
        
        return {
          ...old,
          items: old.items.map((item: T) => 
            (item._id === id || item.id === id)
              ? { ...item, ...data, updatedAt: new Date().toISOString() }
              : item
          )
        };
      }
    );
    
    // Update the individual item cache if it exists
    queryClient.setQueryData(
      [entityType, 'detail', id],
      (old: unknown) => {
        if (!old) return old;
        
        const items = extractItems<T>(old as CollectionResponse<T>);
        if (items.length === 0) return old;
        
        return {
          ...old,
          items: [{ 
            ...items[0], 
            ...data, 
            updatedAt: new Date().toISOString() 
          }]
        };
      }
    );
  },
  
  /**
   * Optimistically removes an item from the list cache and removes its detail cache
   */
  optimisticDelete: <T extends BaseDocument>(
    queryClient: QueryClient,
    entityType: string,
    id: string
  ) => {
    // Update the list cache
    queryClient.setQueryData(
      [entityType, 'list'],
      (old: unknown) => {
        if (!old || !isPaginatedResponse<T>(old)) return old;
        
        return {
          ...old,
          items: old.items.filter((item: T) => item._id !== id && item.id !== id),
          total: Math.max(0, old.total - 1)
        };
      }
    );
    
    // Remove from the individual item cache if it exists
    queryClient.removeQueries({ 
      queryKey: [entityType, 'detail', id]
    });
  },
  
  /**
   * Handles errors by rolling back to previous data
   */
  handleMutationError: <T extends BaseDocument>(
    queryClient: QueryClient,
    entityType: string,
    context?: { previousData?: PaginatedResponse<T> }
  ) => {
    // Roll back on error
    if (context?.previousData) {
      queryClient.setQueryData(
        [entityType, 'list'],
        context.previousData
      );
    }
  }
}; 