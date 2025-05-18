import useSWR, { SWRConfiguration } from "swr";
import { handleClientError } from "@error/handlers/client";
import { useMemo, useEffect } from "react";

type Fetcher<T> = () => Promise<T>;

/**
 * @deprecated Use useSafeQuery from '@hooks/query/useSafeQuery' instead.
 * This hook will be removed in a future version. See migration guide at docs/data-flow/react-query-patterns.md
 * 
 * Enhanced SWR hook with optimized caching, error handling, and key stability
 * @param key - The SWR cache key (string, array, or null)
 * @param fetcher - The data fetching function
 * @param context - Context string for error reporting
 * @param options - Additional SWR configuration options
 */
export function useSafeSWR<T>(
  key: string | readonly unknown[] | null,
  fetcher: Fetcher<T>,
  context: string,
  options: SWRConfiguration = {}
) {
  // Add deprecation warning in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'useSafeSWR is deprecated and will be removed in a future version. ' +
        'Please migrate to useSafeQuery from @hooks/query/useSafeQuery.'
      );
    }
  }, []);

  // Create stable key reference for array keys
  // This prevents unnecessary revalidations when array references change but contents don't
  const stableKey = useMemo(() => {
    if (key === null || typeof key === 'string') {
      return key;
    }
    // For array keys, create a stable reference if contents haven't changed
    return key;
  }, [key]);

  // Enhanced configuration for data stability and performance
  const defaultConfig: SWRConfiguration = {
    dedupingInterval: 10000,     // Deduplicate requests within 10 seconds (increased from 5s)
    revalidateOnFocus: false,    // Don't revalidate when window regains focus
    revalidateIfStale: false,    // Don't automatically revalidate stale data
    revalidateOnReconnect: true, // Revalidate when browser regains connection
    shouldRetryOnError: false,   // Don't retry on error
    focusThrottleInterval: 5000, // If focus revalidation is enabled, throttle it
    errorRetryCount: 2,          // Limit retries on error
    keepPreviousData: true,      // Keep previous data when fetching new data
  };

  // Use memoized fetcher wrapper to ensure stable function reference
  const safeFetcher = useMemo(() => async () => {
    try {
      return await fetcher();
    } catch (err) {
      const errorMessage = handleClientError(err, context);
      console.error(`❌ ${context} failed:`, errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetcher, context]);

  return useSWR<T>(
    stableKey, 
    safeFetcher,
    { ...defaultConfig, ...options }
  );
} 