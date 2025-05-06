'use client';

/**
 * Monday Import Context
 * 
 * Provides state management for the Monday.com import process
 * with a clear separation between UI state and data fetching.
 */
import React, { createContext, useContext, useState, useCallback, ReactNode, useRef, useEffect, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMondayConnection, useMondayBoards, useMondayPreviews, useMondayImport } from './useMondayQueries';

// Type imports
import type { ImportPreview } from '@/lib/integrations/monday/types/import';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Define types for selected items and filters
export interface SelectedItem {
  id: string;
  name: string;
  date?: string;
  school?: string;
  coach?: string;
  isDuplicate?: boolean;
  valid?: boolean;
  owners?: string[];
  [key: string]: unknown;
}

interface MondayFilters {
  searchTerm: string;
  showDuplicates: boolean;
  showInvalid: boolean;
  selectedOwners: string[];
}

// STATE CONTEXT
// -------------

interface MondayStateContextType {
  // Board selection
  selectedBoardId: string | null;
  setSelectedBoardId: (id: string | null) => void;
  
  // Item selection
  selectedItems: SelectedItem[];
  selectItem: (item: SelectedItem) => void;
  deselectItem: (id: string) => void;
  selectMultipleItems: (items: SelectedItem[]) => void;
  clearSelection: () => void;
  
  // Filters
  filters: MondayFilters;
  updateFilter: <K extends keyof MondayFilters>(key: K, value: MondayFilters[K]) => void;
  
  // Import tracking
  importingItemIds: string[];
  setImportingItemIds: (ids: string[]) => void;
  
  // UI state
  previewOpen: boolean;
  setPreviewOpen: (open: boolean) => void;
}

const MondayStateContext = createContext<MondayStateContextType | null>(null);

// STATE PROVIDER
// -------------

function MondayStateProvider({ children }: { children: ReactNode }) {
  // Board selection state
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  
  // Selected items state
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  
  // Filter state
  const [filters, setFilters] = useState<MondayFilters>({
    searchTerm: '',
    showDuplicates: true,
    showInvalid: true,
    selectedOwners: []
  });
  
  // Import tracking state
  const [importingItemIds, setImportingItemIds] = useState<string[]>([]);
  
  // UI state
  const [previewOpen, setPreviewOpen] = useState(false);
  
  // Item selection handlers - memoize all callbacks
  const selectItem = useCallback((item: SelectedItem) => {
    setSelectedItems(prev => {
      if (prev.some(i => i.id === item.id)) return prev;
      return [...prev, item];
    });
  }, []);
  
  const deselectItem = useCallback((id: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== id));
  }, []);
  
  const selectMultipleItems = useCallback((items: SelectedItem[]) => {
    setSelectedItems(prev => {
      const currentIds = new Set(prev.map(item => item.id));
      const newItems = items.filter(item => !currentIds.has(item.id));
      return [...prev, ...newItems];
    });
  }, []);
  
  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);
  
  // Filter handler
  const updateFilter = useCallback(<K extends keyof MondayFilters>(
    key: K,
    value: MondayFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);
  
  // Create the context value using useMemo to prevent unnecessary re-renders
  const stateValue = useMemo(() => ({
    selectedBoardId,
    setSelectedBoardId,
    selectedItems,
    selectItem,
    deselectItem,
    selectMultipleItems,
    clearSelection,
    filters,
    updateFilter,
    importingItemIds,
    setImportingItemIds,
    previewOpen,
    setPreviewOpen
  }), [
    selectedBoardId, 
    selectedItems, 
    filters, 
    importingItemIds, 
    previewOpen,
    selectItem,
    deselectItem,
    selectMultipleItems,
    clearSelection,
    updateFilter,
    setImportingItemIds,
    setPreviewOpen
  ]);
  
  return (
    <MondayStateContext.Provider value={stateValue}>
      {children}
    </MondayStateContext.Provider>
  );
}

// QUERY CONTEXT
// -------------

interface MondayQueryContextType {
  // Connection data
  connectionData: {
    success?: boolean;
    accountId?: string;
    accountName?: string;
    email?: string;
    error?: string;
  } | null | undefined;
  connectionLoading: boolean;
  connectionError: string | null;
  refetchConnection: () => Promise<unknown>;
  
  // Boards data
  boards: {
    id: string;
    name: string;
  }[];
  boardsLoading: boolean;
  boardsError: string | null;
  refetchBoards: () => Promise<unknown>;
  
  // Previews data
  previews: SelectedItem[];
  filteredPreviews: SelectedItem[];
  previewsLoading: boolean;
  previewsError: string | null;
  refetchPreviews: () => Promise<unknown>;
  
  // Import action
  importSelectedItems: () => Promise<{
    success: boolean;
    data?: unknown;
    error?: string;
  }>;
  importLoading: boolean;
  importError: string | null;
  importResult: unknown;
}

