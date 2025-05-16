import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

export interface FiltersAndSortingOptions {
  /** Storage key for persisting state */
  storageKey?: string;
  
  /** Default filters */
  defaultFilters?: Record<string, unknown>;
  
  /** Default sort field */
  defaultSortBy?: string;
  
  /** Default sort order */
  defaultSortOrder?: 'asc' | 'desc';
  
  /** Default page number */
  defaultPage?: number;
  
  /** Default page size */
  defaultPageSize?: number;
  
  /** Valid sort fields */
  validSortFields?: string[];
  
  /** Whether to persist state */
  persist?: boolean;
}

export interface FiltersAndSortingState {
  /** Current filters */
  filters: Record<string, unknown>;
  
  /** Current sort field */
  sortBy: string;
  
  /** Current sort order */
  sortOrder: 'asc' | 'desc';
  
  /** Current page number */
  page: number;
  
  /** Current page size */
  pageSize: number;
  
  /** Current search term */
  search: string;
  
  /** Apply new filters */
  applyFilters: (newFilters: Record<string, unknown>, autoMutate?: boolean) => void;
  
  /** Change sorting */
  changeSorting: (newSortBy: string, newSortOrder?: 'asc' | 'desc', autoMutate?: boolean) => void;
  
  /** Set page number */
  setPage: (newPage: number, autoMutate?: boolean) => void;
  
  /** Set page size */
  setPageSize: (newPageSize: number, autoMutate?: boolean) => void;
  
  /** Set search term */
  setSearch: (newSearch: string, autoMutate?: boolean) => void;
  
  /** Reset all state to defaults */
  reset: (autoMutate?: boolean) => void;
}

/**
 * Hook for managing filters, sorting, pagination, and search state
 */
export function useFiltersAndSorting(options: FiltersAndSortingOptions = {}): FiltersAndSortingState {
  const {
    storageKey,
    defaultFilters = {},
    defaultSortBy = 'createdAt',
    defaultSortOrder = 'desc',
    defaultPage = 1,
    defaultPageSize = 10,
    validSortFields = ['createdAt'],
    persist = true
  } = options;

  // Initialize state
  const [filters, setFilters] = useState<Record<string, unknown>>(defaultFilters);
  const [sortBy, setSortBy] = useState<string>(defaultSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder);
  const [page, setPage] = useState<number>(defaultPage);
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);
  const [search, setSearch] = useState<string>('');

  // Get query client for cache invalidation
  const queryClient = useQueryClient();

  // Helper to validate sort field
  const validateSortBy = useCallback((field: string): string => {
    if (!validSortFields.includes(field)) {
      console.warn(`Invalid sort field: ${field}. Using default: ${defaultSortBy}`);
      return defaultSortBy;
    }
    return field;
  }, [validSortFields, defaultSortBy]);

  // Apply filters
  const applyFilters = useCallback((newFilters: Record<string, unknown>, autoMutate = false) => {
    setFilters(newFilters);
    if (autoMutate && storageKey) {
      queryClient.invalidateQueries({ queryKey: [storageKey] });
    }
  }, [queryClient, storageKey]);

  // Change sorting
  const changeSorting = useCallback((
    newSortBy: string,
    newSortOrder?: 'asc' | 'desc',
    autoMutate = false
  ) => {
    setSortBy(validateSortBy(newSortBy));
    if (newSortOrder) {
      setSortOrder(newSortOrder);
    }
    if (autoMutate && storageKey) {
      queryClient.invalidateQueries({ queryKey: [storageKey] });
    }
  }, [queryClient, storageKey, validateSortBy]);

  // Set page
  const handleSetPage = useCallback((newPage: number, autoMutate = false) => {
    setPage(newPage);
    if (autoMutate && storageKey) {
      queryClient.invalidateQueries({ queryKey: [storageKey] });
    }
  }, [queryClient, storageKey]);

  // Set page size
  const handleSetPageSize = useCallback((newPageSize: number, autoMutate = false) => {
    setPageSize(newPageSize);
    if (autoMutate && storageKey) {
      queryClient.invalidateQueries({ queryKey: [storageKey] });
    }
  }, [queryClient, storageKey]);

  // Set search
  const handleSetSearch = useCallback((newSearch: string, autoMutate = false) => {
    setSearch(newSearch);
    if (autoMutate && storageKey) {
      queryClient.invalidateQueries({ queryKey: [storageKey] });
    }
  }, [queryClient, storageKey]);

  // Reset state
  const reset = useCallback((autoMutate = false) => {
    setFilters(defaultFilters);
    setSortBy(defaultSortBy);
    setSortOrder(defaultSortOrder);
    setPage(defaultPage);
    setPageSize(defaultPageSize);
    setSearch('');
    if (autoMutate && storageKey) {
      queryClient.invalidateQueries({ queryKey: [storageKey] });
    }
  }, [
    queryClient,
    storageKey,
    defaultFilters,
    defaultSortBy,
    defaultSortOrder,
    defaultPage,
    defaultPageSize
  ]);

  return {
    filters,
    sortBy,
    sortOrder,
    page,
    pageSize,
    search,
    applyFilters,
    changeSorting,
    setPage: handleSetPage,
    setPageSize: handleSetPageSize,
    setSearch: handleSetSearch,
    reset
  };
}