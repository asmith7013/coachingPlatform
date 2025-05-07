'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/composed/cards/Card';
import { Button } from '@/components/core/Button';
import { Alert } from '@/components/core/feedback/Alert';
import { Spinner } from '@/components/core/feedback/Spinner';
import { PageHeader } from '@/components/composed/layouts/PageHeader';
import { ImportCompletionForm } from '@/components/integrations/monday/domain/visits/ImportCompletionForm';
import { useMondayMutations } from '@/hooks/integrations/monday/useMondayMutations';
import type { VisitInput } from '@/lib/data-schema/zod-schema/visits/visit';
import type { MondayImportResponse } from '@/lib/integrations/monday/types/import';

// Import stages enum
enum ImportStage {
  LOADING = 'loading',
  COMPLETION = 'completion',
  SUCCESS = 'success',
  ERROR = 'error'
}

/**
 * Client component for handling Monday visit imports
 * This is the component responsible for completing the import process
 * after the user has selected items in the previous step
 */
export default function MondayVisitImportClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Use the Monday mutations hook for API operations
  const { completeVisitImport, loading, error: hookError } = useMondayMutations();
  
  // State for the import process
  const [stage, setStage] = useState<ImportStage>(ImportStage.LOADING);
  const [visitData, setVisitData] = useState<Partial<VisitInput> | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Update local error state when hook error changes
  useEffect(() => {
    if (hookError) {
      setError(hookError);
      setStage(ImportStage.ERROR);
    }
  }, [hookError]);
  
  // Parse URL parameters on component mount
  useEffect(() => {
    try {
      const visitDataParam = searchParams.get('visitData');
      const missingFieldsParam = searchParams.get('missingFields');
      
      if (!visitDataParam) {
        throw new Error('Missing required visit data parameter');
      }
      
      // Parse the visitData
      const parsedVisitData = JSON.parse(decodeURIComponent(visitDataParam));
      
      // Parse missing fields if provided
      let parsedMissingFields: string[] = [];
      if (missingFieldsParam) {
        parsedMissingFields = JSON.parse(decodeURIComponent(missingFieldsParam));
      }
      
      console.log('Parsed visit data:', parsedVisitData);
      console.log('Missing fields:', parsedMissingFields);
      
      // Update state
      setVisitData(parsedVisitData);
      setMissingFields(parsedMissingFields);
      setStage(ImportStage.COMPLETION);
    } catch (err) {
      console.error('Error parsing parameters:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStage(ImportStage.ERROR);
    }
  }, [searchParams]);
  
  // Handle form submission - Using the hook
  const handleSubmit = async (completeData: VisitInput) => {
    try {
      setStage(ImportStage.LOADING);
      
      console.log('Submitting completed data:', completeData);
      
      // Create the MondayImportResponse object
      const importRequest: MondayImportResponse = {
        success: true,
        completionData: completeData,
        completionRequired: true
      };
      
      // Use the completeVisitImport method from the hook
      const result = await completeVisitImport(importRequest);
      
      // Handle the result
      if (result.redirectUrl) {
        router.push(result.redirectUrl);
      } else {
        setStage(ImportStage.SUCCESS);
      }
    } catch (err) {
      // Error is already handled by the hook and set to hookError
      console.error('Error submitting form:', err);
      setStage(ImportStage.ERROR);
    }
  };
  
  // Handle cancellation
  const handleCancel = () => {
    router.push('/integrations/monday/visits');
  };
  
  // Handle view visits - redirect to visits dashboard
  const handleViewVisits = () => {
    router.push('/dashboard/visits');
  };
  
  // Render page title based on stage
  const renderPageTitle = () => {
    switch (stage) {
      case ImportStage.LOADING:
        return {
          title: "Processing Import",
          subtitle: "Please wait while we process your request"
        };
      case ImportStage.COMPLETION:
        return {
          title: "Complete Import Information",
          subtitle: "Fill in any missing information to complete the import"
        };
      case ImportStage.SUCCESS:
        return {
          title: "Import Successful",
          subtitle: "The visit has been successfully imported"
        };
      case ImportStage.ERROR:
        return {
          title: "Import Error",
          subtitle: "There was a problem with the import process"
        };
    }
  };
  
  // Get page title and subtitle
  const { title, subtitle } = renderPageTitle();
  
  return (
    <div className="container mx-auto py-6">
      <PageHeader title={title} subtitle={subtitle} />
      
      {/* Loading state */}
      {(stage === ImportStage.LOADING || loading) && (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
          <div className="ml-4">Processing your request...</div>
        </div>
      )}
      
      {/* Error state */}
      {stage === ImportStage.ERROR && (
        <Card className="mt-4">
          <Card.Header className="bg-red-50">
            <h3 className="text-lg font-medium text-red-800">Import Error</h3>
          </Card.Header>
          <Card.Body>
            <Alert intent="error">
              <Alert.Title>An error occurred</Alert.Title>
              <Alert.Description>
                {error || 'An unknown error occurred during the import process.'}
              </Alert.Description>
            </Alert>
            
            <div className="mt-6 flex justify-end">
              <Button onClick={handleCancel}>
                Return to Monday.com Integration
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}
      
      {/* Success state */}
      {stage === ImportStage.SUCCESS && (
        <Card className="mt-4">
          <Card.Header className="bg-green-50">
            <h3 className="text-lg font-medium text-green-800">Import Successful</h3>
          </Card.Header>
          <Card.Body>
            <Alert intent="success">
              <Alert.Title>Visit Imported</Alert.Title>
              <Alert.Description>
                The visit has been successfully imported from Monday.com.
              </Alert.Description>
            </Alert>
            
            <div className="mt-6 flex justify-end space-x-4">
              <Button intent="secondary" appearance="outline" onClick={handleCancel}>
                Return to Monday.com
              </Button>
              <Button onClick={handleViewVisits}>
                View All Visits
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}
      
      {/* Completion state - form for filling missing data */}
      {stage === ImportStage.COMPLETION && visitData && (
        <Card className="mt-4">
          <Card.Body>
            <ImportCompletionForm
              importedVisit={visitData}
              missingFields={missingFields}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              disabled={loading}
            />
          </Card.Body>
        </Card>
      )}
    </div>
  );
}