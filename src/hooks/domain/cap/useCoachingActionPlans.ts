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
  updateCoachingActionPlanPartial,
  deleteCoachingActionPlan,
  updateCoachingActionPlanStage,
  validateCoachingActionPlanStage,
  getCoachingActionPlanProgress
} from "@actions/coaching/coaching-action-plans";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { WithDateObjects } from '@core-types/document';
import { createTransformationService } from '@transformers/core/transformation-service';
import { z } from 'zod';
import { ensureBaseDocumentCompatibility } from '@/lib/transformers/utils/response-utils';
import { useAutoSave } from '@hooks/utilities/useAutoSave';
import { useInvalidation } from '@query/cache/invalidation';
import { useBulkOperations } from '@query/client/hooks/mutations/useBulkOperations';

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
 * 🔄 PHASE 2: Wrap core server actions with transformation service
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

// 🔄 PHASE 1.2: Enhanced progress hook using transformation service for consistency
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

// 🔄 PHASE 1.2: ENHANCED - Ergonomic auto-save hook wrapper 
export function useCoachingActionPlanAutoSave(planId: string, data: Partial<CoachingActionPlanInput>) {
  const { invalidateEntity, invalidateList } = useInvalidation();
  
  const saveFunction = useCallback(async (entityId: string, saveData: unknown) => {
    const result = await updateCoachingActionPlanPartial(entityId, saveData as Partial<CoachingActionPlanInput>);
    
    if (result.success) {
      // 🆕 Use standardized invalidation patterns for consistency
      await Promise.all([
        invalidateEntity('coachingActionPlans', entityId),
        invalidateList('coachingActionPlans')
      ]);
    } else {
      throw new Error(result.error);
    }
  }, [invalidateEntity, invalidateList]);

  // 🆕 Direct useAutoSave integration - follows your recommended pattern exactly
  return useAutoSave({
    entityId: planId,
    data,
    onSave: saveFunction,
    debounceMs: 2000, // 2-second debouncing as specified
    enabled: !!planId && !!data
  });
}

// 🆕 PHASE 1.3: Enhanced manager with bulk operations and invalidation
export function useCoachingActionPlanManagerWithInvalidation() {
  const manager = useCoachingActionPlanManager();
  const { invalidateEntity, invalidateList } = useInvalidation();
  
  const bulkOps = useBulkOperations({
    entityType: 'coachingActionPlans',
    schema: CoachingActionPlanZodSchema as z.ZodType<CoachingActionPlanWithDates>,
    relatedEntityTypes: ['schools', 'staff', 'visits']
  });

  const updateStage = useCallback(async (
    id: string, 
    stage: string,
    data: Partial<CoachingActionPlanInput>
  ) => {
    const result = await updateCoachingActionPlanStage(id, stage, data);
    if (result.success) {
      await Promise.all([
        invalidateEntity('coachingActionPlans', id),
        invalidateList('coachingActionPlans')
      ]);
      return result;
    }
    throw new Error(result.error);
  }, [invalidateEntity, invalidateList]);

  const validateStage = useCallback(async (id: string, stage: string) => {
    const result = await validateCoachingActionPlanStage(id, stage);
    if (result.success) {
      return result;
    }
    throw new Error(result.error);
  }, []);

  const getProgress = useCallback(async (id: string) => {
    const result = await getCoachingActionPlanProgress(id);
    if (result.success) {
      return result;
    }
    throw new Error(result.error);
  }, []);

  const refreshCoachingActionPlan = useCallback(async (id: string) => {
    await invalidateEntity('coachingActionPlans', id);
  }, [invalidateEntity]);

  const refreshAllCoachingActionPlans = useCallback(async () => {
    await invalidateList('coachingActionPlans');
  }, [invalidateList]);

  return {
    ...manager,
    updateStage,
    validateStage,
    getProgress,
    refreshCoachingActionPlan,
    refreshAllCoachingActionPlans,
    bulkUpdatePlans: bulkOps.bulkUpdate,
    isBulkUpdating: bulkOps.isUpdating,
    bulkUpdateError: bulkOps.updateError
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
 * 🔄 PHASE 3: Unified interface following schools pattern with enhanced capabilities
 */
export const useCoachingActionPlans = {
  list: useCoachingActionPlansList,
  byId: useCoachingActionPlanById,
  progress: useCoachingActionPlanProgress,
  mutations: useCoachingActionPlansMutations,
  manager: useCoachingActionPlanManager,
  autoSave: useCoachingActionPlanAutoSave,
  withInvalidation: useCoachingActionPlanManagerWithInvalidation,
  transformation: coachingActionPlanTransformation
}; 