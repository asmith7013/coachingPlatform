// src/hooks/utils/useResourceManager.ts
import { usePagination } from "@hooks/utils/usePagination";
import { useFiltersAndSorting } from "@hooks/utils/useFiltersAndSorting";
import { useOptimisticResource } from "@hooks/utils/useOptimisticResource";
import { useSafeSWR } from "@hooks/utils/useSafeSWR";
import { handleErrorHandledMutation } from "@hooks/utils/useErrorHandledMutation";
import { useCallback, useMemo } from "react";

interface ResourceResponse<T> {
  items: T[];
  total: number;
  empty: boolean;
}

type FetchParams<T> = {
  page: number;
  limit: number;
  filters: Partial<T>;
  sortBy: string;
  sortOrder: "asc" | "desc";
};

type FetchFunction<T> = (params: FetchParams<T>) => Promise<ResourceResponse<T>>;

interface ResourceManagerOptions {
  initialPage?: number;
  initialLimit?: number;
  defaultSortOrder?: "asc" | "desc";
  debug?: boolean;
}

interface ResourceManagerResult<T> {
  // Data and loading state
  items: T[];
  total: number;
  isLoading: boolean;
  error: Error | null;
  
  // Pagination
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  
  // Filtering and sorting
  filters: Partial<T>;
  applyFilters: (filters: Partial<T>) => void;
  sortBy: string;
  changeSorting: (field: keyof T, direction: "asc" | "desc") => void;
  
  // CRUD operations
  add: (newItem: Omit<T, "_id">) => Promise<{ success: boolean; [key: string]: unknown }>;
  edit: (id: string, updated: Partial<T>) => Promise<{ success: boolean; [key: string]: unknown }>;
  remove: (id: string) => Promise<{ success: boolean; error?: string }>;
  
  // Cache management
  mutate: () => Promise<ResourceResponse<T> | undefined>;
}

export function useResourceManager<T extends { _id: string }>(
  resourceKey: string,
  fetchFunction: FetchFunction<T>,
  createFunction: (data: Omit<T, "_id">) => Promise<{ success: boolean; [key: string]: unknown }>,
  updateFunction: (id: string, data: Partial<T>) => Promise<{ success: boolean; [key: string]: unknown }>,
  deleteFunction: (id: string) => Promise<{ success: boolean; error?: string }>,
  options: ResourceManagerOptions = {}
): ResourceManagerResult<T> {
  const {
    initialPage = 1,
    initialLimit = 20,
    defaultSortOrder = "desc",
    debug = false
  } = options;

  // Initialize pagination
  const { page, setPage, limit, setLimit, total, setTotal } = usePagination(initialPage, initialLimit);

  // Initialize filters and sorting
  const { filters, applyFilters, sortBy, changeSorting } = useFiltersAndSorting<T>();

  // Memoize fetch params
  const fetchParams = useMemo<FetchParams<T>>(() => ({
    page,
    limit,
    filters,
    sortBy,
    sortOrder: defaultSortOrder
  }), [page, limit, filters, sortBy, defaultSortOrder]);

  // Memoize cache key
  const cacheKey = useMemo(() => [resourceKey, page, limit, filters, sortBy], 
    [resourceKey, page, limit, filters, sortBy]);

  // Memoize fetch function
  const fetchData = useCallback(async () => {
    if (debug) {
      console.log(`[${resourceKey}] Fetching with params:`, fetchParams);
    }

    const result = await fetchFunction(fetchParams);
    setTotal(result.total);
    return result;
  }, [fetchFunction, fetchParams, resourceKey, debug, setTotal]);

  // Initialize SWR data fetching
  const { data, error, isLoading, mutate } = useSafeSWR<ResourceResponse<T>>(
    cacheKey,
    fetchData,
    `fetch${resourceKey}`
  );

  if (debug) {
    console.log(`[${resourceKey}] SWR Status:`, {
      isLoading,
      error,
      hasData: !!data
    });
  }

  // Initialize optimistic updates after SWR
  const { optimisticAdd, optimisticModify, optimisticRemove } = useOptimisticResource<T>(mutate);

  // Memoize CRUD operations
  const add = useCallback(async (newItem: Omit<T, "_id">) => {
    if (debug) {
      console.log(`[${resourceKey}] Adding item:`, newItem);
    }
    return handleErrorHandledMutation<{ success: boolean; [key: string]: unknown }>(
      () => optimisticAdd(newItem, createFunction),
      `add${resourceKey}`,
      mutate
    );
  }, [optimisticAdd, createFunction, resourceKey, debug, mutate]);

  const edit = useCallback(async (id: string, updated: Partial<T>) => {
    if (debug) {
      console.log(`[${resourceKey}] Editing item ${id}:`, updated);
    }
    return handleErrorHandledMutation<{ success: boolean; [key: string]: unknown }>(
      () => optimisticModify(id, updated, updateFunction),
      `edit${resourceKey}`,
      mutate
    );
  }, [optimisticModify, updateFunction, resourceKey, debug, mutate]);

  const remove = useCallback(async (id: string) => {
    if (debug) {
      console.log(`[${resourceKey}] Removing item ${id}`);
    }
    return handleErrorHandledMutation<{ success: boolean; error?: string }>(
      () => optimisticRemove(id, deleteFunction),
      `remove${resourceKey}`,
      mutate
    );
  }, [optimisticRemove, deleteFunction, resourceKey, debug, mutate]);

  // Memoize filter and sort operations
  const applyFiltersWithRevalidation = useCallback((newFilters: Partial<T>) => {
    if (debug) {
      console.log(`[${resourceKey}] Applying filters:`, newFilters);
    }
    applyFilters(newFilters, true);
  }, [applyFilters, resourceKey, debug]);

  const changeSortingWithRevalidation = useCallback((field: keyof T, direction: "asc" | "desc") => {
    if (debug) {
      console.log(`[${resourceKey}] Changing sort:`, { field, direction });
    }
    changeSorting(direction, true);
  }, [changeSorting, resourceKey, debug]);

  // Memoize normalized error
  const normalizedError = useMemo(() => 
    error instanceof Error ? error : error ? new Error(String(error)) : null,
    [error]
  );

  // Memoize return object to prevent unnecessary re-renders
  return useMemo(() => ({
    // Data and loading state
    items: data?.items || [],
    total,
    isLoading,
    error: normalizedError,
    
    // Pagination
    page,
    setPage,
    limit,
    setLimit,
    
    // Filtering and sorting
    filters,
    applyFilters: applyFiltersWithRevalidation,
    sortBy,
    changeSorting: changeSortingWithRevalidation,
    
    // CRUD operations
    add,
    edit,
    remove,
    
    // Cache management
    mutate
  }), [
    data?.items,
    total,
    isLoading,
    normalizedError,
    page,
    setPage,
    limit,
    setLimit,
    filters,
    applyFiltersWithRevalidation,
    sortBy,
    changeSortingWithRevalidation,
    add,
    edit,
    remove,
    mutate
  ]);
}