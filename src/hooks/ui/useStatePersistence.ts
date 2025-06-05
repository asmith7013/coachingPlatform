import { useState, useCallback, useRef, useEffect } from 'react';

// Debounce delay for auto-save (3 seconds)
const AUTO_SAVE_DELAY = 3000;

interface PersistableUIState {
  [key: string]: unknown;
}

/**
 * Simplified state persistence hook focused on UI concerns
 * Handles local storage and basic save/load operations
 * Complex server operations moved to domain hooks
 */
export function useStatePersistence() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Refs for debounced operations
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingStateRef = useRef<PersistableUIState | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Simple localStorage save
  const saveToLocalStorage = useCallback((key: string, state: PersistableUIState) => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
      return true;
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
      return false;
    }
  }, []);

  // Simple localStorage load
  const loadFromLocalStorage = useCallback((key: string): PersistableUIState | null => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return null;
    }
  }, []);

  // Generic save function for UI state
  const saveState = useCallback(async (state: PersistableUIState, key = 'ui-state') => {
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const success = saveToLocalStorage(key, state);
      
      if (success) {
        return { success: true };
      } else {
        throw new Error('Failed to save to localStorage');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setSaveError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSaving(false);
    }
  }, [saveToLocalStorage]);

  // Debounced auto-save function
  const autoSaveState = useCallback((state: PersistableUIState, key = 'ui-state') => {
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Store pending state
    pendingStateRef.current = state;
    
    // Set new timeout for debounced save
    autoSaveTimeoutRef.current = setTimeout(async () => {
      if (pendingStateRef.current) {
        await saveState(pendingStateRef.current, key);
        pendingStateRef.current = null;
      }
    }, AUTO_SAVE_DELAY);
  }, [saveState]);

  // Load state function
  const loadState = useCallback(async (key = 'ui-state') => {
    setIsLoading(true);
    setSaveError(null);
    
    try {
      const state = loadFromLocalStorage(key);
      
      if (state) {
        return { success: true, data: state };
      } else {
        return { success: false, error: 'No saved state found' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setSaveError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [loadFromLocalStorage]);

  // Clear localStorage
  const clearSavedState = useCallback((key = 'ui-state') => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
      return false;
    }
  }, []);

  // Clear save error
  const clearSaveError = useCallback(() => {
    setSaveError(null);
  }, []);

  return {
    // Loading states
    isLoading,
    isSaving,
    isAutoSaving: isSaving && pendingStateRef.current !== null,
    
    // Core operations
    saveState,
    autoSaveState,
    loadState,
    clearSavedState,
    
    // Direct localStorage access
    saveToLocalStorage,
    loadFromLocalStorage,
    
    // Error handling
    saveError,
    clearSaveError,
  };
} 