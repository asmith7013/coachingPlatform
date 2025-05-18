// src/hooks/utils/useResourceManager.ts
import { usePagination } from "@hooks/ui/usePagination";
import { useFiltersAndSorting } from "@hooks/ui/useFiltersAndSorting";
import { useOptimisticResource } from "@/hooks/swr/useOptimisticResource";
import { useSafeSWR } from "@/hooks/swr/useSafeSWR";
import { useCrudOperations } from "@/hooks/swr/useCrudOperations";
import { useCallback, useMemo, useEffect } from "react";
import { 
  WithId, 
  FetchFunction, 
  ResourceManagerOptions, 
  ResourceManagerResult 
} from "@core-types/resource-manager";

/**
 * @deprecated Use useQueriesManager from '@hooks/query/useQueriesManager' instead.
 * This hook will be removed in a future version. See migration guide at docs/data-flow/react-query-patterns.md
 */
export function useResourceManager<T extends WithId<Record<string, unknown>>, I>(
  resourceName: string,
  fetchFn: FetchFunction<T>,
  createFn: (data: I) => Promise<{ success: boolean; data?: T; [key: string]: unknown }>,
  updateFn: (id: string, data: I) => Promise<{ success: boolean; data?: T; [key: string]: unknown }>,
  deleteFn: (id: string) => Promise<{ success: boolean; error?: string }>,
  options: ResourceManagerOptions = {}
): ResourceManagerResult<T, I> {
  // Add deprecation warning in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'useResourceManager is deprecated and will be removed in a future version. ' +
        'Please migrate to useQueriesManager from @hooks/query/useQueriesManager.'
      );
    }
  }, []);

  const {
    initialPage = 1,
    initialLimit = 20,
    defaultSortOrder = "asc",
    debug = false
  } = options;

  // Initialize pagination
  const { page, setPage, limit, setLimit } = usePagination(initialPage, initialLimit);

  // Initialize filters and sorting
  const filtersAndSorting = useFiltersAndSorting({
    storageKey: resourceName,
    defaultSortOrder
  });

  const changeSortingWithCorrectSignature = useCallback(
    (field: keyof T, direction: "asc" | "desc") => {
      filtersAndSorting.changeSorting(String(field), direction);
    },
    [filtersAndSorting]
  );

  // Memoize fetch params
  const fetchParams = useMemo(() => ({
    page,
    limit,
    filters: filtersAndSorting.filters,
    sortBy: filtersAndSorting.sortBy,
    sortOrder: defaultSortOrder
  }), [page, limit, filtersAndSorting.filters, filtersAndSorting.sortBy, defaultSortOrder]);

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

  // Create wrappers to match expected return types
  const addWrapper = useCallback(async (data: I): Promise<T | undefined> => {
    const result = await add(data);
    return result.success && result.data ? result.data : undefined;
  }, [add]);

  const editWrapper = useCallback(async (id: string, data: I): Promise<T | undefined> => {
    const result = await edit(id, data);
    return result.success && result.data ? result.data : undefined;
  }, [edit]);

  const removeWrapper = useCallback(async (id: string): Promise<boolean> => {
    const result = await remove(id);
    return result.success;
  }, [remove]);

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
    filters: filtersAndSorting.filters as Record<string, unknown>,
    applyFilters: filtersAndSorting.applyFilters as (filters: Record<string, unknown>) => void,
    sortBy: filtersAndSorting.sortBy,
    changeSorting: changeSortingWithCorrectSignature,
  
    // CRUD operations
    add: addWrapper,
    edit: editWrapper,
    remove: removeWrapper,
    mutate
  };
}