'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/core/Button';
import { MondayItemPreviewCard } from '@/components/integrations/monday/domain/visits/MondayItemPreviewCard';
import { Input } from '@/components/core/fields/Input';
import { Checkbox } from '@/components/core/fields/Checkbox';
import { Badge } from '@/components/core/feedback/Badge';
import { Alert } from '@/components/core/feedback/Alert';
import { Spinner } from '@/components/core/feedback/Spinner';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { ImportPreview } from '@/lib/integrations/monday/types';
import { findPotentialVisitsToImport } from '@/app/actions/integrations/monday';
import type { VisitInput } from '@/lib/data-schema/zod-schema/visits/visit';

interface MondayVisitsSelectorProps {
  boardId: string;
  onImportComplete: (visit: Partial<VisitInput>, missingFields: string[]) => void;
}

export function MondayVisitsSelector({ 
  boardId, 
  onImportComplete 
}: MondayVisitsSelectorProps) {
  // Data states
  const [previews, setPreviews] = useState<ImportPreview[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Control state - only load when explicitly requested
  const [shouldLoad, setShouldLoad] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    showDuplicates: true,
    showInvalid: true,
    searchTerm: ""
  });
  
  // Track owner selections for items that need them
  const [selectedOwners, setSelectedOwners] = useState<Record<string, string>>({});
  
  // Load potential visits - only when shouldLoad is true
  useEffect(() => {
    async function loadPreviews() {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!boardId) {
          setError("Board ID is required");
          setIsLoading(false);
          return;
        }
        
        const items = await findPotentialVisitsToImport(boardId);
        setPreviews(items);
        
        // Auto-select valid, non-duplicate items
        const validIds = items
          .filter(item => item.valid && !item.isDuplicate)
          .map(item => item.original.id as string);
        
        setSelectedIds(validIds);
      } catch (err) {
        console.error("Error loading previews:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    }
    
    // Only load when explicitly requested
    if (shouldLoad && boardId) {
      loadPreviews();
    }
  }, [boardId, shouldLoad]);
  
  // Reset load state when board changes
  useEffect(() => {
    setShouldLoad(false);
    setPreviews([]);
    setSelectedIds([]);
    setError(null);
    setSelectedOwners({});
  }, [boardId]);
  
  // Filter previews based on current filters
  const filteredPreviews = useMemo(() => {
    return previews.filter(preview => {
      // Filter by search term (in name or transformed fields)
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const nameMatch = (preview.original.name as string)?.toLowerCase().includes(searchLower);
        const schoolMatch = preview.transformed.school?.toString().toLowerCase().includes(searchLower);
        const coachMatch = preview.transformed.coach?.toString().toLowerCase().includes(searchLower);
        
        if (!nameMatch && !schoolMatch && !coachMatch) {
          return false;
        }
      }
      
      // Filter by duplicate status
      if (!filters.showDuplicates && preview.isDuplicate) {
        return false;
      }
      
      // Filter by validity
      if (!filters.showInvalid && !preview.valid) {
        return false;
      }
      
      return true;
    });
  }, [previews, filters]);
  
  // Selection statistics
  const stats = useMemo(() => {
    const total = filteredPreviews.length;
    const selected = selectedIds.length;
    const valid = filteredPreviews.filter(p => p.valid).length;
    const invalid = filteredPreviews.filter(p => !p.valid).length;
    const duplicates = filteredPreviews.filter(p => p.isDuplicate).length;
    const needOwner = filteredPreviews.filter(p => 
      p.missingRequired.includes('owners') && 
      p.missingRequired.length === 1
    ).length;
    
    // Count items with auto-assigned owners (coach assigned as owner)
    const autoAssignedOwners = filteredPreviews.filter(p => 
      p.transformed.coach && 
      Array.isArray(p.transformed.owners) &&
      p.transformed.owners.length === 1 && 
      p.transformed.owners[0] === p.transformed.coach
    ).length;
    
    return { 
      total, 
      selected, 
      valid, 
      invalid, 
      duplicates, 
      needOwner,
      autoAssignedOwners 
    };
  }, [filteredPreviews, selectedIds]);
  
  // Handle owner selection
  const handleOwnerSelected = (itemId: string, ownerId: string) => {
    // Store the selected owner
    setSelectedOwners(prev => ({
      ...prev,
      [itemId]: ownerId
    }));
    
    // Update the preview to mark it as valid now
    setPreviews(prev => 
      prev.map(preview => {
        if (preview.original.id === itemId) {
          // Check if this is the only missing required field
          const onlyMissingOwners = 
            preview.missingRequired.length === 1 && 
            preview.missingRequired[0] === 'owners';
          
          if (onlyMissingOwners) {
            // Add the owner to the transformed data
            const updatedTransformed = {
              ...preview.transformed,
              owners: [ownerId]
            };
            
            // Create a copy without 'owners' in missingRequired
            const updatedMissingRequired: string[] = [];
            
            // Remove the corresponding error
            const updatedErrors = { ...preview.errors };
            delete updatedErrors.owners;
            
            return {
              ...preview,
              transformed: updatedTransformed,
              valid: true,
              missingRequired: updatedMissingRequired,
              errors: updatedErrors
            };
          }
        }
        return preview;
      })
    );
    
    // Auto-select this item if it's now valid
    if (!selectedIds.includes(itemId)) {
      setSelectedIds(prev => [...prev, itemId]);
    }
  };
  
  // Bulk selection methods
  const handleSelectAll = () => {
    // Include both valid items and items that only need an owner selection
    const selectableIds = filteredPreviews
      .filter(item => 
        item.valid || 
        (item.missingRequired.length === 1 && item.missingRequired[0] === 'owners')
      )
      .map(item => item.original.id as string);
    
    setSelectedIds(selectableIds);
  };
  
  const handleDeselectAll = () => {
    setSelectedIds([]);
  };
  
  // Handle filter changes
  const handleFilterChange = (key: keyof typeof filters, value: boolean | string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  // Load board items
  const handleLoadBoard = () => {
    setShouldLoad(true);
  };
  
  // Retry after error
  const handleRetry = () => {
    setError(null);
    setShouldLoad(true);
  };
  
  // Import selected items - Updated to work with the parent component
  const handleImport = async () => {
    try {
      setImporting(true);
      setError(null);
      
      // Get the selected item
      const selectedId = selectedIds[0]; // For now, handle one at a time
      const preview = previews.find(p => p.original.id === selectedId);
      
      if (!preview) {
        throw new Error("Selected item not found");
      }
      
      // Prepare the visit data with any owner selections
      const visitData = { ...preview.transformed };
      
      // If we have a selected owner for this item, include it
      if (selectedOwners[selectedId]) {
        visitData.owners = [selectedOwners[selectedId]];
      }
      
      // Pass to parent with missing required fields (excluding owners if selected)
      const missingFields = [...preview.missingRequired];
      
      // If owners were missing but we've selected one, remove from missing list
      if (missingFields.includes('owners') && selectedOwners[selectedId]) {
        const ownersIndex = missingFields.indexOf('owners');
        missingFields.splice(ownersIndex, 1);
      }
      
      // Pass to parent component to handle completion form
      onImportComplete(visitData, missingFields);
    } catch (err) {
      console.error("Error preparing import:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setImporting(false);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Header with action buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <Heading level="h2">Import Visits from Monday.com</Heading>
          <Text className="text-gray-600">
            {previews.length > 0 
              ? `Found ${previews.length} potential visits to import.`
              : "Connect to Monday.com to start importing visits."}
          </Text>
        </div>
        
        {/* Show appropriate action buttons based on state */}
        <div className="flex gap-2">
          {!shouldLoad && !previews.length && (
            <Button 
              intent="primary"
              onClick={handleLoadBoard}
              disabled={!boardId || isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Connecting...
                </>
              ) : "Connect to Monday.com"}
            </Button>
          )}
          
          {previews.length > 0 && (
            <>
              <Button 
                intent="secondary"
                onClick={handleSelectAll}
                disabled={stats.valid === 0 || importing}
              >
                Select All Valid
              </Button>
              <Button 
                intent="secondary"
                onClick={handleDeselectAll}
                disabled={selectedIds.length === 0 || importing}
              >
                Deselect All
              </Button>
              <Button 
                intent="primary" 
                onClick={handleImport}
                disabled={importing || selectedIds.length !== 1}
              >
                {importing ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Importing...
                  </>
                ) : "Continue with Selected"}
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Alerts and progress */}
      {error && (
        <Alert intent="error" className="mb-4">
          <Alert.Title>Error</Alert.Title>
          <Alert.Description>
            {error}
            <div className="mt-2">
              <Button 
                intent="secondary" 
                textSize="sm"
                padding="sm"
                onClick={handleRetry}
              >
                Retry
              </Button>
            </div>
          </Alert.Description>
        </Alert>
      )}
      
      {/* Loading indicator */}
      {isLoading && !error && (
        <div className="text-center py-12">
          <Spinner size="lg" />
          <Text className="mt-2">
            {!previews.length 
              ? "Connecting to Monday.com..." 
              : "Loading potential visits to import..."}
          </Text>
        </div>
      )}
      
      {/* Only show filters and items when loaded and have items */}
      {shouldLoad && previews.length > 0 && !isLoading && !error && (
        <>
          {/* Filters */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <Input
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  placeholder="Search by name, school, or coach..."
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={filters.showDuplicates}
                    onChange={(e) => handleFilterChange('showDuplicates', e.target.checked)}
                  />
                  <span>Show Duplicates</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={filters.showInvalid}
                    onChange={(e) => handleFilterChange('showInvalid', e.target.checked)}
                  />
                  <span>Show Invalid</span>
                </label>
              </div>
            </div>
            
            {/* Filter stats */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge intent="primary">
                {stats.total} Items
              </Badge>
              <Badge intent="success">
                {stats.valid} Valid
              </Badge>
              {stats.invalid > 0 && (
                <Badge intent="danger">
                  {stats.invalid} Invalid
                </Badge>
              )}
              {stats.duplicates > 0 && (
                <Badge intent="warning">
                  {stats.duplicates} Duplicates
                </Badge>
              )}
              {stats.needOwner > 0 && (
                <Badge intent="warning">
                  {stats.needOwner} Need Owner
                </Badge>
              )}
              {stats.autoAssignedOwners > 0 && (
                <Badge intent="info">
                  {stats.autoAssignedOwners} Auto-Assigned Owners
                </Badge>
              )}
              <Badge intent="secondary">
                {selectedIds.length} Selected
              </Badge>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg mb-4 border border-yellow-200">
            <Text className="text-yellow-800 font-medium">
              Please select one item at a time to import.
            </Text>
          </div>
          
          {/* Items list */}
          {filteredPreviews.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Text>No items found{filters.searchTerm ? " matching your search" : " to import from this board"}.</Text>
              {filters.searchTerm && (
                <Button
                  intent="secondary"
                  className="mt-4"
                  onClick={() => handleFilterChange('searchTerm', '')}
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPreviews.map(preview => (
                <MondayItemPreviewCard
                  key={preview.original.id as string}
                  preview={preview}
                  isSelected={selectedIds.includes(preview.original.id as string)}
                  onToggleSelect={(id, selected) => {
                    // Only allow one selection at a time
                    if (selected) {
                      setSelectedIds([id]);
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                  onOwnerSelected={handleOwnerSelected}
                  disabled={importing}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
} 