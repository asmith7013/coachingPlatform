import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@query/core/keys';
import { handleClientError } from '@/lib/error';
import { CollectionResponse } from '@core-types/response';

export interface BulkOperationOptions<T> {
  /** Entity type name (e.g., 'schools', 'staff') */
  entityType: string;
  
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
 * Hook for performing bulk operations with React Query
 */
export function useBulkOperations<T>({
  entityType,
  bulkUpload,
  bulkDelete,
  bulkUpdate,
  errorContext = entityType
}: BulkOperationOptions<T>) {
  const queryClient = useQueryClient();
  
  // Setup bulk upload mutation
  const uploadMutation = bulkUpload 
    ? useMutation({
        mutationFn: async (data: T[]) => {
          try {
            return await bulkUpload(data);
          } catch (error) {
            throw error instanceof Error
              ? error
              : new Error(handleClientError(error, `Bulk upload ${errorContext}`));
          }
        },
        onSuccess: () => {
          // Invalidate entity list queries
          queryClient.invalidateQueries({ queryKey: queryKeys.entities.list(entityType) });
        }
      })
    : { mutate: null, mutateAsync: null, isPending: false, error: null };
  
  // Setup bulk delete mutation
  const deleteMutation = bulkDelete
    ? useMutation({
        mutationFn: async (ids: string[]) => {
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
      })
    : { mutate: null, mutateAsync: null, isPending: false, error: null };
  
  // Setup bulk update mutation
  const updateMutation = bulkUpdate
    ? useMutation({
        mutationFn: async (updates: Array<{ id: string; data: Partial<T> }>) => {
          try {
            return await bulkUpdate(updates);
          } catch (error) {
            throw error instanceof Error
              ? error
              : new Error(handleClientError(error, `Bulk update ${errorContext}`));
          }
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.entities.list(entityType) });
        }
      })
    : { mutate: null, mutateAsync: null, isPending: false, error: null };
  
  return {
    // Bulk upload operations
    bulkUpload: uploadMutation.mutate,
    bulkUploadAsync: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    uploadError: uploadMutation.error,
    
    // Bulk delete operations
    bulkDelete: deleteMutation.mutate,
    bulkDeleteAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
    
    // Bulk update operations
    bulkUpdate: updateMutation.mutate,
    bulkUpdateAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error
  };
} 