// src/hooks/utils/useResourceManager.ts
import { usePagination } from "@hooks/utils/usePagination";
import { useFiltersAndSorting } from "@hooks/utils/useFiltersAndSorting";
import { useOptimisticResource } from "@hooks/utils/useOptimisticResource";
import { useSafeSWR } from "@hooks/utils/useSafeSWR";
import { handleErrorHandledMutation } from "@hooks/utils/useErrorHandledMutation";
import { useCallback, useMemo } from "react";
import { ResourceResponse } from '@core-types/response';
import type { FetchParams } from "@core-types/api";

type FetchFunction<T> = (params: FetchParams) => Promise<ResourceResponse<T>>;

interface ResourceManagerOptions {
  initialPage?: number;
  initialLimit?: number;
  defaultSortOrder?: "asc" | "desc";
  debug?: boolean;
}

interface ResourceManagerResult<T extends { _id: string }, I> {
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
  add: (data: I) => Promise<{ success: boolean; [key: string]: unknown }>;
  edit: (id: string, data: I) => Promise<{ success: boolean; [key: string]: unknown }>;
  remove: (id: string) => Promise<{ success: boolean; error?: string }>;
  mutate: () => Promise<ResourceResponse<T> | undefined>;
}

export function useResourceManager<T extends { _id: string }, I>(
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

  // Memoize fetch params
  const fetchParams = useMemo(() => ({
    page,
    limit,
    filters,
    sortBy,
    sortOrder: defaultSortOrder
  }), [page, limit, filters, sortBy, defaultSortOrder]);

  // Memoize cache key
  const cacheKey = useMemo(() => [resourceName, page, limit, filters, sortBy], 
    [resourceName, page, limit, filters, sortBy]);

  // Memoize fetch function
  const fetchData = useCallback(async () => {
    if (debug) {
      console.log(`[${resourceName}] Fetching with params:`, fetchParams);
    }

    const result = await fetchFn(fetchParams);
    return result;
  }, [fetchFn, fetchParams, resourceName, debug]);

  // Initialize SWR data fetching
  const { data, error, isLoading, mutate } = useSafeSWR<ResourceResponse<T>>(
    cacheKey,
    fetchData,
    `fetch${resourceName}`
  );

  if (debug) {
    console.log(`[${resourceName}] SWR Status:`, {
      isLoading,
      error,
      data
    });
  }

  // Initialize optimistic updates
  const { optimisticAdd, optimisticModify, optimisticRemove } = useOptimisticResource<T, I>(mutate);

  // Memoize CRUD operations
  const add = useCallback(async (data: I) => {
    if (debug) {
      console.log(`[${resourceName}] Adding item:`, data);
    }
    return handleErrorHandledMutation<{ success: boolean; [key: string]: unknown }>(
      () => optimisticAdd(data, createFn),
      `add${resourceName}`,
      mutate
    );
  }, [optimisticAdd, createFn, resourceName, debug, mutate]);

  const edit = useCallback(async (id: string, data: I) => {
    if (debug) {
      console.log(`[${resourceName}] Editing item ${id}:`, data);
    }
    return handleErrorHandledMutation<{ success: boolean; [key: string]: unknown }>(
      () => optimisticModify(id, data, updateFn),
      `edit${resourceName}`,
      mutate
    );
  }, [optimisticModify, updateFn, resourceName, debug, mutate]);

  const remove = useCallback(async (id: string) => {
    if (debug) {
      console.log(`[${resourceName}] Removing item ${id}`);
    }
    return handleErrorHandledMutation<{ success: boolean; error?: string }>(
      () => optimisticRemove(id, deleteFn),
      `remove${resourceName}`,
      mutate
    );
  }, [optimisticRemove, deleteFn, resourceName, debug, mutate]);

  // Memoize filter and sort operations
  const applyFiltersWithRevalidation = useCallback((newFilters: Partial<T>) => {
    if (debug) {
      console.log(`[${resourceName}] Applying filters:`, newFilters);
    }
    applyFilters(newFilters, true);
  }, [applyFilters, resourceName, debug]);

  const changeSortingWithRevalidation = useCallback((field: keyof T, direction: "asc" | "desc") => {
    if (debug) {
      console.log(`[${resourceName}] Changing sort:`, { field, direction });
    }
    changeSorting(direction, true);
  }, [changeSorting, resourceName, debug]);

  // Memoize normalized error
  const normalizedError = useMemo(() => {
    if (!error) return null;
    return error instanceof Error ? error : new Error(String(error));
  }, [error]);

  // Memoize the return object to prevent reference instability
  return useMemo(() => ({
    items: data?.items || [],
    total: data?.total || 0,
    isLoading,
    error: normalizedError,
    page,
    setPage,
    limit,
    setLimit,
    filters,
    applyFilters: applyFiltersWithRevalidation,
    sortBy,
    changeSorting: changeSortingWithRevalidation,
    add,
    edit,
    remove,
    mutate
  }), [
    data?.items, data?.total, isLoading, normalizedError,
    page, setPage, limit, setLimit,
    filters, applyFiltersWithRevalidation,
    sortBy, changeSortingWithRevalidation,
    add, edit, remove, mutate
  ]);
}