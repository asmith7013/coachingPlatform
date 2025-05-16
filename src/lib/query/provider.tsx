'use client';

/**
 * Global React Query Provider setup
 * 
 * This sets up the QueryClient with default options and provides
 * it to the application through a React Context.
 */
import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { initializeQuerySystem } from './initialization';
import { captureError, createErrorContext } from '@/lib/error';

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Creates a QueryClient with error handling
 */
function createQueryClientWithErrorHandling() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
      mutations: {
        retry: 1,
      },
    },
  });
}

/**
 * Provides React Query context to the application
 * Creates a new QueryClient instance for each user session
 * Handles standardized response types
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Create a memoized QueryClient instance
  const [queryClient] = useState(() => createQueryClientWithErrorHandling());
  
  // Initialize query system once when provider mounts
  useEffect(() => {
    try {
      const success = initializeQuerySystem();
      if (!success) {
        console.warn('Query system initialization encountered issues. Some features may not work correctly.');
      }
    } catch (error) {
      captureError(error, createErrorContext('QueryProvider', 'initialization'));
      console.error('Failed to initialize query system:', error);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
} 