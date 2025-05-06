/**
 * Centralized query key factory for consistent cache management
 * 
 * This module defines a structured approach to creating query keys
 * that ensures consistent cache invalidation and organization.
 */

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
  },
  
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
  }
};
