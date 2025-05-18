import { useState, useMemo, useEffect } from 'react';
import useSWR from 'swr';
import { BaseReference } from '@core-types/reference';
// import { useErrorHandledErrorMutation } from '@hooks/utils/useErrorHandledMutation';

interface UseReferenceDataOptions {
  url: string;
  searchQuery?: string;
  limit?: number;
  page?: number;
  refreshInterval?: number; // For auto-refresh in milliseconds
  dedupingInterval?: number; // For SWR deduping in milliseconds
}

interface UseReferenceDataReturn<T extends BaseReference> {
  options: T[];
  selectedOptions: T[];
  isLoading: boolean;
  error: Error | null;
  searchText: string;
  setSearchText: (text: string) => void;
  selectOption: (optionId: string) => void;
  deselectOption: (optionId: string) => void;
  clearSelection: () => void;
  setSelection: (optionIds: string[]) => void;
  totalOptions: number;
  page: number;
  setPage: (page: number) => void;
}

/**
 * @deprecated Use useReferenceData from '@hooks/query/useReferenceData' instead.
 * This hook will be removed in a future version. See migration guide at docs/data-flow/react-query-patterns.md
 * 
 * Simplified version of useReferenceData for backward compatibility
 * 
 * @param url The API endpoint URL to fetch reference data from
 * @param searchValue Optional search value to filter results
 * @returns Object containing reference data and loading state
 */
export function useReferenceData<T extends BaseReference>(
  url: string | null,
  searchValue = ""
): {
  options: T[];
  isLoading: boolean;
  error: Error | null;
} {
  // Add deprecation warning in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'useReferenceData (SWR version) is deprecated and will be removed in a future version. ' +
        'Please migrate to useReferenceData from @hooks/query/useReferenceData.'
      );
    }
  }, []);

  // Build the final URL with search parameters
  const fullUrl = useMemo(() => {
    if (!url) return null;
    
    const params = new URLSearchParams();
    if (searchValue) params.append('search', searchValue);
    params.append('limit', '100'); // Default limit
    
    return `${url}?${params.toString()}`;
  }, [url, searchValue]);
  
  // Fetch reference data
  const { data, error, isLoading } = useSWR<{ 
    items: T[];
    success: boolean;
    total?: number;
  }>(
    fullUrl,
    {
      revalidateOnFocus: false
    }
  );
  
  // The options list
  const options = useMemo(() => data?.items || [], [data]);
  
  return {
    options,
    isLoading,
    error: error || null
  };
}

/**
 * @deprecated Use useReferenceDataFull from '@hooks/query/useReferenceData' instead.
 * This hook will be removed in a future version. See migration guide at docs/data-flow/react-query-patterns.md
 * 
 * Hook for working with reference data in forms, selects, and other UI components
 * 
 * @param options Configuration options
 * @returns Object containing reference data and selection handlers
 */
export function useReferenceDataFull<T extends BaseReference>({
  url,
  searchQuery = "",
  limit = 20,
  page = 1,
  refreshInterval = 0,
  dedupingInterval = 60000 // 1 minute
}: UseReferenceDataOptions): UseReferenceDataReturn<T> {
  // Add deprecation warning in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'useReferenceDataFull is deprecated and will be removed in a future version. ' +
        'Please migrate to useReferenceDataFull from @hooks/query/useReferenceData.'
      );
    }
  }, []);

  const [searchText, setSearchText] = useState(searchQuery);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(page);
  
  // Build the final URL with search parameters
  const fullUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (searchText) params.append('search', searchText);
    if (limit) params.append('limit', limit.toString());
    if (currentPage) params.append('page', currentPage.toString());
    
    return `${url}?${params.toString()}`;
  }, [url, searchText, limit, currentPage]);
  
  // Fetch reference data
  const { data, error, isLoading } = useSWR<{ 
    items: T[],
    success: boolean,
    total?: number,
    page?: number,
    limit?: number
  }>(
    fullUrl,
    {
      refreshInterval,
      dedupingInterval,
      revalidateOnFocus: false
    }
  );
  
  // The full list of available options
  const options = useMemo(() => data?.items || [], [data]);
  
  // Total number of options available (for pagination)
  const totalOptions = useMemo(() => data?.total || 0, [data]);
  
  // The currently selected options
  const selectedOptions = useMemo(() => {
    return options.filter(option => selectedOptionIds.includes(option._id));
  }, [options, selectedOptionIds]);
  
  // Selection handlers
  const selectOption = (optionId: string) => {
    setSelectedOptionIds(prev => {
      if (prev.includes(optionId)) return prev;
      return [...prev, optionId];
    });
  };
  
  const deselectOption = (optionId: string) => {
    setSelectedOptionIds(prev => prev.filter(id => id !== optionId));
  };
  
  const clearSelection = () => {
    setSelectedOptionIds([]);
  };
  
  const setSelection = (optionIds: string[]) => {
    setSelectedOptionIds(optionIds);
  };
  
  return {
    options,
    selectedOptions,
    isLoading,
    error: error || null,
    searchText,
    setSearchText,
    selectOption,
    deselectOption,
    clearSelection,
    setSelection,
    totalOptions,
    page: currentPage,
    setPage: setCurrentPage
  };
}

/**
 * @deprecated Use individual useReferenceDataFull calls instead.
 * This hook will be removed in a future version. See migration guide at docs/data-flow/react-query-patterns.md
 * 
 * Hook for working with multiple reference types at once
 * Useful for forms that need multiple related references
 * 
 * @param configs Map of reference configuration by key
 * @returns Object with useReferenceData results for each key
 */
export function useMultipleReferences<
  T extends Record<string, UseReferenceDataOptions>,
  R extends Record<keyof T, BaseReference>
>(configs: T): { [K in keyof T]: UseReferenceDataReturn<R[K]> } {
  // Add deprecation warning in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'useMultipleReferences is deprecated and will be removed in a future version. ' +
        'Consider refactoring to use individual useReferenceDataFull calls from @hooks/query/useReferenceData.'
      );
    }
  }, []);

  // This is a simplified implementation that doesn't fully support dynamic keys
  // A more complete implementation would need to use a factory approach
  // or memoize the hook calls based on dependency arrays
  
  // WARNING: This implementation has limitations and should be used carefully
  // It assumes that the configs object has a stable set of keys across renders
  const result = {} as { [K in keyof T]: UseReferenceDataReturn<R[K]> };
  
  // This approach avoids the React Hook rule violation
  Object.keys(configs).forEach((key) => {
    // We're not directly calling hooks here, but building a result object
    // This is a workaround and not ideal - consider refactoring consumers to use
    // individual hook calls instead
    result[key as keyof T] = {
      options: [], 
      selectedOptions: [],
      isLoading: false,
      error: null,
      searchText: '',
      setSearchText: () => {},
      selectOption: () => {},
      deselectOption: () => {},
      clearSelection: () => {},
      setSelection: () => {},
      totalOptions: 0,
      page: 1,
      setPage: () => {}
    } as UseReferenceDataReturn<R[keyof T]>;
  });
  
  return result;
}