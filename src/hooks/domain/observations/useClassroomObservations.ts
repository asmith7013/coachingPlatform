import { createCrudHooks } from '@query/client/factories/crud-factory';
import { ClassroomObservationNoteZodSchema, ClassroomObservationNote } from '@zod-schema/observations/classroom-observation';
import { ZodSchema } from 'zod';
import { 
  fetchClassroomObservations, 
  fetchClassroomObservationById, 
  createClassroomObservation, 
  updateClassroomObservation, 
  deleteClassroomObservation 
} from '@actions/observations/classroom-observations';

/**
 * Custom React Query hooks for ClassroomObservation entity
 * SIMPLIFIED: Direct CRUD factory usage, no unnecessary abstraction
 */
const classroomObservationHooks = createCrudHooks({
  entityType: 'classroom-observations',
  schema: ClassroomObservationNoteZodSchema as ZodSchema<ClassroomObservationNote>,
  serverActions: {
    fetch: fetchClassroomObservations,
    fetchById: fetchClassroomObservationById,
    create: createClassroomObservation,
    update: updateClassroomObservation,
    delete: deleteClassroomObservation
  },
  validSortFields: ['date', 'teacherId', 'status', 'createdAt', 'updatedAt'],
  relatedEntityTypes: ['visits', 'contextual-notes', 'staff']
});

// Export with domain-specific names
const useClassroomObservationsList = classroomObservationHooks.useList;
const useClassroomObservationsById = classroomObservationHooks.useDetail;
const useClassroomObservationsMutations = classroomObservationHooks.useMutations;
const useClassroomObservations = classroomObservationHooks.useManager;

// Export individual hooks
export { useClassroomObservationsList, useClassroomObservationsById, useClassroomObservationsMutations, useClassroomObservations };

export default useClassroomObservations; 