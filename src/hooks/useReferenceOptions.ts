import { useMemo } from 'react';
import { useSafeSWR } from './utils/useSafeSWR';
import { handleClientError } from '@/lib/error/handleClientError';

type ReferenceOption = {
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

// Define the API response structure
interface ApiResponse {
  items: ApiResponseItem[];
  [key: string]: unknown;
}

const fetcher = async (url: string): Promise<ApiResponse> => {
  // Only log in development to reduce console noise
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 Fetching reference options from: ${url}`);
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    const errorMessage = `API error (${response.status}): ${errorText}`;
    handleClientError(errorMessage, `ReferenceOptions:${url}`);
    throw new Error(`Failed to fetch data from ${url}: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Only log in development to reduce console noise
  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ Received API response for ${url}`, data);
  }
  
  return data;
};

export function useReferenceOptions(url: string, searchQuery: string = ""): {
  options: ReferenceOption[];
  error: Error | null;
  isLoading: boolean;
} {

  // Memoize the key to prevent unnecessary refetches
  const fetchKey = useMemo(() => 
    searchQuery ? `${url}?search=${encodeURIComponent(searchQuery)}` : url, 
    [url, searchQuery]
  );

  
  // Customize SWR options for reference data
  const swrOptions = {
    dedupingInterval: 30000, // References change infrequently (30s)
    revalidateOnMount: true, // Always fetch on first mount
  };
  
  // Use enhanced SWR with better caching
  const { data, error } = useSafeSWR<ApiResponse>(
    fetchKey,
    async () => fetcher(fetchKey),
    `fetch_reference_${url}`,
    swrOptions
  );

  
  // Memoize the transformed options to prevent unnecessary rerenders
  const options = useMemo(() => {
    if (!data?.items) return [];
    
    const transformedOptions = data.items.map(item => ({
      value: (item._id || item.id || '').toString(),
      label: item.schoolName || item.staffName || item.name || String(item.value || ''),
    }));
    
    return transformedOptions;
  }, [data]);
  
  
  return useMemo(() => ({ 
    options, 
    error: error || null, 
    isLoading: !data && !error 
  }), [options, error, data]);
}

export default useReferenceOptions; 