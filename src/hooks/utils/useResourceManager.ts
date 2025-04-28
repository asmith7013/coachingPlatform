// src/hooks/utils/useResourceManager.ts
import { usePagination } from "@hooks/utils/usePagination";
import { useFiltersAndSorting } from "@hooks/utils/useFiltersAndSorting";
import { useOptimisticResource } from "@hooks/utils/useOptimisticResource";
import { useSafeSWR } from "@hooks/utils/useSafeSWR";
import { handleClientError } from "@error/handle-client-error";
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

// Type helper to work with both MongoDB style _id and normalized id
type WithId<T> = T & { id: string } | T & { _id: string };

// Helper to get ID value regardless of property name
function getId(item: { id: string } | { _id: string }): string {
  return 'id' in item ? item.id : item._id;
}

interface ResourceManagerResult<T extends WithId<Record<string, unknown>>, I> {
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
  const { optimisticAdd, optimisticModify, optimisticRemove } = useOptimisticResource<T>(resourceName);

  // Helper to handle errors in CRUD operations
  const handleMutation = async <R>(
    operation: () => Promise<R>,
    context: string
  ): Promise<R> => {
    try {
      return await operation();
    } catch (error) {
      handleClientError(error, `${resourceName}.${context}`);
      throw error;
    } finally {
      await mutate();
    }
  };

  // Generate a proxy item from input data for optimistic add operations
  const generateProxyItem = useCallback((data: I): T => {
    // Create a temporary ID for optimistic rendering
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Create data structure based on whether the API uses id or _id
    const idField = { id: tempId };
    
    return {
      ...data as unknown as Partial<T>,
      ...idField,
    } as T;
  }, []);

  // Memoize CRUD operations
  const add = useCallback(async (data: I) => {
    if (debug) {
      console.log(`[${resourceName}] Adding item:`, data);
    }
    
    const proxyItem = generateProxyItem(data);
    
    return handleMutation(
      () => optimisticAdd(
        proxyItem, 
        async () => {
          const result = await createFn(data);
          return result;
        },
        { revalidate: true }
      ),
      `add`
    );
  }, [optimisticAdd, createFn, resourceName, debug, generateProxyItem]);

  const edit = useCallback(async (id: string, updateData: I) => {
    if (debug) {
      console.log(`[${resourceName}] Editing item ${id}:`, updateData);
    }
    
    // Find the item to update from the current data state
    const existingItems = data?.items || [];
    const existingItem = existingItems.find((item) => getId(item) === id);
    
    if (!existingItem && debug) {
      console.warn(`[${resourceName}] Item with id ${id} not found for optimistic update`);
    }
    
    // Create updated item by merging with existing data
    // We need to preserve the ID field (_id or id) from the original item
    const updatedItem = {
      ...(existingItem || {}),
      ...updateData as unknown as Partial<T>,
    } as T;
    
    // Make sure id or _id is preserved
    if (existingItem) {
      if ('id' in existingItem) {
        (updatedItem as Record<string, string>).id = id;
      } else if ('_id' in existingItem) {
        (updatedItem as Record<string, string>)._id = id;
      }
    } else {
      // If no existing item, use best guess based on data structure
      if ('id' in (data?.items?.[0] || {})) {
        (updatedItem as Record<string, string>).id = id;
      } else {
        (updatedItem as Record<string, string>)._id = id;
      }
    }
    
    return handleMutation(
      () => optimisticModify(
        updatedItem,
        async () => {
          const result = await updateFn(id, updateData);
          return result;
        },
        { revalidate: true }
      ),
      `edit`
    );
  }, [optimisticModify, updateFn, resourceName, debug, data]);

  const remove = useCallback(async (id: string) => {
    if (debug) {
      console.log(`[${resourceName}] Removing item ${id}`);
    }
    
    // Find the item to remove from the current data state
    const existingItems = data?.items || [];
    const itemToRemove = existingItems.find((item) => getId(item) === id);
    
    if (!itemToRemove) {
      if (debug) {
        console.warn(`[${resourceName}] Item with id ${id} not found for optimistic removal`);
      }
      // Attempt to delete anyway, but we can't do an optimistic update
      return handleMutation(
        () => deleteFn(id),
        `remove`
      );
    }
    
    return handleMutation(
      () => optimisticRemove(
        itemToRemove,
        async () => deleteFn(id),
        { revalidate: true }
      ),
      `remove`
    );
  }, [optimisticRemove, deleteFn, resourceName, debug, data]);

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