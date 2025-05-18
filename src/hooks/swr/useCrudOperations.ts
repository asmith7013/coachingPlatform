// src/hooks/utils/useCrudOperations.ts
import { useCallback, useEffect } from "react";
import { handleClientError } from "@error/handlers/client";
import { WithId, getId } from "@core-types/resource-manager";
import { CollectionResponse } from '@core-types/response';

// Define proper types for optimistic update functions
type OptimisticUpdateOptions = {
  revalidate?: boolean;
  [key: string]: unknown;
};

type OptimisticOperation<T, R> = (
  item: T,  
  operation: () => Promise<R>,
  options?: OptimisticUpdateOptions
) => Promise<R>;

/**
 * @deprecated Use useMutations from '@hooks/query/useEntityQuery' instead.
 * This hook will be removed in a future version. See migration guide at docs/data-flow/react-query-patterns.md
 */
export function useCrudOperations<T extends WithId<Record<string, unknown>>, I>(
  resourceName: string,
  createFn: (data: I) => Promise<{ success: boolean; data?: T; [key: string]: unknown }>,
  updateFn: (id: string, data: I) => Promise<{ success: boolean; data?: T; [key: string]: unknown }>,
  deleteFn: (id: string) => Promise<{ success: boolean; error?: string }>,
  data: CollectionResponse<T> | undefined,
  optimisticAdd: OptimisticOperation<T, { success: boolean; data?: T; [key: string]: unknown }>,
  optimisticModify: OptimisticOperation<T, { success: boolean; data?: T; [key: string]: unknown }>,
  optimisticRemove: OptimisticOperation<T, { success: boolean; error?: string }>,
  mutate: () => Promise<CollectionResponse<T> | undefined>,
  debug: boolean = false
) {
  // Add deprecation warning in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'useCrudOperations is deprecated and will be removed in a future version. ' +
        'Please migrate to useMutations from @hooks/query/useEntityQuery.'
      );
    }
  }, []);

  // Add operation
  const add = useCallback(async (data: I) => {
    if (debug) {
      console.log(`[${resourceName}] Adding item:`, data);
    }
    
    // Create a proxy item for optimistic updates
    const tempId = `temp-${Date.now()}`;
    const proxyItem = {
      ...data as unknown as Partial<T>,
      id: tempId, // Use id for consistency
    } as T;
    
    try {
      const result = await optimisticAdd(
        proxyItem, 
        async () => createFn(data),
        { revalidate: true }
      );
      return result;
    } catch (error) {
      const errorMessage = handleClientError(error);
      await mutate(); // Revalidate data even on error
      throw new Error(errorMessage);
    }
  }, [optimisticAdd, createFn, resourceName, debug, mutate]);

  // Edit operation 
  const edit = useCallback(async (id: string, updateData: I) => {
    if (debug) {
      console.log(`[${resourceName}] Editing item ${id}:`, updateData);
    }
    
    // Find the existing item
    const existingItems = data?.items || [];
    const existingItem = existingItems.find((item: T) => getId(item) === id);
    
    if (!existingItem) {
      if (debug) {
        console.warn(`[${resourceName}] Item with id ${id} not found for update`);
      }
      // Try server update directly
      return updateFn(id, updateData);
    }
    
    // Create updated item with existing data + updates
    const updatedItem = {
      ...existingItem,
      ...updateData as unknown as Partial<T>,
    } as T;
    
    try {
      const result = await optimisticModify(
        updatedItem,
        async () => updateFn(id, updateData),
        { revalidate: true }
      );
      return result;
    } catch (error) {
      const errorMessage = handleClientError(error);
      await mutate(); // Revalidate data even on error
      throw new Error(errorMessage);
    }
  }, [optimisticModify, updateFn, resourceName, debug, data, mutate]);

  // Remove operation
  const remove = useCallback(async (id: string) => {
    if (debug) {
      console.log(`[${resourceName}] Removing item ${id}`);
    }
    
    // Find the item to remove
    const existingItems = data?.items || [];
    const itemToRemove = existingItems.find((item: T) => getId(item) === id);
    
    if (!itemToRemove) {
      if (debug) {
        console.warn(`[${resourceName}] Item with id ${id} not found for removal`);
      }
      // Try server delete directly
      return deleteFn(id);
    }
    
    try {
      const result = await optimisticRemove(
        itemToRemove,
        async () => deleteFn(id),
        { revalidate: true }
      );
      return result;
    } catch (error) {
      const errorMessage = handleClientError(error);
      await mutate(); // Revalidate data even on error
      throw new Error(errorMessage);
    }
  }, [optimisticRemove, deleteFn, resourceName, debug, data, mutate]);

  return { add, edit, remove };
}