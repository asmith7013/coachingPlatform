"use server";

import { CoachingActionPlanV2Model } from "@mongoose-schema/cap/coaching-action-plan-v2.model";
import {
  CoachingActionPlanV2ZodSchema,
  CoachingActionPlanV2InputZodSchema,
  type CoachingActionPlanV2Input,
  CoachingActionPlanV2,
} from "@zod-schema/cap/coaching-action-plan-v2";
import { createCrudActions } from "@server/crud/crud-factory";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { uploadFileWithProgress } from "@server/file-handling/file-upload";
import { ZodType } from "zod";
import { QueryParams, DEFAULT_QUERY_PARAMS } from "@core-types/query";

const coachingActionPlanActions = createCrudActions({
  model: CoachingActionPlanV2Model,
  schema: CoachingActionPlanV2ZodSchema as ZodType<CoachingActionPlanV2>,
  inputSchema: CoachingActionPlanV2InputZodSchema as ZodType<CoachingActionPlanV2Input>,
  name: "Coaching Action Plan",
  revalidationPaths: ["/dashboard/coaching-action-plans"],
  sortFields: ['title', 'status', 'startDate', 'academicYear', 'createdAt'],
  defaultSortField: 'startDate',
  defaultSortOrder: 'desc'
});

export async function fetchCoachingActionPlans(params: QueryParams = DEFAULT_QUERY_PARAMS) {
  return withDbConnection(() => coachingActionPlanActions.fetch(params));
}

export async function fetchCoachingActionPlanById(id: string) {
  return withDbConnection(() => coachingActionPlanActions.fetchById(id));
}

export async function createCoachingActionPlan(data: CoachingActionPlanV2Input) {
  return withDbConnection(() => coachingActionPlanActions.create(data));
}

export async function updateCoachingActionPlan(id: string, data: Partial<CoachingActionPlanV2Input>) {
  return withDbConnection(() => coachingActionPlanActions.update(id, data));
}

export async function deleteCoachingActionPlan(id: string) {
  return withDbConnection(() => coachingActionPlanActions.delete(id));
}

// ===== V2 Progress Calculation =====
export async function getCoachingActionPlanProgress(id: string) {
  return withDbConnection(async () => {
    try {
      const result = await coachingActionPlanActions.fetchById(id);
      if (!result.success || !result.data) {
        throw new Error('Coaching Action Plan not found');
      }
      const plan = result.data;
      const progress = {
        hasBasicInfo: !!(plan.title && plan.goalDescription),
        hasIPGFocus: !!(plan.ipgCoreAction && plan.ipgSubCategory),
        hasRationale: !!plan.rationale,
        hasGoal: !!plan.goalDescription,
        completionPercentage: 0
      };
      const fields = [progress.hasBasicInfo, progress.hasIPGFocus, progress.hasRationale, progress.hasGoal];
      progress.completionPercentage = (fields.filter(Boolean).length / fields.length) * 100;
      return {
        success: true,
        data: progress
      };
    } catch (error) {
      console.error('Error calculating plan progress:', error);
      return {
        success: false,
        error: handleServerError(error, 'getCoachingActionPlanProgress')
      };
    }
  });
}

// ===== V2 Status Workflow =====
export async function getAvailableStatusTransitions(id: string) {
  return withDbConnection(async () => {
    try {
      const result = await coachingActionPlanActions.fetchById(id);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: 'Coaching Action Plan not found'
        };
      }
      const plan = result.data;
      const getNextStatuses = (currentStatus: string) => {
        switch (currentStatus) {
          case 'draft':
            return ['active', 'cancelled'];
          case 'active':
            return ['completed', 'paused', 'cancelled'];
          case 'paused':
            return ['active', 'cancelled'];
          case 'completed':
            return ['archived'];
          default:
            return [];
        }
      };
      const nextStatuses = getNextStatuses(plan.status);
      return {
        success: true,
        data: {
          currentStatus: plan.status,
          availableTransitions: nextStatuses.map(status => ({
            status,
            description: `Change status to ${status}`
          }))
        }
      };
    } catch (error) {
      console.error('Error getting status transitions:', error);
      return {
        success: false,
        error: handleServerError(error, 'getAvailableStatusTransitions')
      };
    }
  });
}

// ===== V2 Field Validation =====
export async function validateCoachingActionPlanField(id: string, fieldName: keyof CoachingActionPlanV2Input) {
  return withDbConnection(async () => {
    try {
      const result = await coachingActionPlanActions.fetchById(id);
      if (!result.success || !result.data) {
        throw new Error('Coaching Action Plan not found');
      }
      const plan = result.data;
      const fieldValue = (plan as Record<string, unknown>)[fieldName as string];
      return {
        success: true,
        data: {
          field: fieldName,
          hasValue: !!fieldValue,
          value: fieldValue
        }
      };
    } catch (error) {
      console.error('Error validating field:', error);
      return {
        success: false,
        error: handleServerError(error, 'validateCoachingActionPlanField')
      };
    }
  });
}

// ===== V2 Bulk Status Update =====
export async function bulkUpdateCoachingActionPlanStatus(
  planIds: string[],
  newStatus: string
) {
  return withDbConnection(async () => {
    try {
      const results = await Promise.all(
        planIds.map(async (id) => {
          const result = await updateCoachingActionPlan(id, { status: newStatus });
          return { id, success: result.success, error: result.error };
        })
      );
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      return {
        success: true,
        data: {
          updated: successful.length,
          failed: failed.length,
          errors: failed.map(f => ({ id: f.id, error: f.error }))
        }
      };
    } catch (error) {
      console.error('Error bulk updating plan status:', error);
      return {
        success: false,
        error: handleServerError(error, 'bulkUpdateCoachingActionPlanStatus')
      };
    }
  });
}

// ===== File Upload Integration =====
export async function uploadCoachingActionPlanFile(file: File): Promise<string> {
  try {
    const result = await uploadFileWithProgress(file, "/api/coaching-action-plans/upload");
    return result.message || "No message";
  } catch (error) {
    throw handleServerError(error);
  }
}

export async function fetchCoachingActionPlanWithRelatedData(id: string) {
  return withDbConnection(async () => {
    try {
      const capResult = await coachingActionPlanActions.fetchById(id);
      if (!capResult.success) {
        return capResult;
      }
      return {
        success: true,
        data: capResult.data
      };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to fetch CAP with related data: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  });
} 