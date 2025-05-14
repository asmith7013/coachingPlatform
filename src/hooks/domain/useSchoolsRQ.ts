import React, { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePaginatedQuery } from '@query-hooks/usePaginatedQuery';
import { schoolApiClient } from '@api-client/school';
import { School, SchoolInput } from '@zod-schema/core/school';
import { PaginationQueryParams } from '@query-hooks/usePaginatedQuery';
import { queryKeys } from '@query/queryKeys';
import { handleClientError } from '@error';
import { PaginatedResponse } from '@core-types/response';

export function useSchoolsRQ(initialPage: number = 1, initialLimit: number = 20) {
  const queryClient = useQueryClient();
  
  // State for pagination and filters
  const [page, setPage] = React.useState(initialPage);
  const [limit, setLimit] = React.useState(initialLimit);
  const [filters, setFilters] = React.useState<Record<string, any>>({});
  const [sortBy, setSortBy] = React.useState('createdAt');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  
  // Query parameters
  const params: PaginationQueryParams = {
    page,
    limit,
    sortBy,
    sortOrder,
    filters,
  };
  
  // Fetch schools with React Query
  const query = usePaginatedQuery<School>({
    entityType: 'schools',
    params,
    fetcher: (params) => schoolApiClient.list(params),
    options: {
      staleTime: 5 * 60 * 1000,
    //   keepPreviousData: true,
    }
  });
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: SchoolInput) => schoolApiClient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.entities.list('schools') });
    },
    onError: (error) => {
      const message = handleClientError(error, 'Create School');
      console.error('Failed to create school:', message);
    },
  });
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SchoolInput> }) =>
      schoolApiClient.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.entities.list('schools') });
    },
    onError: (error) => {
      const message = handleClientError(error, 'Update School');
      console.error('Failed to update school:', message);
    },
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => schoolApiClient.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.entities.list('schools') });
    },
    onError: (error) => {
      const message = handleClientError(error, 'Delete School');
      console.error('Failed to delete school:', message);
    },
  });
  
  // Helper functions that match useResourceManager interface
  const applyFilters = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when applying filters
  };
  
  const changeSorting = (newSortBy: string, newSortOrder?: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    if (newSortOrder) setSortOrder(newSortOrder);
  };
  
  // Return object matching useSchools interface
  return useMemo(() => ({
    schools: query.items,
    loading: query.isLoading,
    error: query.error,
    page,
    setPage,
    limit,
    setLimit,
    total: query.total,
    filters,
    applyFilters,
    sortBy,
    changeSorting,
    addSchool: (data: SchoolInput) => createMutation.mutate(data),
    editSchool: (id: string, data: SchoolInput) => updateMutation.mutate({ id, data }),
    removeSchool: (id: string) => deleteMutation.mutate(id),
    mutate: query.refetch,
  }), [
    query.items,
    query.isLoading,
    query.error,
    query.total,
    query.refetch,
    page,
    limit,
    filters,
    sortBy,
    createMutation.mutate,
    updateMutation.mutate,
    deleteMutation.mutate,
  ]);
} 