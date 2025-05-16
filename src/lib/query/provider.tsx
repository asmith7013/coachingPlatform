'use client';

/**
 * Global React Query Provider setup
 * 
 * This sets up the QueryClient with default options and provides
 * it to the application through a React Context.
 */
import { 
  QueryClient, 
  QueryClientProvider,
  QueryErrorResetBoundary
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';
import { StandardResponse } from '@core-types/response';
import { createQueryClientWithErrorHandling } from './utilities/error-handling';
import { standardResponseSelector, isStandardResponse } from './utilities/response-types';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * Default query client configuration options
 * Aligned with previous SWR configuration for consistency
 */
const defaultOptions = {
  queries: {
    refetchOnWindowFocus: false, // Match SWR's revalidateOnFocus: false
    retry: 2, // Match SWR's errorRetryCount: 2
    staleTime: 10000, // Match SWR's dedupingInterval: 10000
    refetchOnReconnect: true, // Match SWR's revalidateOnReconnect: true
    refetchOnMount: false, // Equivalent to SWR's revalidateIfStale: false
    keepPreviousData: true, // Match SWR's keepPreviousData: true
  },
  mutations: {
    retry: false, // Match SWR's shouldRetryOnError: false
  },
};

/**
 * Provides React Query context to the application
 * Creates a new QueryClient instance for each user session
 * Handles standardized response types
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Create a memoized QueryClient instance
  const [queryClient] = useState(() => {
    const client = createQueryClientWithErrorHandling();
    
    // Add global response transformer to handle StandardResponse format
    client.setDefaultOptions({
      queries: {
        ...defaultOptions.queries,
        select: (data: unknown) => {
          // Use our selector utility if data is a StandardResponse
          if (isStandardResponse(data)) {
            return standardResponseSelector(data as StandardResponse<unknown>);
          }
          // Otherwise return the data as is
          return data;
        },
      },
    });
    
    return client;
  });

  return (
    <QueryErrorResetBoundary>
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV !== 'production' && 
          <ReactQueryDevtools initialIsOpen={false} />
        }
      </QueryClientProvider>
    </QueryErrorResetBoundary>
  );
} 