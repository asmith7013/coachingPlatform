'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/core/Button';
import { MondayItemPreviewCard } from './MondayItemPreviewCard';
import { 
  findPotentialVisitsToImport, 
  importSelectedVisits,
  ImportPreview
} from '@/app/actions/integrations/monday';
import { Alert } from '@/components/core/feedback/Alert';
import { Spinner } from '@/components/core/feedback/Spinner';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';

interface MondayImportSelectorProps {
  boardId: string;
  onImportComplete: () => void;
}

export function MondayImportSelector({ 
  boardId, 
  onImportComplete 
}: MondayImportSelectorProps) {
  const [previews, setPreviews] = useState<ImportPreview[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported: number;
    errors: Record<string, string>;
  } | null>(null);
  
  // Load potential visits
  useEffect(() => {
    async function loadPreviews() {
      try {
        setIsLoading(true);
        setError(null);
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
    
    if (boardId) {
      loadPreviews();
    }
  }, [boardId]);
  
  // Toggle item selection
  const handleToggleSelect = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    }
  };
  
  // Import selected items
  const handleImport = async () => {
    try {
      setImporting(true);
      setError(null);
      const result = await importSelectedVisits(selectedIds);
      setImportResult(result);
      
      if (result.success) {
        onImportComplete();
      }
    } catch (err) {
      console.error("Error importing items:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setImporting(false);
    }
  };
  
  return (
    <div>
      <div className="flex justify-between mb-4">
        <Heading level="h2">Import Visits from Monday.com</Heading>
        <div>
          <Button 
            className="primary" 
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
        </div>
      </div>
      
      {error && (
        <Alert variant="error" className="mb-4">
          <Alert.Title>Error</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Alert>
      )}
      
      {importResult && importResult.success && (
        <Alert variant="success" className="mb-4">
          <Alert.Title>Success</Alert.Title>
          <Alert.Description>
            Successfully imported {importResult.imported} visits.
          </Alert.Description>
        </Alert>
      )}
      
      {isLoading ? (
        <div className="text-center py-12">
          <Spinner size="lg" />
          <Text className="mt-2">Loading potential visits to import...</Text>
        </div>
      ) : previews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Text>No items found to import from this board.</Text>
        </div>
      ) : (
        <div className="space-y-4">
          {previews.map(preview => (
            <MondayItemPreviewCard
              key={preview.original.id as string}
              preview={preview}
              isSelected={selectedIds.includes(preview.original.id as string)}
              onToggleSelect={handleToggleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
} 