import { useMemo } from 'react';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/core/keys';
import { handleClientError } from '@/lib/error';
import { CollectionResponse } from '@core-types/response';
import { isEntityResponse, isCollectionResponse } from '@/lib/query/utilities/response-types';
import { BaseReference } from '@/lib/types/core/reference';

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
  selector?: (data: unknown) => ReferenceOption[];
  
  /** Custom fetch function */
  fetcher?: (url: string) => Promise<unknown>;
  
  /** Additional query options */
  queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn' | 'enabled' | 'select'>;
}

/**
 * Default fetcher for reference data
 */
async function defaultFetcher(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch reference data: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Check if an item conforms to the BaseReference interface
 */
function isBaseReference(item: unknown): item is BaseReference {
  return Boolean(
    item && 
    typeof item === 'object' && 
    item !== null &&
    '_id' in item && 
    'label' in item
  );
}

/**
 * Convert any item to a ReferenceOption format
 */
function itemToReferenceOption(item: unknown): ReferenceOption {
  // If it's already a BaseReference, use its properties
  if (isBaseReference(item)) {
    return {
      value: item._id,
      label: item.label
    };
  }
  
  // Otherwise, try to extract the necessary fields
  const obj = item as Record<string, unknown>;
  
  // Find the best ID field
  const id = obj._id || obj.id || '';
  
  // Find the best label
  const label = obj.name || 
                obj.title || 
                obj.label || 
                obj.staffName || 
                obj.schoolName || 
                String(id);
  
  return {
    value: String(id),
    label: String(label)
  };
}

/**
 * Default selector to transform API response to select options
 */
function defaultSelector(data: unknown): ReferenceOption[] {
  // Extract items array based on response format
  let items: unknown[] = [];
  
  if (isCollectionResponse<unknown>(data)) {
    items = data.items || [];
  } else if (isEntityResponse<unknown>(data)) {
    items = Array.isArray(data.data) ? data.data : [data.data];
  } else if (Array.isArray(data)) {
    items = data;
  } else if (data && typeof data === 'object' && 'items' in data && Array.isArray((data as CollectionResponse<unknown>).items)) {
    items = (data as CollectionResponse<unknown>).items;
  } else {
    return [];
  }
  
  // Transform items to reference options
  return items.map(itemToReferenceOption);
}

/**
 * Hook for fetching reference data for select components with React Query
 */
export function useReferenceData({
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
    refetch: query.refetch,
    // Include the raw response
    rawData: query.data
  };
}