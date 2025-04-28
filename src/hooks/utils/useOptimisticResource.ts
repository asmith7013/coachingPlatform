// src/hooks/utils/useOptimisticResource.ts
import { useCallback, useState } from 'react';
import { useSWRConfig } from 'swr';

// Type helper to work with both MongoDB style _id and normalized id
type WithId = { id: string } | { _id: string };

// Helper to get ID value regardless of property name
function getId(item: WithId): string {
  return 'id' in item ? item.id : item._id;
}

/**
 * Hook for optimistic updates of resources
 * 
 * @param resourceKey - Key for SWR cache
 * @returns Object with optimistic update methods
 */
export function useOptimisticResource<T extends WithId>(resourceKey: string) {
  const { mutate } = useSWRConfig();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Optimistically add a new item
  const optimisticAdd = useCallback(
    async (
      newItem: T,
      adder: (item: T) => Promise<{ success: boolean; data?: T; error?: string }>,
      options?: { 
        /** When true, will refresh data from server after operation completes */
        revalidate?: boolean 
      }
    ) => {
      setIsProcessing(true);
      setError(null);

      try {
        // Optimistically update the local data immediately
        await mutate(
          resourceKey,
          async (currentData: { items: T[]; total: number } | undefined) => {
            if (!currentData) return { items: [newItem], total: 1, success: true };
            
            return {
              items: [...currentData.items, newItem],
              total: currentData.total + 1,
              success: true
            };
          },
          {
            revalidate: false,
          }
        );

        // Perform actual API call
        const result = await adder(newItem);

        if (!result.success) {
          throw new Error(result.error || 'Failed to add item');
        }

        // Revalidate data from server if requested
        if (options?.revalidate) {
          await mutate(resourceKey);
        }

        return { success: true, data: result.data || newItem };
      } catch (err) {
        // If the API call fails, roll back optimistic update
        await mutate(resourceKey);
        
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(error);
        
        return { success: false, error: error.message };
      } finally {
        setIsProcessing(false);
      }
    },
    [mutate, resourceKey]
  );

  // Optimistically modify an existing item
  const optimisticModify = useCallback(
    async (
      updatedItem: T,
      modifier: (item: T) => Promise<{ success: boolean; data?: T; error?: string }>,
      options?: { 
        /** When true, will refresh data from server after operation completes */
        revalidate?: boolean 
      }
    ) => {
      setIsProcessing(true);
      setError(null);

      try {
        // Optimistically update the local data immediately
        await mutate(
          resourceKey,
          async (currentData: { items: T[]; total: number } | undefined) => {
            if (!currentData) return { items: [updatedItem], total: 1, success: true };
            
            return {
              items: currentData.items.map((item) =>
                getId(item) === getId(updatedItem) ? updatedItem : item
              ),
              total: currentData.total,
              success: true
            };
          },
          {
            revalidate: false,
          }
        );

        // Perform actual API call
        const result = await modifier(updatedItem);

        if (!result.success) {
          throw new Error(result.error || 'Failed to modify item');
        }

        // Revalidate data from server if requested
        if (options?.revalidate) {
          await mutate(resourceKey);
        }

        return { success: true, data: result.data || updatedItem };
      } catch (err) {
        // If the API call fails, roll back optimistic update
        await mutate(resourceKey);
        
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(error);
        
        return { success: false, error: error.message };
      } finally {
        setIsProcessing(false);
      }
    },
    [mutate, resourceKey]
  );

  // Optimistically remove an item
  const optimisticRemove = useCallback(
    async (
      itemToRemove: T,
      remover: (item: T) => Promise<{ success: boolean; error?: string }>,
      options?: { 
        /** When true, will refresh data from server after operation completes */
        revalidate?: boolean 
      }
    ) => {
      setIsProcessing(true);
      setError(null);

      try {
        // Optimistically update the local data immediately
        await mutate(
          resourceKey,
          async (currentData: { items: T[]; total: number } | undefined) => {
            if (!currentData) return { items: [], total: 0, success: true };
            
            return {
              items: currentData.items.filter((item) => getId(item) !== getId(itemToRemove)),
              total: currentData.total - 1,
              success: true
            };
          },
          {
            revalidate: false,
          }
        );

        // Perform actual API call
        const result = await remover(itemToRemove);

        if (!result.success) {
          throw new Error(result.error || 'Failed to remove item');
        }

        // Revalidate data from server if requested
        if (options?.revalidate) {
          await mutate(resourceKey);
        }

        return { success: true };
      } catch (err) {
        // If the API call fails, roll back optimistic update
        await mutate(resourceKey);
        
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(error);
        
        return { success: false, error: error.message };
      } finally {
        setIsProcessing(false);
      }
    },
    [mutate, resourceKey]
  );

  return {
    isProcessing,
    error,
    optimisticAdd,
    optimisticModify,
    optimisticRemove,
  };
}