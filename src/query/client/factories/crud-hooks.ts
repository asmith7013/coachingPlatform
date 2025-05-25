import { useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { createQueryErrorContext, ServerActions } from '@core-types/query-factory';
import { QueryParams } from '@core-types/query';
import { logError } from '@error';
import { BaseDocument } from '@core-types/document';
import { CollectionResponse } from '@core-types/response';
import { ZodSchema } from 'zod';
import { transformItemWithSchema } from '@/lib/data-utilities/transformers/utils/transform-helpers';
import { useList as useBaseList } from '@/query/client/hooks/core/useList';
import { createOperationMutation } from '@query/client/utilities/mutation-helpers';

/**
 * Configuration for CRUD hooks
 */
export interface CrudHooksConfig<T extends BaseDocument, TInput> {
  /** Entity type/name (e.g., 'schools', 'staff') */
  entityType: string;
  
  /** Server actions for CRUD operations */
  serverActions: ServerActions<T, TInput>;
  
  /** Zod schema for full entity validation */
  fullSchema: ZodSchema<T>;
  
  /** Zod schema for input validation (create/update) */
  inputSchema: ZodSchema<TInput>;
  
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
  TInput extends Record<string, unknown> = Omit<T, '_id' | 'id' | 'createdAt' | 'updatedAt'>
>(config: CrudHooksConfig<T, TInput>) {
  const {
    entityType,
    serverActions,
    fullSchema,
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
   * Now using the unified useList hook
   */
  function useList(customParams?: Partial<QueryParams>) {
    return useBaseList<T>({
      entityType,
      fetcher: serverActions.fetch,
      schema: fullSchema,
      useSelector: true, // Use the selector system
      defaultParams: {
        ...defaultParams,
        ...(customParams || {})
      },
      validSortFields,
      persistFilters,
      storageKey,
      staleTime,
      errorContextPrefix: entityType
    });
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
          return await serverActions.fetchById!(id) as CollectionResponse<unknown>;
        } catch (error) {
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
      select: (data) => {
        if (!data?.items || data.items.length === 0) {
          return null;
        }
        
        try {
          const item = data.items[0];
          // Use the shared helper function for consistency
          return transformItemWithSchema(item, fullSchema);
        } catch (error) {
          const errorContext = createQueryErrorContext(
            entityType,
            'transformSingleResponse',
            { tags: { entityType } }
          );
          logError(error as Error, errorContext);
          return null;
        }
      },
      enabled: !!id,
      staleTime,
      ...options
    });
    
    return {
      data: query.data, // This is now the transformed single entity
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
    const createMutation = createOperationMutation<TInput, TInput, T>(
      'create',
      entityType,
      serverActions.create as (data: TInput) => Promise<CollectionResponse<T>>,
      queryClient,
      additionalInvalidateKeys
    )();
    
    // Update mutation
    const updateMutation = createOperationMutation<
      { id: string; data: Partial<TInput> },
      { id: string; data: Partial<TInput> },
      T
    >(
      'update',
      entityType,
      (params: { id: string; data: Partial<TInput> }) => 
        (serverActions.update as (id: string, data: Partial<TInput>) => Promise<CollectionResponse<T>>)(
          params.id,
          params.data
        ),
      queryClient,
      additionalInvalidateKeys
    )();
    
    // Delete mutation
    const deleteMutation = createOperationMutation<
      { id: string },
      { id: string },
      T
    >(
      'delete',
      entityType,
      (params: { id: string }) => 
        (serverActions.delete as (id: string) => Promise<CollectionResponse<T>>)(params.id),
      queryClient,
      additionalInvalidateKeys
    )();
    
    // Return combined API
    return {
      create: serverActions.create ? (data: TInput) => createMutation.mutate(data) : null,
      createAsync: serverActions.create ? (data: TInput) => createMutation.mutateAsync(data) : null,
      update: serverActions.update ? (id: string, data: Partial<TInput>) => 
        updateMutation.mutate({ id, data }) : null,
      updateAsync: serverActions.update ? (id: string, data: Partial<TInput>) => 
        updateMutation.mutateAsync({ id, data }) : null,
      delete: serverActions.delete ? (id: string) => 
        deleteMutation.mutate({ id }) : null,
      deleteAsync: serverActions.delete ? (id: string) => 
        deleteMutation.mutateAsync({ id }) : null,
      
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