'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/core/Button';
import { Alert } from '@/components/core/feedback/Alert';
import { Card } from '@/components/composed/cards/Card';
import { importSelectedVisits } from '@/app/actions/integrations/monday';
import { PageHeader } from '@/components/shared/PageHeader';

enum ImportStage {
  LOADING = 'loading',
  COMPLETE = 'complete',
  CONFIRM = 'confirm',
  ERROR = 'error',
}

export interface VisitImportResult {
  created: number;
  updated: number;
  failed: number;
  total: number;
}

export default function MondayVisitsImportClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [stage, setStage] = useState<ImportStage>(ImportStage.LOADING);
  const [importResults, setImportResults] = useState<VisitImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const items = searchParams.get('items');
    const boardId = searchParams.get('boardId');

    if (!items || !boardId) {
      setStage(ImportStage.ERROR);
      setError('Missing required parameters: items and boardId');
      return;
    }

    const handleImport = async () => {
      try {
        const parsedItems = JSON.parse(items);
        if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
          throw new Error('Invalid items format');
        }

        const result = await importSelectedVisits(parsedItems);

        if (!result.success) {
          throw new Error(result.message || 'Failed to import visits');
        }

        setImportResults({
          created: result.imported || 0,
          updated: 0,
          failed: Object.keys(result.errors || {}).length,
          total: parsedItems.length
        });
        setStage(ImportStage.COMPLETE);
      } catch (err) {
        console.error('Import error:', err);
        setStage(ImportStage.ERROR);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    };

    handleImport();
  }, [searchParams]);

  const handleCancel = useCallback(() => {
    router.push('/integrations/monday/visits');
  }, [router]);

  const handleComplete = useCallback(() => {
    router.push('/visits');
  }, [router]);

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
          subtitle: `Successfully imported ${importResults?.created} visits`
        };
      case ImportStage.ERROR:
        return {
          title: "Import Error",
          subtitle: "There was a problem importing your visits"
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
            <Alert.Description>{error || 'An unknown error occurred during import'}</Alert.Description>
          </Alert>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleCancel}>Return to Monday.com Integration</Button>
          </div>
        </div>
      )}

      {stage === ImportStage.COMPLETE && importResults && (
        <Card className="mt-4">
          <div className="p-4">
            <h3 className="text-lg font-medium mb-2">Import Results</h3>
            <ul className="space-y-2">
              <li><span className="font-medium">Created:</span> {importResults.created} visits</li>
              <li><span className="font-medium">Updated:</span> {importResults.updated} visits</li>
              <li><span className="font-medium">Failed:</span> {importResults.failed} visits</li>
              <li><span className="font-medium">Total:</span> {importResults.total} visits</li>
            </ul>

            <div className="mt-6 flex justify-end space-x-4">
              <Button intent="secondary" appearance="outline" onClick={handleCancel}>
                Return to Monday.com
              </Button>
              <Button onClick={handleComplete}>
                View All Visits
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
} 