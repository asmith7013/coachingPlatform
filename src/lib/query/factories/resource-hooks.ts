import { createEntityHooks } from '@query/factories/entity-hooks';
import { BaseDocument } from '@core-types/document';
import { ServerActions } from '@core-types/query-factory';

/**
 * Configuration for resource hooks
 */
export interface ResourceHooksConfig<T extends BaseDocument, TInput> {
  /** Resource type/name (e.g., 'schools', 'staff') */
  resourceType: string;
  
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
  
  /** Related resource types to invalidate on mutations */
  relatedResourceTypes?: string[];
}

/**
 * Factory function that creates a set of React Query hooks for a specific resource type.
 * This is a higher-level factory that uses the entity hooks factory.
 */
export function createResourceHooks<
  T extends BaseDocument,
  TInput = Omit<T, '_id' | 'id' | 'createdAt' | 'updatedAt'>
>(config: ResourceHooksConfig<T, TInput>) {
  // Create entity hooks
  const entityHooks = createEntityHooks<T, TInput>({
    entityType: config.resourceType,
    serverActions: config.serverActions,
    defaultParams: config.defaultParams,
    validSortFields: config.validSortFields,
    persistFilters: config.persistFilters,
    storageKey: config.storageKey,
    staleTime: config.staleTime,
    relatedEntityTypes: config.relatedResourceTypes
  });
  
  // Return the hooks with more specific names
  return {
    useList: entityHooks.useList,
    useById: entityHooks.useById,
    useMutations: entityHooks.useMutations,
    useManager: entityHooks.useManager
  };
}
