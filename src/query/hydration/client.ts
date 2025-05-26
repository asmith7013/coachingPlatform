'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { CollectionResponse } from '@core-types/response';
import { captureError, createErrorContext } from '@error';
import { queryClient } from '@query/core/client';
import { hydrateState } from '@/query/shared-utils/hydration-utils';
import { prefetchEntityData } from './core';

/**
 * Hook for managing hydration state in client components
 * Provides utilities for prefetching and managing query data
 */
export function useHydration() {
  const queryClient = useQueryClient();

  /**
   * Prefetches data for a specific entity
   */
  const prefetchEntity = useCallback(async <T>(
    entityType: string,
    fetchFn: (params: Record<string, unknown>) => Promise<CollectionResponse<T>>,
    params: Record<string, unknown> = {}
  ): Promise<void> => {
    return prefetchEntityData(queryClient, entityType, fetchFn, params);
  }, [queryClient]);

  /**
   * Checks if data is already in the cache for a specific entity
   */
  const hasCachedData = useCallback(
    (entityType: string, params: Record<string, unknown> = {}): boolean => {
      try {
        return queryClient.getQueryData([entityType, 'list', params]) !== undefined;
      } catch (error) {
        captureError(
          error, 
          createErrorContext('QueryHydration', 'hasCachedData', {
            metadata: { entityType, params }
          })
        );
        return false;
      }
    },
    [queryClient]
  );

  /**
   * Invalidates cached data for a specific entity
   */
  const invalidateEntity = useCallback(
    async (entityType: string, params: Record<string, unknown> = {}): Promise<void> => {
      try {
        await queryClient.invalidateQueries({
          queryKey: [entityType, 'list', params]
        });
      } catch (error) {
        captureError(
          error, 
          createErrorContext('QueryHydration', 'invalidateEntity', {
            metadata: { entityType, params }
          })
        );
      }
    },
    [queryClient]
  );

  return {
    prefetchEntity,
    hasCachedData,
    invalidateEntity
  };
}

/**
 * Hydrates the query client on the client side from Next.js props
 * To be used in app/providers.tsx for Next.js App Router
 */
export function hydrateQueryClient(): void {
  if (typeof window !== 'undefined') {
    // Look for the dehydrated state from the server
    const dehydratedState = window.__NEXT_DATA__?.props?.pageProps?.dehydratedState;
    
    if (dehydratedState) {
      hydrateState(queryClient, dehydratedState);
    }
  }
}
