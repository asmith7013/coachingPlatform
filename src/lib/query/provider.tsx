'use client';

/**
 * Global React Query Provider setup
 * 
 * This sets up the QueryClient with default options and provides
 * it to the application through a React Context.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * Default query client configuration options
 */
const defaultOptions = {
  queries: {
    refetchOnWindowFocus: process.env.NODE_ENV === 'production',
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  },
  mutations: {
    retry: 1,
  },
};

/**
 * Provides React Query context to the application
 * Creates a new QueryClient instance for each user session
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV !== 'production' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
} 