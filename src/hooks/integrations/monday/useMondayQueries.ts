'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testConnection, fetchMondayBoards, fetchMondayBoard } from '@api-monday/client';
import { findPotentialVisitsToImport, importSelectedVisits } from '@api-monday/services/import-service';
import { ImportItem, MondayBoard } from '@api-monday/types';
import useErrorHandledMutation from '@/hooks/error/useErrorHandledMutation';
import { queryKeys } from '@/lib/query/queryKeys';
import { handleClientError } from '@/lib/error/handle-client-error';

/**
 * Hook for querying Monday.com connection status
 */
export function useMondayConnection() {
  return useQuery({
    queryKey: ['monday', 'connection'],
    queryFn: testConnection,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for fetching a specific Monday.com board
 * 
 * @returns React Query mutation result for board fetch operation
 */
export function useMondayBoard() {
  return useErrorHandledMutation<MondayBoard, [string, number?]>(
    fetchMondayBoard,
    { 
      errorContext: "MondayBoard",
      defaultErrorMessage: "Failed to fetch Monday.com board"
    }
  );
}

/**
 * Hook for fetching Monday.com boards
 */
export function useMondayBoards() {
  return useQuery({
    queryKey: ['monday', 'boards'],
    queryFn: async () => {
      const result = await fetchMondayBoards();
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for fetching Monday.com visit previews for a specific board
 */
export function useMondayPreviews(boardId: string | null) {
  return useQuery({
    queryKey: ['monday', 'previews', boardId],
    queryFn: async () => {
      if (!boardId) return [];
      return await findPotentialVisitsToImport(boardId);
    },
    enabled: !!boardId,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook for importing visits from Monday.com
 */
export function useMondayImport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ ids, boardId: _boardId }: { ids: string[], boardId: string }) => {
      const items = ids.map(id => ({ id }));
      return await importSelectedVisits(items);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['monday', 'previews'] });
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    }
  });
}

/**
 * Hook for importing a single visit with completion data
 */
export function useImportVisit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ImportItem) => {
      return await importSelectedVisits([data]);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['monday', 'previews'] });
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    }
  });
} 

/**
 * Hook for importing multiple visits at once
 * 
 * @returns React Query mutation result for batch import
 */
export function useImportVisits() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (items: ImportItem[] | string[]) => {
      try {
        return await importSelectedVisits(items);
      } catch (error) {
        throw error instanceof Error 
          ? error 
          : new Error(handleClientError(error, 'Multiple Visits Import'));
      }
    },
    onSuccess: () => {
      // Invalidate using a wildcard string to catch all board IDs
      queryClient.invalidateQueries({ queryKey: queryKeys.monday.potentialVisits('*') });
      queryClient.invalidateQueries({ queryKey: queryKeys.entities.list('visits') });
    }
  });
}
