// src/lib/query/hooks/usePaginatedQuery.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { PaginatedResponse } from '@core-types/pagination';
import { queryKeys } from '@query/core/keys';
import { handleClientError } from '@error/handlers/client';
import { isPaginatedResponse } from '@transformers/utilities/response-utils';
import { QueryParams, buildQueryParams, DEFAULT_QUERY_PARAMS } from '@core-types/query';
import { ZodSchema } from 'zod';
import { transformItemsWithSchema } from '@transformers/core/transform-helpers';

export interface UsePaginatedQueryOptions<T> {
  entityType: string;
  params?: QueryParams;
  fetcher: (params: QueryParams) => Promise<PaginatedResponse<T>>;
  schema: ZodSchema<T>;
  options?: Omit<UseQueryOptions<PaginatedResponse<T>, Error>, 'queryKey' | 'queryFn'>;
}

export interface PaginatedQueryResult<T> {
  items: T[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
  total: number;
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    total: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  response: PaginatedResponse<T> | undefined;
}

export function usePaginatedQuery<T>({
  entityType,
  params = DEFAULT_QUERY_PARAMS,
  fetcher,
  schema,
  options = {},
}: UsePaginatedQueryOptions<T>): PaginatedQueryResult<T> {
  // Build query params with defaults
  const queryParams = buildQueryParams(params);
  const { page, limit, sortBy, sortOrder, filters, search } = queryParams;

  const fullQueryKey = queryKeys.entities.list(entityType, {
    page,
    limit,
    sortBy,
    sortOrder,
    search,
    filters: Object.keys(filters)
      .sort()
      .reduce((acc, key) => ({ ...acc, [key]: filters[key] }), {}),
  });

  const query = useQuery({
    queryKey: fullQueryKey,
    queryFn: async () => {
      try {
        const response = await fetcher(queryParams);
        
        // Ensure we have a valid PaginatedResponse
        if (!isPaginatedResponse<T>(response)) {
          // Convert to paginated response format if needed
          const convertedResponse: PaginatedResponse<T> = {
            items: Array.isArray(response) ? response : 
                   (response && typeof response === 'object' && 'items' in response) ? 
                   (response as PaginatedResponse<T>).items || [] : [],
            total: (response && typeof response === 'object' && 'total' in response) ? 
                   (response as PaginatedResponse<T>).total : 0,
            page,
            limit,
            totalPages: 0,
            hasMore: false,
            success: true,
            empty: false
          };
          
          // Calculate totalPages if not provided
          convertedResponse.totalPages = Math.ceil(convertedResponse.total / limit);
          convertedResponse.hasMore = page < convertedResponse.totalPages;
          convertedResponse.empty = convertedResponse.items.length === 0;
          
          return convertedResponse;
        }
        
        return response;
      } catch (error) {
        throw error instanceof Error 
          ? error 
          : new Error(handleClientError(error, `Fetch ${entityType} list`));
      }
    },
    select: (data) => {
      if (!data?.items) return data;
      
      try {
        // Use the shared helper function for consistency
        const transformedItems = transformItemsWithSchema(data.items, schema);
        
        return {
          ...data,
          items: transformedItems
        };
      } catch (error) {
        console.error('Error transforming paginated data:', error);
        return data; // Fallback to original data
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });

  const { data, isLoading, isFetching, error, refetch } = query;

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? Math.ceil(total / limit);
  const hasNextPage = (data?.page ?? page) < totalPages;
  const hasPreviousPage = (data?.page ?? page) > 1;

  return {
    items,
    isLoading,
    isFetching,
    error: error as Error | null,
    refetch,
    total,
    pagination: {
      page: data?.page ?? page,
      pageSize: data?.limit ?? limit,
      totalPages,
      total,
      hasNextPage,
      hasPreviousPage,
    },
    response: data,
  };
}
