import { createEntityHooks } from '@query/client/factories/entity-factory';
import { z } from 'zod';
import { 
  TeacherScheduleZodSchema, 
  type TeacherSchedule
} from '@zod-schema/schedule/schedule';
import { 
  fetchTeacherSchedules, 
  fetchTeacherScheduleById, 
  createTeacherSchedule, 
  updateTeacherSchedule, 
  deleteTeacherSchedule
} from '@actions/schedule/schedule';
import { DocumentInput, WithDateObjects } from '@core-types/document';
import { createTransformationService } from '@transformers/core/transformation-service';
import { ensureBaseDocumentCompatibility } from '@transformers/utils/response-utils';


/**
 * Teacher Schedule entity with Date objects instead of string dates
 */
export type TeacherScheduleWithDates = WithDateObjects<TeacherSchedule>;

/**
 * Input type that satisfies DocumentInput constraint
 */
export type TeacherScheduleInputType = DocumentInput<TeacherSchedule>;

/**
 * Create transformation service following established pattern
 */
const teacherScheduleTransformation = createTransformationService({
  entityType: 'teacherSchedules',
  schema: ensureBaseDocumentCompatibility<TeacherSchedule>(TeacherScheduleZodSchema),
  handleDates: true,
  errorContext: 'useTeacherSchedules'
});

/**
 * Wrap server actions with transformation service
 */
const wrappedActions = teacherScheduleTransformation.wrapServerActions({
  fetch: fetchTeacherSchedules,
  fetchById: fetchTeacherScheduleById,
  create: createTeacherSchedule,
  update: updateTeacherSchedule,
  delete: deleteTeacherSchedule
});

/**
 * Create entity hooks using established factory pattern
 */
const {
  useEntityList: useTeacherSchedulesList,
  useEntityById: useTeacherScheduleById,
  useMutations: useTeacherSchedulesMutations,
  useManager: useTeacherScheduleManager
} = createEntityHooks<TeacherScheduleWithDates, TeacherScheduleInputType>({
  entityType: 'teacherSchedules',
  fullSchema: TeacherScheduleZodSchema as z.ZodType<TeacherScheduleWithDates>,
  inputSchema: ensureBaseDocumentCompatibility<TeacherSchedule>(TeacherScheduleZodSchema),
  serverActions: wrappedActions,
  validSortFields: ['teacher', 'school', 'createdAt', 'updatedAt'],
  defaultParams: {
    sortBy: 'teacher',
    sortOrder: 'asc',
    page: 1,
    limit: 50
  },
  staleTime: 5 * 60 * 1000, // 5 minutes
  persistFilters: true,
  relatedEntityTypes: ['schools', 'staff']
});

/**
 * Unified interface following useSchools pattern
 */
export const useTeacherSchedules = {
  list: useTeacherSchedulesList,
  byId: useTeacherScheduleById,
  mutations: useTeacherSchedulesMutations,
  manager: useTeacherScheduleManager,
  transformation: teacherScheduleTransformation
};

// Export individual hooks for backward compatibility
export { 
  useTeacherSchedulesList, 
  useTeacherScheduleById, 
  useTeacherSchedulesMutations, 
  useTeacherScheduleManager
};

export default useTeacherSchedules; 