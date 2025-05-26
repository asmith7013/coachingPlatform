'use client';

/**
 * Monday Visit Selector Component
 * 
 * Allows users to view, filter, and select visits to import from Monday.com.
 * Uses React Query for data fetching and context for state management.
 */
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@components/core/Button';
import { Card } from '@components/composed/cards';
import { Input } from '@components/core/fields';
import { Alert } from '@components/core/feedback';
import { Checkbox } from '@components/core/fields';
import { Spinner } from '@components/core/feedback';
import { Heading, Text } from '@components/core/typography';
import { useMondayImportContext, useMondayFilters } from '@hooks/integrations/monday/MondayImportContext';
import type { VisitInput } from '@zod-schema/visits/visit';
import { VisitImportItem } from '@lib/integrations/monday/types/import';

interface VisitSelectorProps {
  boardId: string;
  onImportComplete: (visitData: Partial<VisitInput>, missingFieldsList: string[]) => void;
}

export function MondayVisitsSelector({ boardId }: VisitSelectorProps) {
  const router = useRouter();
  
  // Get data and state from context
  const { 
    // Board selection
    setSelectedBoardId,
    
    // Preview data
    filteredPreviews,
    previewsLoading, 
    previewsError,
    
    // Selection
    selectedItems,
    selectItem,
    deselectItem,
    selectMultipleItems,
    clearSelection,
    
    // Import
    importSelectedItems,
    importLoading
  } = useMondayImportContext();
  
  // Filters
  const { filters, updateFilter, resetFilters } = useMondayFilters();
  
  // Set board ID to context on component mount
  useEffect(() => {
    if (boardId) {
      setSelectedBoardId(boardId);
    }
    
    return () => {
      // Clear selection when unmounting
      clearSelection();
    };
  }, [boardId, setSelectedBoardId, clearSelection]);
  
  // Handle preview check/uncheck
  const togglePreviewSelection = (preview: VisitImportItem) => {
    if (selectedItems.some(item => item.id === preview.id)) {
      deselectItem(preview.id);
    } else {
      selectItem(preview);
    }
  };
  
  // Handle importing the selected previews
  const handleImport = async () => {
    try {
      console.log('Starting import of selected items:', selectedItems);
      
      // Log critical fields in selected items before import
      selectedItems.forEach(item => {
        console.log('Selected item critical fields before import:', {
          id: item.id,
          date: item.date,
          school: item.school,
          coach: item.coach,
        });
      });
      
      const result = await importSelectedItems();
      
      if (result.success && result.data) {
        // Cast the result.data to the expected type
        const importData = result.data as {
          visitData?: Record<string, unknown>;
          missingFields?: string[];
        };
        
        const visitData = importData.visitData || {};
        const missingFields = importData.missingFields || [];
        
        // Ensure critical fields are included with empty string fallbacks
        const processedVisitData = {
          ...visitData,
          date: visitData.date || '',
          school: visitData.school || '',
          coach: visitData.coach || '',
        };
        
        // Log the data that will be passed to the URL
        console.log('Import successful, processed visit data:', processedVisitData);
        console.log('Missing fields:', missingFields);
        
        // Create URL parameters
        const params = new URLSearchParams();
        
        // Add visit data as JSON
        params.set('visitData', JSON.stringify(processedVisitData));
        
        // Add missing fields array as JSON
        if (missingFields && missingFields.length > 0) {
          params.set('missingFields', JSON.stringify(missingFields));
        }
        
        // Add board ID
        params.set('boardId', boardId);
        
        // Navigate to the completion page
        router.push(`/integrations/monday/visits/import/complete?${params.toString()}`);
      } else {
        console.error('Import failed:', result.error);
      }
    } catch (error) {
      console.error('Error during import:', error);
    }
  };
  
  // Select/deselect all visible items
  const toggleSelectAll = () => {
    if (selectedItems.length === filteredPreviews.length) {
      clearSelection();
    } else {
      selectMultipleItems(filteredPreviews);
    }
  };
  
  // Render loading state
  if (previewsLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
        <Text className="ml-3">Loading visits from Monday.com...</Text>
      </div>
    );
  }
  
  // Render error state
  if (previewsError) {
    return (
      <Alert intent="error" className="mb-4">
        <Heading level="h4">Error Loading Visits</Heading>
        <Text>{previewsError}</Text>
      </Alert>
    );
  }
  
  // No visits found
  if (filteredPreviews.length === 0) {
    return (
      <Alert intent="info" className="mb-4">
        <Heading level="h4">No Visits Found</Heading>
        <Text>
          No visits were found on this Monday.com board. Please select a different board
          or make sure your Monday.com board has data.
        </Text>
      </Alert>
    );
  }
  
  // Render visits selector
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 mb-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search visits..."
            value={filters.searchTerm}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
          />
        </div>
        
        {/* Filter toggles */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <Checkbox 
              checked={filters.showDuplicates} 
              onChange={(e) => updateFilter('showDuplicates', e.target.checked)}
            />
            <span>Show Duplicates</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <Checkbox 
              checked={filters.showInvalid} 
              onChange={(e) => updateFilter('showInvalid', e.target.checked)}
            />
            <span>Show Invalid</span>
          </label>
        </div>
        
        {/* Reset filters */}
        <Button intent="secondary" onClick={resetFilters}>
          Reset Filters
        </Button>
      </div>
      
      {/* Selection controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={selectedItems.length === filteredPreviews.length && filteredPreviews.length > 0}
            onChange={toggleSelectAll}
          />
          <Text>
            {selectedItems.length} of {filteredPreviews.length} selected
          </Text>
        </div>
        
        <Button 
          intent="primary"
          disabled={selectedItems.length === 0 || importLoading}
          onClick={handleImport}
        >
          {importLoading ? <Spinner size="sm" className="mr-2" /> : null}
          Import Selected ({selectedItems.length})
        </Button>
      </div>
      
      {/* Visit list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPreviews.map((preview) => (
          <Card key={preview.id} className={`p-4 ${
            preview.isDuplicate ? 'border-amber-300' : 
            !preview.isValid ? 'border-red-300' : 'border-gray-200'
          }`}>
            <div className="flex items-start">
              <Checkbox
                className="mt-1 mr-3"
                checked={selectedItems.some(item => item.id === preview.id)}
                onChange={() => togglePreviewSelection(preview)}
                aria-label={`Select ${preview.name}`}
              />
              
              <div className="flex-1 min-w-0">
                <Heading level="h4" className="mb-1 truncate">{preview.name}</Heading>
                
                <div className="space-y-1 text-sm">
                  <div className="flex items-center">
                    <span className="font-medium w-16">Date:</span>
                    <span>{preview.date || 'Not set'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-medium w-16">School:</span>
                    <span>{preview.school || 'Not set'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-medium w-16">Coach:</span>
                    <span>{preview.coach || 'Not set'}</span>
                  </div>
                  
                  {/* {preview.isDuplicate && (
                    <div className="mt-2">
                      <Text textSize="sm" className="text-amber-600">
                        Possible duplicate
                      </Text>
                    </div>
                  )} */}
                  
                  {!preview.isValid && (
                    <div className="mt-2">
                      <Text textSize="sm" className="text-red-600">
                        Missing required data
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 
