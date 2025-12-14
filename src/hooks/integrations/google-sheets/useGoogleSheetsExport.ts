import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { exportAndResetDailySheets, testGoogleSheetsConnection } from '@actions/scm/google-sheets-export';
import { ExportConfig, ExportResult } from '@zod-schema/integrations/google-sheets-export';
import { EntityResponse } from '@core-types/response';

interface UseGoogleSheetsExportReturn {
  exportData: (config: ExportConfig) => Promise<void>;
  testConnection: (spreadsheetId: string) => Promise<void>;
  isExporting: boolean;
  isTesting: boolean;
  exportResult: ExportResult | null;
  error: string | null;
  connectionStatus: 'idle' | 'success' | 'error';
  resetState: () => void;
}

export function useGoogleSheetsExport(): UseGoogleSheetsExportReturn {
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const exportMutation = useMutation({
    mutationFn: async (config: ExportConfig): Promise<EntityResponse<ExportResult>> => {
      return exportAndResetDailySheets(config);
    },
    onSuccess: (response) => {
      if (response.success) {
        setExportResult(response.data);
        setError(null);
      } else {
        setError(response.error || 'Export failed');
        setExportResult(null);
      }
    },
    onError: (error: Error) => {
      setError(error.message);
      setExportResult(null);
    }
  });

  const connectionMutation = useMutation({
    mutationFn: async (spreadsheetId: string) => {
      return testGoogleSheetsConnection(spreadsheetId);
    },
    onSuccess: (response) => {
      if (response.success) {
        setConnectionStatus('success');
        setError(null);
      } else {
        setConnectionStatus('error');
        setError(response.error || 'Connection test failed');
      }
    },
    onError: (error: Error) => {
      setConnectionStatus('error');
      setError(error.message);
    }
  });

  const exportData = async (config: ExportConfig) => {
    setError(null);
    setExportResult(null);
    await exportMutation.mutateAsync(config);
  };

  const testConnection = async (spreadsheetId: string) => {
    setError(null);
    setConnectionStatus('idle');
    await connectionMutation.mutateAsync(spreadsheetId);
  };

  const resetState = () => {
    setExportResult(null);
    setError(null);
    setConnectionStatus('idle');
    exportMutation.reset();
    connectionMutation.reset();
  };

  return {
    exportData,
    testConnection,
    isExporting: exportMutation.isPending,
    isTesting: connectionMutation.isPending,
    exportResult,
    error,
    connectionStatus,
    resetState
  };
} 