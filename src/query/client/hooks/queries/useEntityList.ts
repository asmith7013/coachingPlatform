import { ZodSchema } from 'zod';
import { UseQueryOptions } from '@tanstack/react-query';
import { ResponseTransformer, usePagination } from '@/query/client/hooks/pagination/usePagination';
import { BaseDocument } from '@core-types/document';
import { QueryParams } from '@core-types/query';
import { PaginatedResponse } from '@core-types/response';
import { transformPaginatedResponse } from '@query/client/utilities/hook-helpers';

/**
 * Configuration for useEntityList hook
 */
export interface UseEntityListConfig<T extends BaseDocument> {
  /** Entity type for query key generation */
  entityType: string;
  
  /** Function to fetch entities */
  fetcher: (params: QueryParams) => Promise<PaginatedResponse<T>>;
  
  /** Zod schema for validation */
  schema: ZodSchema<T>;
  
  /** Whether to use the selector system instead of direct schema validation */
  useSelector?: boolean;
  
  /** Default parameters for the query */
  defaultParams?: Partial<QueryParams>;
  
  /** Valid fields for sorting */
  validSortFields?: string[];
  
  /** Whether to persist filters in storage */
  persistFilters?: boolean;
  
  /** Storage key for persisted filters */
  storageKey?: string;
  
  /** Stale time for cache in milliseconds */
  staleTime?: number;
  
  /** Error context prefix */
  errorContextPrefix?: string;
  
  /** Additional query options */
  queryOptions?: Omit<UseQueryOptions<PaginatedResponse<T>, Error, PaginatedResponse<T>>, 'queryKey' | 'queryFn' | 'select'>;
}

/**
 * Hook for fetching and managing lists of entities with schema validation
 */
export function useEntityList<T extends BaseDocument>({
  entityType,
  fetcher,
  schema,
  useSelector = false,
  defaultParams = {},
  staleTime,
  queryOptions = {},
  errorContextPrefix
}: UseEntityListConfig<T>): ReturnType<typeof usePagination<T, T>> {
  // Create a transformation function using our unified utilities
  const transformer: ResponseTransformer<T, T> = (data: PaginatedResponse<T> | undefined): PaginatedResponse<T> => {
    return transformPaginatedResponse<T>(
      data,
      schema,
      {
        entityType,
        useSelector,
        errorContext: `${errorContextPrefix || entityType}.useEntityList`
      }
    );
  };
  
  // Delegate to the base paginated data hook
  return usePagination<T, T>({
    entityType,
    initialParams: defaultParams,
    queryFn: fetcher,
    queryOptions,
    transformFn: transformer,
    staleTime
  });
}