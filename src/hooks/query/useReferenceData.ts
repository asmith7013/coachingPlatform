import { useMemo } from 'react';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { queryKeys } from '@query/core/keys';
import { handleClientError } from '@error';
import { CollectionResponse } from '@core-types/response';
import { isEntityResponse, isCollectionResponse } from '@query/utilities/response-types';
import { transformItemWithSchema } from '@/lib/data-utilities/transformers/core/transform-helpers';
import { ZodSchema } from 'zod';

export interface ReferenceOption {
  value: string;
  label: string;
}

export interface UseReferenceDataOptions<T = unknown> {
  /** The URL to fetch reference data from */
  url: string;
  
  /** Optional search term to filter options */
  search?: string;
  
  /** Whether to enable the query */
  enabled?: boolean;
  
  /** ✅ NOW REQUIRED: Zod schema for validation */
  schema: ZodSchema<T>;
  
  /** Custom selector to transform API response to options */
  selector?: (data: unknown) => ReferenceOption[];
  
  /** Custom fetch function */
  fetcher?: (url: string) => Promise<unknown>;
  
  /** Additional query options */
  queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn' | 'enabled' | 'select'>;
}

/**
 * Convert any item to a ReferenceOption format with 3-layer transformation
 */
function itemToReferenceOption<T>(item: unknown, schema: ZodSchema<T>): ReferenceOption | null {
  try {
    // Use the shared helper function for consistency
    const validated = transformItemWithSchema(item, schema);
    if (!validated) return null;
    
    // Layer 3: Convert to ReferenceOption (domain transformation)
    const obj = validated as Record<string, unknown>;
    
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
  } catch (error) {
    console.error('Error transforming reference item:', error);
    return null;
  }
}

/**
 * Default selector with schema validation
 */
function defaultSelector<T>(data: unknown, schema: ZodSchema<T>): ReferenceOption[] {
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
  
  // Transform items to reference options with schema validation
  return items
    .map(item => itemToReferenceOption(item, schema))
    .filter((option): option is ReferenceOption => option !== null);
}

/**
 * Hook for fetching reference data for select components with REQUIRED schema validation
 */
export function useReferenceData<T = unknown>({
  url,
  search = '',
  enabled = true,
  schema, // ✅ NOW REQUIRED
  selector,
  fetcher = defaultFetcher,
  queryOptions = {}
}: UseReferenceDataOptions<T>) {
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
    select: (data) => {
      // Use custom selector if provided, otherwise use default with schema validation
      return selector ? selector(data) : defaultSelector(data, schema);
    },
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
    rawData: query.data
  };
}

// Default fetcher implementation
async function defaultFetcher(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch reference data: ${response.statusText}`);
  }
  return response.json();
}