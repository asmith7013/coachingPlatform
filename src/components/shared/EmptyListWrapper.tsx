'use client';

import React from 'react';
import { EmptyState } from './empty-state';

interface EmptyListWrapperProps<T> {
  items: T[];
  resourceName: string; // e.g., "look fors"
  children: React.ReactNode;
}

export function EmptyListWrapper<T>({
  items,
  resourceName,
  children,
}: EmptyListWrapperProps<T>) {
  if (items.length === 0) {
    return (
      <EmptyState
        title={`No ${resourceName} found`}
        description={`Create your first ${resourceName} or upload a batch to get started.`}
      />
    );
  }

  return <>{children}</>;
} 