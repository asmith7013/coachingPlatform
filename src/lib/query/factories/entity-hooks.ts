import { createCrudHooks } from '@query/factories/crud-hooks';
import { BaseDocument } from '@core-types/document';
import { ServerActions } from '@core-types/query-factory';

/**
 * Configuration for entity hooks
 */
export interface EntityHooksConfig<T extends BaseDocument, TInput> {
  /** Entity type/name (e.g., 'schools', 'staff') */
  entityType: string;
  
  /** Server actions for CRUD operations */
  serverActions: ServerActions<T, TInput>;
  
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
 */
export function createEntityHooks<
  T extends BaseDocument,
  TInput = Omit<T, '_id' | 'id' | 'createdAt' | 'updatedAt'>
>(config: EntityHooksConfig<T, TInput>) {
  // Create CRUD hooks
  const crudHooks = createCrudHooks<T, TInput>({
    entityType: config.entityType,
    serverActions: config.serverActions,
    defaultParams: config.defaultParams,
    validSortFields: config.validSortFields,
    persistFilters: config.persistFilters,
    storageKey: config.storageKey,
    staleTime: config.staleTime,
    relatedEntityTypes: config.relatedEntityTypes
  });
  
  // Return the hooks with more specific names
  return {
    useList: crudHooks.useList,
    useById: crudHooks.useById,
    useMutations: crudHooks.useMutations,
    useManager: crudHooks.useManager
  };
}

