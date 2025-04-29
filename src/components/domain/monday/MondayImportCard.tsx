// src/components/domain/monday/MondayImportCard.tsx
import { useState } from 'react';
import { Button } from '@components/core/Button';
import { Card } from '@components/composed/cards/Card';
import Alert from '@components/core/feedback/Alert'; // Import default export
import { Spinner } from '@components/core/feedback/Spinner';
import { useErrorHandledMutation } from '@hooks/error/useErrorHandledMutation';
import { importVisitsFromMonday } from '@actions/integrations/monday';

export function MondayImportCard() {
  // Default board ID could be stored in environment variable or config
  const [boardId, setBoardId] = useState<string>("1234567890"); 
  const [lastImportTime, setLastImportTime] = useState<string | null>(null);
  const [importStats, setImportStats] = useState<{
    total: number;
    imported: number;
    updated: number;
    errors: number;
  } | null>(null);
  
  const { 
    mutate: runImport, 
    isLoading, 
    error, 
    isSuccess 
  } = useErrorHandledMutation(async () => {
    const result = await importVisitsFromMonday(boardId);
    
    if (result.success && result.data) {
      setLastImportTime(new Date().toLocaleString());
      setImportStats(result.data);
    }
    
    return result;
  });

  return (
    <Card>
      <Card.Header>Import from Monday.com</Card.Header>
      <Card.Body>
        <p className="mb-4">
          Import coaching visits and related data from your connected Monday.com boards.
        </p>
        
        <div className="mb-4">
          <label htmlFor="boardId" className="block text-sm font-medium mb-1">
            Monday.com Board ID
          </label>
          <input
            id="boardId"
            type="text"
            value={boardId}
            onChange={(e) => setBoardId(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter Monday.com board ID"
          />
        </div>
        
        {lastImportTime && importStats && (
          <Alert variant="info" className="mb-4">
            <Alert.Title>Last import: {lastImportTime}</Alert.Title>
            <Alert.Description>
              Total items: {importStats.total} | 
              Imported: {importStats.imported} | 
              Updated: {importStats.updated} | 
              Errors: {importStats.errors}
            </Alert.Description>
          </Alert>
        )}
        
        {error && (
          <Alert variant="error" className="mb-4">
            <Alert.Title>Import Failed</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert>
        )}
        
        {isSuccess && (
          <Alert variant="success" className="mb-4">
            <Alert.Title>Success!</Alert.Title>
            <Alert.Description>Import completed successfully!</Alert.Description>
          </Alert>
        )}
        
        <Button 
          className="primary" 
          onClick={() => runImport()} 
          disabled={isLoading || !boardId.trim()}
        >
          {isLoading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Importing...
            </>
          ) : "Import from Monday.com"}
        </Button>
      </Card.Body>
    </Card>
  );
}