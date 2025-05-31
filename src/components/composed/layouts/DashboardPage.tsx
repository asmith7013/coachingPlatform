import React from 'react';
import { HydrationBoundary } from '@components/core/query/HydrationBoundary';

interface DashboardPageProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  dehydratedState?: unknown; // Add this prop for hydration
}

export function DashboardPage({
  children,
  dehydratedState // New prop for hydration state
}: DashboardPageProps) {
  // Wrap children with HydrationBoundary if dehydratedState is provided
  const content = dehydratedState ? (
    <HydrationBoundary state={dehydratedState}>
      {children}
    </HydrationBoundary>
  ) : children;

  return (
    <div className="container">
      {content}
    </div>
  );
}