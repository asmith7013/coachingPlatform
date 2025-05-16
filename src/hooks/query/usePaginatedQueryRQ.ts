// src/lib/query/hooks/usePaginatedQuery.ts
import React from 'react';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { PaginatedResponse } from '@core-types/response';
import { queryKeys } from '@/lib/query/query-keys';
import { handleQueryError } from '@/lib/query/utilities/error-handling';

export interface PaginationQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
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
    queryFn: () => handleQueryError(
      fetcher({ page, limit, sortBy, sortOrder, search, filters }),
      `Fetch ${entityType} list`
    ),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });

  const { data, isLoading, isFetching, error, refetch } = query;

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    items,
    isLoading,
    isFetching,
    error,
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
  };
}