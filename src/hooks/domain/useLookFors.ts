import { createCrudHooks } from '@query/client/factories/crud-factory';
import { LookForZodSchema, LookFor } from '@zod-schema/look-fors/look-for';
import { ZodSchema } from 'zod';
import { fetchLookFors, createLookFor, updateLookFor, deleteLookFor } from '@actions/lookFors/lookFors';

/**
 * Custom React Query hooks for LookFor entity
 * SIMPLIFIED: Direct CRUD factory usage, no unnecessary abstraction
 */
const lookForHooks = createCrudHooks({
  entityType: 'look-fors',
  schema: LookForZodSchema as ZodSchema<LookFor>,
  serverActions: {
    fetch: fetchLookFors,
    create: createLookFor,
    update: updateLookFor,
    delete: deleteLookFor
  },
  validSortFields: ['topic', 'category', 'status', 'createdAt', 'updatedAt'],
  relatedEntityTypes: ['schools', 'rubrics']
});

// Export individual hooks
export const useLookForList = lookForHooks.useList;
export const useLookForById = lookForHooks.useDetail;
export const useLookForMutations = lookForHooks.useMutations;

