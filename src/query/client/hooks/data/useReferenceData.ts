import { useMemo } from 'react';
import { ZodSchema } from 'zod';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { queryKeys } from '@query/core/keys';
import { handleClientError } from '@error/handlers/client';
import { CollectionResponse } from '@core-types/response';
import { isEntityResponse, isCollectionResponse, extractItems } from '@transformers/utils/response-utils';
import { 
  transformSingleItem, 
  transformData,
} from '@transformers/core/unified-transformer';
import { ensureBaseDocumentCompatibility } from '@zod-schema/base-schemas';
import { BaseDocument } from '@core-types/document';
import { getEntityLabel } from '@query/client/utilities/selector-helpers';

export interface ReferenceOption {
  value: string;
  label: string;
  [key: string]: unknown;
}

export interface UseReferenceDataOptions<T = unknown> {
  /** The URL to fetch reference data from */
  url: string;
  
  /** Optional search term to filter options */
  search?: string;
  
  /** Whether to enable the query */
  enabled?: boolean;
  
  /** Optional schema override - if not provided, will use basic transformation */
  schema?: ZodSchema<T>;
  
  /** Entity type for selector system */
  entityType?: string;
  
  /** Custom selector to transform API response to options */
  selector?: (data: unknown) => ReferenceOption[];
  
  /** Custom fetch function */
  fetcher?: (url: string) => Promise<unknown>;
  
  /** Additional query options */
  queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn' | 'enabled' | 'select'>;
}

/**
 * Map URL to entity type for selector system
 */
function getEntityTypeFromUrl(url: string): string {
  if (url.includes('/schools') || url.includes('/school')) {
    return 'schools';
  }
  
  if (url.includes('/staff')) {
    if (url.includes('/nycps')) {
      return 'nycps-staff';
    }
    if (url.includes('/teaching-lab') || url.includes('/teachingLab')) {
      return 'teaching-lab-staff';
    }
    return 'staff';
  }
  
  if (url.includes('/look-fors') || url.includes('/lookFors')) {
    return 'look-fors';
  }
  
  if (url.includes('/rubrics')) {
    return 'rubrics';
  }

  if (url.includes('/next-steps') || url.includes('/nextSteps')) {
    return 'next-steps';
  }
  
  if (url.includes('/visits')) {
    return 'visits';
  }
  
  if (url.includes('/coaching-logs') || url.includes('/coachingLogs')) {
    return 'coaching-logs';
  }
  
  // Use a generic reference type as fallback
  return 'references';
}

/**
 * Convert any item to a ReferenceOption format with optional schema validation
 */
function itemToReferenceOption<T extends BaseDocument>(item: unknown, schema?: ZodSchema<T>): ReferenceOption | null {
  try {
    let validated: unknown = item;
    
    // Use schema validation if available
    if (schema) {
      validated = transformSingleItem<T, T>(item, {
        schema: ensureBaseDocumentCompatibility<T>(schema),
        handleDates: true,
        errorContext: 'itemToReferenceOption'
      });
      
      if (!validated) return null;
    }
    
    // Layer 3: Convert to ReferenceOption (domain transformation)
    const obj = validated as Record<string, unknown>;
    
    // Find the best ID field
    const id = obj._id || obj.id || '';
    
    // Find the best label using the helper function
    const label = getEntityLabel(obj as BaseDocument);
    
    return {
      value: String(id),
      label: String(label),
      ...obj // Include all fields for advanced usage
    };
  } catch (error) {
    console.error('Error transforming reference item:', error);
    return null;
  }
}

/**
 * Default selector with optional schema validation
 */
function defaultSelector<T extends BaseDocument>(data: unknown, schema?: ZodSchema<T>): ReferenceOption[] {
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
  
  // Transform items to reference options with optional schema validation
  if (schema) {
    // Using our transformer with domain transformation
    return transformData<T, ReferenceOption>(items, {
      schema: ensureBaseDocumentCompatibility<T>(schema),
      handleDates: true,
      domainTransform: (item: T) => {
        const id = item._id || item.id || '';
        const label = getEntityLabel(item);
        
        return {
          value: String(id),
          label: String(label),
          ...item // Include all fields for advanced usage
        };
      },
      errorContext: 'defaultSelector'
    });
  }
  
  // If no schema provided, do basic transformation
  return items
    .map(item => itemToReferenceOption(item, schema))
    .filter((option): option is ReferenceOption => option !== null);
}



/**
 * Hook for fetching reference data for select components - enhanced with selector system integration
 */
export function useReferenceData<T extends BaseDocument = BaseDocument>({
  url,
  search = '',
  enabled = true,
  schema,
  entityType,
  selector: customSelector,
  fetcher = defaultFetcher,
  queryOptions = {}
}: UseReferenceDataOptions<T>) {
  // Determine the entity type from URL if not provided
  const derivedEntityType = useMemo(() => 
    entityType || getEntityTypeFromUrl(url),
  [entityType, url]);
  
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
          : new Error(handleClientError(error, `Fetch reference data from ${url} (${derivedEntityType})`));
      }
    },
    select: (data) => {
      // If custom selector is provided, use it
      if (customSelector) {
        return customSelector(data);
      }
      
      try {
        // Extract items from the response
        const items = extractItems(data as CollectionResponse<T>);
        
        // Use the unified transformer with schema validation if available
        if (schema) {
          return transformData<T, ReferenceOption>(items, {
            schema: ensureBaseDocumentCompatibility<T>(schema),
            handleDates: true,
            domainTransform: (item: T) => ({
              value: String(item._id || item.id || ''),
              label: String(getEntityLabel(item)),
              ...item // Include all fields for advanced usage
            }),
            errorContext: `referenceData.${derivedEntityType}`
          });
        }
        
        // Fall back to default selector if no schema
        return defaultSelector(data);
      } catch (error) {
        // Fall back to default selector if transformation fails
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Transformation failed for ${derivedEntityType}, using fallback:`, error);
        }
        return defaultSelector(data, schema as ZodSchema<T>);
      }
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

// Export utility functions for entity type detection
export function getEntityTypeFromUrlUtil(url: string): string {
  return getEntityTypeFromUrl(url);
}

// Export helper functions for testing and reuse
export { 
  itemToReferenceOption, 
  defaultSelector,
};