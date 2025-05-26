import { ZodSchema } from 'zod';

import { useQueryClient } from '@tanstack/react-query';
import { useEntityList } from '@query/client/hooks/data/useEntityList';
import { useEntityById } from '@query/client/hooks/data/useEntityById';
import { createOperationMutation } from '@query/client/utilities/mutation-helpers';

import { ServerActions } from '@core-types/query-factory';
import { QueryParams } from '@core-types/query';
import { BaseDocument } from '@core-types/document';
import { CollectionResponse, PaginatedResponse } from '@core-types/response';

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
    // Use the existing useEntityList hook directly
    const list = useEntityList<T>({
      entityType,
      fetcher: serverActions.fetch as (params: QueryParams) => Promise<PaginatedResponse<T>>,
      schema: fullSchema,
      useSelector: true,
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
    
    const mutations = useMutations();
    
    return {
      // List functionality
      ...list,
      
      // Mutation functionality
      ...mutations
    };
  }
  
  // Return hooks with the new names directly using factory wrappers
  return {
    useEntityList: (customParams?: Partial<QueryParams>) => useEntityList<T>({
      entityType,
      fetcher: serverActions.fetch as (params: QueryParams) => Promise<PaginatedResponse<T>>,
      schema: fullSchema,
      useSelector: true,
      defaultParams: {
        ...defaultParams,
        ...(customParams || {})
      },
      validSortFields,
      persistFilters,
      storageKey,
      staleTime,
      errorContextPrefix: entityType
    }),
    
    useEntityById: (id: string | null | undefined, options = {}) => useEntityById<T>({
      entityType,
      id,
      fetcher: serverActions.fetchById ? 
        (async (entityId: string) => await serverActions.fetchById!(entityId) as CollectionResponse<unknown>) :
        ((_id: string) => { throw new Error(`fetchById action is not defined for ${entityType}`); }),
      schema: fullSchema,
      useSelector: true,
      errorContext: entityType,
      queryOptions: options
    }),
    
    useMutations,
    useManager
  };
} 