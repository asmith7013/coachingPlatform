'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  LOADING = 'loading',
  COMPLETE = 'complete',
  CONFIRM = 'confirm',
  ERROR = 'error'
}

export default function MondayVisitImportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Extract URL parameters
  const boardId = searchParams.get('boardId') || '';
  const visitDataParam = searchParams.get('visitData') || '';
  const missingFieldsParam = searchParams.get('missingFields') || '';
  
  // State
  const [stage, setStage] = useState<ImportStage>(ImportStage.LOADING);
  const [visitToComplete, setVisitToComplete] = useState<Partial<VisitInput> | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
  }>({ success: 0, failed: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Parse URL parameters when page loads
  useEffect(() => {
    try {
      if (visitDataParam) {
        const visitData = JSON.parse(decodeURIComponent(visitDataParam));
        setVisitToComplete(visitData);
      }
      
      if (missingFieldsParam) {
        const missingFields = JSON.parse(decodeURIComponent(missingFieldsParam));
        setMissingFields(missingFields);
      }
      
      // If we have visit data, move to completion stage
      if (visitDataParam) {
        setStage(ImportStage.COMPLETE);
      }
    } catch (err) {
      console.error('Error parsing URL parameters:', err);
      setError('Invalid data provided in URL');
      setStage(ImportStage.ERROR);
    }
  }, [visitDataParam, missingFieldsParam]);
  
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
    // Go back to the selection page
    router.push(`/integrations/monday/visits?boardId=${boardId}`);
  };
  
  // Handle import completion
  const handleImportComplete = () => {
    // For now, redirect to dashboard
    router.push('/dashboard/visits');
  };
  
  // Handle returning to Monday integration page
  const handleReturnToIntegrations = () => {
    router.push('/integrations/monday');
  };
  
  // Render based on current stage
  if (stage === ImportStage.LOADING) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <Spinner size="lg" />
        <Text className="mt-4">Loading import data...</Text>
      </div>
    );
  }
  
  if (stage === ImportStage.ERROR) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title="Error Loading Import Data"
          subtitle="There was a problem processing your import"
        />
        
        <Alert intent="error" className="mb-4">
          <Alert.Title>Import Error</Alert.Title>
          <Alert.Description>{error || 'Unknown error occurred'}</Alert.Description>
        </Alert>
        
        <div className="flex justify-end mt-4">
          <Button onClick={handleCancelImport}>
            Return to Selection
          </Button>
        </div>
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
      <Alert intent="error">
        <Alert.Title>Invalid State</Alert.Title>
        <Alert.Description>The application is in an invalid state. Please return to the selection page.</Alert.Description>
      </Alert>
      <div className="mt-4">
        <Button onClick={handleCancelImport}>
          Return to Selection
        </Button>
      </div>
    </div>
  );
} 