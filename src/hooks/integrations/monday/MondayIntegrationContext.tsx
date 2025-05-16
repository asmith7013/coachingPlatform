'use client';

/**
 * Monday Integration Context
 * 
 * Provides connection management and authentication for Monday.com integration
 * while leveraging React Query for data fetching.
 */
import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { useMondayConnection } from './useMondayQueriesRQ';
import { handleClientError } from '@/lib/error/handle-client-error';

// Define the connection action result type
interface ConnectionActionResult {
  success: boolean;
  data?: {
    connected?: boolean;
    name?: string;
    email?: string;
  };
  error?: string;
}

// Define the context type
interface MondayIntegrationContextType {
  // Additional connection actions beyond what React Query provides
  connectToMonday: () => Promise<ConnectionActionResult>;
  disconnectFromMonday: () => Promise<ConnectionActionResult>;
}

// Create the context with default values
const MondayIntegrationContext = createContext<MondayIntegrationContextType>({
  connectToMonday: () => Promise.resolve({ success: false }),
  disconnectFromMonday: () => Promise.resolve({ success: false })
});

/**
 * Provider component for Monday.com integration context
 */
export function MondayIntegrationProvider({ children }: { children: ReactNode }) {
  // Connection action handlers
  const connectToMonday = useCallback(async (): Promise<ConnectionActionResult> => {
    try {
      const response = await fetch('/api/integrations/monday/connect', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Connection failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { 
        success: true, 
        data: {
          connected: data.success,
          name: data.name || data.accountName,
          email: data.email
        }
      };
    } catch (error) {
      const errorMessage = handleClientError(error, 'Monday Connection');
      return { success: false, error: errorMessage };
    }
  }, []);
  
  const disconnectFromMonday = useCallback(async (): Promise<ConnectionActionResult> => {
    try {
      const response = await fetch('/api/integrations/monday/disconnect', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Disconnection failed: ${response.statusText}`);
      }
      
      return { success: true, data: { connected: false } };
    } catch (error) {
      const errorMessage = handleClientError(error, 'Monday Disconnection');
      return { success: false, error: errorMessage };
    }
  }, []);
  
  // Create the context value
  const contextValue: MondayIntegrationContextType = {
    connectToMonday,
    disconnectFromMonday
  };
  
  return (
    <MondayIntegrationContext.Provider value={contextValue}>
      {children}
    </MondayIntegrationContext.Provider>
  );
}

/**
 * Custom hook for accessing Monday.com integration context with React Query
 */
export function useMondayIntegration() {
  const context = useContext(MondayIntegrationContext);
  
  if (!context) {
    throw new Error('useMondayIntegration must be used within a MondayIntegrationProvider');
  }
  
  // Get connection data and status from React Query
  const connectionQuery = useMondayConnection();
  
  // Make sure these properties exist on the returned object
  const isConnected = connectionQuery.data?.success === true;
  const accountName = connectionQuery.data?.data?.name || '';
  
  return {
    // Connection actions
    connectToMonday: context.connectToMonday,
    disconnectFromMonday: context.disconnectFromMonday,
    
    // Connection data from React Query
    connectionData: connectionQuery.data || null,
    connectionLoading: connectionQuery.isLoading,
    connectionError: connectionQuery.error?.message || null,
    refetchConnection: connectionQuery.refetch,
    
    // Connection status helpers with fixed property access
    isConnected,
    accountName
  };
} 