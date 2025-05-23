// src/lib/query/utilities/optimistic-updates.ts
import { useQueryClient, useMutation, QueryClient } from '@tanstack/react-query';
import { 
  transformDocument, 
  prepareForCreate 
} from '@/lib/data-utilities/transformers/core/db-transformers';
import { 
  validateStrict, 
  validatePartialStrict 
} from '@/lib/data-utilities/transformers/core/schema-validators';
import { ZodSchema, ZodObject, ZodRawShape, ZodTypeAny } from 'zod';
import { handleClientError } from '@error';
import { queryKeys } from '@query/core/keys';
import { BaseDocument } from '@core-types/document';
import { PaginatedResponse } from '@core-types/pagination';
import { CrudResultType } from '@core-types/crud';

/**
 * Creates optimistic CRUD operations for a specific entity type
 * that mirror the server-side CRUD factory pattern
 */
export function createOptimisticCrudActions<
  InputType extends Partial<BaseDocument>,
  FullType extends BaseDocument
>(
  entityType: string,
  fullSchema: ZodSchema<FullType>,
  inputSchema: ZodObject<ZodRawShape, "strip", ZodTypeAny, InputType>
) {
  const entityListKey = queryKeys.entities.list(entityType);
  
  return {
    /**
     * Optimistically add a new item to the collection
     */
    optimisticCreate(
      queryClient: QueryClient,
      data: InputType
    ): { previousData: PaginatedResponse<FullType> | undefined } {
      try {
        // Validate and sanitize data using the same pattern as server-side
        const validatedData = validateStrict(inputSchema, data);
        const preparedData = prepareForCreate(validatedData);
        
        // Generate temporary ID and timestamps for optimistic rendering
        const optimisticItem = {
          ...preparedData,
          _id: `temp_${Date.now()}`,
          id: `temp_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Parse with full schema to ensure it matches server response format
        const processedItem = validateStrict(fullSchema, optimisticItem) as FullType;
        
        // Save previous data for potential rollback
        const previousData = queryClient.getQueryData<PaginatedResponse<FullType>>(entityListKey);
        
        // Update the query data optimistically
        queryClient.setQueryData<PaginatedResponse<FullType>>(
          entityListKey,
          (oldData): PaginatedResponse<FullType> => {
            // If no previous data exists, create a new response
            if (!oldData) {
              return {
                success: true,
                items: [processedItem],
                total: 1,
                page: 1,
                limit: 10,
                totalPages: 1,
                empty: false,
                hasMore: false
              };
            }
            
            // Otherwise add to existing collection
            const newTotal = oldData.total + 1;
            const limit = oldData.limit || 10;
            const page = oldData.page || 1;
            const newTotalPages = Math.ceil(newTotal / limit);
            
            return {
              ...oldData,
              items: [...oldData.items, processedItem],
              total: newTotal,
              empty: false,
              totalPages: newTotalPages,
              hasMore: newTotalPages > page
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
    ): { previousData: PaginatedResponse<FullType> | undefined } {
      try {
        // Validate and sanitize partial data
        const validatedPartial = validatePartialStrict(inputSchema, data);
        const preparedData = prepareForCreate(validatedPartial);
        
        // Save previous data for potential rollback
        const previousData = queryClient.getQueryData<PaginatedResponse<FullType>>(entityListKey);
        
        // Update the query data optimistically
        queryClient.setQueryData<PaginatedResponse<FullType>>(
          entityListKey,
          (oldData): PaginatedResponse<FullType> | undefined => {
            if (!oldData) return undefined;
            
            // Update the matching item
            const updatedItems = oldData.items.map(item => {
              const itemId = (item as FullType)._id;
              
              if (itemId === id) {
                // Merge existing item with updates
                const merged = {
                  ...item,
                  ...preparedData,
                  updatedAt: new Date().toISOString()
                };
                
                // Validate merged item
                try {
                  // Sanitize and parse to ensure format matches server response
                  const transformedData = transformDocument(merged);
                  return validateStrict(fullSchema, transformedData);
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
    ): { previousData: PaginatedResponse<FullType> | undefined } {
      try {
        // Save previous data for potential rollback
        const previousData = queryClient.getQueryData<PaginatedResponse<FullType>>(entityListKey);
        
        // Update the query data optimistically
        queryClient.setQueryData<PaginatedResponse<FullType>>(
          entityListKey,
          (oldData): PaginatedResponse<FullType> | undefined => {
            if (!oldData) return undefined;
            
            // Filter out the deleted item
            const filteredItems = oldData.items.filter(item => {
              const itemId = (item as FullType)._id;
              return itemId !== id;
            });
            
            // Update pagination info
            const newTotal = Math.max(0, oldData.total - 1);
            const limit = oldData.limit || 10;
            const page = oldData.page || 1;
            const newTotalPages = Math.ceil(newTotal / limit);
            
            return {
              ...oldData,
              items: filteredItems,
              total: newTotal,
              totalPages: newTotalPages,
              empty: filteredItems.length === 0,
              hasMore: newTotalPages > page
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
      return prepareForCreate(data) as InputType;
    }
  };
}

/**
 * Creates a custom hook for a specific entity type that mirrors your server-side CRUD factory
 */
export function createMutationHook<
  InputType extends Partial<BaseDocument>,
  FullType extends BaseDocument
>(
  entityType: string,
  fullSchema: ZodSchema<FullType>,
  inputSchema: ZodObject<ZodRawShape, "strip", ZodTypeAny, InputType>,
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
    const optimistic = createOptimisticCrudActions<InputType, FullType>(
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