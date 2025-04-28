import { useState } from "react";
import { useResourceManager } from "@/hooks/data/useResourceManager";
import { fetchLookFors, createLookFor, updateLookFor, deleteLookFor } from "@actions/lookFors/lookFors";
import { LookFor, LookForInput } from "@domain-types/look-fors";
import type { ResourceResponse } from "@core-types/response";
import type { FetchParams } from "@core-types/api";

/**
 * Custom Hook for managing LookFors with pagination, filters, sorting, caching, and optimistic updates.
 * - Uses SWR for client-side caching.
 * - Implements Server Actions for data fetching.
 * - Supports pagination, filtering, and sorting dynamically.
 * - Includes detailed debugging and error handling.
 */
export function useLookFors(initialPage: number = 1, initialLimit: number = 20) {
  const [performanceMode, setPerformanceMode] = useState(false);

  const {
    items: lookFors,
    total,
    isLoading: loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    filters,
    applyFilters,
    sortBy,
    changeSorting,
    add: addLookFor,
    edit: editLookFor,
    remove: removeLookFor,
    mutate
  } = useResourceManager<LookFor, LookForInput>(
    "lookFors",
    fetchLookFors as (params: FetchParams) => Promise<ResourceResponse<LookFor>>,
    createLookFor as (data: LookForInput) => Promise<{ success: boolean; [key: string]: unknown }>,
    updateLookFor as (id: string, data: LookForInput) => Promise<{ success: boolean; [key: string]: unknown }>,
    deleteLookFor as (id: string) => Promise<{ success: boolean; [key: string]: unknown }>,
    {
      initialPage,
      initialLimit,
      defaultSortOrder: "desc"
    }
  );

  const togglePerformanceMode = () => {
    setPerformanceMode(prev => !prev);
  };

  return {
    lookFors,
    loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    total,
    filters,
    applyFilters,
    sortBy,
    changeSorting,
    addLookFor,
    editLookFor,
    removeLookFor,
    mutate,
    performanceMode,
    togglePerformanceMode,
  };
}