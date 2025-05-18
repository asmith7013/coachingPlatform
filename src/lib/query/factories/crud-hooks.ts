import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useFiltersAndSorting } from '@ui-hooks/useFiltersAndSorting';
import { 
  isPaginatedResponse, 
  extractItems, 
  extractPagination 
} from '@query/utilities/response-types';
import { 
  syncClientCache 
} from '@/lib/query/cache-sync/client-sync';
import { 
  createQueryErrorContext, 
  QueryParams, 
  ServerActions 
} from '@core-types/query-factory';
import { logError } from '@error';
import { useQuery } from '@tanstack/react-query';
import { useOptimisticMutation } from '@query-hooks/useOptimisticMutation';
import { BaseDocument } from '@core-types/document';
import { PaginatedResponse, CollectionResponse } from '@core-types/response';

/**
 * Configuration for CRUD hooks
 */
export interface CrudHooksConfig<T extends BaseDocument, TInput> {
  /** Entity type/name (e.g., 'schools', 'staff') */
  entityType: string;
  
  /** Server actions for CRUD operations */
  serverActions: ServerActions<T, TInput>;
  
  /** Default parameters for queries */
  defaultParams?: Partial<QueryParams>;
  
  /** Valid sort fields */
  validSortFields?: string[];
  
  /** Whether to persist filter/sort state */
  persistFilters?: boolean;
  
  /** Storage key for filters */
  storageKey?: string;
  
  /** Stale time for queries in ms */
  staleTime?: number;
  
