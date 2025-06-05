import { createEntityHooks } from '@query/client/factories/entity-factory';
import { 
  CoachingActionPlanZodSchema, 
  CoachingActionPlan,
  type CoachingActionPlanInput
} from '@zod-schema/core/cap';
import { 
  fetchCoachingActionPlans,
  fetchCoachingActionPlanById,
  createCoachingActionPlan,
  updateCoachingActionPlan,
  deleteCoachingActionPlan,
  updateCoachingActionPlanStage,
  validateCoachingActionPlanStage,
  getCoachingActionPlanProgress
} from "@actions/coaching/coaching-action-plans";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { WithDateObjects } from '@core-types/document';
import { createTransformationService } from '@transformers/core/transformation-service';
import { z } from 'zod';
import { ensureBaseDocumentCompatibility } from '@/lib/transformers/utils/response-utils';

/**
 * Coaching Action Plan entity with Date objects instead of string dates
 */
export type CoachingActionPlanWithDates = WithDateObjects<CoachingActionPlan>;

/**
 * Create transformation service following established pattern
 */
const coachingActionPlanTransformation = createTransformationService<CoachingActionPlan, CoachingActionPlanWithDates>({
  entityType: 'coachingActionPlans',
  schema: CoachingActionPlanZodSchema as z.ZodSchema<CoachingActionPlan>,
  handleDates: true,
  errorContext: 'useCoachingActionPlans'
});

/**
 * Wrap server actions with transformation service
 */
const wrappedActions = coachingActionPlanTransformation.wrapServerActions({
  fetch: fetchCoachingActionPlans,
  fetchById: fetchCoachingActionPlanById,
  create: createCoachingActionPlan,
  update: updateCoachingActionPlan,
  delete: deleteCoachingActionPlan
});

/**
 * Create entity hooks using established factory pattern
 */
const {
  useEntityList: useCoachingActionPlansList,
  useEntityById: useCoachingActionPlanById,
  useMutations: useCoachingActionPlansMutations,
  useManager: useCoachingActionPlanManager
} = createEntityHooks({
  entityType: 'coachingActionPlans',
  fullSchema: CoachingActionPlanZodSchema as z.ZodSchema<CoachingActionPlan>,
  inputSchema: ensureBaseDocumentCompatibility<CoachingActionPlan>(CoachingActionPlanZodSchema),
  serverActions: wrappedActions,
  validSortFields: ['title', 'status', 'startDate', 'academicYear', 'createdAt', 'updatedAt'],
  defaultParams: {
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 12
  },
  staleTime: 5 * 60 * 1000, // 5 minutes
  persistFilters: true,
  relatedEntityTypes: ['schools', 'staff']
});

// Query keys for additional operations
const queryKeys = {
  all: ['coachingActionPlans'] as const,
  lists: () => [...queryKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...queryKeys.lists(), params] as const,
  details: () => [...queryKeys.all, 'detail'] as const,
  detail: (id: string) => [...queryKeys.details(), id] as const,
  progress: (id: string) => [...queryKeys.detail(id), 'progress'] as const,
  stageValidation: (id: string, stage: string) => [...queryKeys.detail(id), 'stage', stage] as const,
};

// Additional hooks for specialized operations
export function useCoachingActionPlanProgress(id: string) {
  return useQuery({
    queryKey: queryKeys.progress(id),
    queryFn: () => getCoachingActionPlanProgress(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute for progress data
  });
}

// Manager hook with enhanced stage functionality
export function useCoachingActionPlanManagerWithStages() {
  const queryClient = useQueryClient();
  const manager = useCoachingActionPlanManager();

  const updateStage = async (
    id: string, 
    stage: string,
    data: Partial<CoachingActionPlanInput>
  ) => {
    const result = await updateCoachingActionPlanStage(id, stage, data);
    if (result.success) {
      // Invalidate relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.progress(id) }),
      ]);
      return result;
    }
    throw new Error(result.error);
  };

  const validateStage = async (id: string, stage: string) => {
    const result = await validateCoachingActionPlanStage(id, stage);
    if (result.success) {
      return result;
    }
    throw new Error(result.error);
  };

  const getProgress = async (id: string) => {
    const result = await getCoachingActionPlanProgress(id);
    if (result.success) {
      return result;
    }
    throw new Error(result.error);
  };

  return {
    ...manager,
    updateStage,
    validateStage,
    getProgress,
  };
}

// Export individual hooks with descriptive aliases
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
  manager: useCoachingActionPlanManager,
  withStages: useCoachingActionPlanManagerWithStages,
  transformation: coachingActionPlanTransformation
}; 