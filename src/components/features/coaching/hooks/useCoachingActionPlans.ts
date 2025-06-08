import { createCrudHooks } from '@query/client/factories/crud-factory';
import { 
  CoachingActionPlanZodSchema, 
  CoachingActionPlan,
  type CoachingActionPlanInput
} from '@zod-schema/core/cap';
import { ZodSchema } from 'zod';
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
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useAutoSave } from '@hooks/utilities/useAutoSave';
import { useInvalidation } from '@query/cache/invalidation';
import { useBulkOperations } from '@/query/client/hooks/mutations/useBulkOperations';

/**
 * Custom React Query hooks for Coaching Action Plan entity
 * SIMPLIFIED: Direct CRUD factory usage, no unnecessary transformation
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

// Enhanced progress hook using transformation service for consistency
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

// ENHANCED - Ergonomic auto-save hook wrapper 
export function useCoachingActionPlanAutoSave(planId: string, data: Partial<CoachingActionPlanInput>) {
  const { invalidateEntity, invalidateList } = useInvalidation();
  
  const saveFunction = useCallback(async (entityId: string, saveData: unknown) => {
    const result = await updateCoachingActionPlan(entityId, saveData as Partial<CoachingActionPlanInput>);
    
    if (result.success) {
      // Use standardized invalidation patterns for consistency
      await Promise.all([
        invalidateEntity('coachingActionPlans', entityId),
        invalidateList('coachingActionPlans')
      ]);
    } else {
      throw new Error(result.error);
    }
  }, [invalidateEntity, invalidateList]);

  // Direct useAutoSave integration - follows your recommended pattern exactly
  return useAutoSave({
    entityId: planId,
    data,
    onSave: saveFunction,
    debounceMs: 2000, // 2-second debouncing as specified
    enabled: !!planId && !!data
  });
}

// Enhanced manager with bulk operations and invalidation
export function useCoachingActionPlanManagerWithInvalidation() {
  const manager = useCoachingActionPlanManager();
  const { invalidateEntity, invalidateList } = useInvalidation();
  
  const bulkOps = useBulkOperations({
    entityType: 'coachingActionPlans',
    schema: CoachingActionPlanZodSchema as ZodSchema<CoachingActionPlan>,
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
 * Unified interface following schools pattern with enhanced capabilities
 */
export const useCoachingActionPlans = {
  list: useCoachingActionPlansList,
  byId: useCoachingActionPlanById,
  progress: useCoachingActionPlanProgress,
  mutations: useCoachingActionPlansMutations,
  manager: useCoachingActionPlanManager,
  withInvalidation: useCoachingActionPlanManagerWithInvalidation,
  autoSave: useCoachingActionPlanAutoSave
};

export default useCoachingActionPlans; 