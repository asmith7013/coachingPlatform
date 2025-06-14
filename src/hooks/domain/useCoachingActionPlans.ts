import { createCrudHooks } from '@query/client/factories/crud-factory';
import { CoachingActionPlanV2ZodSchema, CoachingActionPlanV2 } from '@zod-schema/cap/coaching-action-plan-v2';
import { ZodSchema } from 'zod';
import { 
  fetchCoachingActionPlans,
  fetchCoachingActionPlanById,
  createCoachingActionPlan,
  updateCoachingActionPlan,
  deleteCoachingActionPlan
} from "@app/actions/coaching/coaching-action-plans";

const coachingActionPlanHooks = createCrudHooks({
  entityType: 'coachingActionPlans',
  schema: CoachingActionPlanV2ZodSchema as ZodSchema<CoachingActionPlanV2>,
  serverActions: {
    fetch: fetchCoachingActionPlans,
    fetchById: fetchCoachingActionPlanById,
    create: createCoachingActionPlan,
    update: updateCoachingActionPlan,
    delete: deleteCoachingActionPlan
  },
  validSortFields: ['title', 'status', 'startDate', 'academicYear', 'createdAt'],
  relatedEntityTypes: ['schools', 'staff', 'capMetrics', 'capEvidence', 'capOutcomes', 'capWeeklyPlans', 'capImplementationRecords']
});

export const useCoachingActionPlans = {
  list: coachingActionPlanHooks.useList,
  byId: coachingActionPlanHooks.useDetail,
  mutations: coachingActionPlanHooks.useMutations,
  manager: coachingActionPlanHooks.useManager
}; 