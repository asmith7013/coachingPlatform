import { createEntityHooks } from '@query/client/factories/entity-factory';
import { 
  LookForZodSchema, 
  LookForInputZodSchema, 
  LookFor
} from '@zod-schema/look-fors/look-for';
import { 
  fetchLookFors, 
  createLookFor, 
  updateLookFor, 
  deleteLookFor 
} from '@actions/lookFors/lookFors';
import { WithDateObjects, DocumentInput } from '@core-types/document';
import { wrapServerActions } from '@transformers/factories/server-action-factory';
import { transformData } from '@transformers/core/unified-transformer';
import { ZodType } from 'zod';
import { useCallback } from 'react';

/**
 * LookFor entity with Date objects instead of string dates
 */
export type LookForWithDates = WithDateObjects<LookFor>;

/**
 * Input type that satisfies DocumentInput constraint for LookFor
 */
export type LookForInput = DocumentInput<LookFor>;

// Stub function for fetchById since it doesn't exist in the actions
const fetchLookForById = async (_id: string) => {
  throw new Error('fetchLookForById not implemented');
};

/**
 * Wraps all server actions to transform dates in responses
 */
const wrappedActions = wrapServerActions<LookFor, LookForWithDates, LookForInput>(
  {
    fetch: fetchLookFors,
    fetchById: fetchLookForById,
    create: createLookFor,
    update: updateLookFor,
    delete: deleteLookFor
  },
  items => transformData<LookFor, LookForWithDates>(items, {
    schema: LookForZodSchema as unknown as ZodType<LookForWithDates>,
    handleDates: true,
    errorContext: 'useLookFors'
  })
);

/**
 * Custom React Query hooks for LookFor entity
 * 
 * These hooks handle fetching, creating, updating, and deleting look-for items
 * with proper date transformation (string dates to Date objects)
 */
const entityHooks = createEntityHooks<LookForWithDates, LookForInput>({
  entityType: 'look-fors',
  fullSchema: LookForZodSchema as unknown as ZodType<LookForWithDates>,
  inputSchema: LookForInputZodSchema as unknown as ZodType<LookForInput>,
  serverActions: wrappedActions,
  validSortFields: ['topic', 'category', 'status', 'createdAt', 'updatedAt'],
  defaultParams: {
    sortBy: 'topic',
    sortOrder: 'asc',
    page: 1,
    limit: 20
  },
  staleTime: 5 * 60 * 1000, // 5 minutes
  persistFilters: true,
  relatedEntityTypes: ['schools', 'rubrics']
});

// Export individual hooks
export const {
  useEntityList: useLookForList,
  useEntityById: useLookForById,
  useMutations: useLookForMutations
} = entityHooks;

/**
 * Enhanced hook that provides backward compatibility with existing components
 * while leveraging the entity hooks system
 */
export function useLookFors() {
  const { 
    items,
    total,
    isLoading,
    error,
    page,
    pageSize,
    setPage,
    setPageSize,
    filters,
    applyFilters: applyFiltersOriginal,
    sortBy,
    sortOrder,
    changeSorting
  } = entityHooks.useEntityList();

  const { delete: deleteItem } = entityHooks.useMutations();

  // Apply filters with a consistent signature
  const applyFilters = useCallback((newFilters: Record<string, unknown>) => {
    applyFiltersOriginal(newFilters);
  }, [applyFiltersOriginal]);

  // Provide a backward-compatible removeLookFor method
  const removeLookFor = useCallback(async (id: string) => {
    if (deleteItem) {
      return deleteItem(id);
    }
    throw new Error('Delete operation not available');
  }, [deleteItem]);

  return {
    // Data
    lookFors: items || [],
    total: total || 0,
    loading: isLoading,
    error,
    
    // Pagination
    page,
    limit: pageSize,
    setPage,
    setPageSize,
    
    // Filtering and sorting
    filters,
    applyFilters,
    sortBy,
    sortOrder,
    changeSorting,
    
    // Operations
    removeLookFor
  };
}

// Default export
export default useLookFors; 