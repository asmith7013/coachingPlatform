// src/query/client/hooks/pagination/usePaginatedQuery.ts

import { ZodSchema } from 'zod';
import { useQueryPagination } from '@query/client/hooks/core/useQueryPagination';
import { ListQueryResult } from '@core-types/query-factory';
import { QueryParams } from '@core-types/query';
import { PaginatedResponse } from '@core-types/response';
import { BaseDocument } from '@core-types/document';
import { transformPaginatedResponse } from '@query/client/utilities/hook-helpers';

export interface UsePaginatedQueryOptions<T extends BaseDocument> {
  entityType: string;
  params?: Partial<QueryParams>;
  fetcher: (params: QueryParams) => Promise<PaginatedResponse<T> | unknown>;
  schema: ZodSchema<T>;
  options?: Record<string, unknown>;
  useSelector?: boolean;
}

/**
 * Hook for handling paginated queries with flexible response formats
 */
export function usePaginatedQuery<T extends BaseDocument, R extends Record<string, unknown> = T>({
  entityType,
  params,
  fetcher,
  schema,
  options = {},
  useSelector = false
}: UsePaginatedQueryOptions<T>): ListQueryResult<R> {
  
  /**
   * Wrapper function that normalizes different response formats to PaginatedResponse
   */
  const wrappedFetcher = async (queryParams: QueryParams): Promise<PaginatedResponse<T>> => {
    return fetcher(queryParams) as Promise<PaginatedResponse<T>>;
  };
  
  /**
   * Transformer function that applies schema validation to the normalized response
   */
  const transformer = (data: PaginatedResponse<T> | undefined) => {
    return transformPaginatedResponse<T, R>(
      data,
      schema,
      {
        entityType,
        useSelector,
        errorContext: `${entityType}.paginatedQuery`
      }
    );
  };
  
  // Delegate to the base paginated data hook with our specialized functions
  return useQueryPagination({
    entityType,
    initialParams: params,
    queryFn: wrappedFetcher,
    transformFn: transformer,
    queryOptions: options,
    staleTime: typeof options.staleTime === 'number' ? options.staleTime : undefined
  });
}

