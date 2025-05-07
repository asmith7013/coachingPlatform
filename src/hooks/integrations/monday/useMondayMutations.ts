import { useState } from 'react';
import type { 
  ImportPreview, 
  MondayImportResponse,
  MondayBoard,
  MondayUserResponse 
} from '@/lib/integrations/monday/types';
/**
 * Response type for Monday.com import operations
 */


/**
 * Hook for managing Monday.com data mutation operations
 */
export function useMondayMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Import selected visits from Monday.com
   * 
   * @param selectedItems - Array of Monday.com item IDs to import
   * @param boardId - Monday.com board ID
   * @returns Import operation result
   */
  const importVisits = async (
    selectedItems: string[], 
    boardId: string
  ): Promise<MondayImportResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/integrations/monday/visits/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          selectedItems,
          boardId 
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Import request failed');
      }
      
      if (!result.success) {
        throw new Error(result.message || 'Import operation failed');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during import';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Test connection to Monday.com
   * 
   * @returns Connection test result
   */
  const testConnection = async (): Promise<{success: boolean, message?: string}> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/integrations/monday/connection', {
        method: 'GET',
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Connection test failed');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during connection test';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get Monday.com board data
   * 
   * @param boardId - Monday.com board ID
   * @returns Board data
   */
  const getBoard = async (boardId: string): Promise<MondayBoard> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/integrations/monday/board?boardId=${boardId}`, {
        method: 'GET',
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to get board data');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error while fetching board';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Find potential visits to import from Monday.com
   * 
   * @param boardId - Monday.com board ID
   * @returns Potential visits to import
   */
  const findPotentialVisits = async (boardId: string): Promise<ImportPreview[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/integrations/monday/visits/potential?boardId=${boardId}`, {
        method: 'GET',
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to find potential visits');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error finding potential visits';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Complete visit import with missing fields
   * 
   * @param completionData - Data to complete import
   * @returns Completion result
   */
  const completeVisitImport = async (completionData: MondayImportResponse): Promise<MondayImportResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/integrations/monday/visits/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completionData),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Import completion failed');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during import completion';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get Monday.com user by email
   * 
   * @param email - User email to search for
   * @returns User information if found
   */
  const getMondayUserByEmail = async (email: string): Promise<MondayUserResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/integrations/monday/user?email=${encodeURIComponent(email)}`, {
        method: 'GET',
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to find Monday.com user');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error finding Monday.com user';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    importVisits,
    testConnection,
    getBoard,
    findPotentialVisits,
    completeVisitImport,
    getMondayUserByEmail,
    loading,
    error
  };
}

export default useMondayMutations;