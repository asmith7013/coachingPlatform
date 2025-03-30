import { useState } from "react";
import { useSWRConfig } from "swr";

interface FiltersAndSortingOptions {
  resourceKey: string; // Required field for SWR cache key
  defaultSortOrder?: "asc" | "desc";
}

/**
 * SWR-Optimized Hook for managing filters and sorting.
 * Uses resourceKey to ensure proper cache invalidation across different resources.
 */
export function useFiltersAndSorting<T extends Record<string, unknown>>(
  options: FiltersAndSortingOptions
) {
  const { mutate } = useSWRConfig();
  const [filters, setFilters] = useState<Partial<T>>({});
  const [sortBy, setSortBy] = useState<string>(options.defaultSortOrder || "desc");

  const applyFilters = (newFilters: Partial<T>, autoMutate = false) => {
    setFilters(newFilters);
    if (autoMutate) {
      mutate([options.resourceKey, newFilters, sortBy]);
    }
  };

  const changeSorting = (newSortBy: string, autoMutate = false) => {
    setSortBy(newSortBy);
    if (autoMutate) {
      mutate([options.resourceKey, filters, newSortBy]);
    }
  };

  return { filters, applyFilters, sortBy, changeSorting };
}