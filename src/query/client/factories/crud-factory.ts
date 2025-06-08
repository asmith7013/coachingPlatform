import { ZodSchema } from 'zod';

import { useQueryClient } from '@tanstack/react-query';
import { useEntityList } from '@/query/client/hooks/queries/useEntityList';
import { useEntityById } from '@/query/client/hooks/queries/useEntityById';
import { createOperationMutation } from '@query/client/utilities/mutation-helpers';

import { ServerActions } from '@core-types/query-factory';
import { QueryParams } from '@core-types/query';
import { BaseDocument } from '@core-types/document';
import { EntityResponse, PaginatedResponse } from '@core-types/response';
import { DocumentInput } from '@core-types/document';

/**
 * Configuration for CRUD hooks - simplified with better defaults
 */
export interface CrudHooksConfig<T extends BaseDocument> {
  entityType: string;
  serverActions: ServerActions<T, DocumentInput<T>>;
  schema: ZodSchema<T>;
  
  // Optional with good defaults
  validSortFields?: string[];
  relatedEntityTypes?: string[];
}

/**
 * Factory function that creates a set of React Query hooks for a specific entity type.
 * This mirrors the server-side createCrudActions pattern but for client-side React Query.
 */
export function createCrudHooks<T extends BaseDocument>(
  config: CrudHooksConfig<T>
) {
  const { 
    entityType, 
    serverActions, 
    schema, 
    validSortFields = ['createdAt'],
    relatedEntityTypes = []
  } = config;
  
  // Derived defaults (DRY)
  const defaultParams = { 
    page: 1, 
    limit: 10, 
    sortBy: validSortFields[0], 
    sortOrder: 'desc' as const 
  };
  
  // Create additional invalidation keys from related entity types
  const additionalInvalidateKeys = relatedEntityTypes.map(type => [type, 'list']);
  
  // Create hooks once, not wrappers
  const useList = (customParams?: Partial<QueryParams>) => useEntityList<T>({
    entityType,
    fetcher: serverActions.fetch as (params: QueryParams) => Promise<PaginatedResponse<T>>,
    schema,
    defaultParams: { ...defaultParams, ...customParams },
    validSortFields,
    persistFilters: true,
    storageKey: `${entityType}_filters`,
    staleTime: 60 * 1000,
    errorContextPrefix: entityType
  });
  
  const useDetail = (id: string | null | undefined, options = {}) => {
    if (!serverActions.fetchById) {
      throw new Error(`fetchById not implemented for ${entityType}`);
    }
    
    return useEntityById<T>({
      entityType,
      id,
      fetcher: serverActions.fetchById as (id: string) => Promise<EntityResponse<T>>,
      schema,
      errorContext: entityType,
      queryOptions: options
    });
  };

  /**
   * Hook for creating, updating, and deleting entities with optimistic updates
   * Only returns operations that are actually implemented
   */
  function useMutations() {
    const queryClient = useQueryClient();
    
    const createMutation = serverActions.create ? 
      createOperationMutation('create', entityType, serverActions.create, queryClient, additionalInvalidateKeys)() : 
      null;
      
    const updateMutation = serverActions.update ? 
      createOperationMutation('update', entityType, 
        (params: { id: string; data: Partial<DocumentInput<T>> }) => 
          serverActions.update!(params.id, params.data),
        queryClient, additionalInvalidateKeys)() : 
      null;
      
    const deleteMutation = serverActions.delete ? 
      createOperationMutation('delete', entityType, 
        (params: { id: string }) => serverActions.delete!(params.id),
        queryClient, additionalInvalidateKeys)() : 
      null;
    
    return {
      // Only include operations that exist
      ...(createMutation && {
        create: (data: DocumentInput<T>) => createMutation.mutate(data),
        createAsync: (data: DocumentInput<T>) => createMutation.mutateAsync(data),
        isCreating: createMutation.isPending,
        createError: createMutation.error
      }),
      
      ...(updateMutation && {
        update: (id: string, data: Partial<DocumentInput<T>>) => updateMutation.mutate({ id, data }),
        updateAsync: (id: string, data: Partial<DocumentInput<T>>) => updateMutation.mutateAsync({ id, data }),
        isUpdating: updateMutation.isPending,
        updateError: updateMutation.error
      }),
      
      ...(deleteMutation && {
        delete: (id: string) => deleteMutation.mutate({ id }),
        deleteAsync: (id: string) => deleteMutation.mutateAsync({ id }),
        isDeleting: deleteMutation.isPending,
        deleteError: deleteMutation.error
      })
    };
  }
  
  /**
   * Hook that combines list and mutations functionality
   * Simple composition, no duplication
   */
  function useManager(customParams?: Partial<QueryParams>) {
    const list = useList(customParams);
    const mutations = useMutations();
    return { ...list, ...mutations };
  }
  
  return {
    useList,
    useDetail,
    useMutations,
    useManager
  };
} 