import { createCrudHooks } from '@query/client/factories/crud-factory';
import { ZodSchema } from 'zod';
import { 
  VisitScheduleZodSchema, 
  type VisitSchedule 
} from '@/lib/schema/zod-schema/schedules/schedule-documents';
import { 
  fetchVisitSchedules,
  fetchVisitScheduleById,
  createVisitSchedule,
  updateVisitSchedule,
  deleteVisitSchedule
} from '@/app/actions/schedules/visit-schedule';

// Standard CRUD factory usage - no custom logic
const visitScheduleHooks = createCrudHooks({
  entityType: 'visitSchedules',
  schema: VisitScheduleZodSchema as ZodSchema<VisitSchedule>,
  serverActions: {
    fetch: fetchVisitSchedules,
    fetchById: fetchVisitScheduleById,
    create: createVisitSchedule,
    update: updateVisitSchedule,
    delete: deleteVisitSchedule
  },
  validSortFields: ['date', 'coachId', 'schoolId', 'createdAt'],
  relatedEntityTypes: ['schools', 'staff', 'coachingActionPlans', 'bellSchedules']
});

// Export individual hooks
const useVisitSchedulesList = visitScheduleHooks.useList;
const useVisitScheduleById = visitScheduleHooks.useDetail;
const useVisitSchedulesMutations = visitScheduleHooks.useMutations;
const useVisitScheduleManager = visitScheduleHooks.useManager;

// Unified interface following established pattern
export const useVisitSchedules = {
  list: useVisitSchedulesList,
  byId: useVisitScheduleById,
  mutations: useVisitSchedulesMutations,
  manager: useVisitScheduleManager
};

// Individual exports for backward compatibility
export { 
  useVisitSchedulesList, 
  useVisitScheduleById, 
  useVisitSchedulesMutations, 
  useVisitScheduleManager
};

export default useVisitSchedules; 