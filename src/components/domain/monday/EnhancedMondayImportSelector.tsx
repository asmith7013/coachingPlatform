'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/core/Button';
import { MondayItemPreviewCard } from './MondayItemPreviewCard';
import { Input } from '@/components/core/fields/Input';
import { Checkbox } from '@/components/core/fields/Checkbox';
import { Badge } from '@/components/core/feedback/Badge';
import { Alert } from '@/components/core/feedback/Alert';
import { Spinner } from '@/components/core/feedback/Spinner';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { ImportPreview, ImportResult } from '@/lib/types/domain/monday';
import { findPotentialVisitsToImport, importSelectedVisits } from '@/app/actions/integrations/monday';

interface EnhancedMondayImportSelectorProps {
  boardId: string;
  onImportComplete: () => void;
}

export function EnhancedMondayImportSelector({ 
  boardId, 
  onImportComplete 
}: EnhancedMondayImportSelectorProps) {
  // Data states
  const [previews, setPreviews] = useState<ImportPreview[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  
  // Control state - only load when explicitly requested
  const [shouldLoad, setShouldLoad] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    showDuplicates: true,
    showInvalid: true,
    searchTerm: ""
  });
  
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
    
    return { total, selected, valid, invalid, duplicates };
  }, [filteredPreviews, selectedIds]);
  
  // Toggle item selection
  const handleToggleSelect = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(itemId => itemId !== id));
    }
  };
  
  // Bulk selection methods
  const handleSelectAll = () => {
    const allValidIds = filteredPreviews
      .filter(item => item.valid)
      .map(item => item.original.id as string);
    setSelectedIds(allValidIds);
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
  
  // Import selected items
  const handleImport = async () => {
    try {
      setImporting(true);
      setError(null);
      setImportProgress(0);
      
      // Simulated progress updates (in a real implementation, you'd get actual progress)
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          const newValue = prev + Math.random() * 10;
          return newValue > 90 ? 90 : newValue; // Cap at 90% until complete
        });
      }, 200);
      
      const result = await importSelectedVisits(selectedIds);
      clearInterval(progressInterval);
      setImportProgress(100);
      setImportResult(result);
      
      if (result.success) {
        // Refresh the list to update duplicates status
        setShouldLoad(true);
        onImportComplete();
      }
    } catch (err) {
      console.error("Error importing items:", err);
      setError(err instanceof Error ? err.message : String(err));
      setImportProgress(0);
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
                disabled={importing || selectedIds.length === 0}
              >
                {importing ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Importing...
                  </>
                ) : `Import Selected (${selectedIds.length})`}
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Alerts and progress */}
      {error && (
        <Alert variant="error" className="mb-4">
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
      
      {importResult && (
        <Alert 
          variant={importResult.success ? "success" : "error"} 
          className="mb-4"
        >
          <Alert.Title>
            {importResult.success ? "Import Successful" : "Import Completed with Issues"}
          </Alert.Title>
          <Alert.Description>
            {importResult.message}
            {importResult.errors && Object.keys(importResult.errors).length > 0 && (
              <div className="mt-2">
                <details>
                  <summary className="cursor-pointer font-medium">
                    View Error Details ({Object.keys(importResult.errors).length})
                  </summary>
                  <ul className="mt-2 list-disc list-inside text-sm">
                    {Object.entries(importResult.errors).map(([id, error]) => (
                      <li key={id}>Item {id}: {error}</li>
                    ))}
                  </ul>
                </details>
              </div>
            )}
          </Alert.Description>
        </Alert>
      )}
      
      {importing && (
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span>Importing visits...</span>
            <span>{Math.round(importProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${importProgress}%` }}
            ></div>
          </div>
        </div>
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
              <Badge intent="secondary">
                {stats.selected} Selected
              </Badge>
            </div>
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
                  onToggleSelect={handleToggleSelect}
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