const MondayQueryContext = createContext<MondayQueryContextType | null>(null);

// QUERY PROVIDER
// -------------

function MondayQueryProvider({ children }: { children: ReactNode }) {
  // Get the state context
  const stateContext = useContext(MondayStateContext);
  
  if (!stateContext) {
    throw new Error('MondayQueryProvider must be used within a MondayStateProvider');
  }
  
  // Create stable references to avoid re-renders
  const stateRef = useRef(stateContext);
  
  // Update the ref on each render to keep it current
  useEffect(() => {
    stateRef.current = stateContext;
  }, [stateContext]);
  
  // Extract primitive values from context to use as dependencies
  const selectedBoardId = stateContext.selectedBoardId;
  const searchTerm = stateContext.filters.searchTerm;
  const showDuplicates = stateContext.filters.showDuplicates;
  const showInvalid = stateContext.filters.showInvalid;
  const selectedOwnersCount = stateContext.filters.selectedOwners.length;
  const selectedOwners = stateContext.filters.selectedOwners;
  const selectedItems = stateContext.selectedItems;
  
  // Initialize React Query hooks with primitive dependencies
  const connectionQuery = useMondayConnection();
  const boardsQuery = useMondayBoards();
  const previewsQuery = useMondayPreviews(selectedBoardId);
  const importMutation = useMondayImport();
  
  // Store filtered previews in a ref to break render cycle
  const filteredPreviewsRef = useRef<SelectedItem[]>([]);
  
  // Update filtered previews in an effect, not during render
  useEffect(() => {
    if (!previewsQuery.data) {
      filteredPreviewsRef.current = [];
      return;
    }
    
    // Transform ImportPreview[] to SelectedItem[] and apply filters
    filteredPreviewsRef.current = previewsQuery.data
      .map((preview: ImportPreview) => {
        // Extract relevant fields from the transformed data
        const transformedData = preview.transformed || {};
        
        // Create a SelectedItem from the preview
        const item: SelectedItem = {
          id: String(transformedData.id || ''),
          name: String(transformedData.name || transformedData.title || `Item ${transformedData.id || ''}`),
          date: transformedData.date as string | undefined,
          school: transformedData.school as string | undefined,
          coach: transformedData.coach as string | undefined,
          isDuplicate: preview.isDuplicate,
          valid: preview.valid,
          owners: (transformedData.owners || []) as string[],
          // Include other properties for reference
          original: preview.original,
          transformed: preview.transformed,
          errors: preview.errors,
          missingRequired: preview.missingRequired
        };
        
        return item;
      })
      .filter(preview => {
        // Search term filter
        const matchesSearch = searchTerm 
          ? preview.name.toLowerCase().includes(searchTerm.toLowerCase())
          : true;
        
        // Duplicate filter
        const matchesDuplicate = !preview.isDuplicate || showDuplicates;
        
        // Validity filter
        const matchesValid = preview.valid !== false || showInvalid;
        
        // Owner filter
        const matchesOwner = selectedOwnersCount === 0 || 
          (Array.isArray(preview.owners) && preview.owners.some((owner: string) => 
            selectedOwners.includes(owner)
          ));
        
        return matchesSearch && matchesDuplicate && matchesValid && matchesOwner;
      });
  }, [
    previewsQuery.data, 
    searchTerm,
    showDuplicates,
    showInvalid,
    selectedOwnersCount,
    selectedOwners
  ]);
  
  // Create stable import function
  const importFunc = useCallback(async () => {
    if (!selectedBoardId || selectedItems.length === 0) {
      return { success: false, error: 'No items selected for import' };
    }
    
    try {
      stateRef.current.setImportingItemIds(selectedItems.map(item => item.id));
      
      const ids = selectedItems.map(item => item.id);
      const result = await importMutation.mutateAsync({ 
        ids, 
        boardId: selectedBoardId 
      });
      
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Import failed' 
      };
    } finally {
      stateRef.current.setImportingItemIds([]);
    }
  }, [importMutation, selectedBoardId, selectedItems]);
  
  // Create the query context value ONCE using useMemo
  const queryValue = useMemo(() => {
    // Map previews to SelectedItem format if data exists
    const mappedPreviews: SelectedItem[] = previewsQuery.data 
      ? previewsQuery.data.map((preview: ImportPreview) => {
          // Extract relevant fields from the transformed data
          const transformedData = preview.transformed || {};
          
          // Create a SelectedItem from the preview
          return {
            id: String(transformedData.id || ''),
            name: String(transformedData.name || transformedData.title || `Item ${transformedData.id || ''}`),
            date: transformedData.date as string | undefined,
            school: transformedData.school as string | undefined,
            coach: transformedData.coach as string | undefined,
            isDuplicate: preview.isDuplicate,
            valid: preview.valid,
            owners: (transformedData.owners || []) as string[],
            // Include other properties for reference
            original: preview.original,
            transformed: preview.transformed,
            errors: preview.errors,
            missingRequired: preview.missingRequired
          };
        })
      : [];

    return {
      // Connection data
      connectionData: connectionQuery.data,
      connectionLoading: connectionQuery.isLoading,
      connectionError: connectionQuery.error?.message || null,
      refetchConnection: connectionQuery.refetch,
      
      // Boards data
      boards: boardsQuery.data || [],
      boardsLoading: boardsQuery.isLoading,
      boardsError: boardsQuery.error?.message || null,
      refetchBoards: boardsQuery.refetch,
      
      // Previews data
      previews: mappedPreviews,
      filteredPreviews: filteredPreviewsRef.current,
      previewsLoading: previewsQuery.isLoading,
      previewsError: previewsQuery.error?.message || null,
      refetchPreviews: previewsQuery.refetch,
      
      // Import action
      importSelectedItems: importFunc,
      importLoading: importMutation.isPending,
      importError: importMutation.error?.message || null,
      importResult: importMutation.data
    };
  }, [
    connectionQuery.data,
    connectionQuery.isLoading,
    connectionQuery.error,
    connectionQuery.refetch,
    boardsQuery.data,
    boardsQuery.isLoading,
    boardsQuery.error,
    boardsQuery.refetch,
    previewsQuery.data,
    previewsQuery.isLoading,
    previewsQuery.error,
    previewsQuery.refetch,
    importFunc,
    importMutation.isPending,
    importMutation.error,
    importMutation.data,
    filteredPreviewsRef.current
  ]);
  
  return (
    <MondayQueryContext.Provider value={queryValue}>
      {children}
    </MondayQueryContext.Provider>
  );
}

