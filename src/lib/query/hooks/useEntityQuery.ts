/**
 * Generic entity query hook for React Query
 * 
 * This hook provides a standardized approach to fetching entity data
 * with proper loading, error handling, and caching.
 */
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { handleClientError } from '@error/handle-client-error';
import { queryKeys } from '@query/queryKeys';

/**
 * Hook for querying a single entity by ID
 * 
 * @param entityType - The type of entity being queried (e.g., 'visit', 'coach')
 * @param id - The entity ID to fetch
 * @param fetcher - The function to fetch the entity data
 * @param options - Additional React Query options
 */
export function useEntityQuery<TData>(
  entityType: string,
  id: string | null | undefined,
  fetcher: (id: string) => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, Error, TData>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  return useQuery({
    queryKey: queryKeys.entities.detail(entityType, id as string),
    queryFn: async () => {
      if (!id) {
        throw new Error(`Cannot fetch ${entityType} without an ID`);
      }
      
      try {
        return await fetcher(id);
      } catch (error) {
        throw error instanceof Error 
          ? error 
          : new Error(handleClientError(error, `Fetch ${entityType}`));
      }
    },
    enabled: !!id,
    ...options
  });
}

/**
 * Hook for querying a list of entities
 * 
 * @param entityType - The type of entity being queried (e.g., 'visits', 'coaches')
 * @param params - Parameters for filtering the entity list
 * @param fetcher - The function to fetch the entity list
 * @param options - Additional React Query options
 */
export function useEntityListQuery<TData, TParams extends Record<string, unknown>>(
  entityType: string,
  params: TParams | undefined,
  fetcher: (params: TParams) => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, Error, TData>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  return useQuery({
    queryKey: queryKeys.entities.list(entityType, params as Record<string, unknown>),
    queryFn: async () => {
      if (!params) {
        throw new Error(`Cannot fetch ${entityType} list without parameters`);
      }
      
      try {
        return await fetcher(params);
      } catch (error) {
        throw error instanceof Error 
          ? error 
          : new Error(handleClientError(error, `Fetch ${entityType} list`));
      }
    },
    enabled: !!params,
    ...options
  });
} 