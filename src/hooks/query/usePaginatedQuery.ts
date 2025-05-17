// src/lib/query/hooks/usePaginatedQuery.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { PaginatedResponse } from '@core-types/response';
import { queryKeys } from '@/lib/query/core/keys';
import { handleQueryError } from '@/lib/query/utilities/error-handling';
import { isPaginatedResponse } from '@/lib/query/utilities/response-types';

export interface PaginationQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, unknown>;
}

export interface UsePaginatedQueryOptions<T> {
  entityType: string;
  params?: PaginationQueryParams;
  fetcher: (params: PaginationQueryParams) => Promise<PaginatedResponse<T>>;
  options?: Omit<UseQueryOptions<PaginatedResponse<T>, Error>, 'queryKey' | 'queryFn'>;
}

export interface PaginatedQueryResult<T> {
  items: T[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
  total: number;
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    total: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  // Original response for advanced usage
  response: PaginatedResponse<T> | undefined;
}

export function usePaginatedQuery<T>({
  entityType,
  params = {},
  fetcher,
  options = {},
}: UsePaginatedQueryOptions<T>): PaginatedQueryResult<T> {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    search = '',
    filters = {},
  } = params;

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
      const response = await handleQueryError(
        fetcher({ page, limit, sortBy, sortOrder, search, filters }),
        `Fetch ${entityType} list`
      );
      
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
        };
        
        // Calculate totalPages if not provided
        convertedResponse.totalPages = Math.ceil(convertedResponse.total / limit);
        convertedResponse.hasMore = page < convertedResponse.totalPages;
        
        return convertedResponse;
      }
      
      return response;
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