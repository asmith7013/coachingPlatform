// src/hooks/utils/useOptimisticResource.ts
import { useState, useCallback } from "react";
import { KeyedMutator } from "swr";
import { ResourceResponse } from '@core-types/response';

export function useOptimisticResource<T extends { _id: string }, I>(
  mutate: KeyedMutator<ResourceResponse<T>>
) {
  const [isOptimisticUpdating, setIsOptimisticUpdating] = useState(false);

  const optimisticAdd = useCallback(async (
    data: I,
    createAction: (data: I) => Promise<{ success: boolean; [key: string]: unknown }>
  ) => {
    setIsOptimisticUpdating(true);
    const tempId = `temp-${Date.now()}`;
    
    mutate(
      (currentData) => ({
        items: [...(currentData?.items || []), { ...data, _id: tempId } as unknown as T],
        total: (currentData?.total || 0) + 1,
        empty: false
      }),
      false
    );

    try {
      const result = await createAction(data);
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
    data: I,
    updateAction: (id: string, data: I) => Promise<{ success: boolean; [key: string]: unknown }>
  ) => {
    setIsOptimisticUpdating(true);
    
    mutate(
      (currentData) => ({
        items: currentData?.items.map(item => 
          item._id === id ? { ...item, ...data } as unknown as T : item
        ) || [],
        total: currentData?.total || 0,
        empty: currentData?.empty || false
      }),
      false
    );

    try {
      const result = await updateAction(id, data);
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
      (currentData) => ({
        items: currentData?.items.filter(item => item._id !== id) || [],
        total: (currentData?.total || 0) - 1,
        empty: (currentData?.items || []).length <= 1
      }),
      false
    );

    try {
      const result = await deleteAction(id);
      if (result.success) {
        mutate(); // Update with the real data
        return result;
      } else {
        mutate(); // Revert on error
        throw new Error(result.error || "Failed to delete item");
      }
    } catch (error) {
      mutate(); // Revert on error
      throw error;
    } finally {
      setIsOptimisticUpdating(false);
    }
  }, [mutate]);

  return {
    optimisticAdd,
    optimisticModify,
    optimisticRemove,
    isOptimisticUpdating
  };
}