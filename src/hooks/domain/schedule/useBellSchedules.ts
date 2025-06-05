import { z } from 'zod';
import { createEntityHooks } from '@query/client/factories/entity-factory';

import { BellScheduleZodSchema, type BellSchedule } from '@zod-schema/schedule/schedule';
import { 
  fetchBellSchedules, 
  fetchBellScheduleById, 
  createBellSchedule, 
  updateBellSchedule, 
  deleteBellSchedule
} from '@actions/schedule/schedule';
// import { DocumentInput, WithDateObjects } from '@core-types/document';

import { createTransformationService } from '@transformers/core/transformation-service';
import { ensureBaseDocumentCompatibility } from '@transformers/utils/response-utils';

/**
 * Create transformation service following established pattern
 */
const bellScheduleTransformation = createTransformationService({
    entityType: 'bellSchedules',
    schema: ensureBaseDocumentCompatibility<BellSchedule>(BellScheduleZodSchema),
    handleDates: true,
    errorContext: 'useBellSchedules'
  });

/**
 * Wrap server actions with transformation service
 */
const wrappedActions = bellScheduleTransformation.wrapServerActions({
  fetch: fetchBellSchedules,
  fetchById: fetchBellScheduleById,
  create: createBellSchedule,
  update: updateBellSchedule,
  delete: deleteBellSchedule
});

/**
 * Create entity hooks using established factory pattern
 */
const {
  useEntityList: useBellSchedulesList,
  useEntityById: useBellScheduleById,
  useMutations: useBellSchedulesMutations,
  useManager: useBellScheduleManager
} = createEntityHooks<BellSchedule>({
  entityType: 'bellSchedules',
  fullSchema: BellScheduleZodSchema as z.ZodType<BellSchedule>,
  inputSchema: ensureBaseDocumentCompatibility<BellSchedule>(BellScheduleZodSchema),
  serverActions: wrappedActions,
  validSortFields: ['school', 'bellScheduleType', 'createdAt', 'updatedAt'],
  defaultParams: {
    sortBy: 'school',
    sortOrder: 'asc',
    page: 1,
    limit: 50
  },
  staleTime: 5 * 60 * 1000, // 5 minutes
  persistFilters: true,
  relatedEntityTypes: ['schools']
});

/**
 * Unified interface following useSchools pattern
 */
export const useBellSchedules = {
  list: useBellSchedulesList,
  byId: useBellScheduleById,
  mutations: useBellSchedulesMutations,
  manager: useBellScheduleManager,
  transformation: bellScheduleTransformation
};

// Export individual hooks for backward compatibility
export { 
  useBellSchedulesList, 
  useBellScheduleById, 
  useBellSchedulesMutations, 
  useBellScheduleManager
};

export default useBellSchedules; 