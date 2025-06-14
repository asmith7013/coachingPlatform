import { createCrudHooks } from '@query/client/factories/crud-factory';
import { ClassroomObservationNoteZodSchema, ClassroomObservationNote, ClassroomObservationNoteInput } from '@zod-schema/observations/classroom-observation';
import { ZodSchema } from 'zod';
import { 
  fetchClassroomObservations, 
  fetchClassroomObservationById, 
  createClassroomObservation, 
  updateClassroomObservation, 
  deleteClassroomObservation 
} from '@actions/observations/classroom-observations';
import { useInvalidation } from '@query/cache/invalidation';
import { useNotifications } from '@/hooks/ui/useNotifications';
import { createDefaultToastConfig } from '@/lib/ui/notifications/toast-configs';
import { FEATURE_FLAGS } from '@/lib/ui/notifications/types';
import { useCallback } from 'react';

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
const useClassroomObservationsManager = classroomObservationHooks.useManager;

/**
 * Enhanced observation manager with explicit invalidation capabilities
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
  
  const refreshTeacherObservations = useCallback(async () => {
    // Invalidate observations for specific teacher
    await invalidateList('classroom-observations');
  }, [invalidateList]);
  
  return {
    ...manager,
    refreshObservation,
    refreshAllObservations,
    refreshTeacherObservations
  };
}

/**
 * Enhanced observation manager with toast notifications
 */
function useClassroomObservationsWithNotifications() {
  const notifications = useNotifications();
  const toastConfig = createDefaultToastConfig('classroom observations');
  const enableToasts = FEATURE_FLAGS?.ENABLE_TOASTS !== false;
  const mutations = useClassroomObservationsMutations();

  return {
    ...mutations,
    createWithToast: (data: ClassroomObservationNoteInput) => {
      if (!mutations.createAsync) throw new Error('createAsync is not defined');
      return notifications.withToast(
        () => mutations.createAsync!(data as ClassroomObservationNote),
        toastConfig.create!,
        enableToasts
      );
    },
    updateWithToast: (id: string, data: Partial<ClassroomObservationNoteInput>) => {
      if (!mutations.updateAsync) throw new Error('updateAsync is not defined');
      return notifications.withToast(
        () => mutations.updateAsync!(id, data),
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
 * Enhanced observation manager with auto-save capabilities
 */
function useClassroomObservationsWithAutoSave() {
  const mutations = useClassroomObservationsMutations();
  
  const createAutoSaveConfig = useCallback((observationId: string, formData: ClassroomObservationNoteInput) => {
    return {
      entityId: observationId,
      data: formData,
      onSave: async (id: string, data: unknown) => {
        if (!mutations.updateAsync) throw new Error('updateAsync not available');
        // Ensure data is the correct type and only includes schema fields
        const updateDataRaw = data as Partial<ClassroomObservationNoteInput>;
        const updateData: Partial<ClassroomObservationNoteInput> = {
          status: updateDataRaw.status || 'draft',
          ownerIds: updateDataRaw.ownerIds || [],
          cycle: updateDataRaw.cycle || '',
          session: updateDataRaw.session || '',
          teacherId: updateDataRaw.teacherId || '',
          coachId: updateDataRaw.coachId || '',
          schoolId: updateDataRaw.schoolId || '',
          date: updateDataRaw.date || new Date().toISOString(),
          lesson: updateDataRaw.lesson,
          otherContext: updateDataRaw.otherContext,
          learningTargets: updateDataRaw.learningTargets,
          coolDown: updateDataRaw.coolDown,
          feedback: updateDataRaw.feedback,
          lessonFlow: updateDataRaw.lessonFlow,
          progressMonitoring: updateDataRaw.progressMonitoring,
          timeTracking: updateDataRaw.timeTracking,
          transcripts: updateDataRaw.transcripts,
          contextualNotes: updateDataRaw.contextualNotes,
          tagging: updateDataRaw.tagging,
          isSharedWithTeacher: updateDataRaw.isSharedWithTeacher,
          visitId: updateDataRaw.visitId,
          coachingActionPlanId: updateDataRaw.coachingActionPlanId,
          isDraft: updateDataRaw.isDraft,
        };
        const result = await mutations.updateAsync!(id, updateData);
        if (!result.success) {
          throw new Error(result.error || 'Auto-save failed');
        }
      },
      enabled: !!observationId,
      debounceMs: 2000
    };
  }, [mutations.updateAsync]);
  
  const createInitialDraft = useCallback(async (formData: ClassroomObservationNoteInput) => {
    if (!mutations.createAsync) throw new Error('createAsync not available');
    // Ensure all required fields are present for draft
    const draftData: ClassroomObservationNoteInput = {
      status: formData.status || 'draft',
      ownerIds: formData.ownerIds || [],
      cycle: formData.cycle || '',
      session: formData.session || '',
      teacherId: formData.teacherId || '',
      coachId: formData.coachId || '',
      schoolId: formData.schoolId || '',
      date: formData.date || new Date().toISOString(),
      lesson: formData.lesson,
      otherContext: formData.otherContext,
      learningTargets: formData.learningTargets,
      coolDown: formData.coolDown,
      feedback: formData.feedback,
      lessonFlow: formData.lessonFlow,
      progressMonitoring: formData.progressMonitoring,
      timeTracking: formData.timeTracking,
      transcripts: formData.transcripts,
      contextualNotes: formData.contextualNotes,
      tagging: formData.tagging,
      isSharedWithTeacher: formData.isSharedWithTeacher,
      visitId: formData.visitId,
      coachingActionPlanId: formData.coachingActionPlanId,
      isDraft: true,
    };
    const result = await mutations.createAsync!(draftData as ClassroomObservationNote);
    if (result.success && result.data) {
      return result.data._id;
    }
    throw new Error('Failed to create initial draft');
  }, [mutations.createAsync]);
  
  return {
    createAutoSaveConfig,
    createInitialDraft,
    updateAsync: mutations.updateAsync
  };
}

// Export individual hooks
export { 
  useClassroomObservationsList, 
  useClassroomObservationsById, 
  useClassroomObservationsMutations, 
  useClassroomObservationsManager,
  useClassroomObservationsWithInvalidation,
  useClassroomObservationsWithNotifications,
  useClassroomObservationsWithAutoSave
};

/**
 * Unified interface for all classroom observation hooks
 * Matches the pattern established in useSchools
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