/**
 * Creates a standardized mutation hook for a specific CRUD operation
 * 
 * @param operationType - Type of operation (create, update, delete or bulk variants)
 * @param entityType - Type of entity being operated on
 * @param serverAction - Server action function to call
 * @param queryClient - React Query client instance
 * @param additionalInvalidateKeys - Additional query keys to invalidate
 * @returns Configured mutation hook with proper typing
 */
import { useOptimisticMutation } from '@/query/client/hooks/mutations/useOptimisticMutation';
import { optimisticUpdateHelpers } from '@query/client/utilities/optimistic-update-helpers';
import { syncClientCache } from '@query/cache/sync';
import { BaseDocument } from '@core-types/document';
import { CollectionResponse, PaginatedResponse } from '@core-types/response';
import { CacheOperationType, CacheSyncConfig } from '@core-types/cache';
import { QueryClient, QueryKey } from '@tanstack/react-query';
import { handleQueryError } from '@error/handlers/query';

// Type guards for mutation data
function isUpdateData(data: Record<string, unknown>): data is { id: string; data: Record<string, unknown> } {
  return 'id' in data && 'data' in data && typeof data.id === 'string';
}

function isIdData(data: Record<string, unknown>): data is { id: string } {
  return 'id' in data && typeof data.id === 'string';
}

/**
 * Creates a standardized mutation hook for a specific CRUD operation
 * 
 * @param operationType - Type of operation (create, update, delete or bulk variants)
 * @param entityType - Type of entity being operated on
 * @param serverAction - Server action function to call
 * @param queryClient - React Query client instance
 * @param additionalInvalidateKeys - Additional query keys to invalidate
 * @returns Configured mutation hook with proper typing
 */
export function createOperationMutation<
  TData extends Record<string, unknown>,
  TParams extends Record<string, unknown>,
  TResult extends BaseDocument
>(
  operationType: CacheOperationType,
  entityType: string,
  serverAction: (params: TParams) => Promise<CollectionResponse<TResult>>,
  queryClient: QueryClient,
  additionalInvalidateKeys: QueryKey[] = []
) {
  // Define the mutation function and parameters adapter based on operation type
  let mutationFn: (data: TData) => Promise<CollectionResponse<TResult>>;
  let getEntityId: (data: TData) => string | undefined;
  
  // Helper function to extract update data
  const extractUpdateData = (data: TData) => {
    if (!isUpdateData(data)) {
      throw new Error('Invalid update data format');
    }
    return { id: data.id, updateData: data.data };
  };
  
  if (operationType === 'create' || operationType === 'bulkCreate') {
    // For create operations, data is passed directly
    mutationFn = (data: TData) => serverAction(data as unknown as TParams);
    getEntityId = () => undefined;
  } else if (operationType === 'update' || operationType === 'bulkUpdate') {
    // For update operations, we need to extract id and data
    mutationFn = (data: TData) => {
      const { id, updateData } = extractUpdateData(data);
      return serverAction({ id, data: updateData } as unknown as TParams);
    };
    getEntityId = (data: TData) => isIdData(data) ? data.id : undefined;
  } else {
    // For delete operations, data is the ID
    mutationFn = (data: TData) => serverAction(data as unknown as TParams);
    getEntityId = (data: TData) => typeof data === 'string' ? data : undefined;
  }

  // Create the cache sync configuration
  const createCacheSyncConfig = (): CacheSyncConfig => ({
    entityType,
    operationType,
    additionalInvalidateKeys
  });

  // Create a custom hook that uses the optimistic mutation
  function useMutation() {
    return useOptimisticMutation<TData, CollectionResponse<TResult>, Error, { previousData?: PaginatedResponse<TResult> }>(
      mutationFn,
      {
        invalidateQueries: [[entityType, 'list']],
        
        onMutate: async (data: TData) => {
          try {
            // Get the entity ID if applicable
            const id = getEntityId(data);
            
            // Prepare the optimistic context
            const context = await optimisticUpdateHelpers.prepareOptimisticContext<TResult>(
              queryClient, 
              entityType, 
              id
            );
            
            // Apply the appropriate optimistic update
            if (operationType === 'create' || operationType === 'bulkCreate') {
              optimisticUpdateHelpers.optimisticCreate<TResult, TData>(
                queryClient,
                entityType,
                data
              );
            } else if (operationType === 'update' || operationType === 'bulkUpdate') {
              const { id, updateData } = extractUpdateData(data);
              optimisticUpdateHelpers.optimisticUpdate<TResult, typeof updateData>(
                queryClient,
                entityType,
                id,
                updateData
              );
            } else if (operationType === 'delete' || operationType === 'bulkDelete') {
              optimisticUpdateHelpers.optimisticDelete<TResult>(
                queryClient,
                entityType,
                data as unknown as string
              );
            }
            
            return context;
          } catch (error) {
            handleQueryError(
              error,
              'mutation',
              entityType,
              { 
                operation: operationType,
                action: 'onMutate',
                data: JSON.stringify(data)
              }
            );
            throw error;
          }
        },
        
        onSuccess: async (_, data) => {
          try {
            // Get the entity ID if applicable
            const id = getEntityId(data);
            
            // Sync the client cache
            await syncClientCache(
              createCacheSyncConfig(),
              id
            );
          } catch (error) {
            handleQueryError(
              error,
              'mutation',
              entityType,
              { 
                operation: operationType,
                action: 'onSuccess',
                data: JSON.stringify(data)
              }
            );
          }
        },
        
        onError: (error, data, context) => {
          try {
            // Handle mutation errors
            optimisticUpdateHelpers.handleMutationError<TResult>(
              queryClient,
              entityType,
              context
            );
            
            // Log the error with context
            handleQueryError(
              error,
              'mutation',
              entityType,
              { 
                operation: operationType,
                action: 'onError',
                data: JSON.stringify(data),
                context: JSON.stringify(context)
              }
            );
          } catch (handlingError) {
            // If error handling itself fails, log it separately
            handleQueryError(
              handlingError,
              'mutation',
              entityType,
              { 
                operation: operationType,
                action: 'errorHandling',
                originalError: error instanceof Error ? error.message : String(error)
              }
            );
          }
        },
        
        errorContext: `${operationType.charAt(0).toUpperCase() + operationType.slice(1)}${entityType}`
      }
    );
  }

  return useMutation;
}