import { createCrudHooks } from "@query/client/factories/crud-factory";
import { ZodSchema } from "zod";
import {
  TeacherScheduleZodSchema,
  type TeacherSchedule,
} from "@/lib/schema/zod-schema/schedules/schedule-documents";
import {
  fetchTeacherSchedules,
  fetchTeacherScheduleById,
  createTeacherSchedule,
  updateTeacherSchedule,
  deleteTeacherSchedule,
} from "@/app/actions/schedules/teacher-schedule";

// Standard CRUD factory usage - no custom logic
const teacherScheduleHooks = createCrudHooks({
  entityType: "teacherSchedules",
  schema: TeacherScheduleZodSchema as ZodSchema<TeacherSchedule>,
  serverActions: {
    fetch: fetchTeacherSchedules,
    fetchById: fetchTeacherScheduleById,
    create: createTeacherSchedule,
    update: updateTeacherSchedule,
    delete: deleteTeacherSchedule,
  },
  validSortFields: ["teacherId", "schoolId", "createdAt"],
  relatedEntityTypes: ["schools", "staff", "bellSchedules"],
});

// Export individual hooks
const useTeacherSchedulesList = teacherScheduleHooks.useList;
const useTeacherScheduleById = teacherScheduleHooks.useDetail;
const useTeacherSchedulesMutations = teacherScheduleHooks.useMutations;
const useTeacherScheduleManager = teacherScheduleHooks.useManager;

// Unified interface following established pattern
export const useTeacherSchedules = {
  list: useTeacherSchedulesList,
  byId: useTeacherScheduleById,
  mutations: useTeacherSchedulesMutations,
  manager: useTeacherScheduleManager,
};

// Individual exports for backward compatibility
export {
  useTeacherSchedulesList,
  useTeacherScheduleById,
  useTeacherSchedulesMutations,
  useTeacherScheduleManager,
};

export default useTeacherSchedules;
