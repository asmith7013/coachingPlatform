/**
 * @deprecated This entire module is deprecated. Use selector-based pagination from @/lib/query/utilities/pagination.ts instead.
 * 
 * Migration Guide:
 * 1. Replace direct imports from this module with imports from @/lib/query/utilities/pagination.ts
 * 2. Use executePaginatedQueryWithSelector instead of executePaginatedQuery
 * 3. Use fetchPaginatedResourceWithSelector instead of fetchPaginatedResource
 * 4. Use createPaginatedQueryHook for React Query integration
 */

export * from './pagination';
export * from './paginated-query';
export * from './sort-utils';
