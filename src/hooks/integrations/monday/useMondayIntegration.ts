'use client';

/**
 * Monday Integration Hook
 * Provides a comprehensive API for Monday.com integration
 */
import { useCallback, useState } from 'react';
import {
  useMondayConnection,
  useMondayBoards,
  useMondayBoard,
  useMondayPreviews,
  useMondayImport,
  useImportVisit,
  useImportVisits
} from './useMondayQueries';

import { testConnection } from '@/lib/integrations/monday/client/client';
import { findPotentialVisitsToImport, importSelectedVisits } from '@/lib/integrations/monday/services/import-service';

// Type imports
import type { ImportItem, ImportPreview, ImportResult } from '@/lib/integrations/monday/types/import';
import type { MondayBoard } from '@/lib/integrations/monday/types/board';
import type { ServerResponse } from '@/hooks/error/useErrorHandledMutation';

// Selected item type needed for the import page
export interface SelectedItem {
  id: string;
  name: string;
  date?: string;
  school?: string;
  coach?: string;
  [key: string]: unknown;
}

/**
 * Hook for tracking the state of a Monday.com visit import process
 */
export function useMondayImportState() {
  // State to track the current visit import process
  const [currentStage, setCurrentStage] = useState<'selection' | 'completion' | 'success' | 'error'>('selection');
  const [currentVisitData, setCurrentVisitData] = useState<SelectedItem | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Reset state
  const resetState = useCallback(() => {
    setCurrentStage('selection');
    setCurrentVisitData(null);
    setMissingFields([]);
    setSelectedItemId(null);
  }, []);

  return {
    currentStage,
    setCurrentStage,
    currentVisitData,
    setCurrentVisitData,
    missingFields,
    setMissingFields,
    selectedItemId,
    setSelectedItemId,
    resetState
  };
}

// Export our import hooks with consistent naming
export { useMondayConnection, useMondayBoards, useMondayBoard, useMondayPreviews };
export { useMondayImport, useImportVisit, useImportVisits };

/**
 * Interface for the older version of useMondayIntegration hook
 * This maintains backward compatibility with existing components
 */
export interface ClassicMondayIntegrationResult {
  // Connection
  connectionStatus: 'unknown' | 'connected' | 'error';
  connectionData: { name?: string; email?: string } | null;
  connectionError: string | null;
  testConnection: () => Promise<ServerResponse<unknown>>;
  
  // Board operations
  board: MondayBoard | null;
  boardLoading: boolean;
  boardError: string | null;
  getBoard: (boardId: string, itemLimit?: number) => Promise<ServerResponse<MondayBoard>>;
  
  // Import operations
  previewItems: ImportPreview[] | null;
  previewLoading: boolean;
  previewError: string | null;
  findItemsToImport: (boardId: string) => Promise<ServerResponse<ImportPreview[]>>;
  
  // Import execution
  importResult: ImportResult | null;
  importing: boolean;
  importError: string | null;
  importItems: (selectedItems: string[] | ImportItem[]) => Promise<ServerResponse<ImportResult>>;
}

/**
 * Comprehensive hook for Monday.com integration
 * 
 * This hook provides backward compatibility with existing code
 * while also exposing the new interface.
 * 
 * @returns Complete Monday.com integration interface
 */
export function useMondayIntegration(): ClassicMondayIntegrationResult {
  // State for board and connection
  const [connectionState, setConnectionState] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [connectionData, setConnectionData] = useState<{ name?: string; email?: string } | null>(null);
  const [board, setBoard] = useState<MondayBoard | null>(null);
  const [previewItems, setPreviewItems] = useState<ImportPreview[] | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  
  // Use the primitive hooks
  const connectionQuery = useMondayConnection();
  const _boardsQuery = useMondayBoards(); // Prefixed with underscore to indicate it's used indirectly
  const boardMutation = useMondayBoard();
  const importMutation = useMondayImport();
  const importSingleMutation = useImportVisit();
  const importMultipleMutation = useImportVisits();
  
  // Test connection
  const testConnectionHandler = useCallback(async () => {
    try {
      const result = await testConnection();
      
      if (result.success) {
        setConnectionState('connected');
        setConnectionData({
          name: result.data?.name,
          email: result.data?.email
        });
        return { 
          success: true, 
          data: result.data
        };
      } else {
        setConnectionState('error');
        setConnectionData(null);
        return { 
          success: false, 
          error: result.error || 'Failed to connect to Monday.com'
        };
      }
    } catch (error) {
      setConnectionState('error');
      setConnectionData(null);
      const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
        ? String(error.message) 
        : 'Unknown error occurred';
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }, []);
  
  // Get board
  const getBoardHandler = useCallback(async (boardId: string, _itemLimit?: number) => {
    try {
      // Instead of using the useErrorHandledMutation result directly, make a direct API call
      const response = await fetch(`/api/integrations/monday/boards/${boardId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch board: ${response.statusText}`);
      }
      
      const boardData = await response.json();
      setBoard(boardData);
      return { success: true, data: boardData };
    } catch (error) {
      setBoard(null);
      const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
        ? String(error.message) 
        : 'Unknown error occurred';
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }, []);
  
  // Find items to import
  const findItemsHandler = useCallback(async (boardId: string) => {
    try {
      const items = await findPotentialVisitsToImport(boardId);
      setPreviewItems(items);
      return { success: true, data: items };
    } catch (error) {
      setPreviewItems(null);
      const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
        ? String(error.message) 
        : 'Unknown error occurred';
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }, []);
  
  // Import items
  const importItemsHandler = useCallback(async (items: string[] | ImportItem[]) => {
    try {
      const result = await importSelectedVisits(items);
      setImportResult(result);
      return { 
        success: result.success, 
        data: result,
        error: result.success ? undefined : 'Import failed'
      };
    } catch (error) {
      setImportResult(null);
      const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
        ? String(error.message) 
        : 'Unknown error occurred';
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }, []);
  
  // Return the classic interface for backward compatibility
  return {
    // Connection
    connectionStatus: connectionState,
    connectionData,
    connectionError: connectionQuery.error ? 
      (typeof connectionQuery.error === 'object' && 'message' in connectionQuery.error ? 
        String(connectionQuery.error.message) : 'Connection error') : null,
    testConnection: testConnectionHandler,
    
    // Board operations
    board,
    boardLoading: boardMutation.isLoading,
    boardError: boardMutation.error ? 'Error fetching board data' : null,
    getBoard: getBoardHandler,
    
    // Import operations
    previewItems,
    previewLoading: false,
    previewError: null,
    findItemsToImport: findItemsHandler,
    
    // Import execution
    importResult,
    importing: importMutation.isPending || importSingleMutation.isPending || importMultipleMutation.isPending,
    importError: importMutation.error ? 
      (typeof importMutation.error === 'object' && 'message' in importMutation.error ? 
        String(importMutation.error.message) : 'Import error') : null,
    importItems: importItemsHandler
  };
}

// Export as default
export default useMondayIntegration;