'use client';

import { HydrationBoundary as RQHydrationBoundary } from '@tanstack/react-query';
import { queryClient } from '@query/core/client';

interface HydrationBoundaryProps {
  state?: unknown;
  children: React.ReactNode;
}

/**
 * Boundary component that hydrates the query client with server state
 * 
 * @example
 * // In a server component
 * const dehydratedState = await prefetchData();
 * 
 * // Render with state
 * <HydrationBoundary state={dehydratedState}>
 *   <ClientComponent />
 * </HydrationBoundary>
 */
export function HydrationBoundary({ state, children }: HydrationBoundaryProps) {
  return (
    <RQHydrationBoundary state={state} queryClient={queryClient}>
      {children}
    </RQHydrationBoundary>
  );
} 