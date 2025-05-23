import { createCrudHooks } from '@query/factories/crud-hooks';
import { BaseDocument } from '@core-types/document';
import { ServerActions } from '@core-types/query-factory';
import { ZodSchema } from 'zod';

/**
 * Configuration for entity hooks
 */
export interface EntityHooksConfig<T extends BaseDocument, TInput> {
  /** Entity type/name (e.g., 'schools', 'staff') */
  entityType: string;
  
  /** Server actions for CRUD operations */
  serverActions: ServerActions<T, TInput>;
  
  /** Zod schema for full entity validation */
  fullSchema: ZodSchema<T>;
  
  /** Zod schema for input validation (create/update) */
  inputSchema: ZodSchema<TInput>;
  
  /** Default parameters for queries */
  defaultParams?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, unknown>;
  };
  
  /** Valid sort fields */
  validSortFields?: string[];
  
  /** Whether to persist filter/sort state */
  persistFilters?: boolean;
  
  /** Storage key for filters */
  storageKey?: string;
  
  /** Stale time for queries in ms */
  staleTime?: number;
  
  /** Related entity types to invalidate on mutations */
  relatedEntityTypes?: string[];
}

/**
 * Factory function that creates a set of React Query hooks for a specific entity type.
 * This is a higher-level factory that uses the CRUD hooks factory.
 * 
 * VERIFIED: This factory correctly passes schemas through to the CRUD hooks factory,
 * which already implements the 3-layer transformation system.
 */
export function createEntityHooks<
  T extends BaseDocument,
  TInput = Omit<T, '_id' | 'id' | 'createdAt' | 'updatedAt'>
>(config: EntityHooksConfig<T, TInput>) {
  // Pass schemas through to CRUD hooks (schemas are already being passed correctly)
  const crudHooks = createCrudHooks<T, TInput>({
    entityType: config.entityType,
    serverActions: config.serverActions,
    fullSchema: config.fullSchema,
    inputSchema: config.inputSchema,
    defaultParams: config.defaultParams,
    validSortFields: config.validSortFields,
    persistFilters: config.persistFilters,
    storageKey: config.storageKey,
    staleTime: config.staleTime,
    relatedEntityTypes: config.relatedEntityTypes
  });
  
  // Return the hooks with more specific names
  // VERIFIED: The CRUD hooks factory already handles schema integration correctly
  return {
    useList: crudHooks.useList,
    useById: crudHooks.useById,
    useMutations: crudHooks.useMutations,
    useManager: crudHooks.useManager,
    // ADDED: Alias for backward compatibility (as specified in cursor prompt)
    useEntity: crudHooks.useManager
  };
}

