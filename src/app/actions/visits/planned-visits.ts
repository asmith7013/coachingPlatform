"use server";

import { createCrudActions } from "@server/crud";
import { PlannedVisitModel } from "@mongoose-schema/visits/planned-visit.model";
import { 
  PlannedVisit,
  PlannedVisitZodSchema, 
  PlannedVisitInputZodSchema,
  type PlannedVisitInput,
  type TimeSlot
} from "@zod-schema/visits/planned-visit";
import { withDbConnection } from "@server/db/ensure-connection";
import { QueryParams } from "@core-types/query";
import { ZodType } from "zod";
import { bulkUploadToDB } from "@server/crud/bulk-operations";
import { handleServerError } from "@error/handlers/server";

// Create PlannedVisit CRUD actions using established factory pattern
const plannedVisitActions = createCrudActions({
  model: PlannedVisitModel,
  schema: PlannedVisitZodSchema as ZodType<PlannedVisit>,
  inputSchema: PlannedVisitInputZodSchema,
  name: "PlannedVisit",
  revalidationPaths: ["/dashboard/visits/planned", "/dashboard/schedule"],
  sortFields: ['date', 'teacherId', 'coach', 'timeSlot.startTime', 'createdAt', 'updatedAt'],
  defaultSortField: 'date',
  defaultSortOrder: 'asc'
});

// Export standard CRUD functions with connection handling (following visits.ts pattern)
export async function createPlannedVisit(data: PlannedVisitInput) {
  return withDbConnection(() => plannedVisitActions.create(data));
}

export async function updatePlannedVisit(id: string, data: Partial<PlannedVisitInput>) {
  return withDbConnection(() => plannedVisitActions.update(id, data));
}

export async function deletePlannedVisit(id: string) {
  return withDbConnection(() => plannedVisitActions.delete(id));
}

export async function fetchPlannedVisits(params: QueryParams) {
  return withDbConnection(() => plannedVisitActions.fetch(params));
}

export async function fetchPlannedVisitById(id: string) {
  return withDbConnection(() => plannedVisitActions.fetchById(id));
}

/**
 * Check for teacher scheduling conflicts on a specific date and time slot
 * Used by useAssignmentManagement hook for conflict detection
 */
export async function checkTeacherConflicts(
  teacherId: string, 
  date: string, 
  timeSlot: TimeSlot
) {
  return withDbConnection(async () => {
    try {
      if (!teacherId || !date || !timeSlot) {
        return {
          success: false,
          hasConflicts: false,
          error: 'Missing required parameters for conflict check'
        };
      }

      // Find any existing planned visits for this teacher on this date
      // that have overlapping time slots
      const conflicts = await PlannedVisitModel.find({
        teacherId,
        date: new Date(date),
        $or: [
          {
            // Check for time slot overlap using standard overlap detection
            // (startA < endB && endA > startB)
            'timeSlot.startTime': { $lt: timeSlot.endTime },
            'timeSlot.endTime': { $gt: timeSlot.startTime }
          }
        ]
      }).lean();

      const hasConflicts = conflicts.length > 0;

      return {
        success: true,
        hasConflicts,
        conflicts: hasConflicts ? conflicts.map(conflict => ({
          id: (conflict._id as { toString(): string }).toString(),
          timeSlot: conflict.timeSlot,
          purpose: conflict.purpose,
          coach: conflict.coach
        })) : []
      };
    } catch (error) {
      const errorMessage = handleServerError(error, 'checkTeacherConflicts');
      return {
        success: false,
        hasConflicts: false,
        error: errorMessage
      };
    }
  });
}

/**
 * Bulk create planned visits from schedule builder assignments
 * Used by usePlannedVisits hook for bulk operations
 */
export async function bulkCreatePlannedVisits(data: PlannedVisitInput[]) {
  return withDbConnection(async () => {
    try {
      if (!data || data.length === 0) {
        return {
          success: false,
          error: 'No data provided for bulk creation'
        };
      }

      // Use existing bulk upload utility with proper validation
      const result = await bulkUploadToDB(
        data,
        PlannedVisitModel,
        PlannedVisitInputZodSchema,
        ["/dashboard/visits/planned", "/dashboard/schedule"]
      );
      
      return {
        success: result.success,
        data: result.items,
        count: result.total,
        message: result.message || `Successfully created ${result.total} planned visits`
      };
    } catch (error) {
      const errorMessage = handleServerError(error, 'bulkCreatePlannedVisits');
      return {
        success: false,
        error: errorMessage
      };
    }
  });
} 