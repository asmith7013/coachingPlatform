// src/lib/domain/monday/useMondayImport.ts
import { useState } from 'react';
import { useErrorHandledMutation } from '@/hooks/error/useErrorHandledMutation';
import { importVisitsFromMonday } from '@/app/actions/integrations/monday';

interface ImportOptions {
  boardId: string;
  overwriteExisting?: boolean;
  importAttachments?: boolean;
}

interface ImportResults {
  total: number;
  imported: number;
  updated: number;
  errors: number;
  errorDetails?: string[];
}

export function useMondayImport() {
  const [lastImportTime, setLastImportTime] = useState<Date | null>(null);
  const [importResults, setImportResults] = useState<ImportResults | null>(null);
  
  const { 
    mutate: runImport, 
    isLoading, 
    error, 
    isSuccess 
  } = useErrorHandledMutation(async (options: ImportOptions) => {
    const result = await importVisitsFromMonday(options.boardId);
    
    if (result.success && result.data) {
      setLastImportTime(new Date());
      setImportResults(result.data);
    }
    
    return result;
  });

  return {
    runImport,
    isLoading,
    error,
    isSuccess,
    lastImportTime,
    importResults
  };
}