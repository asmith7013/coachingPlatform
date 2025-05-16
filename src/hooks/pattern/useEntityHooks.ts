import { useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { queryKeys } from '@/lib/query/query-keys';
import { syncClientCache } from '@/lib/query/cache-sync/client-sync';
import { handleClientError } from '@/lib/error/handle-client-error';
import { useFiltersAndSorting } from '@/hooks/ui/useFiltersAndSorting';
import { BaseDocument } from '@/lib/types/core/document';
import { StandardResponse, PaginatedResponse } from '@/lib/types/core/response';

/**
 * Query parameters for paginated requests
 */
export interface PaginationQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, unknown>;
  options?: Record<string, unknown>;
}

/**
 * Configuration interface for entity hooks factory
 */
export interface EntityHookConfig<T extends BaseDocument, TInput> {
  /** Entity type name for query key generation */
  entityType: string;
  
  /** Zod schema for full entity (including system fields) */
  fullSchema: z.ZodType<T>;
  
  /** Zod schema for input entity (user-provided fields) */
  inputSchema: z.ZodType<TInput>;
  
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
  
  /** Related entity types to invalidate on mutations */
  relatedEntityTypes?: string[];
}

/**
 * Creates a set of React Query hooks for working with an entity
 */
export function createEntityHooks<
  T extends BaseDocument,
  TInput = Omit<T, '_id' | 'id' | 'createdAt' | 'updatedAt'>
