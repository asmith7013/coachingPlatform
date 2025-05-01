'use client';

import { useState } from 'react';
import { Button } from '@/components/core/Button';
import { Alert } from '@/components/core/feedback/Alert';
import { Spinner } from '@/components/core/feedback/Spinner';
import { testConnection } from '@/app/actions/integrations/monday';
import { MondayConnectionTestResult } from '@api-integrations/monday/types';

export interface ConnectionTestProps {
  className?: string;
}

export function ConnectionTest({ className }: ConnectionTestProps) {
  const [connectionTestStatus, setConnectionTestStatus] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
  }>({ status: 'idle' });

  // Test API connection
  const handleTestConnection = async () => {
    setConnectionTestStatus({ status: 'loading' });
    
    try {
      const result = await testConnection() as MondayConnectionTestResult;
      
      if (result.success && result.data) {
        setConnectionTestStatus({ 
          status: 'success', 
          message: `Connected as ${result.data.name} (${result.data.email})` 
        });
      } else {
        setConnectionTestStatus({ 
          status: 'error', 
          message: result.error || "Connection test failed" 
        });
      }
    } catch (err) {
      console.error("Connection test error:", err);
      setConnectionTestStatus({ 
        status: 'error', 
        message: err instanceof Error ? err.message : "An unknown error occurred" 
      });
    }
  };

  return (
    <div className={className}>
      {/* Connection test button */}
      <div className="flex justify-end">
        <Button 
          intent="secondary" 
          textSize="sm"
          padding="sm"
          onClick={handleTestConnection}
          disabled={connectionTestStatus.status === 'loading'}
        >
          {connectionTestStatus.status === 'loading' ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Testing Connection...
            </>
          ) : "Test Connection"}
        </Button>
      </div>
      
      {/* Connection test result */}
      {connectionTestStatus.status === 'success' && (
        <Alert intent="success">
          <Alert.Title>Connection Successful</Alert.Title>
          <Alert.Description>{connectionTestStatus.message}</Alert.Description>
        </Alert>
      )}
      
      {connectionTestStatus.status === 'error' && (
        <Alert intent="error">
          <Alert.Title>Connection Failed</Alert.Title>
          <Alert.Description>{connectionTestStatus.message}</Alert.Description>
        </Alert>
      )}
    </div>
  );
} 