// src/query/client/hooks/mutations/useBulkOperations.ts

import { useStandardMutation } from '@query/client/hooks/mutations/useStandardMutation';
import { CollectionResponse } from '@core-types/response';
import { ZodSchema } from 'zod';
import { BaseDocument } from '@core-types/document';
import { transformCollectionResponse } from '@query/client/utilities/hook-helpers';
import { useInvalidation } from '@query/cache/invalidation';

export interface BulkOperationOptions<T extends BaseDocument> {
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
  
  /** Whether to use selector system */
  useSelector?: boolean;
  
  /** Optional related entity types to invalidate on mutations */
  relatedEntityTypes?: string[];
}

/**
 * Hook for performing bulk operations with React Query and schema validation
 * 
 * @example
 * ```typescript
 * const bulkOps = useBulkOperations({
 *   entityType: 'schools',
 *   schema: SchoolZodSchema,
 *   bulkUpload: uploadSchools,
 *   bulkDelete: deleteSchools,
 *   relatedEntityTypes: ['staff', 'visits'] // Will invalidate staff and visits when schools are modified
 * });
 * 
 * // Use the operations
 * bulkOps.bulkUpload(schoolsData);
 * ```
 */
export function useBulkOperations<T extends BaseDocument>({
  entityType,
  schema, // ✅ NOW REQUIRED
  bulkUpload,
  bulkDelete,
  bulkUpdate,
  errorContext = entityType,
  useSelector = false,
  relatedEntityTypes = []
}: BulkOperationOptions<T>) {
  const { invalidateList } = useInvalidation();
  
  /**
   * Invalidates the entity and any related entities
   */
  const invalidateData = async () => {
    // Invalidate the main entity type
    await invalidateList(entityType);
    
    // Invalidate any related entity types
    if (relatedEntityTypes.length > 0) {
      await Promise.all(
        relatedEntityTypes.map(type => invalidateList(type))
      );
    }
  };
  
  // Upload mutation with centralized error handling
  const uploadMutation = useStandardMutation(
    async (data: T[]) => {
      if (!bulkUpload) {
        throw new Error('Bulk upload function not provided');
      }
      return await bulkUpload(data);
    },
    {
      onSuccess: async (response) => {
        // Transform response with schema validation
        transformCollectionResponse<T>(
          response, 
          schema,
          {
            entityType,
            useSelector,
            errorContext: `${errorContext}.bulkUpload`
          }
        );
        
        // Use invalidation hook instead of direct queryClient call
        await invalidateData();
      }
    },
    `${errorContext}.bulkUpload`
  );

  // Delete mutation with centralized error handling
  const deleteMutation = useStandardMutation(
    async (ids: string[]) => {
      if (!bulkDelete) {
        throw new Error('Bulk delete function not provided');
      }
      return await bulkDelete(ids);
    },
    {
      onSuccess: async () => {
        await invalidateData();
      }
    },
    `${errorContext}.bulkDelete`
  );

  // Update mutation with centralized error handling
  const updateMutation = useStandardMutation(
    async (updates: Array<{ id: string; data: Partial<T> }>) => {
      if (!bulkUpdate) {
        throw new Error('Bulk update function not provided');
      }
      return await bulkUpdate(updates);
    },
    {
      onSuccess: async (response) => {
        // Transform response with schema validation
        transformCollectionResponse<T>(
          response, 
          schema,
          {
            entityType,
            useSelector,
            errorContext: `${errorContext}.bulkUpdate`
          }
        );
        
        await invalidateData();
      }
    },
    `${errorContext}.bulkUpdate`
  );
  
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