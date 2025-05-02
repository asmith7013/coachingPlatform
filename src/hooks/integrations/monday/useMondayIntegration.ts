'use client';

import { useCallback, useState } from 'react';
import { useErrorHandledMutation, ServerResponse } from '@/hooks/error/useErrorHandledMutation';
import { 
  testConnection, 
  getBoard, 
  findPotentialVisitsToImport, 
  importSelectedVisits,
  ImportItem
} from '@/app/actions/integrations/monday';
import type { 
  MondayBoard,
  MondayConnectionTestResult,
  ImportPreview,
  ImportResult,
} from '@/lib/integrations/monday/types';

/**
 * Interface for the return value of the hook
 */
interface UseMondayIntegrationResult {
  // Connection
  connectionStatus: 'unknown' | 'connected' | 'error';
  connectionData: { name?: string; email?: string } | null;
  connectionError: string | null;
  testConnection: () => Promise<ServerResponse<MondayConnectionTestResult['data']>>;
  
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
 * A hook for interacting with the Monday.com integration
 * Provides methods for testing connections, fetching boards, and importing items
 */
export function useMondayIntegration(): UseMondayIntegrationResult {
  // Connection state
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [connectionData, setConnectionData] = useState<{ name?: string; email?: string } | null>(null);
  
  // Board state
  const [board, setBoard] = useState<MondayBoard | null>(null);
  
  // Preview state
  const [previewItems, setPreviewItems] = useState<ImportPreview[] | null>(null);
  
  // Import state
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  
  // Connection mutation
  const { 
    mutate: mutateTestConnection, 
    isLoading: _connectionLoading, 
    error: connectionError 
  } = useErrorHandledMutation<MondayConnectionTestResult['data'], []>(
    testConnection,
    { 
      errorContext: "MondayConnection",
      defaultErrorMessage: "Failed to connect to Monday.com"
    }
  );
  
  // Board mutation
  const { 
    mutate: mutateGetBoard, 
    isLoading: boardLoading, 
    error: boardError 
  } = useErrorHandledMutation<MondayBoard, [string, number?]>(
    getBoard,
    { 
      errorContext: "MondayBoard",
      defaultErrorMessage: "Failed to fetch Monday.com board"
    }
  );
  
  // Find items mutation
  // We need to wrap findPotentialVisitsToImport to ensure it returns the expected ServerResponse format
  const findItemsWrapper = useCallback(async (boardId: string): Promise<ServerResponse<ImportPreview[]>> => {
    try {
      const items = await findPotentialVisitsToImport(boardId);
      return { success: true, data: items };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  }, []);
  
  const { 
    mutate: mutateFindItems, 
    isLoading: previewLoading, 
    error: previewError 
  } = useErrorHandledMutation<ImportPreview[], [string]>(
    findItemsWrapper,
    { 
      errorContext: "MondayPreview",
      defaultErrorMessage: "Failed to find items to import"
    }
  );
  
  // Import mutation
  // Wrap importSelectedVisits to ensure it returns the expected ServerResponse format
  const importItemsWrapper = useCallback(async (selectedItems: string[] | ImportItem[]): Promise<ServerResponse<ImportResult>> => {
    try {
      const result = await importSelectedVisits(selectedItems);
      return { 
        success: result.success, 
        message: result.message,
        data: result 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  }, []);
  
  const { 
    mutate: mutateImportItems, 
    isLoading: importing, 
    error: importError 
  } = useErrorHandledMutation<ImportResult, [string[] | ImportItem[]]>(
    importItemsWrapper,
    { 
      errorContext: "MondayImport",
      defaultErrorMessage: "Failed to import items from Monday.com"
    }
  );
  
  // Test connection
  const handleTestConnection = useCallback(async () => {
    const result = await mutateTestConnection();
    
    if (result?.success) {
      setConnectionStatus('connected');
      if (result.data) {
        setConnectionData(result.data);
      }
    } else {
      setConnectionStatus('error');
      setConnectionData(null);
    }
    
    return result;
  }, [mutateTestConnection]);
  
  // Fetch board
  const handleGetBoard = useCallback(async (boardId: string, itemLimit?: number) => {
    const result = await mutateGetBoard(boardId, itemLimit);
    
    if (result?.success && result?.data) {
      setBoard(result.data);
    } else {
      setBoard(null);
    }
    
    return result;
  }, [mutateGetBoard]);
  
  // Find items to import
  const handleFindItems = useCallback(async (boardId: string) => {
    const result = await mutateFindItems(boardId);
    
    if (result?.success && result?.data) {
      setPreviewItems(result.data);
    } else {
      setPreviewItems(null);
    }
    
    return result;
  }, [mutateFindItems]);
  
  // Import items
  const handleImportItems = useCallback(async (selectedItems: string[] | ImportItem[]) => {
    const result = await mutateImportItems(selectedItems);
    
    if (result?.success && result?.data) {
      setImportResult(result.data);
    } else {
      setImportResult(null);
    }
    
    return result;
  }, [mutateImportItems]);
  
  return {
    // Connection
    connectionStatus,
    connectionData,
    connectionError,
    testConnection: handleTestConnection,
    
    // Board operations
    board,
    boardLoading,
    boardError,
    getBoard: handleGetBoard,
    
    // Import operations
    previewItems,
    previewLoading,
    previewError,
    findItemsToImport: handleFindItems,
    
    // Import execution
    importResult,
    importing,
    importError,
    importItems: handleImportItems
  };
}