>(config: EntityHookConfig<T, TInput>) {
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
    queryKeys.entities.list(type)
  );
  
  /**
   * Hook for fetching a list of entities with filtering and sorting
   */
  function useList(customParams?: Partial<PaginationQueryParams>) {
    // Set up filters and sorting
    const filtersAndSorting = useFiltersAndSorting({
      storageKey,
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
    
    // Use React Query for data fetching
    const query = useQuery({
      queryKey: queryKeys.entities.list(entityType, queryParams),
      queryFn: async () => {
        try {
          const response = await serverActions.fetch(queryParams);
          return response;
        } catch (error) {
          throw error instanceof Error 
            ? error 
            : new Error(handleClientError(error, `Fetch ${entityType} list`));
        }
      },
      staleTime,
      // Merge overridden options
      ...(customParams?.options || {})
    });
    
    // Return combined API
    return {
      // Data and loading state
      data: query.data?.items || [],
      items: query.data?.items || [],
      isLoading: query.isLoading,
      isError: query.isError,
      error: query.error,
      refetch: query.refetch,
      
      // Pagination info
      page: filtersAndSorting.page,
      pageSize: filtersAndSorting.pageSize,
      total: query.data?.total || 0,
      totalPages: query.data?.totalPages || 0,
      
      // Filtering and sorting
      filters: filtersAndSorting.filters,
      search: filtersAndSorting.search,
      sortBy: filtersAndSorting.sortBy,
      sortOrder: filtersAndSorting.sortOrder,
      
      // Functions
      setPage: filtersAndSorting.setPage,
      setPageSize: filtersAndSorting.setPageSize,
      setSearch: filtersAndSorting.setSearch,
      applyFilters: filtersAndSorting.applyFilters,
      changeSorting: filtersAndSorting.changeSorting,
      
      // Raw query and params
      query,
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
    
    // Use React Query for data fetching
    const query = useQuery({
      queryKey: queryKeys.entities.detail(entityType, id as string),
      queryFn: async () => {
        if (!id) {
          throw new Error(`Cannot fetch ${entityType} without an ID`);
        }
        
        try {
          const response = await serverActions.fetchById(id);
          return response;
        } catch (error) {
          throw error instanceof Error 
            ? error 
            : new Error(handleClientError(error, `Fetch ${entityType} by ID`));
        }
      },
      enabled: !!id,
      staleTime,
      ...options
    });
    
    return {
      data: query.data?.items?.[0],
      isLoading: query.isLoading,
      isError: query.isError,
      error: query.error,
      refetch: query.refetch,
      query
    };
  }
  
  /**
   * Hook for entity mutations (create, update, delete)
   */
  function useMutations() {
    // const queryClient = useQueryClient();
    
    // Create mutation
    const createMutation = useMutation({
      mutationFn: async (data: TInput) => {
        if (!serverActions.create) {
          throw new Error(`Create action is not defined for ${entityType}`);
        }
        try {
          return await serverActions.create(data);
        } catch (error) {
          throw error instanceof Error 
            ? error 
            : new Error(handleClientError(error, `Create ${entityType}`));
        }
      },
      onSuccess: async () => {
        // Sync cache using centralized utility
        await syncClientCache({
          entityType,
          operationType: 'create',
          additionalInvalidateKeys
        });
      }
    });
    
    // Update mutation
    const updateMutation = useMutation({
      mutationFn: async ({ id, data }: { id: string; data: Partial<TInput> }) => {
        if (!serverActions.update) {
          throw new Error(`Update action is not defined for ${entityType}`);
        }
        try {
          return await serverActions.update(id, data);
        } catch (error) {
          throw error instanceof Error 
            ? error 
            : new Error(handleClientError(error, `Update ${entityType}`));
        }
      },
      onSuccess: async (_, { id }) => {
        // Sync cache using centralized utility
        await syncClientCache({
          entityType,
          operationType: 'update',
          additionalInvalidateKeys
        }, id);
      }
    });
    
    // Delete mutation
    const deleteMutation = useMutation({
      mutationFn: async (id: string) => {
        if (!serverActions.delete) {
          throw new Error(`Delete action is not defined for ${entityType}`);
        }
        try {
          return await serverActions.delete(id);
        } catch (error) {
          throw error instanceof Error 
            ? error 
            : new Error(handleClientError(error, `Delete ${entityType}`));
        }
      },
      onSuccess: async (_, id) => {
        // Sync cache using centralized utility
        await syncClientCache({
          entityType,
          operationType: 'delete',
          additionalInvalidateKeys
        }, id);
      }
    });
    
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
      removeError: deleteMutation.error,
      
      // Raw mutations
      createMutation,
      updateMutation,
      deleteMutation
    };
  }
  
  /**
   * Combined hook that provides all functionality
   */
  function useEntity(initialParams?: Partial<PaginationQueryParams>) {
    const list = useList(initialParams);
    const mutations = useMutations();
    
    // Return combined API with consistent naming
    return useMemo(() => ({
      // List data
      items: list.items,
      isLoading: list.isLoading,
      error: list.error,
      
      // Pagination
      page: list.page,
      setPage: list.setPage,
      pageSize: list.pageSize,
      setPageSize: list.setPageSize,
      total: list.total,
      totalPages: list.totalPages,
      
      // Filtering and sorting
      filters: list.filters,
      search: list.search,
      sortBy: list.sortBy,
      sortOrder: list.sortOrder,
      setSearch: list.setSearch,
      applyFilters: list.applyFilters,
      changeSorting: list.changeSorting,
      
      // Mutation operations with consistent naming
      create: mutations.create,
      createAsync: mutations.createAsync,
      update: mutations.update,
      updateAsync: mutations.updateAsync,
      delete: mutations.remove,
      deleteAsync: mutations.removeAsync,
      
      // Loading states
      isCreating: mutations.isCreating,
      isUpdating: mutations.isUpdating,
      isDeleting: mutations.isRemoving,
      
      // Error states
      createError: mutations.createError,
      updateError: mutations.updateError,
      deleteError: mutations.removeError,
      
      // Refetch data
      refetch: list.refetch
    }), [
      list.items,
      list.isLoading,
      list.error,
      list.page,
      list.pageSize,
      list.total,
      list.totalPages,
      list.filters,
      list.search,
      list.sortBy,
      list.sortOrder,
      list.setPage,
      list.setPageSize,
      list.setSearch,
      list.applyFilters,
      list.changeSorting,
      list.refetch,
      mutations.create,
      mutations.createAsync,
      mutations.update,
      mutations.updateAsync,
      mutations.remove,
      mutations.removeAsync,
      mutations.isCreating,
      mutations.isUpdating,
      mutations.isRemoving,
      mutations.createError,
      mutations.updateError,
      mutations.removeError
    ]);
  }
  
  // Return all hooks
  return {
    useList,
    useById,
    useMutations,
    useEntity
  };
}

// Export types for convenience
export type { EntityHookConfig, PaginationQueryParams }; 