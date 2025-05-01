'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MondayVisitsSelector } from '@/components/integrations/monday/domain/visits/VisitSelector';
import { ImportCompletionForm } from '@/components/integrations/monday/domain/visits/ImportCompletionForm';
import { Alert } from '@/components/core/feedback/Alert';
import { Card } from '@/components/composed/cards/Card';
import { Button } from '@/components/core/Button';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { Spinner } from '@/components/core/feedback/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { importSelectedVisits } from '@/app/actions/integrations/monday';
import type { VisitInput } from '@/lib/data-schema/zod-schema/visits/visit';

// Import stages
enum ImportStage {
  SELECT = 'select',
  COMPLETE = 'complete',
  CONFIRM = 'confirm'
}

export default function MondayVisitImportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const boardId = searchParams.get('boardId') || '';
  
  // State
  const [stage, setStage] = useState<ImportStage>(ImportStage.SELECT);
  const [visitToComplete, setVisitToComplete] = useState<Partial<VisitInput> | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
  }>({ success: 0, failed: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle import initiation from VisitSelector
  const handleInitiateImport = (visit: Partial<VisitInput>, missing: string[]) => {
    // Store the visit data and missing fields
    setVisitToComplete(visit);
    setMissingFields(missing);
    
    // If no missing fields, import directly
    if (missing.length === 0) {
      handleImportVisit(visit as VisitInput);
    } else {
      // Otherwise, move to completion stage
      setStage(ImportStage.COMPLETE);
    }
  };
  
  // Handle import of a completed visit
  const handleImportVisit = async (visitData: VisitInput) => {
    try {
      setLoading(true);
      setError(null);
      
      // Import the completed visit
      const result = await importSelectedVisits([{
        id: visitData.mondayItemId as string,
        completeData: visitData
      }]);
      
      if (result.success) {
        // Update success count
        setImportResults(prev => ({
          success: prev.success + 1,
          failed: prev.failed
        }));
        
        // Move to confirmation stage
        setStage(ImportStage.CONFIRM);
      } else {
        // Update failure count
        setImportResults(prev => ({
          success: prev.success,
          failed: prev.failed + 1
        }));
        
        setError(result.errors?.[visitData.mondayItemId as string] || 'Failed to import visit');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import visit');
      console.error('Import error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle cancellation of import
  const handleCancelImport = () => {
    // Go back to selection stage
    setStage(ImportStage.SELECT);
    setVisitToComplete(null);
    setMissingFields([]);
  };
  
  // Handle import completion
  const handleImportComplete = () => {
    // For now, redirect to dashboard
    // Eventually, this could be updated to handle multiple imports
    router.push('/dashboard/visits');
  };
  
  // Handle returning to Monday integration page
  const handleReturnToIntegrations = () => {
    router.push('/integrations/monday');
  };
  
  // Render based on current stage
  if (stage === ImportStage.SELECT) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title="Import Visits from Monday.com"
          subtitle="Select items from Monday.com to import as Visits"
        />
        
        <Card className="p-6">
          <MondayVisitsSelector 
            boardId={boardId}
            onImportComplete={(visit, missing) => handleInitiateImport(visit, missing)}
          />
        </Card>
      </div>
    );
  }
  
  if (stage === ImportStage.COMPLETE && visitToComplete) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title="Complete Visit Information"
          subtitle="Provide the missing information to complete the import"
        />
        
        {error && (
          <Alert intent="error" className="mb-4">
            <Alert.Title>Error</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert>
        )}
        
        {loading && (
          <Alert intent="info" className="mb-4">
            <Alert.Title>Processing Import</Alert.Title>
            <Alert.Description>
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                <span>Please wait while we create the visit...</span>
              </div>
            </Alert.Description>
          </Alert>
        )}
        
        <Card className="p-6">
          <div className="mb-4">
            <Text className="font-medium">
              Completing: {visitToComplete.mondayItemName || 'Visit from Monday.com'}
            </Text>
          </div>
          
          <ImportCompletionForm
            importedVisit={visitToComplete}
            onSubmit={handleImportVisit}
            onCancel={handleCancelImport}
            missingFields={missingFields}
          />
        </Card>
      </div>
    );
  }
  
  if (stage === ImportStage.CONFIRM) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title="Import Complete"
          subtitle="Visit import from Monday.com has been completed"
        />
        
        <Card className="p-6">
          <div className="mb-6">
            <Heading level="h3" className="mb-2">Import Results</Heading>
            <Text>
              Successfully imported: {importResults.success} visit{importResults.success !== 1 ? 's' : ''}
            </Text>
            
            {importResults.failed > 0 && (
              <Text color="danger" className="mt-1">
                Failed to import: {importResults.failed} visit{importResults.failed !== 1 ? 's' : ''}
              </Text>
            )}
          </div>
          
          <div className="flex gap-4 justify-end">
            <Button 
              intent="secondary"
              onClick={handleReturnToIntegrations}
            >
              Return to Integrations
            </Button>
            <Button
              intent="primary"
              onClick={handleImportComplete}
            >
              Go to Visits Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  // Fallback for invalid state
  return (
    <div className="container mx-auto px-4 py-6 text-center">
      <Spinner size="lg" />
      <Text className="mt-4">Loading import interface...</Text>
    </div>
  );
} 