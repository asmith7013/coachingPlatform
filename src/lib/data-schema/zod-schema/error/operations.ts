import { z } from "zod";

/**
 * Operation types for React Query-related errors
 */
export const QueryOperationTypeSchema = z.enum([
  'query',          // Data fetching
  'mutation',       // Data mutation
  'invalidation',   // Cache invalidation
  'initialization', // Query system setup
  'selector',       // Data transformation
  'hydration',      // SSR hydration
  'prefetch'        // Server-side prefetching
]).describe("React Query operation types");

/**
 * Base Operation Type Schema (extendable for other domains)
 */
export const OperationTypeSchema = QueryOperationTypeSchema
  // Extend with other operation types as needed
  // .or(AuthOperationTypeSchema)
  // .or(ApiOperationTypeSchema)
  .describe("Application operation types for error tracking");

// Export type definitions for TypeScript
export type QueryOperationType = z.infer<typeof QueryOperationTypeSchema>;
export type OperationType = z.infer<typeof OperationTypeSchema>; 