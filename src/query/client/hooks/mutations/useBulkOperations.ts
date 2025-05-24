import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@query/core/keys';
import { handleClientError } from '@error/handlers/client';
import { CollectionResponse } from '@core-types/response';
import { ZodSchema } from 'zod';
import { transformItemsWithSchema } from '@transformers/core/transform-helpers';

export interface BulkOperationOptions<T> {
  /** Entity type name (e.g., 'schools', 'staff') */
  entityType: string;
  
  /** ✅ NOW REQUIRED: Zod schema for data validation */
  schema: ZodSchema<T>;
  
  /** Function to perform bulk upload */
  bulkUpload?: (data: T[]) => Promise<CollectionResponse<T>>;
  
  /** Function to perform bulk delete */
  bulkDelete?: (ids: string[]) => Promise<CollectionResponse<unknown>>;
  
  /** Function to perform bulk update */
  bulkUpdate?: (updates: Array<{ id: string; data: Partial<T> }>) => Promise<CollectionResponse<T>>;
  
  /** Error context for error reporting */
  errorContext?: string;
}

/**
 * Transform response using shared helper
 */
function transformBulkResponse<T>(
  response: CollectionResponse<T> | null | undefined,
  schema: ZodSchema<T>
): CollectionResponse<T> {
  if (!response?.items) {
    return { success: false, items: [], total: 0 };
  }
  
  try {
    const transformedItems = transformItemsWithSchema(response.items, schema);
    
    return {
      ...response,
      items: transformedItems,
      total: transformedItems.length
    };
  } catch (error) {
    console.error('Error transforming bulk response:', error);
    return response; // Fallback to original
  }
}

/**
 * Hook for performing bulk operations with React Query and REQUIRED schema validation
 */
export function useBulkOperations<T>({
  entityType,
  schema, // ✅ NOW REQUIRED
  bulkUpload,
  bulkDelete,
  bulkUpdate,
  errorContext = entityType
}: BulkOperationOptions<T>) {
  const queryClient = useQueryClient();
  
  // Always create mutations, but only use them if the corresponding function is provided
  const uploadMutation = useMutation({
    mutationFn: async (data: T[]) => {
      if (!bulkUpload) {
        throw new Error('Bulk upload function not provided');
      }
      try {
        return await bulkUpload(data);
      } catch (error) {
        throw error instanceof Error
          ? error
          : new Error(handleClientError(error, `Bulk upload ${errorContext}`));
      }
    },
    onSuccess: (response) => {
      // Transform response with schema validation
      const transformed = transformBulkResponse(response, schema);
      
      // Invalidate entity list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.entities.list(entityType) });
      
      return transformed;
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      if (!bulkDelete) {
        throw new Error('Bulk delete function not provided');
      }
      try {
        return await bulkDelete(ids);
      } catch (error) {
        throw error instanceof Error
          ? error
          : new Error(handleClientError(error, `Bulk delete ${errorContext}`));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.entities.list(entityType) });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: async (updates: Array<{ id: string; data: Partial<T> }>) => {
      if (!bulkUpdate) {
        throw new Error('Bulk update function not provided');
      }
      try {
        return await bulkUpdate(updates);
      } catch (error) {
        throw error instanceof Error
          ? error
          : new Error(handleClientError(error, `Bulk update ${errorContext}`));
      }
    },
    onSuccess: (response) => {
      // Transform response with schema validation
      const transformed = transformBulkResponse(response, schema);
      
      queryClient.invalidateQueries({ queryKey: queryKeys.entities.list(entityType) });
      
      return transformed;
    }
  });
  
  return {
    // Bulk upload operations
    bulkUpload: bulkUpload ? uploadMutation.mutate : null,
    bulkUploadAsync: bulkUpload ? uploadMutation.mutateAsync : null,
    isUploading: uploadMutation.isPending,
    uploadError: uploadMutation.error,
    
    // Bulk delete operations
    bulkDelete: bulkDelete ? deleteMutation.mutate : null,
    bulkDeleteAsync: bulkDelete ? deleteMutation.mutateAsync : null,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
    
    // Bulk update operations
    bulkUpdate: bulkUpdate ? updateMutation.mutate : null,
    bulkUpdateAsync: bulkUpdate ? updateMutation.mutateAsync : null,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error
  };
} 