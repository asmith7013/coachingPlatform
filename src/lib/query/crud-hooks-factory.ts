import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ZodSchema } from 'zod';
import { queryKeys } from './query-keys';
import { usePaginatedQuery, PaginationQueryParams } from '@/hooks/query/usePaginatedQueryRQ';
import { useEntityQuery } from '@/hooks/query/useEntityQueryRQ';
import { useFiltersAndSorting } from '@/hooks/ui/useFiltersAndSorting';
import { isPaginatedResponse } from './utilities/response-types';
import { StandardResponse, PaginatedResponse } from '@core-types/response';
import { handleClientError } from '@/lib/error';
import { useOptimisticMutation } from '@/hooks/query/useOptimisticMutationRQ';
import { BaseDocument } from '@core-types/document';
import { PaginatedResult } from '@core-types/pagination';

export interface CrudHooksConfig<T, TInput> {
  /** Entity type/name (e.g., 'schools', 'staff') */
  entityType: string;
  
  /** Full schema for validation (including system fields) */
  fullSchema: ZodSchema<T>;
  
  /** Input schema for validation (excluding system fields) */
  inputSchema: ZodSchema<TInput>;
  
  /** Server actions for CRUD operations */
  serverActions: {
    fetch: (params: PaginationQueryParams) => Promise<PaginatedResponse<T>>;
    fetchById?: (id: string) => Promise<StandardResponse<T>>;
    create?: (data: TInput) => Promise<StandardResponse<T>>;
    update?: (id: string, data: Partial<TInput>) => Promise<StandardResponse<T>>;
    delete?: (id: string) => Promise<StandardResponse<T>>;
  };
  
  /** Default parameters for queries */
  defaultParams?: Partial<PaginationQueryParams>;
  
  /** Valid sort fields */
  validSortFields?: string[];
  
  /** Whether to persist filter/sort state */
  persistFilters?: boolean;
  
  /** Storage key for filters */
  storageKey?: string;
  
  /** Stale time for queries in ms */
  staleTime?: number;
}

/**
 * Factory function that creates a set of React Query hooks for a specific entity type.
 * This mirrors the server-side createCrudActions pattern but for client-side React Query.
 */
export function createCrudHooks<
  T extends BaseDocument,
  TInput = Omit<T, '_id' | 'id' | 'createdAt' | 'updatedAt'>
