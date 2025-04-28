import { useState, useMemo } from 'react';
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
 * Hook for working with reference data in forms, selects, and other UI components
 * 
 * @param options Configuration options
 * @returns Object containing reference data and selection handlers
 */
export function useReferenceData<T extends BaseReference>({
  url,
  searchQuery = "",
  limit = 20,
  page = 1,
  refreshInterval = 0,
  dedupingInterval = 60000 // 1 minute
}: UseReferenceDataOptions): UseReferenceDataReturn<T> {
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
  const result = {} as { [K in keyof T]: UseReferenceDataReturn<R[K]> };
  
  for (const key in configs) {
    result[key] = useReferenceData<R[keyof T]>(configs[key]);
  }
  
  return result;
}