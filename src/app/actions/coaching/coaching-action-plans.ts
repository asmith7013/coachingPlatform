// accept conditionally - needs further review later


"use server";

import { z, ZodType } from "zod";
import { CoachingActionPlanModel } from "@mongoose-schema/core/coaching-action-plan.model";
import { 
  CoachingActionPlan,
  CoachingActionPlanZodSchema, 
  CoachingActionPlanInputZodSchema,
  type CoachingActionPlanInput
} from "@zod-schema/core/cap";
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";
import { createCrudActions } from "@server/crud";
import { withDbConnection } from "@server/db/ensure-connection";
import { uploadFileWithProgress } from "@server/file-handling/file-upload";
import { bulkUploadToDB } from "@server/crud/bulk-operations";
import { QueryParams } from "@core-types/query";
import { 
  calculatePlanProgress, 
  isValidStage, 
  getStageFieldPath,
  statusWorkflow,
  type PlanStatus
} from '@transformers/utils/coaching-action-plan-utils';

// Create standard CRUD actions for Coaching Action Plans (following schools pattern)
const coachingActionPlanActions = createCrudActions({
  model: CoachingActionPlanModel,
  schema: CoachingActionPlanZodSchema as ZodType<CoachingActionPlan>,
  inputSchema: CoachingActionPlanInputZodSchema as ZodType<CoachingActionPlanInput>,
  name: "Coaching Action Plan",
  revalidationPaths: ["/dashboard/coaching-action-plans"],
  sortFields: ['title', 'status', 'startDate', 'academicYear', 'createdAt', 'updatedAt'],
  defaultSortField: 'createdAt',
  defaultSortOrder: 'desc'
});

// Export the generated actions with connection handling (following schools pattern)
export async function fetchCoachingActionPlans(params: QueryParams) {
  return withDbConnection(() => coachingActionPlanActions.fetch(params));
}

export async function createCoachingActionPlan(data: CoachingActionPlanInput) {
  return withDbConnection(() => coachingActionPlanActions.create(data));
}

export async function updateCoachingActionPlan(id: string, data: Partial<CoachingActionPlanInput>) {
  return withDbConnection(() => coachingActionPlanActions.update(id, data));
}

// NEW: Partial update server action for auto-save functionality
export async function updateCoachingActionPlanPartial(
  planId: string, 
  partialData: Partial<CoachingActionPlanInput>
) {
  return withDbConnection(async () => {
    try {
      // Validate the planId
      if (!planId || typeof planId !== 'string') {
        return {
          success: false,
          error: 'Invalid plan ID provided'
        };
      }

      // Validate that we have some data to update
      if (!partialData || Object.keys(partialData).length === 0) {
        return {
          success: false,
          error: 'No data provided for update'
        };
      }

      // Use MongoDB $set operation for efficient partial updates
      const updateResult = await CoachingActionPlanModel.findByIdAndUpdate(
        planId,
        { 
          $set: {
            ...partialData,
            updatedAt: new Date() // Always update the timestamp
          }
        },
        { 
          new: true, // Return the updated document
          runValidators: true, // Run schema validation
          lean: true // Return plain JavaScript object for better performance
        }
      );

      if (!updateResult) {
        return {
          success: false,
          error: 'Coaching Action Plan not found'
        };
      }

      // Validate the updated document against our schema
      const validationResult = CoachingActionPlanZodSchema.safeParse(updateResult);
      if (!validationResult.success) {
        console.error('Partial update validation failed:', validationResult.error);
        return {
          success: false,
          error: 'Updated data failed validation'
        };
      }

      return {
        success: true,
        data: validationResult.data,
        message: 'Coaching action plan updated successfully'
      };

    } catch (error) {
      // Handle Mongoose validation errors
      if (error instanceof Error && error.name === 'ValidationError') {
        return {
          success: false,
          error: `Validation error: ${error.message}`
        };
      }

      // Handle Mongoose cast errors (invalid ObjectId, etc.)
      if (error instanceof Error && error.name === 'CastError') {
        return {
          success: false,
          error: 'Invalid plan ID format'
        };
      }

      // Log error for monitoring but don't expose details to client
      console.error('Partial update error:', {
        planId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });

      return {
        success: false,
        error: handleServerError(error, 'updateCoachingActionPlanPartial')
      };
    }
  });
}

export async function deleteCoachingActionPlan(id: string) {
  return withDbConnection(() => coachingActionPlanActions.delete(id));
}

export async function fetchCoachingActionPlanById(id: string) {
  return withDbConnection(() => coachingActionPlanActions.fetchById(id));
}

