// src/components/domain/monday/MondayImportPanelSimple.tsx
import { useState } from 'react';
import { Button } from '@/components/core/Button';
import { Card } from '@/components/composed/cards/Card';
import { Alert } from '@/components/core/feedback/Alert';
import { Spinner } from '@/components/core/feedback/Spinner';
import { Input } from '@/components/core/fields/Input';
import { Checkbox } from '@/components/core/fields/Checkbox';
import { importVisitsFromMonday } from '@/app/actions/integrations/monday';
import { useErrorHandledMutation } from '@/hooks/error/useErrorHandledMutation';

interface ImportResults {
    total: number;
    imported: number;
    updated: number;
    errors: number;
}

export function MondayImportPanelSimple() {
  const [boardId, setBoardId] = useState<string>('');
  const [importOptions, setImportOptions] = useState({
    overwriteExisting: true,
    importAttachments: true,
  });
  const [lastImportTime, setLastImportTime] = useState<Date | null>(null);
  const [importResults, setImportResults] = useState<ImportResults | null>(null);
  
  const { 
    mutate: runImport, 
    isLoading, 
    error, 
    isSuccess 
  } = useErrorHandledMutation(async () => {
    if (!boardId.trim()) {
      throw new Error("Please enter a valid Monday.com board ID");
    }
    
    const result = await importVisitsFromMonday(boardId);
    
    if (result.success && result.data) {
      setLastImportTime(new Date());
      setImportResults(result.data);
    }
    
    return result;
  });

  const handleOptionChange = (option: keyof typeof importOptions) => {
    setImportOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  return (
    <Card>
      <Card.Header>Import from Monday.com</Card.Header>
      <Card.Body>
        <div className="space-y-4">
          <p>
            Import coaching visits from a specific Monday.com board.
          </p>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Monday.com Board ID
            </label>
            <Input
              value={boardId}
              onChange={(e) => setBoardId(e.target.value)}
              placeholder="Enter board ID (e.g., 12345678)"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Find your board ID in the URL: monday.com/boards/<strong>123456789</strong>/...
            </p>
          </div>
          
          <div className="space-y-2">
            <Checkbox
              id="overwriteExisting"
              checked={importOptions.overwriteExisting}
              onChange={() => handleOptionChange('overwriteExisting')}
              label="Update existing visits"
            />
            
            <Checkbox
              id="importAttachments"
              checked={importOptions.importAttachments}
              onChange={() => handleOptionChange('importAttachments')}
              label="Import attachments"
            />
          </div>
          
          {lastImportTime && importResults && (
            <Alert variant="info">
              <Alert.Title>Last import: {lastImportTime.toLocaleString()}</Alert.Title>
              <Alert.Description>
                Total: {importResults.total} | 
                Imported: {importResults.imported} | 
                Updated: {importResults.updated} | 
                Errors: {importResults.errors}
              </Alert.Description>
            </Alert>
          )}
          
          {error && (
            <Alert variant="error">
              <Alert.Title>Import Failed</Alert.Title>
              <Alert.Description>{error.toString()}</Alert.Description>
            </Alert>
          )}
          
          {isSuccess && (
            <Alert variant="success">
              <Alert.Title>Import Successful</Alert.Title>
              <Alert.Description>
                The import completed successfully. You can view the imported visits in the Visits dashboard.
              </Alert.Description>
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
        </div>
      </Card.Body>
    </Card>
  );
}