// COMBINED PROVIDER
// ----------------

export const MondayImportProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <MondayStateProvider>
        <MondayQueryProvider>
          {children}
        </MondayQueryProvider>
      </MondayStateProvider>
    </QueryClientProvider>
  );
};

// HOOKS
// -----

export function useMondayState() {
  const context = useContext(MondayStateContext);
  
  if (!context) {
    console.error('MondayStateContext not found. Component hierarchy:', 
      new Error().stack?.split('\n').slice(1).join('\n'));
    throw new Error(
      'useMondayState must be used within a MondayStateProvider. ' +
      'Please wrap your component with MondayImportProvider.'
    );
  }
  
  return context;
}

export function useMondayQueries() {
  const context = useContext(MondayQueryContext);
  
  if (!context) {
    console.error('MondayQueryContext not found. Component hierarchy:', 
      new Error().stack?.split('\n').slice(1).join('\n'));
    throw new Error(
      'useMondayQueries must be used within a MondayQueryProvider. ' +
      'Please wrap your component with MondayImportProvider.'
    );
  }
  
  return context;
}

// COMBINED HOOK (for backward compatibility)
// -----------------------------------------

export function useMondayImportContext() {
  try {
    const stateContext = useMondayState();
    const queryContext = useMondayQueries();
    
    return {
      ...stateContext,
      ...queryContext
    };
  } catch (error) {
    // Log details to help with debugging
    console.error('Error in useMondayImportContext:', error);
    console.error('Component hierarchy:', 
      new Error().stack?.split('\n').slice(1).join('\n'));
    
    throw new Error(
      'useMondayImportContext must be used within a MondayImportProvider. ' +
      'Please wrap your component with MondayImportProvider.'
    );
  }
}

// Specialized hooks for convenience
export function useMondaySelection() {
  try {
    const { 
      selectedItems, 
      selectItem, 
      deselectItem, 
      selectMultipleItems, 
      clearSelection 
    } = useMondayState();
    
    return {
      selectedItems,
      selectItem,
      deselectItem,
      selectMultipleItems,
      clearSelection,
      hasSelection: selectedItems.length > 0,
      selectionCount: selectedItems.length
    };
  } catch (error) {
    console.error('Error in useMondaySelection:', error);
    throw new Error(
      'useMondaySelection must be used within a MondayImportProvider. ' +
      'Please wrap your component with MondayImportProvider.'
    );
  }
}

export function useMondayFilters() {
  try {
    const { filters, updateFilter } = useMondayState();
    
    return {
      filters,
      updateFilter,
      resetFilters: () => {
        updateFilter('searchTerm', '');
        updateFilter('showDuplicates', true);
        updateFilter('showInvalid', true);
        updateFilter('selectedOwners', []);
      }
    };
  } catch (error) {
    console.error('Error in useMondayFilters:', error);
    throw new Error(
      'useMondayFilters must be used within a MondayImportProvider. ' +
      'Please wrap your component with MondayImportProvider.'
    );
  }
} 