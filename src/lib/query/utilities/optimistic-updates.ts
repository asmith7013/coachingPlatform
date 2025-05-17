// src/lib/query/utilities/optimisticUpdates.ts
import { useQueryClient, useMutation, QueryClient } from '@tanstack/react-query';
import { deepSanitize, removeTimestampFields } from '@/lib/data-utilities/transformers/sanitize';
import { parseOrThrow, parsePartialOrThrow } from '@/lib/data-utilities/transformers/parse';
import { ZodSchema } from 'zod';
import { handleClientError } from '@/lib/error/handle-client-error';
import { queryKeys } from '@/lib/query/core/keys';
import { BaseDocument } from '@/lib/types/core/document';
import { PaginatedResult } from '@/lib/types/core/pagination';
import { CrudResultType } from '@/lib/types/core/crud';

/**
 * Creates optimistic CRUD operations for a specific entity type
 * that mirror the server-side CRUD factory pattern
 */
export function createOptimisticCrudActions<
  Doc extends BaseDocument,
  InputType,
  FullType
>(
  entityType: string,
  fullSchema: ZodSchema<FullType>,
  inputSchema: ZodSchema<InputType>
) {
  const entityListKey = queryKeys.entities.list(entityType);
  
  return {
    /**
     * Optimistically add a new item to the collection
     */
    optimisticCreate(
      queryClient: QueryClient,
      data: InputType
    ): { previousData: PaginatedResult<FullType> | undefined } {
      try {
        // Validate and sanitize data using the same pattern as server-side
        const validatedData = parseOrThrow(inputSchema, data);
        const safeData = removeTimestampFields(validatedData);
        
        // Generate temporary ID and timestamps for optimistic rendering
        const optimisticItem = {
          ...safeData,
          _id: `temp_${Date.now()}`,
          id: `temp_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Parse with full schema to ensure it matches server response format
        const processedItem = parseOrThrow(fullSchema, optimisticItem) as FullType;
        
        // Save previous data for potential rollback
        const previousData = queryClient.getQueryData<PaginatedResult<FullType>>(entityListKey);
        
        // Update the query data optimistically
        queryClient.setQueryData<PaginatedResult<FullType>>(
          entityListKey,
          (oldData): PaginatedResult<FullType> => {
            // If no previous data exists, create a new response
            if (!oldData) {
              return {
                success: true,
                items: [processedItem],
                total: 1,
                page: 1,
                limit: 10,
                totalPages: 1,
                empty: false
              };
            }
            
            // Otherwise add to existing collection
            return {
              ...oldData,
              items: [...oldData.items, processedItem],
              total: oldData.total + 1,
              empty: false,
              totalPages: Math.ceil((oldData.total + 1) / (oldData.limit || 10))
            };
          }
        );
        
        return { previousData };
      } catch (error) {
        handleClientError(error, `Optimistic${entityType}Create`);
        throw error;
      }
    },
    
    /**
     * Optimistically update an existing item in the collection
     */
    optimisticUpdate(
      queryClient: QueryClient,
      id: string,
      data: Partial<InputType>
    ): { previousData: PaginatedResult<FullType> | undefined } {
      try {
        // Validate and sanitize partial data
        const validatedData = parsePartialOrThrow(inputSchema, data);
        const safeData = removeTimestampFields(validatedData);
        
        // Save previous data for potential rollback
        const previousData = queryClient.getQueryData<PaginatedResult<FullType>>(entityListKey);
        
        // Update the query data optimistically
        queryClient.setQueryData<PaginatedResult<FullType>>(
          entityListKey,
          (oldData): PaginatedResult<FullType> | undefined => {
            if (!oldData) return undefined;
            
            // Update the matching item
            const updatedItems = oldData.items.map(item => {
              const itemId = (item as any)._id;
              
              if (itemId === id) {
                // Merge existing item with updates
                const merged = {
                  ...item,
                  ...safeData,
                  updatedAt: new Date().toISOString()
                };
                
                // Validate merged item
                try {
                  // Sanitize and parse to ensure format matches server response
                  return parseOrThrow(fullSchema, deepSanitize(merged));
                } catch (error) {
                  console.error('Validation error in optimistic update:', error);
                  return item; // Fall back to original on validation error
                }
              }
              
              return item;
            });
            
            return {
              ...oldData,
              items: updatedItems
            };
          }
        );
        
        return { previousData };
      } catch (error) {
        handleClientError(error, `Optimistic${entityType}Update`);
        throw error;
      }
    },
    
    /**
     * Optimistically delete an item from the collection
     */
    optimisticDelete(
      queryClient: QueryClient,
      id: string
    ): { previousData: PaginatedResult<FullType> | undefined } {
      try {
        // Save previous data for potential rollback
        const previousData = queryClient.getQueryData<PaginatedResult<FullType>>(entityListKey);
        
        // Update the query data optimistically
        queryClient.setQueryData<PaginatedResult<FullType>>(
          entityListKey,
          (oldData): PaginatedResult<FullType> | undefined => {
            if (!oldData) return undefined;
            
            // Filter out the deleted item
            const filteredItems = oldData.items.filter(item => {
              const itemId = (item as any)._id;
              return itemId !== id;
            });
            
            // Update pagination info
            const newTotal = Math.max(0, oldData.total - 1);
            const newTotalPages = Math.ceil(newTotal / (oldData.limit || 10));
            
            return {
              ...oldData,
              items: filteredItems,
              total: newTotal,
              totalPages: newTotalPages,
              empty: filteredItems.length === 0
            };
          }
        );
        
        return { previousData };
      } catch (error) {
        handleClientError(error, `Optimistic${entityType}Delete`);
        throw error;
      }
    },
    
    /**
     * Prepare data for server submission by removing system fields
     */
    prepareForSubmission(data: InputType): InputType {
      return removeTimestampFields(data) as InputType;
    }
  };
}

/**
 * Creates a custom hook for a specific entity type that mirrors your server-side CRUD factory
 */
export function createMutationHook<
  Doc extends BaseDocument,
  InputType,
  FullType
>(
  entityType: string,
  fullSchema: ZodSchema<FullType>,
  inputSchema: ZodSchema<InputType>,
  serverActions: {
    create: (data: InputType) => Promise<CrudResultType<FullType>>;
    update: (id: string, data: Partial<InputType>) => Promise<CrudResultType<FullType>>;
    delete: (id: string) => Promise<CrudResultType<FullType>>;
  }
) {
  return function useCrudMutation() {
    const queryClient = useQueryClient();
    const entityListKey = queryKeys.entities.list(entityType);
    
    // Create optimistic actions for this entity type
    const optimistic = createOptimisticCrudActions<Doc, InputType, FullType>(
      entityType, 
      fullSchema, 
      inputSchema
    );
    
    // Create mutation
    const createMutation = useMutation({
      mutationFn: serverActions.create,
      onMutate: async (newData) => {
        // Cancel any in-flight queries
        await queryClient.cancelQueries({ queryKey: entityListKey });
        
        // Perform optimistic update
        return optimistic.optimisticCreate(queryClient, newData);
      },
      onSuccess: () => {
        // Invalidate relevant queries on success
        queryClient.invalidateQueries({ queryKey: entityListKey });
      },
      onError: (_, __, context) => {
        // Roll back on error
        if (context?.previousData) {
          queryClient.setQueryData(entityListKey, context.previousData);
        }
      }
    });
    
    // Update mutation
    const updateMutation = useMutation({
      mutationFn: (params: { id: string; data: Partial<InputType> }) => 
        serverActions.update(params.id, params.data),
      onMutate: async ({ id, data }) => {
        await queryClient.cancelQueries({ queryKey: entityListKey });
        return optimistic.optimisticUpdate(queryClient, id, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: entityListKey });
      },
      onError: (_, __, context) => {
        if (context?.previousData) {
          queryClient.setQueryData(entityListKey, context.previousData);
        }
      }
    });
    
    // Delete mutation
    const deleteMutation = useMutation({
      mutationFn: serverActions.delete,
      onMutate: async (id) => {
        await queryClient.cancelQueries({ queryKey: entityListKey });
        return optimistic.optimisticDelete(queryClient, id);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: entityListKey });
      },
      onError: (_, __, context) => {
        if (context?.previousData) {
          queryClient.setQueryData(entityListKey, context.previousData);
        }
      }
    });
    
    return {
      create: createMutation.mutate,
      createAsync: createMutation.mutateAsync,
      update: updateMutation.mutate,
      updateAsync: updateMutation.mutateAsync,
      remove: deleteMutation.mutate,
      removeAsync: deleteMutation.mutateAsync,
      isCreating: createMutation.isPending,
      isUpdating: updateMutation.isPending,
      isRemoving: deleteMutation.isPending,
      createError: createMutation.error,
      updateError: updateMutation.error,
      removeError: deleteMutation.error
    };
  };
}