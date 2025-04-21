'use client';

import { SWRConfig } from 'swr';
import React from 'react';

export const globalSWRConfig = {
  dedupingInterval: 10000,
  revalidateOnFocus: false,
  revalidateIfStale: false,
  revalidateOnReconnect: true,
  shouldRetryOnError: false,
  errorRetryCount: 2,
  keepPreviousData: true,
  provider: () => new Map(),
};

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={globalSWRConfig}>
      {children}
    </SWRConfig>
  );
} 