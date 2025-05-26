// src/query/client/hooks/core/useEntityQuery.ts

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { ZodSchema } from 'zod';
import { BaseDocument } from '@core-types/document';
import { transformSingleItem, transformItems } from '@query/client/utilities/hook-helpers';

/**
 * Hook for querying a single entity by ID with schema validation
 */
export function useBaseQuery<T extends BaseDocument, R = T>({
  queryKey,
  queryFn,
  schema,
  entityType,
  useSelector = false,
  ...options
}: Omit<UseQueryOptions<T, Error>, 'queryFn'> & {
  queryFn: () => Promise<T>;
  schema: ZodSchema<T>;
  entityType?: string;
  useSelector?: boolean;
}) {
  return useQuery({
    queryKey,
    queryFn,
    ...options,
    select: (data) => {
      return transformSingleItem<T, R>(
        data,
        schema,
        {
          entityType,
          useSelector,
          errorContext: `${entityType || 'entity'}.query`
        }
      );
    }
  });
}

/**
 * Hook for querying a list of entities with schema validation
 */
export function useBaseListQuery<T extends BaseDocument, R = T>({
  queryKey,
  queryFn,
  schema,
  entityType,
  useSelector = false,
  ...options
}: Omit<UseQueryOptions<T[], Error>, 'queryFn'> & {
  queryFn: () => Promise<T[]>;
  schema: ZodSchema<T>;
  entityType?: string;
  useSelector?: boolean;
}) {
  return useQuery({
    queryKey,
    queryFn,
    ...options,
    select: (data) => {
      return transformItems<T, R>(
        data,
        schema,
        {
          entityType,
          useSelector,
          errorContext: `${entityType || 'entity'}.listQuery`
        }
      );
    }
  });
} 