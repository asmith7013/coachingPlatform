import { useState } from "react";
import { useResourceManager } from "@hooks/utils/useResourceManager";
import { fetchLookFors, createLookFor, updateLookFor, deleteLookFor, LookForInput } from "@actions/lookFors/lookFors";
import { LookFor } from "@/lib/zod-schema";

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
    fetchLookFors,
    createLookFor,
    updateLookFor,
    deleteLookFor,
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