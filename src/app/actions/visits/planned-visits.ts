// accept conditionally - needs further review later

"use server";

import { createCrudActions } from "@server/crud";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { QueryParams } from "@core-types/query";
import { ZodType } from "zod";
import { revalidatePath } from "next/cache";

// Import schemas (will need to create the Mongoose model)
import { 
  PlannedVisit,
  PlannedVisitZodSchema, 
  PlannedVisitInputZodSchema,
  type PlannedVisitInput
} from "@zod-schema/visits/planned-visit";

// Import state management schemas
import {
  VisitScheduleBuilderState,
  VisitScheduleBuilderStateZodSchema,
  type TeacherAccountabilityState
} from "@zod-schema/visits/schedule-builder-state";

// TODO: Create PlannedVisitModel - will be implemented in subsequent tasks
// import { PlannedVisitModel } from "@mongoose-schema/visits/planned-visit.model";

// For now, use a placeholder model structure
const PlannedVisitModel = null; // Will be replaced when Mongoose model is created

// Create PlannedVisit CRUD actions (following established visit pattern)
const plannedVisitActions = createCrudActions({
  model: PlannedVisitModel!,
  schema: PlannedVisitZodSchema as ZodType<PlannedVisit>,
  inputSchema: PlannedVisitInputZodSchema as ZodType<PlannedVisitInput>,
  name: "Planned Visit",
  revalidationPaths: ["/dashboard/schedule-builder", "/dashboard/visits"],
  sortFields: ['date', 'teacherId', 'coach', 'timeSlot.startTime', 'createdAt', 'updatedAt'],
  defaultSortField: 'date',
  defaultSortOrder: 'asc'
});

// =================== BASIC CRUD OPERATIONS ===================

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

// =================== SCHEDULE BUILDER OPERATIONS ===================

/**
 * Create multiple planned visits from schedule builder state
 */
export async function bulkCreatePlannedVisits(data: PlannedVisitInput[]) {
  try {
    const results = await Promise.all(
      data.map(visit => createPlannedVisit(visit))
    );
    
    // Revalidate schedule builder pages
    revalidatePath("/dashboard/schedule-builder");
    revalidatePath("/dashboard/visits");
    
    return {
      success: true,
      data: results,
      count: results.length
    };
  } catch (error) {
    return {
      success: false,
      error: handleServerError(error),
      count: 0
    };
  }
}

/**
 * Save schedule builder state for session persistence
 * This handles the UI state separate from the actual planned visits
 */
export async function saveScheduleBuilderState(state: VisitScheduleBuilderState) {
  try {
    // Validate the state
    const validatedState = VisitScheduleBuilderStateZodSchema.parse(state);
    
    // TODO: Implement state persistence to database or cache
    // For now, return success (client will handle local storage)
    
    return {
      success: true,
      data: validatedState,
      sessionId: validatedState.sessionId || `session_${Date.now()}`
    };
  } catch (error) {
    return {
      success: false,
      error: handleServerError(error)
    };
  }
}

/**
 * Load schedule builder state from session
 */
export async function loadScheduleBuilderState(sessionId: string) {
  try {
    // TODO: Implement state loading from database or cache
    // For now, return empty state structure
    
    return {
      success: true,
      data: null, // Client will handle local storage fallback
      sessionId
    };
  } catch (error) {
    return {
      success: false,
      error: handleServerError(error)
    };
  }
}

// =================== SCHEDULE-SPECIFIC QUERIES ===================

/**
 * Fetch planned visits for a specific date and school
 */
export async function fetchPlannedVisitsByDateAndSchool(date: string, school: string) {
  const params: QueryParams = {
    page: 1,
    limit: 50,
    filters: {
      date,
      school
    },
    sortBy: 'timeSlot.startTime',
    sortOrder: 'asc'
  };
  
  return fetchPlannedVisits(params);
}

/**
 * Fetch planned visits for a specific teacher
 */
export async function fetchPlannedVisitsByTeacher(teacherId: string, dateRange?: { start: string; end: string }) {
  const filters: Record<string, unknown> = { teacherId };
  
  if (dateRange) {
    filters.date = {
      $gte: dateRange.start,
      $lte: dateRange.end
    };
  }
  
  const params: QueryParams = {
    page: 1,
    limit: 50,
    filters,
    sortBy: 'date',
    sortOrder: 'asc'
  };
  
  return fetchPlannedVisits(params);
}

/**
 * Check for scheduling conflicts for a teacher
 */
export async function checkTeacherScheduleConflicts(
  teacherId: string,
  date: string,
  timeSlot: { startTime: string; endTime: string }
) {
  try {
    const params: QueryParams = {
      page: 1,
      limit: 10,
      filters: {
        teacherId,
        date,
        'timeSlot.startTime': { $lte: timeSlot.endTime },
        'timeSlot.endTime': { $gte: timeSlot.startTime }
      },
      sortBy: 'timeSlot.startTime',
      sortOrder: 'asc'
    };
    
    const conflicts = await fetchPlannedVisits(params);
    
    return {
      success: true,
      hasConflicts: conflicts.items && conflicts.items.length > 0,
      conflicts: conflicts.items || []
    };
  } catch (error) {
    return {
      success: false,
      error: handleServerError(error),
      hasConflicts: false,
      conflicts: []
    };
  }
}

// =================== ACCOUNTABILITY OPERATIONS ===================

/**
 * Update teacher accountability status
 */
export async function updateTeacherAccountability(
  date: string,
  school: string,
  accountabilityData: TeacherAccountabilityState[]
) {
  try {
    // TODO: Implement accountability tracking persistence
    // This might be stored as part of a daily schedule record
    
    return {
      success: true,
      data: accountabilityData,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: handleServerError(error)
    };
  }
} 