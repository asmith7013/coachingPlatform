/**
 * Generic entity query hook for React Query
 * 
 * This hook provides a standardized approach to fetching entity data
 * with proper loading, error handling, and caching.
 */
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { ZodSchema } from 'zod';
import { transformItemWithSchema, transformItemsWithSchema } from '@transformers/core/transform-helpers';

/**
 * Hook for querying a single entity by ID with REQUIRED schema validation
 */
export function useEntityQuery<TData = unknown, TError = unknown>({
  queryKey,
  queryFn,
  schema,
  ...options
}: Omit<UseQueryOptions<TData, TError>, 'queryFn'> & {
  queryFn: () => Promise<TData>;
  schema: ZodSchema<TData>;
}) {
  return useQuery({
    queryKey,
    queryFn,
    ...options,
    select: (data) => {
      try {
        return transformItemWithSchema(data, schema);
      } catch (error) {
        console.error('Error transforming data:', error);
        return data; // Fallback to original data
      }
    }
  });
}

/**
 * Hook for querying a list of entities with REQUIRED schema validation
 */
export function useEntityListQuery<TData = unknown, TError = unknown>({
  queryKey,
  queryFn,
  schema,
  ...options
}: Omit<UseQueryOptions<TData[], TError>, 'queryFn'> & {
  queryFn: () => Promise<TData[]>;
  schema: ZodSchema<TData>;
}) {
  return useQuery({
    queryKey,
    queryFn,
    ...options,
    select: (data) => {
      try {
        return transformItemsWithSchema(data, schema);
      } catch (error) {
        console.error('Error transforming data:', error);
        return data; // Fallback to original data
      }
    }
  });
} 