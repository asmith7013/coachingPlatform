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
import { PaginatedResponse, EntityResponse, BaseResponse } from '@core-types/response';
import { CacheOperationType, CacheSyncConfig } from '@core-types/cache';
import { QueryClient, QueryKey, UseMutationResult } from '@tanstack/react-query';
import { handleQueryError } from '@error/handlers/query';

// Type guards for mutation data
function isUpdateData(data: unknown): data is { id: string; data: Record<string, unknown> } {
  return typeof data === 'object' && 
         data !== null && 
         'id' in data && 
         'data' in data && 
         typeof (data as { id: unknown }).id === 'string';
}

function isIdData(data: unknown): data is { id: string } {
  return typeof data === 'object' && 
         data !== null && 
         'id' in data && 
         typeof (data as { id: unknown }).id === 'string';
}

// Function overloads for different operation types
export function createOperationMutation<TData extends Record<string, unknown>, TResult extends BaseDocument>(
  operationType: 'create' | 'update' | 'bulkCreate' | 'bulkUpdate',
  entityType: string,
  serverAction: (params: TData) => Promise<EntityResponse<TResult>>,
  queryClient: QueryClient,
  additionalInvalidateKeys?: QueryKey[]
): () => UseMutationResult<EntityResponse<TResult>, Error, TData>;

export function createOperationMutation<TData extends Record<string, unknown>>(
  operationType: 'delete' | 'bulkDelete', 
  entityType: string,
  serverAction: (params: TData) => Promise<BaseResponse>,
  queryClient: QueryClient,
  additionalInvalidateKeys?: QueryKey[]
): () => UseMutationResult<BaseResponse, Error, TData>;

/**
 * Creates a standardized mutation hook for a specific CRUD operation
 * ✅ UPDATED: Now uses function overloads for precise typing
 */
export function createOperationMutation<TData extends Record<string, unknown>, TResult extends BaseDocument = BaseDocument>(
  operationType: CacheOperationType,
  entityType: string,
  serverAction: (params: TData) => Promise<EntityResponse<TResult> | BaseResponse>,
  queryClient: QueryClient,
  additionalInvalidateKeys: QueryKey[] = []
): () => UseMutationResult<EntityResponse<TResult> | BaseResponse, Error, TData> {
  // Development validation
  if (process.env.NODE_ENV === 'development') {
    if (!entityType) {
      throw new Error('entityType is required for createOperationMutation');
    }
    if (!serverAction) {
      throw new Error('serverAction is required for createOperationMutation');
    }
  }

  // Define the mutation function and parameters adapter based on operation type
  let mutationFn: (data: TData) => Promise<EntityResponse<TResult> | BaseResponse>;
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
    mutationFn = (data: TData) => serverAction(data);
    getEntityId = () => undefined;
  } else if (operationType === 'update' || operationType === 'bulkUpdate') {
    // For update operations, we need to extract id and data
    mutationFn = (data: TData) => {
      const { id, updateData } = extractUpdateData(data);
      // The serverAction expects the right shape, trust TypeScript
      return serverAction({ id, data: updateData } as unknown as TData);
    };
    getEntityId = (data: TData) => {
      if (isIdData(data)) {
        return data.id;
      }
      return undefined;
    };
  } else {
    // For delete operations, data is the ID
    mutationFn = (data: TData) => serverAction(data);
    getEntityId = (data: TData) => {
      if (isIdData(data)) {
        return data.id;
      }
      return undefined;
    };
  }

  // Helper function to safely extract delete ID
  const extractDeleteId = (data: TData): string => {
    // Handle string ID directly
    if (typeof data === 'string') {
      return data;
    }
    
    // Handle object with ID
    if (isIdData(data)) {
      return data.id;
    }
    
    throw new Error(`Invalid delete data format for ${entityType}`);
  };

  // Create the cache sync configuration
  const createCacheSyncConfig = (): CacheSyncConfig => ({
    entityType,
    operationType,
    additionalInvalidateKeys
  });

  // Create a custom hook that uses the optimistic mutation
  function useMutation() {
    return useOptimisticMutation<TData, EntityResponse<TResult> | BaseResponse, Error, { previousData?: PaginatedResponse<TResult> }>(
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
                extractDeleteId(data)
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
        
        // ✅ FIXED: onSuccess now handles different response types correctly
        onSuccess: async (response, data) => {
          try {
            // Get the entity ID if applicable
            const id = getEntityId(data);
            
            // Clean success handling - no debug logs in production
            if (process.env.NODE_ENV === 'development') {
              console.log(`✅ ${operationType} ${entityType} mutation completed successfully`);
            }
            
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
        
        errorContext: `${entityType}${operationType.charAt(0).toUpperCase() + operationType.slice(1)}Mutation`
      }
    );
  }

  return useMutation;
}