// Status management actions
export async function updateCoachingActionPlanStatus(id: string, newStatus: PlanStatus, reason?: string) {
  return withDbConnection(async () => {
    try {
      // First, get the current plan to validate the transition
      const currentResult = await coachingActionPlanActions.fetchById(id);
      if (!currentResult.success || !currentResult.data) {
        return {
          success: false,
          error: 'Coaching Action Plan not found'
        };
      }

      const currentPlan = currentResult.data;
      
      // Validate the status transition
      const validation = statusWorkflow.validateTransition(currentPlan.status, newStatus, currentPlan);
      if (!validation.valid) {
        return {
          success: false,
          error: `Status transition not allowed: ${validation.errors.join(', ')}`
        };
      }

      // Update the status
      const updateData: Partial<CoachingActionPlanInput> = { 
        status: newStatus,
        // Add transition metadata if needed
        ...(reason && { statusChangeReason: reason })
      };

      return coachingActionPlanActions.update(id, updateData);
    } catch (error) {
      console.error('Error updating plan status:', error);
      return {
        success: false,
        error: handleServerError(error, 'updateCoachingActionPlanStatus')
      };
    }
  });
}

export async function bulkUpdateCoachingActionPlanStatus(planIds: string[], newStatus: PlanStatus) {
  return withDbConnection(async () => {
    try {
      const results = await Promise.all(
        planIds.map(async (id) => {
          const result = await updateCoachingActionPlanStatus(id, newStatus);
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
      const nextStatuses = statusWorkflow.getNextStatuses(plan.status, plan);
      
      return {
        success: true,
        data: {
          currentStatus: plan.status,
          availableTransitions: nextStatuses.map(status => ({
            status,
            description: statusWorkflow.transitions.find(t => 
              t.from === plan.status && t.to === status
            )?.description || ''
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

// Domain-specific utilities (following getSchoolIdFromSlug pattern)
export async function getCoachingActionPlanProgress(id: string) {
  return withDbConnection(async () => {
    try {
      const result = await coachingActionPlanActions.fetchById(id);
      if (!result.success || !result.data) {
        throw new Error('Coaching Action Plan not found');
      }
      
      // Use transformer utility (like parseSchoolSlug)
      return {
        success: true,
        data: calculatePlanProgress(result.data)
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

export async function validateCoachingActionPlanStage(id: string, stage: string) {
  return withDbConnection(async () => {
    try {
      if (!isValidStage(stage)) {
        throw new Error(`Invalid stage: ${stage}`);
      }

      const result = await coachingActionPlanActions.fetchById(id);
      if (!result.success || !result.data) {
        throw new Error('Coaching Action Plan not found');
      }

      // Use transformer utility for stage validation
      const progress = calculatePlanProgress(result.data);
      const stageProgress = progress.stageDetails.find(s => s.stage === stage);

      return {
        success: true,
        data: stageProgress
      };
    } catch (error) {
      console.error('Error validating stage:', error);
      return {
        success: false,
        error: handleServerError(error, 'validateCoachingActionPlanStage')
      };
    }
  });
}

// Stage update using standard update operation (simplified)
export async function updateCoachingActionPlanStage(
  id: string, 
  stage: string,
  data: Partial<CoachingActionPlanInput>
) {
  return withDbConnection(async () => {
    try {
      if (!isValidStage(stage)) {
        throw new Error(`Invalid stage: ${stage}`);
      }

      const stageField = getStageFieldPath(stage);
      const updateData = { [stageField]: data[stageField as keyof CoachingActionPlanInput] };
      
      return coachingActionPlanActions.update(id, updateData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: handleValidationError(error)
        };
      }
      return {
        success: false,
        error: handleServerError(error, 'updateCoachingActionPlanStage')
      };
    }
  });
}

// File upload integration (following uploadSchoolFile pattern)
export const uploadCoachingActionPlanFile = async (file: File): Promise<string> => {
  try {
    const result = await uploadFileWithProgress(file, "/api/coaching-action-plans/upload");
    return result.message || "No message";
  } catch (error) {
    throw handleServerError(error);
  }
};

// Bulk upload using existing utilities (following uploadSchools pattern)
export async function uploadCoachingActionPlans(data: CoachingActionPlanInput[]) {
  return withDbConnection(async () => {
    try {
      const result = await bulkUploadToDB(
        data, 
        CoachingActionPlanModel, 
        CoachingActionPlanInputZodSchema, 
        ["/dashboard/coaching-action-plans"]
      );
      
      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }

      return {
        success: true,
        items: result.items
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: handleValidationError(error)
        };
      }
      return {
        success: false,
        error: handleServerError(error)
      };
    }
  });
} 