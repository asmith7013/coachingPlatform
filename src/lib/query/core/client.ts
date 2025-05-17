// import { QueryClient } from '@tanstack/react-query';
import { createQueryClientWithErrorHandling } from '../utilities/error-handling';

/**
 * Global QueryClient instance with proper error handling
 * 
 * This is used for stand-alone functions that need access to the query client
 * outside of React components.
 */
export const queryClient = createQueryClientWithErrorHandling();

/**
 * Reset the entire cache (useful for testing and debugging)
 */
export function resetQueryCache(): void {
  queryClient.clear();
}

/**
 * Pre-populate the query cache with initial data (useful for SSR)
 * 
 * @param queryKey The query key to populate
 * @param data The initial data
 */
export function setInitialQueryData<T>(queryKey: unknown[], data: T): void {
  queryClient.setQueryData(queryKey, data);
} 