  /** Related entity types to invalidate on mutations */
  relatedEntityTypes?: string[];
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
    serverActions,
    defaultParams = {},
    validSortFields = ['createdAt'],
    persistFilters = true,
    storageKey = `${entityType}_filters`,
    staleTime = 60 * 1000, // 1 minute default
    relatedEntityTypes = []
  } = config;
  
  // Create additional invalidation keys from related entity types
  const additionalInvalidateKeys = relatedEntityTypes.map(type => 
    [type, 'list'] as string[]
  );
  
  /**
   * Hook for managing a paginated list of entities with filtering and sorting
   */
  function useList(customParams?: Partial<QueryParams>) {
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
    
    // Use the query
    const query = useQuery({
      queryKey: [entityType, 'list', queryParams] as string[],
      queryFn: async () => {
        try {
          return await serverActions.fetch(queryParams);
        } catch (error) {
          // Create error context for better error reporting
          const errorContext = createQueryErrorContext(
            entityType,
            'fetchList',
            { 
              metadata: { queryParams },
              tags: { entityType }
            }
          );
          logError(error as Error, errorContext);
          throw error;
        }
      },
      staleTime,
      // Merge overridden options
      ...(customParams?.options || {})
    });
    
    // Extract items and pagination
    const items = extractItems<T>(query.data as CollectionResponse<T>);
    const pagination = extractPagination(query.data as PaginatedResponse<T>);
    
    // Return combined API
    return {
      // Data
      items,
      
      // Pagination
      total: pagination.total,
      page: filtersAndSorting.page,
      pageSize: filtersAndSorting.pageSize,
      totalPages: pagination.totalPages,
      hasMore: pagination.hasMore,
      
      // Filtering and sorting
      filters: filtersAndSorting.filters,
      search: filtersAndSorting.search,
      sortBy: filtersAndSorting.sortBy,
      sortOrder: filtersAndSorting.sortOrder,
      
      // Query state
      isLoading: query.isLoading,
      isError: query.isError,
      error: query.error,
      refetch: query.refetch,
      
      // Actions
      setPage: filtersAndSorting.setPage,
      setPageSize: filtersAndSorting.setPageSize,
      setSearch: filtersAndSorting.setSearch,
      applyFilters: filtersAndSorting.applyFilters,
      changeSorting: filtersAndSorting.changeSorting,
      
      // Raw data
      queryParams,
      query
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
    
    // Use the query
    const query = useQuery({
      queryKey: [entityType, 'detail', id] as string[],
      queryFn: async () => {
        if (!id) {
          throw new Error(`Cannot fetch ${entityType} without an ID`);
        }
        
        try {
          return await serverActions.fetchById!(id) as CollectionResponse<T>;
        } catch (error) {
          // Enhanced error handling with context
          const errorContext = createQueryErrorContext(
            entityType, 
            'fetchById',
            { 
              metadata: { id },
              tags: { entityType }
            }
          );
          logError(error as Error, errorContext);
          throw error;
        }
      },
      enabled: !!id,
      staleTime,
      ...options
    });
    
    return {
      data: extractItems<T>(query.data as CollectionResponse<T>)[0],
      isLoading: query.isLoading,
      isError: query.isError,
      error: query.error,
      refetch: query.refetch,
      query
    };
  }
  
  /**
   * Hook for creating, updating, and deleting entities with optimistic updates
   */
  function useMutations() {
    const queryClient = useQueryClient();
    
    // Create mutation
    const createMutation = useOptimisticMutation<TInput, CollectionResponse<T>, Error, { previousData?: PaginatedResponse<T> }>(
      serverActions.create as (data: TInput) => Promise<CollectionResponse<T>>,
      {
        invalidateQueries: [[entityType, 'list']] as string[][],
        onMutate: async (newData) => {
          // Cancel related queries
          await queryClient.cancelQueries({ queryKey: [entityType, 'list'] });
          
          // Store previous data for potential rollback
          const previousData = queryClient.getQueryData<PaginatedResponse<T>>(
            [entityType, 'list']
          );
          
          // Optimistically update the cache
          queryClient.setQueryData(
            [entityType, 'list'],
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
        onSuccess: async () => {
          // Sync cache
          await syncClientCache(
            { 
              entityType, 
              additionalInvalidateKeys,
              operationType: 'create'
            }
          );
        },
        onError: (_, __, context) => {
          // Roll back on error
          if (context?.previousData) {
            queryClient.setQueryData(
              [entityType, 'list'],
              context.previousData
            );
          }
        },
        errorContext: `Create${entityType}`
      }
    );
    
    // Update mutation
    const updateMutation = useOptimisticMutation<
      { id: string; data: Partial<TInput> },
      CollectionResponse<T>,
      Error,
      { previousData?: PaginatedResponse<T> }
    >(
      async ({ id, data }) => (serverActions.update!(id, data) as Promise<CollectionResponse<T>>),
      {
        invalidateQueries: [[entityType, 'list']] as string[][],
        onMutate: async ({ id, data }) => {
          // Cancel related queries
          await queryClient.cancelQueries({ queryKey: [entityType, 'list'] });
          
          // Also cancel the specific item query if it exists
          if (serverActions.fetchById) {
            await queryClient.cancelQueries({ 
              queryKey: [entityType, 'detail', id]
            });
          }
          
          // Store previous data for potential rollback
          const previousData = queryClient.getQueryData<PaginatedResponse<T>>(
            [entityType, 'list']
          );
          
          // Optimistically update the list cache
          queryClient.setQueryData(
            [entityType, 'list'],
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
              [entityType, 'detail', id],
              (old: unknown) => {
                if (!old) return old;
                
                const items = extractItems<T>(old as CollectionResponse<T>);
                if (items.length === 0) return old;
                
                return {
                  ...old,
                  items: [{ 
                    ...items[0], 
                    ...data, 
                    updatedAt: new Date().toISOString() 
                  }]
                };
              }
            );
          }
          
          return { previousData };
        },
        onSuccess: async (_, { id }) => {
          // Sync cache
          await syncClientCache(
            { 
              entityType, 
              additionalInvalidateKeys,
              operationType: 'update'
            },
            id
          );
        },
        onError: (_, __, context) => {
          // Roll back on error
          if (context?.previousData) {
            queryClient.setQueryData(
              [entityType, 'list'],
              context.previousData
            );
          }
        },
        errorContext: `Update${entityType}`
      }
    );
    
    // Delete mutation
    const deleteMutation = useOptimisticMutation<string, CollectionResponse<T>, Error, { previousData?: PaginatedResponse<T> }>(
      serverActions.delete as (id: string) => Promise<CollectionResponse<T>>,
      {
        invalidateQueries: [[entityType, 'list']] as string[][],
        onMutate: async (id) => {
          // Cancel related queries
          await queryClient.cancelQueries({ queryKey: [entityType, 'list'] });
          
          // Store previous data for potential rollback
          const previousData = queryClient.getQueryData<PaginatedResponse<T>>(
            [entityType, 'list']
          );
          
          // Optimistically update the cache
          queryClient.setQueryData(
            [entityType, 'list'],
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
              queryKey: [entityType, 'detail', id]
            });
          }
          
          return { previousData };
        },
        onSuccess: async (_, id) => {
          // Sync cache
          await syncClientCache(
            { 
              entityType, 
              additionalInvalidateKeys,
              operationType: 'delete'
            },
            id
          );
        },
        onError: (_, __, context) => {
          // Roll back on error
          if (context?.previousData) {
            queryClient.setQueryData(
              [entityType, 'list'],
              context.previousData
            );
          }
        },
        errorContext: `Delete${entityType}`
      }
    );
    
    // Return combined API
    return {
      create: serverActions.create ? createMutation.mutate : null,
      createAsync: serverActions.create ? createMutation.mutateAsync : null,
      update: serverActions.update ? (id: string, data: Partial<TInput>) => 
        updateMutation.mutate({ id, data }) : null,
      updateAsync: serverActions.update ? (id: string, data: Partial<TInput>) => 
        updateMutation.mutateAsync({ id, data }) : null,
      delete: serverActions.delete ? deleteMutation.mutate : null,
      deleteAsync: serverActions.delete ? deleteMutation.mutateAsync : null,
      
      // Loading states
      isCreating: createMutation.isPending,
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,
      
      // Error states
      createError: createMutation.error,
      updateError: updateMutation.error,
      deleteError: deleteMutation.error
    };
  }
  
  /**
   * Hook that combines list and mutations functionality
   */
  function useManager(customParams?: Partial<QueryParams>) {
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