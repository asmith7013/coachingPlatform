// src/components/domain/monday/MondayImportPanel.tsx
import { useState } from 'react';
import { Button } from '@/components/core/Button';
import { Card } from '@/components/composed/cards/Card';
import { Alert } from '@/components/core/feedback/Alert';
import { Spinner } from '@/components/core/feedback/Spinner';
import { Select } from '@/components/core/fields/Select';
import { Checkbox } from '@/components/core/fields/Checkbox';
import { useMondayImport } from '@/lib/domain/monday/useMondayImport';
import { useReferenceData } from '@/hooks/data/useReferenceData';

// Interface that properly matches the BaseReference interface requirements
interface MondayBoard {
  _id: string;  // Changed from 'value' to '_id' to match BaseReference
  label: string;
}

export function MondayImportPanel() {
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [importOptions, setImportOptions] = useState({
    overwriteExisting: false,
    importAttachments: true,
  });
  
  // Use the reference data hook to fetch boards
  const { options: boards, isLoading: boardsLoading, error: boardsError } = 
    useReferenceData<MondayBoard>('/api/integrations/monday/boards');
  
  // Use the custom hook for import operations
  const { 
    runImport, 
    isLoading, 
    error, 
    isSuccess,
    lastImportTime,
    importResults
  } = useMondayImport();

  const handleOptionChange = (option: keyof typeof importOptions) => {
    setImportOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleBoardChange = (value: string) => {
    setSelectedBoardId(value);
  };

  const handleImport = () => {
    runImport({
      boardId: selectedBoardId,
      overwriteExisting: importOptions.overwriteExisting,
      importAttachments: importOptions.importAttachments
    });
  };

  // Convert boards to select options format
  const boardOptions = boards.map(board => ({
    value: board._id,
    label: board.label
  }));

  return (
    <Card>
      <div className="font-medium text-lg mb-2">Import from Monday.com</div>
      <div className="mb-4">
        Import coaching visits and related data from your connected Monday.com boards.
      </div>
      
      {boardsError && (
        <Alert variant="error" className="mb-4">
          Error loading Monday.com boards: {boardsError.message}
        </Alert>
      )}
      
      <div className="mb-4">
        <label className="block mb-2 font-medium">
          Select Monday.com Board
        </label>
        
        {boardsLoading ? (
          <div className="flex items-center">
            <Spinner size="sm" className="mr-2" />
            <span>Loading boards...</span>
          </div>
        ) : (
          <Select
            value={selectedBoardId}
            onChange={handleBoardChange}
            options={boardOptions}
            disabled={isLoading}
            placeholder="Select a board"
          />
        )}
      </div>
      
      <div className="mb-6 space-y-2">
        <Checkbox
          id="overwriteExisting"
          checked={importOptions.overwriteExisting}
          onChange={() => handleOptionChange('overwriteExisting')}
          label="Overwrite existing items"
          disabled={isLoading}
        />
        
        <Checkbox
          id="importAttachments"
          checked={importOptions.importAttachments}
          onChange={() => handleOptionChange('importAttachments')}
          label="Import attachments"
          disabled={isLoading}
        />
      </div>
      
      {lastImportTime && (
        <Alert variant="info" className="mb-4">
          Last import: {lastImportTime.toLocaleString()}
          {importResults && (
            <div className="mt-1">
              Imported: {importResults.imported}, 
              Updated: {importResults.updated}, 
              Errors: {importResults.errors}
            </div>
          )}
        </Alert>
      )}
      
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      {isSuccess && (
        <Alert variant="success" className="mb-4">
          Import completed successfully!
        </Alert>
      )}
      
      <Button 
        className="primary" 
        onClick={handleImport} 
        disabled={isLoading || !selectedBoardId}
      >
        {isLoading ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Importing...
          </>
        ) : "Import from Monday.com"}
      </Button>
    </Card>
  );
}