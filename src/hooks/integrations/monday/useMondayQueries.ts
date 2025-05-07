'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { MondayBoard } from '@/lib/integrations/monday/types/board';
import type { MondayUser } from '@/lib/integrations/monday/types/api';
import useErrorHandledMutation from '@/hooks/error/useErrorHandledMutation';

/**
 * Hook for testing Monday.com connection
 */
export function useMondayConnection() {
  return useQuery({
    queryKey: ['monday', 'connection'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/integrations/monday/connection');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to test connection');
        }
        
        return data;
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Connection test failed');
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for fetching a specific Monday.com board
 */
export function useMondayBoard() {
  return useErrorHandledMutation<MondayBoard, [string, number?]>(
    async ([boardId, limit]) => {
      const response = await fetch(`/api/integrations/monday/board?boardId=${boardId}${limit ? `&limit=${limit}` : ''}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch board');
      }
      
      return data;
    },
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
      try {
        const response = await fetch('/api/integrations/monday/boards');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch boards');
        }
        
        return data.items || [];
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to fetch boards');
      }
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
      
      try {
        const response = await fetch(`/api/integrations/monday/visits/potential?boardId=${boardId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch previews');
        }
        
        return data.items || [];
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to fetch previews');
      }
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
    mutationFn: async ({ ids, boardId }: { ids: string[], boardId: string }) => {
      try {
        const response = await fetch('/api/integrations/monday/visits/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ selectedItems: ids, boardId }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Import failed');
        }
        
        return data;
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Import failed');
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['monday', 'previews'] });
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    }
  });
}

/**
 * Hook for fetching a Monday.com user by email
 */
export function useMondayUserByEmail(email: string) {
  return useQuery({
    queryKey: ['monday', 'user', email],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/integrations/monday/user?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to find user');
        }
        
        return data.data as MondayUser;
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to find user');
      }
    },
    enabled: !!email,
  });
}
