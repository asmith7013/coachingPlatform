import { useMemo } from 'react';
import { useSafeSWR } from './utils/useSafeSWR';
import { handleClientError } from '@/lib/core/error/handle-client-error';
import { standardizeResponse } from '@/lib/api/responses/standardize';

export type ReferenceOption = {
  value: string;
  label: string;
};

// Define item shape for API responses
interface ApiResponseItem {
  _id?: string;
  id?: string;
  schoolName?: string;
  staffName?: string;
  name?: string;
  value?: string | number;
  [key: string]: unknown;
}

// Define the possible API response structures
interface ApiObjectResponse {
  items: ApiResponseItem[];
  [key: string]: unknown;
}

type ApiArrayResponse = ApiResponseItem[];

type ApiResponse = ApiObjectResponse | ApiArrayResponse;

/**
 * Safely normalizes different API response formats into a consistent array of items
 */
function normalizeApiResponse(data: unknown): ApiResponseItem[] {
  // Use standardizeResponse then access items
  const standardized = standardizeResponse<ApiResponseItem>(data);
  return standardized.items;
}

/**
 * Safely transform API items into ReferenceOptions with proper value/label
 */
function transformToOptions(items: ApiResponseItem[]): ReferenceOption[] {
  if (!items || !Array.isArray(items)) return [];
  
  return items.map(item => ({
    value: (item._id || item.id || '').toString(),
    label: item.schoolName || item.staffName || item.name || String(item.value || ''),
  }));
}

const fetcher = async (url: string): Promise<ApiResponse> => {
  // Only log in development to reduce console noise
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 Fetching reference options from: ${url}`);
  }
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    // Only log in development to reduce console noise
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Received API response for ${url}`, data);
    }
    
    return data as ApiResponse;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    handleClientError(error, `ReferenceOptions:${url}`);
    throw new Error(`Failed to fetch data from ${url}: ${errorMessage}`);
  }
};

/**
 * Enhanced hook for fetching and formatting reference options from an API
 * Includes robust error handling and support for different API response formats
 */
export function useReferenceOptions(
  url: string | null, 
  searchQuery: string = "",
  refreshKey: number = 0
): {
  options: ReferenceOption[];
  error: Error | null;
  isLoading: boolean;
  rawData: unknown;
} {
  // Don't fetch if URL is null
  const shouldFetch = !!url;
  
  // Memoize the key to prevent unnecessary refetches
  const fetchKey = useMemo(() => {
    if (!shouldFetch) return null;
    return searchQuery 
      ? `${url}?search=${encodeURIComponent(searchQuery)}&_refresh=${refreshKey}` 
      : `${url}?_refresh=${refreshKey}`;
  }, [url, searchQuery, shouldFetch, refreshKey]);

  // Customize SWR options for reference data
  const swrOptions = {
    dedupingInterval: 30000, // References change infrequently (30s)
    revalidateOnFocus: false, // Don't revalidate on focus to reduce API calls
    revalidateOnMount: true, // Always fetch on first mount
    keepPreviousData: true, // Keep previous data to prevent UI flicker
  };
  
  // Use enhanced SWR with better caching
  const { data, error } = useSafeSWR<ApiResponse | null>(
    fetchKey,
    async () => shouldFetch ? fetcher(fetchKey as string) : null,
    `fetch_reference_${url}`,
    swrOptions
  );

  // Safely normalize and transform the data
  const normalizedItems = useMemo(() => {
    return normalizeApiResponse(data);
  }, [data]);
  
  // Memoize the transformed options to prevent unnecessary rerenders
  const options = useMemo(() => {
    return transformToOptions(normalizedItems);
  }, [normalizedItems]);
  
  return useMemo(() => ({ 
    options, 
    error: error || null, 
    isLoading: shouldFetch && !data && !error,
    rawData: data // Provide raw data for debugging
  }), [options, error, data, shouldFetch]);
}

export default useReferenceOptions; 