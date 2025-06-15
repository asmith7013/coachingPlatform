import { createCrudHooks } from '@query/client/factories/crud-factory';
import {
  ClassroomObservationZodSchema,
  ClassroomObservation,
  ClassroomObservationInput,
  ClassroomObservationContext,
  ClassroomObservationInputZodSchema,
  createClassroomObservationDefaults
} from '@/lib/schema/zod-schema/visits/classroom-observation';
import {
  fetchClassroomObservations,
  fetchClassroomObservationById,
  createClassroomObservation,
  updateClassroomObservation,
  deleteClassroomObservation,
  autoSaveObservationData
} from '@/app/actions/observations/classroom-observations';
import { ZodSchema } from 'zod';
import { useInvalidation } from '@query/cache/invalidation';
import { useCallback } from 'react';
import { useNotifications } from '@/hooks/ui/useNotifications';
import { createDefaultToastConfig } from '@/lib/ui/notifications/toast-configs';
import { FEATURE_FLAGS } from '@/lib/ui/notifications/types';
import { DocumentInput } from '@/lib/types/core/document';

const classroomObservationHooks = createCrudHooks({
  entityType: 'classroom-observations',
  schema: ClassroomObservationZodSchema as ZodSchema<ClassroomObservation>,
  serverActions: {
    fetch: fetchClassroomObservations,
    fetchById: fetchClassroomObservationById,
    create: createClassroomObservation,
    update: updateClassroomObservation,
    delete: deleteClassroomObservation
  },
  validSortFields: ['date', 'teacherId', 'status', 'createdAt', 'updatedAt'],
  relatedEntityTypes: []
});

// Basic hooks
const useClassroomObservationsList = classroomObservationHooks.useList;
const useClassroomObservationsById = classroomObservationHooks.useDetail;
const useClassroomObservationsMutations = classroomObservationHooks.useMutations;
const useClassroomObservationsManager = classroomObservationHooks.useManager;

/**
 * Enhanced manager with explicit invalidation capabilities
 */
function useClassroomObservationsWithInvalidation() {
  const manager = useClassroomObservationsManager();
  const { invalidateEntity, invalidateList } = useInvalidation();
  
  const refreshObservation = useCallback(async (observationId: string) => {
    await invalidateEntity('classroom-observations', observationId);
  }, [invalidateEntity]);
  
  const refreshAllObservations = useCallback(async () => {
    await invalidateList('classroom-observations');
  }, [invalidateList]);
  
  return {
    ...manager,
    refreshObservation,
    refreshAllObservations
  };
}

/**
 * Enhanced with notifications
 */
function useClassroomObservationsWithNotifications() {
  const notifications = useNotifications();
  const toastConfig = createDefaultToastConfig('classroom-observations');
  const enableToasts = FEATURE_FLAGS?.ENABLE_TOASTS !== false;
  const mutations = useClassroomObservationsMutations();

  return {
    ...mutations,
    createWithToast: (data: ClassroomObservationInput) => {
      if (!mutations.createAsync) throw new Error('createAsync is not defined');
      return notifications.withToast(
        () => mutations.createAsync!(data as DocumentInput<ClassroomObservation>),
        toastConfig.create!,
        enableToasts
      );
    },
    updateWithToast: (id: string, data: Partial<ClassroomObservationInput>) => {
      if (!mutations.updateAsync) throw new Error('updateAsync is not defined');
      return notifications.withToast(
        () => mutations.updateAsync!(id, data as DocumentInput<ClassroomObservation>),
        toastConfig.update!,
        enableToasts
      );
    },
    deleteWithToast: (id: string) => {
      if (!mutations.deleteAsync) throw new Error('deleteAsync is not defined');
      return notifications.withToast(
        () => mutations.deleteAsync!(id),
        toastConfig.delete!,
        enableToasts
      );
    }
  };
}

/**
 * Auto-save integration for classroom observations
 */
function useClassroomObservationsWithAutoSave() {
  const createInitialDraft = useCallback(
    async (partialData: Partial<ClassroomObservationInput> = {}): Promise<string> => {
      // Only pass context fields to the defaults factory
      const {
        userId, schoolId, visitId, teacherId, coachId, cycle, session, coachingActionPlanId
      }: Partial<ClassroomObservationContext> = partialData;
      const defaults = createClassroomObservationDefaults({
        userId, schoolId, visitId, teacherId, coachId, cycle, session, coachingActionPlanId
      });
      // Merge in any additional fields and always set status to 'draft', then validate
      const completeData: ClassroomObservationInput = ClassroomObservationInputZodSchema.parse({
        ...defaults,
        ...partialData,
        status: 'draft'
      });
      const result = await createClassroomObservation(completeData as ClassroomObservationInput);
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create initial draft');
      }
      return result.data._id;
    },
    []
  );

  const createAutoSaveConfig = useCallback((observationId: string, formData: unknown) => {
    return {
      entityId: observationId,
      data: formData,
      onSave: async (id: string, data: unknown) => {
        const result = await autoSaveObservationData(id, data as Record<string, unknown>);
        if (!result.success) {
          throw new Error(result.error || 'Auto-save failed');
        }
      }
    };
  }, []);

  return {
    createInitialDraft,
    createAutoSaveConfig
  };
}

/**
 * Unified interface for all classroom observation-related hooks
 */
export const useClassroomObservations = {
  list: useClassroomObservationsList,
  byId: useClassroomObservationsById,
  mutations: useClassroomObservationsMutations,
  manager: useClassroomObservationsManager,
  withInvalidation: useClassroomObservationsWithInvalidation,
  withNotifications: useClassroomObservationsWithNotifications,
  withAutoSave: useClassroomObservationsWithAutoSave
};

export default useClassroomObservations; 