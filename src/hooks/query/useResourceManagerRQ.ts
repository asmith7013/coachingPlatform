import { useMemo } from 'react';
import { useFiltersAndSortingRQ } from '@/hooks/ui/useFiltersAndSortingRQ';
import { useReferenceDataRQ } from '@/hooks/query/useReferenceDataRQ';
import { useBulkOperationsRQ } from '@/hooks/query/useBulkOperationsRQ';
import { useQueriesManagerRQ } from '@/hooks/query/useQueriesManagerRQ';
import { queryKeys } from '@/lib/query/query-keys';
import { StandardResponse } from '@core-types/response';

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
  }) => Promise<StandardResponse<T>>;
  
  /** Function to fetch single entity */
  fetchById?: (id: string) => Promise<StandardResponse<T>>;
  
  /** Function to create entity */
  create?: (data: Partial<T>) => Promise<StandardResponse<T>>;
  
  /** Function to update entity */
  update?: (id: string, data: Partial<T>) => Promise<StandardResponse<T>>;
  
  /** Function to delete entity */
  delete?: (id: string) => Promise<StandardResponse<unknown>>;
  
  /** Function to perform bulk upload */
  bulkUpload?: (data: T[]) => Promise<StandardResponse<T>>;
  
  /** Function to perform bulk delete */
  bulkDelete?: (ids: string[]) => Promise<StandardResponse<unknown>>;
  
  /** Function to perform bulk update */
  bulkUpdate?: (updates: Array<{ id: string; data: Partial<T> }>) => Promise<StandardResponse<T>>;
  
  /** Function to fetch reference data */
  fetchReferenceData?: (search?: string) => Promise<StandardResponse<unknown>>;
  
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
export function useResourceManagerRQ<T, F extends Record<string, unknown> = Record<string, unknown>>({
  entityType,
  fetchList,
  fetchById,
  create,
  update,
  delete: deleteEntity,
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
  } = useFiltersAndSortingRQ({
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
  } = useReferenceDataRQ({
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
  } = useBulkOperationsRQ({
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
  } = useQueriesManagerRQ({
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
