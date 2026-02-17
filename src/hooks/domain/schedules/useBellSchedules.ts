import { createCrudHooks } from "@query/client/factories/crud-factory";
import { ZodSchema } from "zod";
import {
  BellScheduleZodSchema,
  type BellSchedule,
} from "@/lib/schema/zod-schema/schedules/schedule-documents";
import {
  fetchBellSchedules,
  fetchBellScheduleById,
  createBellSchedule,
  updateBellSchedule,
  deleteBellSchedule,
} from "@/app/actions/schedules/bell-schedule";

// Standard CRUD factory usage - no custom logic
const bellScheduleHooks = createCrudHooks({
  entityType: "bellSchedules",
  schema: BellScheduleZodSchema as ZodSchema<BellSchedule>,
  serverActions: {
    fetch: fetchBellSchedules,
    fetchById: fetchBellScheduleById,
    create: createBellSchedule,
    update: updateBellSchedule,
    delete: deleteBellSchedule,
  },
  validSortFields: ["name", "schoolId", "bellScheduleType", "createdAt"],
  relatedEntityTypes: ["schools", "teacherSchedules"],
});

// Export individual hooks
const useBellSchedulesList = bellScheduleHooks.useList;
const useBellScheduleById = bellScheduleHooks.useDetail;
const useBellSchedulesMutations = bellScheduleHooks.useMutations;
const useBellScheduleManager = bellScheduleHooks.useManager;

// Unified interface following established pattern
export const useBellSchedules = {
  list: useBellSchedulesList,
  byId: useBellScheduleById,
  mutations: useBellSchedulesMutations,
  manager: useBellScheduleManager,
};

// Individual exports for backward compatibility
export {
  useBellSchedulesList,
  useBellScheduleById,
  useBellSchedulesMutations,
  useBellScheduleManager,
};

export default useBellSchedules;