>(config: CrudHooksConfig<T, TInput>) {
  const {
    entityType,
    fullSchema,
    inputSchema,
    serverActions,
    defaultParams = {},
    validSortFields = ['createdAt'],
    persistFilters = true,
    storageKey = `${entityType}_filters`,
    staleTime = 60 * 1000 // 1 minute default
  } = config;
  
  /**
   * Hook for managing a paginated list of entities with filtering and sorting
   */
  function useList(customParams?: Partial<PaginationQueryParams>) {
    // Set up filters and sorting
    const filtersAndSorting = useFiltersAndSorting({
      storageKey: storageKey,
      defaultFilters: defaultParams.filters || {},
      defaultSortBy: defaultParams.sortBy || 'createdAt',
      defaultSortOrder: (defaultParams.sortOrder as 'asc' | 'desc') || 'desc',
      defaultPage: defaultParams.page || 1,
      defaultPageSize: defaultParams.limit || 10,
      validSortFields,
      persist: persistFilters
    });
    
    // Prepare query parameters
    const queryParams = useMemo(() => ({
      page: filtersAndSorting.page,
      limit: filtersAndSorting.pageSize,
      sortBy: filtersAndSorting.sortBy,
      sortOrder: filtersAndSorting.sortOrder,
      search: filtersAndSorting.search || undefined,
      filters: {
        ...filtersAndSorting.filters,
        ...(customParams?.filters || {})
      }
    }), [
      filtersAndSorting.page,
      filtersAndSorting.pageSize,
      filtersAndSorting.sortBy,
      filtersAndSorting.sortOrder,
      filtersAndSorting.search,
      filtersAndSorting.filters,
      customParams?.filters
    ]);
    
    // Use the paginated query hook
    const paginatedQuery = usePaginatedQuery<T>({
      entityType,
      params: queryParams,
      fetcher: serverActions.fetch,
      options: {
        staleTime,
        // Merge overridden options
        ...(customParams?.options || {})
      }
    });
    
    // Return combined API
    return {
      // Data and loading state
      ...paginatedQuery,
      
      // Filtering and sorting
      ...filtersAndSorting,
      
      // Additional utilities
      queryParams
    };
  }
  
  /**
   * Hook for fetching a single entity by ID
   */
  function useById(id: string | null | undefined, options = {}) {
    // Check if the server action exists
    if (!serverActions.fetchById) {
      throw new Error(`fetchById action is not defined for ${entityType}`);
    }
    
    // Use the entity query hook
    return useEntityQuery<T>(
      entityType,
      id,
      serverActions.fetchById,
      {
        staleTime,
        ...options
      }
    );
  }
  
  /**
   * Hook for creating, updating, and deleting entities with optimistic updates
   */
  function useMutations() {
    const queryClient = useQueryClient();
    
    // Create mutation
    const createMutation = serverActions.create
      ? useOptimisticMutation<TInput, StandardResponse<T>, Error, { previousData?: PaginatedResult<T> }>(
          serverActions.create,
          {
            invalidateQueries: [queryKeys.entities.list(entityType)],
            onMutate: async (newData) => {
              // Cancel related queries
              await queryClient.cancelQueries({ queryKey: queryKeys.entities.list(entityType) });
              
              // Store previous data for potential rollback
              const previousData = queryClient.getQueryData<PaginatedResult<T>>(
                queryKeys.entities.list(entityType)
              );
              
              // Optimistically update the cache
              queryClient.setQueryData(
                queryKeys.entities.list(entityType),
                (old: unknown) => {
                  if (!old || !isPaginatedResponse<T>(old)) return old;
                  
                  // Create a temporary item with a generated ID
                  const tempItem = {
                    ...(newData as unknown as Record<string, unknown>),
                    _id: `temp_${Date.now()}`,
                    id: `temp_${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  } as unknown as T;
                  
                  return {
                    ...old,
                    items: [...old.items, tempItem],
                    total: old.total + 1
                  };
                }
              );
              
              return { previousData };
            },
            onError: (_, __, context) => {
              // Roll back on error
              if (context?.previousData) {
                queryClient.setQueryData(
                  queryKeys.entities.list(entityType),
                  context.previousData
                );
              }
            },
            errorContext: `Create${entityType}`
          }
        )
      : { mutate: null, mutateAsync: null, isPending: false, error: null };
    
    // Update mutation
    const updateMutation = serverActions.update
      ? useOptimisticMutation<
          { id: string; data: Partial<TInput> },
          StandardResponse<T>,
          Error,
          { previousData?: PaginatedResult<T> }
        >(
          async ({ id, data }) => serverActions.update!(id, data),
          {
            invalidateQueries: [queryKeys.entities.list(entityType)],
            onMutate: async ({ id, data }) => {
              // Cancel related queries
              await queryClient.cancelQueries({ queryKey: queryKeys.entities.list(entityType) });
              
              // Also cancel the specific item query if it exists
              if (serverActions.fetchById) {
                await queryClient.cancelQueries({ 
                  queryKey: queryKeys.entities.detail(entityType, id)
                });
              }
              
              // Store previous data for potential rollback
              const previousData = queryClient.getQueryData<PaginatedResult<T>>(
                queryKeys.entities.list(entityType)
              );
              
              // Optimistically update the list cache
              queryClient.setQueryData(
                queryKeys.entities.list(entityType),
                (old: unknown) => {
                  if (!old || !isPaginatedResponse<T>(old)) return old;
                  
                  return {
                    ...old,
                    items: old.items.map((item: T) => 
                      (item._id === id || item.id === id)
                        ? { ...item, ...data, updatedAt: new Date().toISOString() }
                        : item
                    )
                  };
                }
              );
              
              // Also update the individual item cache if it exists
              if (serverActions.fetchById) {
                queryClient.setQueryData(
                  queryKeys.entities.detail(entityType, id),
                  (old: unknown) => {
                    if (!old || !old.data) return old;
                    
                    return {
                      ...old,
                      data: { 
                        ...old.data, 
                        ...data, 
                        updatedAt: new Date().toISOString() 
                      }
                    };
                  }
                );
              }
              
              return { previousData };
            },
            onError: (_, __, context) => {
              // Roll back on error
              if (context?.previousData) {
                queryClient.setQueryData(
                  queryKeys.entities.list(entityType),
                  context.previousData
                );
              }
            },
            errorContext: `Update${entityType}`
          }
        )
      : { mutate: null, mutateAsync: null, isPending: false, error: null };
    
    // Delete mutation
    const deleteMutation = serverActions.delete
      ? useOptimisticMutation<string, StandardResponse<T>, Error, { previousData?: PaginatedResult<T> }>(
          serverActions.delete,
          {
            invalidateQueries: [queryKeys.entities.list(entityType)],
            onMutate: async (id) => {
              // Cancel related queries
              await queryClient.cancelQueries({ queryKey: queryKeys.entities.list(entityType) });
              
              // Store previous data for potential rollback
              const previousData = queryClient.getQueryData<PaginatedResult<T>>(
                queryKeys.entities.list(entityType)
              );
              
              // Optimistically update the cache
              queryClient.setQueryData(
                queryKeys.entities.list(entityType),
                (old: unknown) => {
                  if (!old || !isPaginatedResponse<T>(old)) return old;
                  
                  return {
                    ...old,
                    items: old.items.filter((item: T) => item._id !== id && item.id !== id),
                    total: Math.max(0, old.total - 1)
                  };
                }
              );
              
              // Also remove from the individual item cache if it exists
              if (serverActions.fetchById) {
                queryClient.removeQueries({ 
                  queryKey: queryKeys.entities.detail(entityType, id)
                });
              }
              
              return { previousData };
            },
            onError: (_, __, context) => {
              // Roll back on error
              if (context?.previousData) {
                queryClient.setQueryData(
                  queryKeys.entities.list(entityType),
                  context.previousData
                );
              }
            },
            errorContext: `Delete${entityType}`
          }
        )
      : { mutate: null, mutateAsync: null, isPending: false, error: null };
    
    // Return combined API
    return {
      create: createMutation.mutate,
      createAsync: createMutation.mutateAsync,
      update: (id: string, data: Partial<TInput>) => 
        updateMutation.mutate?.({ id, data }),
      updateAsync: (id: string, data: Partial<TInput>) => 
        updateMutation.mutateAsync?.({ id, data }),
      remove: deleteMutation.mutate,
      removeAsync: deleteMutation.mutateAsync,
      
      // Loading states
      isCreating: createMutation.isPending,
      isUpdating: updateMutation.isPending,
      isRemoving: deleteMutation.isPending,
      
      // Error states
      createError: createMutation.error,
      updateError: updateMutation.error,
      removeError: deleteMutation.error
    };
  }
  
  /**
   * Hook that combines list and mutations functionality
   */
  function useManager(customParams?: Partial<PaginationQueryParams>) {
    const list = useList(customParams);
    const mutations = useMutations();
    
    return {
      // List functionality
      ...list,
      
      // Mutation functionality
      ...mutations
    };
  }
  
  // Return all hooks
  return {
    useList,
    useById,
    useMutations,
    useManager
  };
} 