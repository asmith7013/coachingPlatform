import { useState, useCallback } from 'react';
import { handleClientError } from '@error/handlers/client';
import { logError } from '@error/core/logging';
import type { VisitScheduleBuilderState } from '@zod-schema/visits/schedule-builder-state';
import { 
  saveScheduleBuilderState,
  loadScheduleBuilderState 
} from '@actions/visits/planned-visits';

/**
 * Hook for managing state persistence
 * Extracted from useVisitScheduleBuilder for better separation of concerns
 */
export function useStatePersistence() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const saveState = useCallback(async (state: VisitScheduleBuilderState) => {
    setIsSaving(true);
    try {
      const result = await saveScheduleBuilderState(state);
      if (!result.success) {
        throw new Error(result.error || 'Failed to save state');
      }
      return result;
    } catch (error) {
      const errorMessage = handleClientError(error, 'StatePersistence.saveState');
      logError(error, { 
        component: 'StatePersistence', 
        operation: 'saveState' 
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsSaving(false);
    }
  }, []);

  const loadState = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    try {
      const result = await loadScheduleBuilderState(sessionId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to load state');
      }
      return result;
    } catch (error) {
      const errorMessage = handleClientError(error, 'StatePersistence.loadState');
      logError(error, { 
        component: 'StatePersistence', 
        operation: 'loadState' 
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    isSaving,
    saveState,
    loadState
  };
} 