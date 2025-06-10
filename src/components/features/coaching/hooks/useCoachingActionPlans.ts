import { createCrudHooks } from '@query/client/factories/crud-factory';
import { 
  CoachingActionPlanZodSchema, 
  CoachingActionPlan
} from '@zod-schema/core/cap';
import { ZodSchema } from 'zod';
import { 
  fetchCoachingActionPlans,
  fetchCoachingActionPlanById,
  createCoachingActionPlan,
  updateCoachingActionPlan,
  deleteCoachingActionPlan,
  getCoachingActionPlanProgress
} from "@actions/coaching/coaching-action-plans";
import { useQuery } from "@tanstack/react-query";

/**
 * Custom React Query hooks for Coaching Action Plan entity
 * SIMPLIFIED: Direct CRUD factory usage, no unnecessary abstraction
 */
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

// Export with domain-specific names
const useCoachingActionPlansList = coachingActionPlanHooks.useList;
const useCoachingActionPlanById = coachingActionPlanHooks.useDetail;
const useCoachingActionPlansMutations = coachingActionPlanHooks.useMutations;
const useCoachingActionPlanManager = coachingActionPlanHooks.useManager;

// Progress hook using standard query pattern
export function useCoachingActionPlanProgress(id: string) {
  return useQuery({
    queryKey: ['coachingActionPlans', 'detail', id, 'progress'],
    queryFn: async () => {
      const result = await getCoachingActionPlanProgress(id);
      if (result.success) {
        return result;
      }
      throw new Error(result.error);
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute for progress data
  });
}

// Export individual hooks
export { 
  useCoachingActionPlansList, 
  useCoachingActionPlanById, 
  useCoachingActionPlansMutations, 
  useCoachingActionPlanManager
};

/**
 * Unified interface following schools pattern
 */
export const useCoachingActionPlans = {
  list: useCoachingActionPlansList,
  byId: useCoachingActionPlanById,
  progress: useCoachingActionPlanProgress,
  mutations: useCoachingActionPlansMutations,
  manager: useCoachingActionPlanManager
};

export default useCoachingActionPlans; 