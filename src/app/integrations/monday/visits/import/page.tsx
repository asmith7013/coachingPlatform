'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { findPotentialVisitsToImport, importSelectedVisits } from '@/app/actions/integrations/monday';
import { ImportCompletionForm } from '@/components/integrations/monday/domain/visits/ImportCompletionForm';
import { MondayItemPreviewCard } from '@/components/integrations/monday/domain/visits/MondayItemPreviewCard';
import { Alert } from '@/components/core/feedback/Alert';
import { Card } from '@/components/composed/cards/Card';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { Button } from '@/components/core/Button';
import { Spinner } from '@/components/core/feedback/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import type { ImportPreview } from '@api-integrations/monday/types';
import type { VisitInput } from '@/lib/data-schema/zod-schema/visits/visit';

// Import stages
enum ImportStage {
  SELECT = 'select',
  COMPLETE = 'complete',
  CONFIRM = 'confirm'
}

export default function MondayVisitImport() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const boardId = searchParams.get('boardId') || '';
  
  // State
  const [stage, setStage] = useState<ImportStage>(ImportStage.SELECT);
  const [previews, setPreviews] = useState<ImportPreview[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentItem, setCurrentItem] = useState<Partial<VisitInput> | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
  } | null>(null);
  
  // Load preview data
  useEffect(() => {
    async function loadPreviews() {
      if (!boardId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const items = await findPotentialVisitsToImport(boardId);
        setPreviews(items);
        
        // Auto-select valid, non-duplicate items
        setSelectedIds(
          items
            .filter(item => item.valid && !item.isDuplicate)
            .map(item => item.original.id as string)
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load items');
      } finally {
        setLoading(false);
      }
    }
    
    loadPreviews();
  }, [boardId]);
  
  // Handle selection toggle
  const handleToggleSelect = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(itemId => itemId !== id));
    }
  };
  
  // Handle proceeding to form completion stage
  const handleProceedToComplete = async () => {
    if (selectedIds.length === 0) {
      setError('Please select at least one visit to import');
      return;
    }
    
    try {
      setLoading(true);
      
      // For simplicity, process one item at a time
      // In a real app, you might batch these or provide a queue UI
      const itemId = selectedIds[0];
      const preview = previews.find(p => p.original.id === itemId);
      
      if (!preview) {
        throw new Error('Selected item not found');
      }
      
      // Move to completion stage with the first item
      setCurrentItem(preview.transformed as Partial<VisitInput>);
      setMissingFields(preview.requiredForFinalValidation || []);
      setStage(ImportStage.COMPLETE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to prepare import');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form submission
  const handleSubmitForm = async (data: VisitInput) => {
    try {
      setLoading(true);
      
      // Create the visit with completed data
      await importSelectedVisits([{
        id: currentItem?.mondayItemId as string,
        completeData: data
      }]);
      
      // Update results
      setImportResults(prev => ({
        success: (prev?.success || 0) + 1,
        failed: prev?.failed || 0
      }));
      
      // Remove processed item from selection
      setSelectedIds(prev => 
        prev.filter(id => id !== currentItem?.mondayItemId)
      );
      
      // Process next item or finish
      if (selectedIds.length <= 1) {
        setStage(ImportStage.CONFIRM);
      } else {
        // Move to next item
        const nextItemId = selectedIds.find(id => id !== currentItem?.mondayItemId);
        const nextPreview = previews.find(p => p.original.id === nextItemId);
        
        if (nextPreview) {
          setCurrentItem(nextPreview.transformed as Partial<VisitInput>);
          setMissingFields(nextPreview.requiredForFinalValidation || []);
        } else {
          // No more items to process
          setStage(ImportStage.CONFIRM);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import visit');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle going back to selection
  const handleBackToSelection = () => {
    setStage(ImportStage.SELECT);
    setCurrentItem(null);
    setMissingFields([]);
  };
  
  // Handle finishing import
  const handleFinishImport = () => {
    router.push('/dashboard/visits');
  };
  
  // Render based on current stage
  if (loading && previews.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
        <Text className="ml-3">Loading Monday.com data...</Text>
      </div>
    );
  }
  
  if (error && previews.length === 0) {
    return (
      <Alert intent="error" className="m-4">
        <Alert.Title>Failed to Load Data</Alert.Title>
        <Alert.Description>{error}</Alert.Description>
        <div className="mt-4">
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </Alert>
    );
  }
  
  if (stage === ImportStage.SELECT) {
    return (
      <div className="container mx-auto p-4">
        <PageHeader
          title="Import Visits from Monday.com"
          subtitle="Select visits to import into the system"
        />
        
        {error && (
          <Alert intent="error" className="mb-4">
            <Alert.Title>Error</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert>
        )}
        
        <div className="mb-4 flex justify-between items-center">
          <Text>
            {previews.length} items found. {selectedIds.length} selected.
          </Text>
          <Button
            onClick={handleProceedToComplete}
            disabled={selectedIds.length === 0 || loading}
            loading={loading}
          >
            Import Selected ({selectedIds.length})
          </Button>
        </div>
        
        <div className="space-y-4">
          {previews.map(preview => (
            <MondayItemPreviewCard
              key={preview.original.id as string}
              preview={preview}
              isSelected={selectedIds.includes(preview.original.id as string)}
              onToggleSelect={handleToggleSelect}
              disabled={loading}
            />
          ))}
        </div>
      </div>
    );
  }
  
  if (stage === ImportStage.COMPLETE && currentItem) {
    return (
      <div className="container mx-auto p-4">
        <PageHeader
          title="Complete Visit Information"
          subtitle="Provide missing information to complete the import"
        />
        
        <div className="mb-4">
          <Text>
            Importing: {currentItem.mondayItemName || 'Visit'}
          </Text>
          <Text className="text-gray-500">
            {selectedIds.length} items remaining
          </Text>
        </div>
        
        <ImportCompletionForm
          importedVisit={currentItem}
          onSubmit={handleSubmitForm}
          onCancel={handleBackToSelection}
          missingFields={missingFields}
        />
      </div>
    );
  }
  
  if (stage === ImportStage.CONFIRM) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <Card.Body>
            <Heading level="h2">Import Complete</Heading>
            
            <div className="mt-4">
              <Text>
                Successfully imported: {importResults?.success || 0} visits
              </Text>
              {importResults?.failed ? (
                <Text className="text-red-600">
                  Failed to import: {importResults.failed} visits
                </Text>
              ) : null}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button onClick={handleFinishImport}>
                View Visits
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }
  
  return null;
} 