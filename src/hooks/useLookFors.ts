import useSWR from "swr";
import { usePagination } from "@/hooks/utils/usePagination";
import { useFiltersAndSorting } from "@/hooks/utils/useFiltersAndSorting";
import { useOptimisticUpdate } from "@/hooks/utils/useOptimisticUpdate";
import { fetchLookFors, createLookFor, updateLookFor, deleteLookFor } from "@actions/lookFors/lookFors";
import { LookFor } from "@/lib/zod-schema";
// import FieldConfig from "@/lib/ui-schema/fieldConfig";
import { handleServerError } from "@/lib/handleServerError";
import { useState } from "react";
import type { SortOrder } from "mongoose";

/**
 * Custom Hook for managing LookFors with pagination, filters, and sorting.
 * Uses SWR for client-side caching and optimistic updates.
 */

export function useLookFors(initialPage: number = 1, initialLimit: number = 20) {
    const { page, setPage, limit, setLimit, total, setTotal } = usePagination(initialPage, initialLimit);
    const { filters, applyFilters, sortBy, changeSorting } = useFiltersAndSorting<LookFor>();
    const [performanceMode, setPerformanceMode] = useState(false);
    
    // Create a unique cache key that includes pagination, filtering, sorting, and performance mode
    const cacheKey = ["lookFors", page, limit, filters, sortBy, performanceMode];        

    // console.log("🔍 cacheKey", cacheKey);
    const { optimisticAdd, optimisticModify, optimisticRemove } = useOptimisticUpdate<LookFor>();

    // Use SWR for data fetching with caching
    const { data, error, isLoading, mutate } = useSWR(cacheKey, async () => {
        try {
            const result = await fetchLookFors(
                page, 
                limit, 
                filters, 
                { createdAt: sortBy as SortOrder }, 
                performanceMode
            );
            // console.log("🔍 result", result); // Log the entire result
            setTotal(result.total); // Ensure this is a number
            return Array.isArray(result.lookFors) ? result.lookFors : [];
        } catch (err) {
            console.log("🔍 error", err); // Log the error
            throw handleServerError(err); // Ensure this throws an error
        }
    });
    
    // Add a new LookFor with optimistic update
    const addLookFor = async (newLookFor: Omit<LookFor, "_id">) => {
        return optimisticAdd(newLookFor, createLookFor, cacheKey, 'lookFor');
    };

    // Update a LookFor with optimistic update
    const editLookFor = async (id: string, updatedData: Partial<LookFor>) => {
        return optimisticModify(id, updatedData, updateLookFor, cacheKey, 'lookFor');
    };

    // Delete a LookFor with optimistic update
    const removeLookFor = async (id: string) => {
        console.log("🔍 cacheKey inside removeLookFor", cacheKey);
        return optimisticRemove(id, deleteLookFor, cacheKey);   
    };

    // Apply filters with SWR revalidation
    const applyFiltersWithRevalidation = (newFilters: Partial<LookFor>) => {
        applyFilters(newFilters);
        mutate(); // Trigger SWR to refetch with new filters
    };

    // Change sorting with SWR revalidation
    const changeSortingWithRevalidation = (field: keyof LookFor, direction: 'asc' | 'desc') => {
        changeSorting(direction);
        mutate(); // Trigger SWR to refetch with new sorting
    };

    // Toggle performance mode
    const togglePerformanceMode = () => {
        setPerformanceMode(prev => !prev);
    };

    return {
        lookFors: data || [],
        loading: isLoading,
        error: error instanceof Error ? error.message : "Unknown error",
        page,
        setPage,
        limit,
        setLimit,
        total,
        filters,
        applyFilters: applyFiltersWithRevalidation,
        sortBy,
        changeSorting: changeSortingWithRevalidation,
        addLookFor,
        editLookFor,
        removeLookFor,
        mutate,
        performanceMode,
        togglePerformanceMode,
    };
}