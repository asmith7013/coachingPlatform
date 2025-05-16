import { useMemo } from 'react';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/query-keys';
import { handleClientError } from '@/lib/error';
import { StandardResponse } from '@core-types/response';

export interface ReferenceOption {
  value: string;
  label: string;
}

export interface UseReferenceDataOptions {
  /** The URL to fetch reference data from */
  url: string;
  
  /** Optional search term to filter options */
  search?: string;
  
  /** Whether to enable the query */
  enabled?: boolean;
  
  /** Custom selector to transform API response to options */
  selector?: (data: any) => ReferenceOption[];
  
  /** Custom fetch function */
  fetcher?: (url: string) => Promise<any>;
  
  /** Additional query options */
  queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn' | 'enabled' | 'select'>;
}

/**
 * Default fetcher for reference data
 */
async function defaultFetcher(url: string): Promise<any> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch reference data: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Default selector to transform API response to select options
 */
function defaultSelector(data: StandardResponse<any>): ReferenceOption[] {
  if (!data?.items) return [];
  
  return data.items.map((item: any) => ({
    value: item._id || item.id || '',
    label: item.name || item.title || item.label || item.staffName || item.schoolName || String(item._id || item.id || '')
  }));
}

/**
 * Hook for fetching reference data for select components with React Query
 */
export function useReferenceDataRQ({
  url,
  search = '',
  enabled = true,
  selector = defaultSelector,
  fetcher = defaultFetcher,
  queryOptions = {}
}: UseReferenceDataOptions) {
  // Build the URL with search parameter if provided
  const fetchUrl = useMemo(() => {
    if (!search) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}search=${encodeURIComponent(search)}`;
  }, [url, search]);
  
  // Create the query key
  const queryKey = queryKeys.references.options(url, search);
  
  // Execute the query
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        return await fetcher(fetchUrl);
      } catch (error) {
        throw error instanceof Error
          ? error
          : new Error(handleClientError(error, `Fetch reference data from ${url}`));
      }
    },
    select: selector,
    enabled: enabled && !!url,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...queryOptions
  });
  
  return {
    options: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch
  };
}
