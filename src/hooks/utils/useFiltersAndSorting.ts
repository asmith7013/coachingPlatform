import { useState } from "react";
import { useSWRConfig } from "swr";

interface FiltersAndSortingOptions {
  defaultSortOrder?: "asc" | "desc";
}

/**
 * SWR-Optimized Hook for managing filters and sorting.
 */
export function useFiltersAndSorting<T extends Record<string, unknown>>(options: FiltersAndSortingOptions = {}) {
    const { mutate } = useSWRConfig(); // ✅ Get SWR's mutate function
    const [filters, setFilters] = useState<Partial<T>>({});
    const [sortBy, setSortBy] = useState<string>(options.defaultSortOrder || "desc");

    const applyFilters = (newFilters: Partial<T>, autoMutate = false) => {
        setFilters(newFilters);
        if (autoMutate) {
            mutate(["lookFors", newFilters, sortBy]); // ✅ Trigger SWR re-fetch
        }
    };

    const changeSorting = (newSortBy: string, autoMutate = false) => {
        setSortBy(newSortBy);
        if (autoMutate) {
            mutate(["lookFors", filters, newSortBy]); // ✅ Trigger SWR re-fetch
        }
    };

    return { filters, applyFilters, sortBy, changeSorting };
}