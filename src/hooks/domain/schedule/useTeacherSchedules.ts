import { createCrudHooks } from '@query/client/factories/crud-factory';
import { ZodSchema } from 'zod';
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

/**
 * Custom React Query hooks for Teacher Schedule entity
 * SIMPLIFIED: Direct CRUD factory usage, no unnecessary transformation
 */
const teacherScheduleHooks = createCrudHooks({
  entityType: 'teacherSchedules',
  schema: TeacherScheduleZodSchema as ZodSchema<TeacherSchedule>,
  serverActions: {
    fetch: fetchTeacherSchedules,
    fetchById: fetchTeacherScheduleById,
    create: createTeacherSchedule,
    update: updateTeacherSchedule,
    delete: deleteTeacherSchedule
  },
  validSortFields: ['teacher', 'school', 'createdAt', 'updatedAt'],
  relatedEntityTypes: ['schools', 'staff']
});

// Export with domain-specific names
const useTeacherSchedulesList = teacherScheduleHooks.useList;
const useTeacherScheduleById = teacherScheduleHooks.useDetail;
const useTeacherSchedulesMutations = teacherScheduleHooks.useMutations;
const useTeacherScheduleManager = teacherScheduleHooks.useManager;

/**
 * Unified interface following useSchools pattern
 */
export const useTeacherSchedules = {
  list: useTeacherSchedulesList,
  byId: useTeacherScheduleById,
  mutations: useTeacherSchedulesMutations,
  manager: useTeacherScheduleManager
};

// Export individual hooks for backward compatibility
export { 
  useTeacherSchedulesList, 
  useTeacherScheduleById, 
  useTeacherSchedulesMutations, 
  useTeacherScheduleManager
};

export default useTeacherSchedules; 