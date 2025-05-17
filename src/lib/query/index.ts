// src/lib/query/index.ts
// Export query client and provider
export { QueryProvider } from './provider';
export { queryClient, resetQueryCache, setInitialQueryData } from './core/client';

// Export query keys
export { queryKeys, createEntityKeys } from './core/keys';

// Export utility functions
export * from './utilities/error-handling';
export * from './utilities/response-types';
export * from './utilities/feature-flags';
export * from './utilities/invalidation';
export * from './hydration';