// src/hooks/utils/useOptimisticResource.ts
import { useState, useCallback, useMemo } from "react";
import { KeyedMutator } from "swr";

interface ResourceResponse<T> {
  items: T[];
  total: number;
  empty: boolean;
}

export function useOptimisticResource<T extends { _id: string }>(mutate: KeyedMutator<ResourceResponse<T>>) {
  const [isOptimisticUpdating, setIsOptimisticUpdating] = useState(false);

  const optimisticAdd = useCallback(async (
    newItem: Omit<T, "_id">,
    createAction: (data: Omit<T, "_id">) => Promise<{ success: boolean; [key: string]: unknown }>
  ) => {
    setIsOptimisticUpdating(true);
    const tempId = `temp-${Date.now()}`;
    
    mutate(
      (currentData) => ({
        items: [...(currentData?.items || []), { ...newItem, _id: tempId } as T],
        total: (currentData?.total || 0) + 1,
        empty: false
      }),
      false
    );

    try {
      const result = await createAction(newItem);
      if (result.success) {
        mutate(); // Update with the real data
        return result;
      } else {
        mutate(); // Revert on error
        throw new Error("Failed to create item");
      }
    } catch (error) {
      mutate(); // Revert on error
      throw error;
    } finally {
      setIsOptimisticUpdating(false);
    }
  }, [mutate]);

  const optimisticModify = useCallback(async (
    id: string,
    updatedData: Partial<T>,
    updateAction: (id: string, data: Partial<T>) => Promise<{ success: boolean; [key: string]: unknown }>
  ) => {
    setIsOptimisticUpdating(true);
    mutate(
      (currentData) => ({
        items: currentData?.items.map((item) =>
          item._id === id ? { ...item, ...updatedData } : item
        ) || [],
        total: currentData?.total || 0,
        empty: false
      }),
      false
    );

    try {
      const result = await updateAction(id, updatedData);
      if (result.success) {
        mutate(); // Update with the real data
        return result;
      } else {
        mutate(); // Revert on error
        throw new Error("Failed to update item");
      }
    } catch (error) {
      mutate(); // Revert on error
      throw error;
    } finally {
      setIsOptimisticUpdating(false);
    }
  }, [mutate]);

  const optimisticRemove = useCallback(async (
    id: string,
    deleteAction: (id: string) => Promise<{ success: boolean; error?: string }>
  ) => {
    setIsOptimisticUpdating(true);
    mutate(
      (currentData) => {
        const filteredItems = currentData?.items.filter((item) => item._id !== id) || [];
        return {
          items: filteredItems,
          total: Math.max(0, (currentData?.total || 1) - 1),
          empty: filteredItems.length === 0
        };
      },
      false
    );

    try {
      const result = await deleteAction(id);
      if (!result.success) {
        mutate(); // Revert on error
        throw new Error("Failed to delete item");
      }
      mutate(); // Update with the real data
      return result;
    } catch (error) {
      mutate(); // Revert on error
      throw error;
    } finally {
      setIsOptimisticUpdating(false);
    }
  }, [mutate]);

  // Memoize the return object to maintain referential stability
  return useMemo(() => ({
    optimisticAdd,
    optimisticModify,
    optimisticRemove,
    isOptimisticUpdating
  }), [optimisticAdd, optimisticModify, optimisticRemove, isOptimisticUpdating]);
}