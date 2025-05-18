'use client';

import { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { initializeQuerySystem } from '@query/initialization';
import { captureError, createErrorContext } from '@error';
import { createQueryClient } from '@query/core/client';

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Provides React Query context to the application
 * Creates a new QueryClient instance for each user session
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Create a memoized QueryClient instance using our unified creator
  const [queryClient] = useState(() => createQueryClient());
  
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