import { useMemo } from 'react';
import { useFiltersAndSorting } from '@ui-hooks/useFiltersAndSorting';
import { useReferenceData } from '@query-hooks/useReferenceData';
import { useBulkOperations } from '@query-hooks/useBulkOperations';
import { useQueriesManager } from '@query-hooks/useQueriesManager';
import { queryKeys } from '@query/core/keys';
import { CollectionResponse } from '@core-types/response';

export interface ResourceManagerConfig<T, F extends Record<string, unknown> = Record<string, unknown>> {
  /** Entity type name (e.g., 'schools', 'staff') */
  entityType: string;
  
  /** Function to fetch list of entities */
  fetchList: (params: {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: F;
    search?: string;
  }) => Promise<CollectionResponse<T>>;
  
  /** Function to fetch single entity */
  fetchById?: (id: string) => Promise<CollectionResponse<T>>;
  
  /** Function to create entity */
  create?: (data: Partial<T>) => Promise<CollectionResponse<T>>;
  
  /** Function to update entity */
  update?: (id: string, data: Partial<T>) => Promise<CollectionResponse<T>>;
  
  /** Function to delete entity */
  delete?: (id: string) => Promise<CollectionResponse<unknown>>;
  
  /** Function to perform bulk upload */
  bulkUpload?: (data: T[]) => Promise<CollectionResponse<T>>;
  
  /** Function to perform bulk delete */
  bulkDelete?: (ids: string[]) => Promise<CollectionResponse<unknown>>;
  
  /** Function to perform bulk update */
  bulkUpdate?: (updates: Array<{ id: string; data: Partial<T> }>) => Promise<CollectionResponse<T>>;
  
  /** Function to fetch reference data */
  fetchReferenceData?: (search?: string) => Promise<CollectionResponse<unknown>>;
  
  /** Valid sort fields */
  validSortFields?: string[];
  
  /** Default filters */
  defaultFilters?: F;
  
  /** Default sort field */
  defaultSortBy?: string;
  
  /** Default sort order */
  defaultSortOrder?: 'asc' | 'desc';
  
  /** Default page number */
  defaultPage?: number;
  
  /** Default page size */
  defaultPageSize?: number;
  
  /** Whether to persist filters in local storage */
  persistFilters?: boolean;
  
  /** Error context for error reporting */
  errorContext?: string;
}

/**
 * Hook for managing entity resources with React Query
 */
export function createResourceManager<T, F extends Record<string, unknown> = Record<string, unknown>>({
  entityType,
  // fetchList,
  fetchById,
  // create,
  // update,
  // delete: deleteEntity,
  bulkUpload,
  bulkDelete,
  bulkUpdate,
  fetchReferenceData,
  validSortFields,
  defaultFilters,
  defaultSortBy,
  defaultSortOrder,
  defaultPage,
  defaultPageSize,
  persistFilters,
  errorContext = entityType
}: ResourceManagerConfig<T, F>) {
  // Setup filters and sorting
  const {
    filters,
    sortBy,
    sortOrder,
    search,
    page,
    pageSize,
    setFilters,
    setSearch,
    setSortBy,
    setSortOrder,
    setPage,
    setPageSize,
    resetFilters,
    queryParams
  } = useFiltersAndSorting({
    storageKey: persistFilters ? `${entityType}-filters` : undefined,
    defaultFilters,
    defaultSortBy,
    defaultSortOrder,
    defaultPage,
    defaultPageSize,
    validSortFields,
    persist: persistFilters
  });
  
  // Setup reference data
  const {
    options: referenceOptions,
    isLoading: isLoadingReference,
    error: referenceError,
    refetch: refetchReference
  } = useReferenceData({
    url: fetchReferenceData ? `/api/${entityType}/reference` : '',
    enabled: !!fetchReferenceData,
    fetcher: fetchReferenceData
  });
  
  // Setup bulk operations
  const {
    bulkUpload: upload,
    bulkUploadAsync: uploadAsync,
    isUploading,
    uploadError,
    bulkDelete: deleteBulk,
    bulkDeleteAsync: deleteBulkAsync,
    isDeleting,
    deleteError,
    bulkUpdate: updateBulk,
    bulkUpdateAsync: updateBulkAsync,
    isUpdating,
    updateError
  } = useBulkOperations({
    entityType,
    bulkUpload,
    bulkDelete,
    bulkUpdate,
    errorContext
  });
  
  // Setup queries manager for fetching entity and related data
  const {
    data,
    relatedData,
    isLoading: isLoadingEntity,
    error: entityError,
    invalidateQueries,
    queries
  } = useQueriesManager({
    queryKey: fetchById ? [...queryKeys.entities.detail(entityType, 'id')] : [],
    queryFn: fetchById ? () => fetchById('id') : async () => ({ success: true, items: [] }),
    errorContext
  });
  
  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(() => ({
    // Filters and sorting
    filters,
    sortBy,
    sortOrder,
    search,
    page,
    pageSize,
    setFilters,
    setSearch,
    setSortBy,
    setSortOrder,
    setPage,
    setPageSize,
    resetFilters,
    queryParams,
    
    // Reference data
    referenceOptions,
    isLoadingReference,
    referenceError,
    refetchReference,
    
    // Bulk operations
    upload,
    uploadAsync,
    isUploading,
    uploadError,
    deleteBulk,
    deleteBulkAsync,
    isDeleting,
    deleteError,
    updateBulk,
    updateBulkAsync,
    isUpdating,
    updateError,
    
    // Entity data
    data,
    relatedData,
    isLoadingEntity,
    entityError,
    invalidateQueries,
    queries
  }), [
    filters,
    sortBy,
    sortOrder,
    search,
    page,
    pageSize,
    referenceOptions,
    isLoadingReference,
    referenceError,
    isUploading,
    uploadError,
    isDeleting,
    deleteError,
    isUpdating,
    updateError,
    data,
    relatedData,
    isLoadingEntity,
    entityError,
    queries
  ]);
}
