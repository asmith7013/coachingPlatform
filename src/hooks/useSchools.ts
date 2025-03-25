import useSWR from "swr";
import { usePagination } from "@/hooks/utils/usePagination";
import { useFiltersAndSorting } from "@/hooks/utils/useFiltersAndSorting";
import { useOptimisticUpdate } from "@/hooks/utils/useOptimisticUpdate";
import { fetchSchools, createSchool, updateSchool, deleteSchool } from "@/app/actions/schools/schools";
import { School } from "@/lib/zod-schema";
import { handleServerError } from "@/lib/handleServerError";
import { useState } from "react";
import type { SortOrder } from "mongoose";

/**
 * Custom Hook for managing Schools with pagination, filters, sorting, caching, and optimistic updates.
 * - Uses SWR for client-side caching.
 * - Implements Server Actions for data fetching.
 * - Supports pagination, filtering, and sorting dynamically.
 */
export function useSchools(initialPage: number = 1, initialLimit: number = 20) {
    const { page, setPage, limit, setLimit, total, setTotal } = usePagination(initialPage, initialLimit);
    const { filters, applyFilters, sortBy, changeSorting } = useFiltersAndSorting<School>();
    const [performanceMode, setPerformanceMode] = useState(true);
    
    // Create a unique cache key that includes pagination, filtering, sorting, and performance mode
    const cacheKey = ["schools", page, limit, filters, sortBy, performanceMode];
    
    // Use optimistic updates
    const { optimisticAdd, optimisticModify, optimisticRemove } = useOptimisticUpdate<School>();
    
    // Use SWR for data fetching with caching
    const { data, error, isLoading, mutate } = useSWR(cacheKey, async () => {
        try {
            const result = await fetchSchools(
                page, 
                limit, 
                filters, 
                { createdAt: sortBy as SortOrder }, 
                performanceMode
            );
            setTotal(result.total);
            return Array.isArray(result.schools) ? result.schools : [];
        } catch (err) {
            console.log("🔍 SWR Fetch Error:", err);
            throw handleServerError(err);
        }
    });

    // Add a new school with optimistic update
    const addSchool = async (newSchool: Omit<School, "_id">) => {
        return optimisticAdd(newSchool, createSchool, cacheKey, 'school');
    };

    // Update a school with optimistic update
    const editSchool = async (id: string, updatedData: Partial<School>) => {
        return optimisticModify(id, updatedData, updateSchool, cacheKey, 'school');
    };

    // Remove a school with optimistic update
    const removeSchool = async (id: string) => {
        return optimisticRemove(id, deleteSchool, cacheKey);
    };

    // Apply filters with SWR revalidation
    const applyFiltersWithRevalidation = (newFilters: Partial<School>) => {
        applyFilters(newFilters);
        mutate(); // Trigger SWR to refetch with new filters
    };

    // Change sorting with SWR revalidation
    const changeSortingWithRevalidation = (field: keyof School, direction: 'asc' | 'desc') => {
        changeSorting(direction);
        mutate(); // Trigger SWR to refetch with new sorting
    };

    // Toggle performance mode
    const togglePerformanceMode = () => {
        setPerformanceMode(prev => !prev);
    };

    return {
        schools: data || [],
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
        addSchool,
        editSchool,
        removeSchool,
        mutate,
        performanceMode,
        togglePerformanceMode,
    };
}