import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  testMondayConnection,
  getMondayBoard,
  findVisitsToImport,
  importSelectedVisitsFromMonday,
} from "@actions/integrations/monday";

/**
 * Custom hook for Monday.com integration operations
 *
 * Provides a unified interface for Monday.com integration including:
 * - Testing connection status
 * - Retrieving board information
 * - Finding potential visits to import
 * - Importing selected visits
 */
export function useMondayMutations() {
  const queryClient = useQueryClient();
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "testing" | null
  >(null);

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      setConnectionStatus("testing");
      try {
        const result = await testMondayConnection();
        setConnectionStatus(result.success ? "connected" : "disconnected");
        return result;
      } catch (error) {
        setConnectionStatus("disconnected");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monday", "connection"] });
    },
  });

  // Get board mutation
  const getBoardMutation = useMutation({
    mutationFn: async (boardId: string) => {
      return await getMondayBoard(boardId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monday", "boards"] });
    },
  });

  // Find potential visits mutation
  const findPotentialVisitsMutation = useMutation({
    mutationFn: async (boardId: string) => {
      return await findVisitsToImport(boardId);
    },
  });

  // Import selected visits mutation
  const importVisitsMutation = useMutation({
    mutationFn: async (itemIds: string[]) => {
      const result = await importSelectedVisitsFromMonday(itemIds);

      // Invalidate visits queries to refresh data
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["visits"] });
      }

      return result;
    },
  });

  // Combined loading state
  const loading =
    testConnectionMutation.isPending ||
    getBoardMutation.isPending ||
    findPotentialVisitsMutation.isPending ||
    importVisitsMutation.isPending;

  // Combined error state
  const error =
    testConnectionMutation.error ||
    getBoardMutation.error ||
    findPotentialVisitsMutation.error ||
    importVisitsMutation.error;

  return {
    // Connection status
    connectionStatus,
    testConnection: testConnectionMutation.mutateAsync,
    testingConnection: testConnectionMutation.isPending,
    connectionError: testConnectionMutation.error,

    // Board operations
    getBoard: getBoardMutation.mutateAsync,
    board:
      getBoardMutation.data && "data" in getBoardMutation.data
        ? getBoardMutation.data.data
        : null,
    boardLoading: getBoardMutation.isPending,
    boardError: getBoardMutation.error,

    // Find visits operations
    findPotentialVisits: findPotentialVisitsMutation.mutateAsync, // Renamed for compatibility
    findItemsToImport: findPotentialVisitsMutation.mutateAsync, // Keep for backward compatibility
    previewItems: findPotentialVisitsMutation.data || [],
    previewLoading: findPotentialVisitsMutation.isPending,
    previewError: findPotentialVisitsMutation.error,

    // Import operations
    importVisits: importVisitsMutation.mutateAsync, // Renamed for compatibility
    importItems: importVisitsMutation.mutateAsync, // Keep for backward compatibility
    importResult: importVisitsMutation.data,
    importing: importVisitsMutation.isPending,
    importError: importVisitsMutation.error,

    // Combined states
    loading,
    error,
  };
}

export default useMondayMutations;
