import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/query-keys';

export interface FiltersAndSortingOptions {
  /** Key for storing filter state in localStorage */
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
  
  /** Valid fields for sorting */
  validSortFields?: string[];
  
  /** Whether to persist state to localStorage */
  persist?: boolean;
  
  /** Entity type (for query invalidation) */
  entityType?: string;
}

interface FiltersAndSortingState {
  filters: Record<string, unknown>;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search: string;
  page: number;
  pageSize: number;
}

/**
 * Hook for managing filters, sorting, and pagination state for React Query
 * Compatible with both the useResourceManagerRQ hook and direct query usage
 */
export function useFiltersAndSortingRQ({
  storageKey,
  defaultFilters = {},
  defaultSortBy = 'createdAt',
  defaultSortOrder = 'desc',
  defaultPage = 1,
  defaultPageSize = 10,
  validSortFields = ['createdAt'],
  persist = true,
  entityType
}: FiltersAndSortingOptions = {}) {
  const queryClient = useQueryClient();
  
  // Load initial state from localStorage if available
  const loadInitialState = useCallback((): FiltersAndSortingState => {
    if (persist && storageKey && typeof window !== 'undefined') {
      try {
        const savedState = localStorage.getItem(`filter_${storageKey}`);
        if (savedState) {
          return JSON.parse(savedState);
        }
      } catch (e) {
        console.warn('Failed to load filter state from localStorage:', e);
      }
    }
    
    return {
      filters: defaultFilters,
      sortBy: defaultSortBy,
      sortOrder: defaultSortOrder,
      search: '',
      page: defaultPage,
      pageSize: defaultPageSize
    };
  }, [persist, storageKey, defaultFilters, defaultSortBy, defaultSortOrder, defaultPage, defaultPageSize]);
  
  // State for filters and sorting
  const [state, setState] = useState<FiltersAndSortingState>(loadInitialState);
  
  // Extract individual state values
  const { filters, sortBy, sortOrder, search, page, pageSize } = state;
  
  // Save state to localStorage when it changes
  useEffect(() => {
    if (persist && storageKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`filter_${storageKey}`, JSON.stringify(state));
      } catch (e) {
        console.warn('Failed to save filter state to localStorage:', e);
      }
    }
  }, [persist, storageKey, state]);
  
  // Function to update filters
  const setFilters = useCallback((newFilters: Record<string, unknown>) => {
    setState((prev: FiltersAndSortingState) => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      page: 1 // Reset to first page when filters change
    }));
    
    if (entityType) {
      // Invalidate queries when filters change
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.entities.list(entityType), 
        exact: false 
      });
    }
  }, [entityType, queryClient]);
  
  // Function to update search
  const setSearch = useCallback((newSearch: string) => {
    setState((prev: FiltersAndSortingState) => ({
      ...prev,
      search: newSearch,
      page: 1 // Reset to first page when search changes
    }));
    
    if (entityType) {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.entities.list(entityType), 
        exact: false 
      });
    }
  }, [entityType, queryClient]);
  
  // Function to update sort field
  const setSortBy = useCallback((newSortBy: string) => {
    if (validSortFields.includes(newSortBy)) {
      setState((prev: FiltersAndSortingState) => ({
        ...prev,
        sortBy: newSortBy
      }));
      
      if (entityType) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.entities.list(entityType), 
          exact: false 
        });
      }
    } else {
      console.warn(`Invalid sort field: ${newSortBy}. Valid fields are: ${validSortFields.join(', ')}`);
    }
  }, [validSortFields, entityType, queryClient]);
  
  // Function to update sort order
  const setSortOrder = useCallback((newSortOrder: 'asc' | 'desc') => {
    setState((prev: FiltersAndSortingState) => ({
      ...prev,
      sortOrder: newSortOrder
    }));
    
    if (entityType) {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.entities.list(entityType), 
        exact: false 
      });
    }
  }, [entityType, queryClient]);
  
  // Function to update page
  const setPage = useCallback((newPage: number) => {
    setState((prev: FiltersAndSortingState) => ({
      ...prev,
      page: newPage
    }));
    
    if (entityType) {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.entities.list(entityType), 
        exact: false 
      });
    }
  }, [entityType, queryClient]);
  
  // Function to update page size
  const setPageSize = useCallback((newPageSize: number) => {
    setState((prev: FiltersAndSortingState) => ({
      ...prev,
      pageSize: newPageSize,
      page: 1 // Reset to first page when page size changes
    }));
    
    if (entityType) {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.entities.list(entityType), 
        exact: false 
      });
    }
  }, [entityType, queryClient]);
  
  // Function to reset all filters to defaults
  const resetFilters = useCallback(() => {
    setState({
      filters: defaultFilters,
      sortBy: defaultSortBy,
      sortOrder: defaultSortOrder,
      search: '',
      page: defaultPage,
      pageSize: defaultPageSize
    });
    
    if (entityType) {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.entities.list(entityType), 
        exact: false 
      });
    }
  }, [defaultFilters, defaultSortBy, defaultSortOrder, defaultPage, defaultPageSize, entityType, queryClient]);
  
  // Build query parameters for React Query
  const queryParams = {
    page,
    limit: pageSize,
    sortBy,
    sortOrder,
    search: search || undefined,
    filters
  };
  
  return {
    // State values
    filters,
    sortBy,
    sortOrder,
    search,
    page,
    pageSize,
    
    // State update functions
    setFilters,
    setSearch,
    setSortBy,
    setSortOrder,
    setPage,
    setPageSize,
    resetFilters,
    
    // Ready-to-use query parameters for React Query
    queryParams
  };
} 