import { School } from "@/lib/zod-schema";
import { useState } from "react";
import { KeyedMutator } from "swr";

/**
 * Custom hook for optimistic updates with School data
 * Handles the specific return types from the school server actions
 */
export function useSchoolOptimisticUpdate(mutate: KeyedMutator<School[]>) {
  const [isOptimisticUpdating, setIsOptimisticUpdating] = useState(false);

  /**
   * Optimistically add a new school
   */
  const optimisticAdd = async (
    newSchool: Omit<School, "_id">,
    createAction: (data: Omit<School, "_id">) => Promise<{ success: boolean; school?: School; error?: string }>
  ) => {
    setIsOptimisticUpdating(true);
    
    // Create a temporary ID for optimistic UI
    const tempId = `temp-${Date.now()}`;
    
    // Optimistically update the UI
    mutate(
      (currentData) => [
        ...(currentData || []),
        { ...newSchool, _id: tempId } as School
      ],
      false
    );
    
    try {
      // Call the actual API
      const result = await createAction(newSchool);
      
      if (result.success && result.school) {
        // Update with the real data
        mutate();
        return result.school;
      } else {
        // Revert on error
        mutate();
        throw new Error(result.error || "Failed to create school");
      }
    } catch (error) {
      // Revert on error
      mutate();
      throw error;
    } finally {
      setIsOptimisticUpdating(false);
    }
  };

  /**
   * Optimistically modify a school
   */
  const optimisticModify = async (
    id: string,
    updatedData: Partial<School>,
    updateAction: (id: string, data: Partial<School>) => Promise<{ success: boolean; school?: School; error?: string }>
  ) => {
    setIsOptimisticUpdating(true);
    
    // Optimistically update the UI
    mutate(
      (currentData) =>
        currentData?.map((item) =>
          item._id === id ? { ...item, ...updatedData } : item
        ) || [],
      false
    );
    
    try {
      // Call the actual API
      const result = await updateAction(id, updatedData);
      
      if (result.success && result.school) {
        // Update with the real data
        mutate();
        return result.school;
      } else {
        // Revert on error
        mutate();
        throw new Error(result.error || "Failed to update school");
      }
    } catch (error) {
      // Revert on error
      mutate();
      throw error;
    } finally {
      setIsOptimisticUpdating(false);
    }
  };

  /**
   * Optimistically remove a school
   */
  const optimisticRemove = async (
    id: string,
    deleteAction: (id: string) => Promise<{ success: boolean; error?: string }>
  ) => {
    setIsOptimisticUpdating(true);
    
    // Optimistically update the UI
    mutate(
      (currentData) =>
        currentData?.filter((item) => item._id !== id) || [],
      false
    );
    
    try {
      // Call the actual API
      const result = await deleteAction(id);
      
      if (result.success) {
        // Confirm the deletion
        mutate();
      } else {
        // Revert on error
        mutate();
        throw new Error(result.error || "Failed to delete school");
      }
    } catch (error) {
      // Revert on error
      mutate();
      throw error;
    } finally {
      setIsOptimisticUpdating(false);
    }
  };

  return {
    optimisticAdd,
    optimisticModify,
    optimisticRemove,
    isOptimisticUpdating
  };
} 