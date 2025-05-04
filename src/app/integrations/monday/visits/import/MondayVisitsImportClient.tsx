'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/core/Button';
import { Alert } from '@/components/core/feedback/Alert';
import { Card } from '@/components/composed/cards/Card';
import { ImportCompletionForm } from '@/components/integrations/monday/domain/visits/ImportCompletionForm';
import { useMondayIntegration } from '@/hooks/integrations/monday/useMondayIntegration';
import { PageHeader } from '@/components/composed/layouts/PageHeader';
import type { VisitInput } from '@/lib/data-schema/zod-schema/visits/visit';

enum ImportStage {
  LOADING = 'loading',
  COMPLETE = 'complete',
  CONFIRM = 'confirm',
  ERROR = 'error',
}

export default function MondayVisitsImportClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    connectionData,
    importItems,
    importError
  } = useMondayIntegration();
  
  // State
  const [stage, setStage] = useState<ImportStage>(ImportStage.LOADING);
  const [visitData, setVisitData] = useState<Partial<VisitInput> | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [boardId, setBoardId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Parse URL parameters on component mount
  useEffect(() => {
    try {
      const boardIdParam = searchParams.get('boardId');
      const visitDataParam = searchParams.get('visitData');
      const missingFieldsParam = searchParams.get('missingFields');
      
      if (!visitDataParam || !missingFieldsParam) {
        throw new Error('Missing required parameters');
      }
      
      // Parse the visitData and missingFields
      const parsedVisitData = JSON.parse(decodeURIComponent(visitDataParam));
      const parsedMissingFields = JSON.parse(decodeURIComponent(missingFieldsParam));
      
      setVisitData(parsedVisitData);
      setMissingFields(parsedMissingFields);
      
      if (boardIdParam) {
        setBoardId(boardIdParam);
      }
      
      // Update stage
      setStage(ImportStage.CONFIRM);
    } catch (err) {
      console.error('Error parsing parameters:', err);
      setStage(ImportStage.ERROR);
      setError('Invalid import data provided. Please go back and try again.');
    }
  }, [searchParams]);
  
  // Handle form submission
  const handleSubmit = useCallback(async (completeVisit: VisitInput) => {
    try {
      setStage(ImportStage.LOADING);
      
      // Import the completed visit using the hook
      const result = await importItems([{
        id: completeVisit.mondayItemId as string,
        completeData: completeVisit
      }]);
      
      if (result?.success) {
        setStage(ImportStage.COMPLETE);
      } else {
        setStage(ImportStage.ERROR);
        setError(result?.error || 'Failed to import visit');
      }
    } catch (err) {
      console.error('Error importing visit:', err);
      setStage(ImportStage.ERROR);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  }, [importItems]);
  
  // Handle cancellation
  const handleCancel = useCallback(() => {
    router.push('/integrations/monday/visits');
  }, [router]);
  
  // Handle completion - navigate to visits dashboard
  const handleComplete = useCallback(() => {
    router.push('/dashboard/visits');
  }, [router]);
  
  // Render page title based on stage
  const renderPageTitle = () => {
    switch (stage) {
      case ImportStage.LOADING:
        return {
          title: "Processing Import",
          subtitle: "Please wait while we import your visits from Monday.com"
        };
      case ImportStage.COMPLETE:
        return {
          title: "Import Complete",
          subtitle: "Your visit has been successfully imported"
        };
      case ImportStage.ERROR:
        return {
          title: "Import Error",
          subtitle: "There was a problem importing your visits"
        };
      case ImportStage.CONFIRM:
        return {
          title: "Complete Monday.com Import",
          subtitle: "Provide any missing information to complete the import"
        };
      default:
        return {
          title: "Import Visits from Monday.com",
          subtitle: "Complete import process for selected visits"
        };
    }
  };
  
  const { title, subtitle } = renderPageTitle();
  
  return (
    <div className="py-6">
      <PageHeader title={title} subtitle={subtitle} />
      
      {stage === ImportStage.LOADING && (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-4">Processing your import request...</p>
        </div>
      )}

      {stage === ImportStage.ERROR && (
        <div className="py-4">
          <Alert intent="error">
            <Alert.Title>Import Error</Alert.Title>
            <Alert.Description>{error || importError || 'An unknown error occurred during import'}</Alert.Description>
          </Alert>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleCancel}>Return to Monday.com Integration</Button>
          </div>
        </div>
      )}

      {stage === ImportStage.COMPLETE && (
        <Card className="mt-4">
          <Card.Header className="p-4 font-semibold">Import Results</Card.Header>
          <Card.Body className="p-4">
            <Alert intent="success" className="mb-4">
              <Alert.Title>Success</Alert.Title>
              <Alert.Description>
                Your visit has been successfully imported from Monday.com
              </Alert.Description>
            </Alert>
            
            <div className="mt-6 flex justify-end space-x-4">
              <Button intent="secondary" appearance="outline" onClick={handleCancel}>
                Return to Monday.com
              </Button>
              <Button onClick={handleComplete}>
                View All Visits
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}
      
      {stage === ImportStage.CONFIRM && visitData && (
        <Card className="mt-4">
          <Card.Body className="p-4">
            <ImportCompletionForm
              importedVisit={visitData}
              missingFields={missingFields}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              boardId={boardId}
              mondayItemName={visitData.mondayItemName as string}
              mondayUserName={connectionData?.name}
            />
          </Card.Body>
        </Card>
      )}
    </div>
  );
} 