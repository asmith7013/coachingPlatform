// src/hooks/utils/useResourceManager.ts
import { usePagination } from "@hooks/ui/usePagination";
import { useFiltersAndSorting } from "@hooks/ui/useFiltersAndSorting";
import { useOptimisticResource } from "@/hooks/swr/useOptimisticResource";
import { useSafeSWR } from "@/hooks/swr/useSafeSWR";
import { useCrudOperations } from "@/hooks/swr/useCrudOperations";
import { useCallback, useMemo } from "react";
import { 
  WithId, 
  FetchFunction, 
  ResourceManagerOptions, 
  ResourceManagerResult 
} from "@core-types/resource-manager";

export function useResourceManager<T extends WithId<Record<string, unknown>>, I>(
  resourceName: string,
  fetchFn: FetchFunction<T>,
  createFn: (data: I) => Promise<{ success: boolean; [key: string]: unknown }>,
  updateFn: (id: string, data: I) => Promise<{ success: boolean; [key: string]: unknown }>,
  deleteFn: (id: string) => Promise<{ success: boolean; error?: string }>,
  options: ResourceManagerOptions = {}
): ResourceManagerResult<T, I> {
  const {
    initialPage = 1,
    initialLimit = 20,
    defaultSortOrder = "asc",
    debug = false
  } = options;

  // Initialize pagination
  const { page, setPage, limit, setLimit } = usePagination(initialPage, initialLimit);

  // Initialize filters and sorting
  const { filters, applyFilters, sortBy, changeSorting } = useFiltersAndSorting<T>({
    resourceKey: resourceName,
    defaultSortOrder
  });

  const changeSortingWithCorrectSignature = useCallback(
    (field: keyof T, direction: "asc" | "desc") => {
      changeSorting(`${String(field)}:${direction}`);
    },
    [changeSorting]
  );

  // Memoize fetch params
  const fetchParams = useMemo(() => ({
    page,
    limit,
    filters,
    sortBy,
    sortOrder: defaultSortOrder
  }), [page, limit, filters, sortBy, defaultSortOrder]);

  // Generate cache key for SWR
  const cacheKey = useMemo(() => [resourceName, JSON.stringify(fetchParams)], 
    [resourceName, fetchParams]);

  // Data fetching function
  const fetchData = useCallback(async () => {
    if (debug) {
      console.log(`[${resourceName}] Fetching with params:`, fetchParams);
    }
    return fetchFn(fetchParams);
  }, [fetchFn, fetchParams, resourceName, debug]);

  // Initialize SWR data fetching
  const { data, error, isLoading, mutate } = useSafeSWR(
    cacheKey,
    fetchData,
    `fetch${resourceName}` // Add the context parameter
  );

  // Initialize optimistic updates
  const { optimisticAdd, optimisticModify, optimisticRemove } = useOptimisticResource<T>(resourceName);

  // Initialize CRUD operations
  const { add, edit, remove } = useCrudOperations<T, I>(
    resourceName,
    createFn,
    updateFn,
    deleteFn,
    data,
    optimisticAdd,
    optimisticModify,
    optimisticRemove,
    mutate,
    debug
  );

  // Return the complete resource manager interface
  return {
    // Data state
    items: data?.items || [],
    total: data?.total || 0,
    isLoading,
    error: error instanceof Error ? error : error ? new Error(String(error)) : null,
    
    // Pagination
    page,
    setPage,
    limit,
    setLimit,
    
    // Filtering and sorting
    filters,
    applyFilters,
    sortBy,
    changeSorting: changeSortingWithCorrectSignature,
  
    // CRUD operations
    add,
    edit,
    remove,
    mutate
  };
}