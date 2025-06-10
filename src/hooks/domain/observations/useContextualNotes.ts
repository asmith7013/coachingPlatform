import { createCrudHooks } from '@query/client/factories/crud-factory';
import { ContextualNoteZodSchema, ContextualNote } from '@zod-schema/observations/classroom-observation';
import { ZodSchema } from 'zod';
import { 
  fetchContextualNotes, 
  fetchContextualNoteById, 
  createContextualNote, 
  updateContextualNote, 
  deleteContextualNote 
} from '@actions/observations/contextual-notes';

/**
 * Custom React Query hooks for ContextualNote entity
 * SIMPLIFIED: Direct CRUD factory usage, no unnecessary abstraction
 */
const contextualNoteHooks = createCrudHooks({
  entityType: 'contextual-notes',
  schema: ContextualNoteZodSchema as ZodSchema<ContextualNote>,
  serverActions: {
    fetch: fetchContextualNotes,
    fetchById: fetchContextualNoteById,
    create: createContextualNote,
    update: updateContextualNote,
    delete: deleteContextualNote
  },
  validSortFields: ['content', 'noteType', 'createdAt', 'updatedAt'],
  relatedEntityTypes: ['visits', 'classroom-observations']
});

// Export with domain-specific names
const useContextualNotesList = contextualNoteHooks.useList;
const useContextualNotesById = contextualNoteHooks.useDetail;
const useContextualNotesMutations = contextualNoteHooks.useMutations;
const useContextualNotes = contextualNoteHooks.useManager;

// Export individual hooks
export { useContextualNotesList, useContextualNotesById, useContextualNotesMutations, useContextualNotes };

export default useContextualNotes; 