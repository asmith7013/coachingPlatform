/**
 * Centralized query key factory for consistent cache management
 * 
 * This module defines a structured approach to creating query keys
 * that ensures consistent cache invalidation and organization.
 */

/**
 * Factory for creating typed query keys
 */
export type QueryKeyFactory<TFilters = Record<string, unknown>> = {
  /** Base key for all entity operations */
  all: readonly unknown[];
  /** Key for list operations */
  lists: () => readonly unknown[];
  /** Key for a specific list with filters */
  list: (filters?: TFilters) => readonly unknown[];
  /** Key for all detail operations */
  details: () => readonly unknown[];
  /** Key for a specific detail by ID */
  detail: (id: string) => readonly unknown[];
};

/**
 * Creates a set of query keys for an entity type
 * 
 * @param entity The entity name (e.g., 'schools', 'staff')
 * @returns A set of functions for creating query keys
 */
export function createEntityKeys<TFilters = Record<string, unknown>>(
  entity: string
): QueryKeyFactory<TFilters> {
  return {
    // Base key for the entity
    all: [entity] as const,
    // Key for list operations
    lists: () => [...createEntityKeys(entity).all, 'list'] as const,
    // Key for a specific list with filters
    list: (filters?: TFilters) => 
      [...createEntityKeys(entity).lists(), { ...(filters || {}) }] as const,
    // Key for detail operations
    details: () => [...createEntityKeys(entity).all, 'detail'] as const,
    // Key for a specific detail by ID
    detail: (id: string) => 
      [...createEntityKeys(entity).details(), id] as const,
  };
}

/**
 * Query keys for the entire application
 * 
 * Factory functions for generating consistent query keys that maintain
 * proper parent-child relationships for granular invalidation.
 */
export const queryKeys = {
  // Core entity keys
  entities: {
    all: ['entities'] as const,
    lists: () => [...queryKeys.entities.all, 'list'] as const,
    list: (entity: string, filters?: Record<string, unknown>) => 
      [...queryKeys.entities.lists(), entity, { ...(filters || {}) }] as const,
    details: () => [...queryKeys.entities.all, 'detail'] as const,
    detail: (entity: string, id: string) => 
      [...queryKeys.entities.details(), entity, id] as const,
    
    // Create type-safe entity keys for specific entities
    forEntity: <TFilters = Record<string, unknown>>(entity: string) => 
      createEntityKeys<TFilters>(entity),
  },
  
  // Domain-specific keys
  
  // Monday integration keys
  monday: {
    all: ['monday'] as const,
    connection: () => [...queryKeys.monday.all, 'connection'] as const,
    boards: () => [...queryKeys.monday.all, 'boards'] as const,
    board: (id: string) => [...queryKeys.monday.boards(), id] as const,
    visits: () => [...queryKeys.monday.all, 'visits'] as const,
    potentialVisits: (boardId: string) => [...queryKeys.monday.board(boardId), 'potential'] as const,
    importPreview: (ids: string[]) => [...queryKeys.monday.visits(), 'preview', ids.join(',')] as const
  },
  
  // Reference data keys
  references: {
    all: ['references'] as const,
    options: (url: string, search?: string) => 
      [...queryKeys.references.all, url, { search }] as const,
  },
  
  // UI state keys
  ui: {
    all: ['ui'] as const,
    filters: (screen: string) => [...queryKeys.ui.all, 'filters', screen] as const,
    pagination: (screen: string) => [...queryKeys.ui.all, 'pagination', screen] as const,
  },
  
  // Domain-specific entity keys
  schools: createEntityKeys<{ district?: string; search?: string }>('schools'),
  staff: createEntityKeys<{ role?: string; search?: string }>('staff'),
  visits: createEntityKeys<{ schoolId?: string; date?: string }>('visits'),
  lookFors: createEntityKeys<{ category?: string }>('lookFors'),
  coachingLogs: createEntityKeys('coachingLogs'),
  cycles: createEntityKeys('cycles'),
};
