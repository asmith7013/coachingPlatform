import { useQuery, UseQueryOptions, QueryFunction } from '@tanstack/react-query';
import { ZodSchema } from 'zod';
import { transformItemWithSchema } from '@/lib/data-utilities/transformers/core/transform-helpers';

/**
 * Hook for querying data with error handling and REQUIRED schema validation
 */
export function useErrorHandledQuery<TData = unknown, TError = unknown>({
  queryKey,
  queryFn,
  schema,
  ...options
}: Omit<UseQueryOptions<TData, TError>, 'queryFn'> & {
  queryFn: QueryFunction<TData>;
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