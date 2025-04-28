// src/lib/types/core/index.ts
// Export API types with named exports
export { 
    type FetchParams,
    DEFAULT_FETCH_PARAMS,
    getDefaultFetchParams
  } from './api';
  
  // Export pagination types with named exports
  export {
    type PaginationOptions,
    type PaginatedResult,
    DEFAULT_PAGINATION_OPTIONS
  } from './pagination';
  
  // Export other modules
  export * from './error';
  export * from './document';
  export * from './reference';
  export * from './response';
  export * from './utils';