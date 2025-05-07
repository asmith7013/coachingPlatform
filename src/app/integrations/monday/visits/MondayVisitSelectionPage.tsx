'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/composed/cards/Card';
import { Input } from '@/components/core/fields/Input';
import { Button } from '@/components/core/Button';
import { Checkbox } from '@/components/core/fields/Checkbox';
import { Alert } from '@/components/core/feedback/Alert';
import { Spinner } from '@/components/core/feedback/Spinner';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import type { VisitInput } from '@/lib/data-schema/zod-schema/visits/visit';
import type { ImportPreview } from '@/lib/integrations/monday/types';

/**
 * Monday Visit Selection Page
 * This page allows users to select visits from Monday.com to import
 */
export default function MondayVisitSelectionPage() {
  const router = useRouter();
  
  // State
  const [boardId, setBoardId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<ImportPreview[]>([]);
  const [filteredPreviews, setFilteredPreviews] = useState<ImportPreview[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [showDuplicates, setShowDuplicates] = useState(true);
  const [showInvalid, setShowInvalid] = useState(true);
  
  // Fetch visit previews when board ID changes
  useEffect(() => {
    const fetchPreviews = async () => {
      if (!boardId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Use the API endpoint to fetch previews
        const response = await fetch(`/api/integrations/monday/visits?boardId=${boardId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch previews');
        }
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch previews');
        }
        
        // Set the previews
        setPreviews(data.items || []);
      } catch (err) {
        console.error('Error fetching previews:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only fetch if board ID is provided
    if (boardId) {
      fetchPreviews();
    }
  }, [boardId]);
  
  // Apply filters when filter state or previews change
  useEffect(() => {
    // Apply filters to previews
    const filtered = previews.filter(preview => {
      const name = preview.original?.name || '';
      const matchesSearch = searchTerm 
        ? (name as string).toLowerCase().includes(searchTerm.toLowerCase())
        : true;
        
      const matchesDuplicate = !preview.isDuplicate || showDuplicates;
      const matchesValid = preview.valid !== false || showInvalid;
      
      return matchesSearch && matchesDuplicate && matchesValid;
    });
    
    setFilteredPreviews(filtered);
  }, [previews, searchTerm, showDuplicates, showInvalid]);
  
  // Handle preview selection
  const togglePreviewSelection = useCallback((previewId: string) => {
    setSelectedItems(prev => {
      // If already selected, remove it
      if (prev.includes(previewId)) {
        return prev.filter(id => id !== previewId);
      }
      
      // Otherwise, add it
      return [...prev, previewId];
    });
  }, []);
  
  // Handle import initiation - UPDATED to use API endpoint
  const handleImport = useCallback(async () => {
    if (selectedItems.length === 0) {
      setError('Please select at least one visit to import');
      return;
    }
    
    setImportLoading(true);
    setError(null);
    
    try {
      // Use the API endpoint instead of direct server action
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
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Import failed');
      }
      
      // If we need to complete data for a single item
      if (result.data && result.data.visitData && result.data.missingFields) {
        // Format URL parameters
        const params = new URLSearchParams();
        params.set('visitData', JSON.stringify(result.data.visitData));
        params.set('missingFields', JSON.stringify(result.data.missingFields));
        params.set('boardId', boardId);
        
        // Navigate to the completion page
        router.push(`/integrations/monday/visits/import?${params.toString()}`);
      } else {
        // Navigate to success page with summary
        router.push('/dashboard/visits');
      }
    } catch (err) {
      console.error('Error importing visits:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setImportLoading(false);
    }
  }, [selectedItems, boardId, router]);
  
  // Toggle select all
  const toggleSelectAll = useCallback(() => {
    if (selectedItems.length === filteredPreviews.length) {
      // Deselect all
      setSelectedItems([]);
    } else {
      // Select all valid items
      setSelectedItems(
        filteredPreviews
          .filter(preview => preview.valid)
          .map(preview => preview.original.id as string)
      );
    }
  }, [filteredPreviews, selectedItems.length]);
  
  // Reset filters
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setShowDuplicates(true);
    setShowInvalid(true);
  }, []);
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <Heading level="h1">Import Visits from Monday.com</Heading>
        <Text className="text-gray-600 mt-2">
          Select visits from Monday.com to import into the system
        </Text>
      </div>
      
      {/* Board ID input */}
      <Card className="mb-6">
        <Card.Body>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monday.com Board ID
              </label>
              <Input 
                placeholder="Enter Monday.com board ID" 
                value={boardId}
                onChange={e => setBoardId(e.target.value)}
              />
            </div>
            <div>
              <Button 
                onClick={() => {
                  if (boardId) {
                    setIsLoading(true);
                    // Will trigger the useEffect
                  } else {
                    setError('Please enter a board ID');
                  }
                }}
                disabled={isLoading || !boardId}
              >
                {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
                Load Visits
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
      
      {/* Error display */}
      {error && (
        <Alert intent="error" className="mb-4">
          <Alert.Title>Error</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Alert>
      )}
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
          <div className="ml-4">Loading visits from Monday.com...</div>
        </div>
      )}
      
      {/* No visits found */}
      {!isLoading && previews.length === 0 && boardId && (
        <Alert intent="info" className="mb-4">
          <Alert.Title>No Visits Found</Alert.Title>
          <Alert.Description>
            No visits were found for this board. Please check the board ID and try again.
          </Alert.Description>
        </Alert>
      )}
      
      {/* Visit selection */}
      {!isLoading && previews.length > 0 && (
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <Card.Body>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Visits
                  </label>
                  <Input 
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-4 items-center">
                  <label className="flex items-center gap-2">
                    <Checkbox 
                      checked={showDuplicates} 
                      onChange={e => setShowDuplicates(e.target.checked)}
                    />
                    <span className="text-sm">Show Duplicates</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox 
                      checked={showInvalid} 
                      onChange={e => setShowInvalid(e.target.checked)} 
                    />
                    <span className="text-sm">Show Invalid</span>
                  </label>
                  <Button 
                    intent="secondary" 
                    textSize="sm" 
                    onClick={resetFilters}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
          
          {/* Selection controls */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={selectedItems.length > 0 && selectedItems.length === filteredPreviews.length}
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
          
          {/* Previews grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPreviews.map(preview => (
              <Card 
                key={preview.original.id as string} 
                className={`
                  p-4 border-l-4
                  ${preview.isDuplicate ? 'border-l-amber-500' : 
                    preview.valid ? 'border-l-green-500' : 'border-l-red-500'}
                `}
              >
                <div className="flex items-start gap-3">
                  <div>
                    <Checkbox 
                      checked={selectedItems.includes(preview.original.id as string)}
                      onChange={() => togglePreviewSelection(preview.original.id as string)}
                      disabled={!preview.valid && !selectedItems.includes(preview.original.id as string)}
                    />
                  </div>
                  <div className="flex-grow">
                    <Heading level="h4" className="text-lg font-medium">
                      {preview.original.name as string}
                    </Heading>
                    
                    <div className="mt-2 space-y-1">
                      <div className="text-sm">
                        <span className="font-medium">Date:</span>{' '}
                        {(preview.transformed as Partial<VisitInput>).date || 'Not set'}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">School:</span>{' '}
                        {(preview.transformed as Partial<VisitInput>).school || 'Not set'}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Coach:</span>{' '}
                        {(preview.transformed as Partial<VisitInput>).coach || 'Not set'}
                      </div>
                    </div>
                    
                    {preview.isDuplicate && (
                      <div className="mt-2">
                        <Text className="text-amber-600 text-sm">
                          Possible duplicate
                        </Text>
                      </div>
                    )}
                    
                    {!preview.valid && (
                      <div className="mt-2">
                        <Text className="text-red-600 text-sm">
                          Missing required data ({preview.missingRequired.join(', ')})
                        </Text>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}