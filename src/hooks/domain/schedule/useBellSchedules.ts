import { createCrudHooks } from '@query/client/factories/crud-factory';
import { ZodSchema } from 'zod';
import { BellScheduleZodSchema, type BellSchedule } from '@zod-schema/schedule/schedule';
import { 
  fetchBellSchedules, 
  fetchBellScheduleById, 
  createBellSchedule, 
  updateBellSchedule, 
  deleteBellSchedule
} from '@actions/schedule/schedule';
// import { DocumentInput, WithDateObjects } from '@core-types/document';

/**
 * Custom React Query hooks for Bell Schedule entity
 * SIMPLIFIED: Direct CRUD factory usage, no unnecessary transformation
 */
const bellScheduleHooks = createCrudHooks({
  entityType: 'bellSchedules',
  schema: BellScheduleZodSchema as ZodSchema<BellSchedule>,
  serverActions: {
    fetch: fetchBellSchedules,
    fetchById: fetchBellScheduleById,
    create: createBellSchedule,
    update: updateBellSchedule,
    delete: deleteBellSchedule
  },
  validSortFields: ['school', 'bellScheduleType', 'createdAt', 'updatedAt'],
  relatedEntityTypes: ['schools']
});

// Export with domain-specific names
const useBellSchedulesList = bellScheduleHooks.useList;
const useBellScheduleById = bellScheduleHooks.useDetail;
const useBellSchedulesMutations = bellScheduleHooks.useMutations;
const useBellScheduleManager = bellScheduleHooks.useManager;

/**
 * Unified interface following useSchools pattern
 */
export const useBellSchedules = {
  list: useBellSchedulesList,
  byId: useBellScheduleById,
  mutations: useBellSchedulesMutations,
  manager: useBellScheduleManager
};

// Export individual hooks for backward compatibility
export { 
  useBellSchedulesList, 
  useBellScheduleById, 
  useBellSchedulesMutations, 
  useBellScheduleManager
};

export default useBellSchedules; 