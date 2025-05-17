// src/hooks/utils/useCrudOperations.ts
import { useCallback } from "react";
import { handleClientError } from "@error/handle-client-error";
import { WithId, getId } from "@core-types/resource-manager";
import { ResourceResponse } from '@core-types/response';

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

export function useCrudOperations<T extends WithId<Record<string, unknown>>, I>(
  resourceName: string,
  createFn: (data: I) => Promise<{ success: boolean; [key: string]: unknown }>,
  updateFn: (id: string, data: I) => Promise<{ success: boolean; [key: string]: unknown }>,
  deleteFn: (id: string) => Promise<{ success: boolean; error?: string }>,
  data: ResourceResponse<T> | undefined,
  optimisticAdd: OptimisticOperation<T, { success: boolean; [key: string]: unknown }>,
  optimisticModify: OptimisticOperation<T, { success: boolean; [key: string]: unknown }>,
  optimisticRemove: OptimisticOperation<T, { success: boolean; error?: string }>,
  mutate: () => Promise<ResourceResponse<T> | undefined>,
  debug: boolean = false
) {
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
    const existingItem = existingItems.find((item) => getId(item) === id);
    
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
    const itemToRemove = existingItems.find((item) => getId(item) === id);
    
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