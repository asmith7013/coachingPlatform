import { createCrudHooks } from '@query/client/factories/crud-factory';
import { 
  CoachingActionPlanZodSchema, 
  CoachingActionPlan
} from '@/lib/schema/zod-schema/cap/coaching-action-plan';
import { ZodSchema } from 'zod';
import { 
  fetchCoachingActionPlans,
  fetchCoachingActionPlanById,
  createCoachingActionPlan,
  updateCoachingActionPlan,
  deleteCoachingActionPlan
} from "@actions/coaching/coaching-action-plans";

const coachingActionPlanHooks = createCrudHooks({
  entityType: 'coachingActionPlans',
  schema: CoachingActionPlanZodSchema as ZodSchema<CoachingActionPlan>,
  serverActions: {
    fetch: fetchCoachingActionPlans,
    fetchById: fetchCoachingActionPlanById,
    create: createCoachingActionPlan,
    update: updateCoachingActionPlan,
    delete: deleteCoachingActionPlan
  },
  validSortFields: ['title', 'status', 'startDate', 'academicYear', 'createdAt', 'updatedAt'],
  relatedEntityTypes: ['schools', 'staff']
});

export const useCoachingActionPlans = {
  list: coachingActionPlanHooks.useList,
  byId: coachingActionPlanHooks.useDetail,
  mutations: coachingActionPlanHooks.useMutations,
  manager: coachingActionPlanHooks.useManager
}; 