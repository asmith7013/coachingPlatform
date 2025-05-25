"use server";

import { z } from "zod";
import { TeacherScheduleModel, BellScheduleModel } from "@/lib/data-schema/mongoose-schema/schedule/schedule.model";
import { 
  TeacherScheduleZodSchema, 
  TeacherScheduleInputZodSchema,
  BellScheduleZodSchema, 
  BellScheduleInputZodSchema 
} from "@/lib/data-schema/zod-schema/schedule/schedule";
import { createCrudActions } from "@data-server/crud/crud-action-factory";
import { withDbConnection } from "@data-server/db/ensure-connection";
import { connectToDB } from "@data-server/db/connection";
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";
import { createItem, updateItem, deleteItem } from "@data-server/crud/crud-operations";
import { fetchPaginatedResource } from "@data-utilities/pagination/paginated-query";
import { sanitizeSortBy } from "@/lib/data-utilities/pagination/pagination-utils";
import { type QueryParams, buildQueryParams } from "@core-types/pagination";

// Types
export type TeacherSchedule = z.infer<typeof TeacherScheduleZodSchema>;
export type TeacherScheduleInput = z.infer<typeof TeacherScheduleInputZodSchema>;
export type BellSchedule = z.infer<typeof BellScheduleZodSchema>;
export type BellScheduleInput = z.infer<typeof BellScheduleInputZodSchema>;

// Valid sort fields for schedules
const validSortFields = ['createdAt', 'updatedAt', 'teacher', 'school'];

// ===== BELL SCHEDULE ACTIONS =====

// Create standard CRUD actions for Bell Schedules
export const bellScheduleActions = createCrudActions({
  model: BellScheduleModel,
  fullSchema: BellScheduleZodSchema,
  inputSchema: BellScheduleInputZodSchema,
  revalidationPaths: ["/dashboard/schedule"],
  options: {
    validSortFields: ['school', 'bellScheduleType', 'createdAt', 'updatedAt'],
    defaultSortField: 'createdAt',
    defaultSortOrder: 'desc',
    entityName: 'Bell Schedule'
  }
});

// Export the generated bell schedule actions with connection handling
export async function fetchBellSchedules(params = {}) {
  return withDbConnection(() => bellScheduleActions.fetch(params));
}

export async function createBellSchedule(data: BellScheduleInput) {
  return withDbConnection(() => bellScheduleActions.create(data));
}

export async function updateBellSchedule(id: string, data: Partial<BellScheduleInput>) {
  return withDbConnection(() => bellScheduleActions.update(id, data));
}

export async function deleteBellSchedule(id: string) {
  return withDbConnection(() => bellScheduleActions.delete(id));
}

export async function fetchBellScheduleById(id: string) {
  return withDbConnection(() => bellScheduleActions.fetchById(id));
}

// Add specialized bell schedule actions
export async function fetchBellSchedulesBySchool(schoolId: string) {
  return withDbConnection(async () => {
    try {
      const results = await BellScheduleModel.find({ school: schoolId })
        .sort({ createdAt: -1 })
        .lean()
        .exec();
      
      return {
        success: true,
        items: results.map(item => BellScheduleZodSchema.parse(item)),
        total: results.length
      };
    } catch (error) {
      return {
        success: false,
        items: [],
        total: 0,
        error: handleServerError(error)
      };
    }
  });
}

export async function fetchBellSchedulesByType(bellScheduleType: string) {
  return withDbConnection(async () => {
    try {
      const results = await BellScheduleModel.find({ bellScheduleType })
        .sort({ createdAt: -1 })
        .lean()
        .exec();
      
      return {
        success: true,
        items: results.map(item => BellScheduleZodSchema.parse(item)),
        total: results.length
      };
    } catch (error) {
      return {
        success: false,
        items: [],
        total: 0,
        error: handleServerError(error)
      };
    }
  });
}

export async function getActiveCycleDayForDate(schoolId: string, date: string) {
  return withDbConnection(async () => {
    try {
      // Find bell schedules for the school
      const bellSchedules = await BellScheduleModel.find({ school: schoolId })
        .lean()
        .exec();

      if (!bellSchedules || bellSchedules.length === 0) {
        return {
          success: false,
          error: `No bell schedules found for school ${schoolId}`
        };
      }

      // Find assigned cycle day for the date across all bell schedules
      let cycleDay = null;
      
      for (const schedule of bellSchedules) {
        const assignedDay = schedule.assignedCycleDays?.find((day: { date: string; blockDayType: string }) => 
          day.date === date
        );
        
        if (assignedDay) {
          cycleDay = assignedDay.blockDayType;
          break;
        }
      }

      return {
        success: true,
        data: {
          date,
          schoolId,
          cycleDay
        }
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error)
      };
    }
  });
}

// ===== TEACHER SCHEDULE ACTIONS =====

/** Fetch all Teacher Schedules */
export async function fetchSchedules(params: QueryParams = {}) {
  try {
    await connectToDB();
    
    // Sanitize sortBy to ensure it's a valid field name
    const safeSortBy = sanitizeSortBy(params.sortBy, validSortFields, 'createdAt');
    
    const fetchParams = buildQueryParams({
      ...params,
      sortBy: safeSortBy,
      sortOrder: params.sortOrder ?? "desc"
    });
    
    return fetchPaginatedResource(
      TeacherScheduleModel,
      TeacherScheduleZodSchema,
      fetchParams
    );
  } catch (error) {
    throw new Error(handleServerError(error));
  }
}

/** Fetch Teacher Schedules with pagination */
export async function fetchTeacherSchedules(params: QueryParams = {}) {
  try {
    await connectToDB();
    
    return fetchPaginatedResource(
      TeacherScheduleModel,
      TeacherScheduleZodSchema,
      {
        ...params,
        sortBy: params.sortBy ?? "createdAt",
        sortOrder: params.sortOrder ?? "desc"
      }
    );
  } catch (error) {
    throw new Error(handleServerError(error));
  }
}

/** Fetch Teacher Schedule by School ID */
export async function fetchTeacherSchedulesBySchool(schoolId: string) {
  try {
    await connectToDB();
    
    const schedules = await TeacherScheduleModel.find({ school: schoolId })
      .lean()
      .exec();
    
    return { 
      success: true, 
      items: schedules,
      total: schedules.length 
    };
  } catch (error) {
    throw new Error(handleServerError(error));
  }
}

/** Create Teacher Schedule */
export async function createTeacherSchedule(data: TeacherScheduleInput) {
  try {
    await connectToDB();
    return createItem(
      TeacherScheduleModel, 
      TeacherScheduleInputZodSchema, 
      data, 
      ["/dashboard/schedule"]
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw handleValidationError(error);
    }
    throw handleServerError(error);
  }
}

/** Update Teacher Schedule */
export async function updateTeacherSchedule(id: string, data: Partial<TeacherScheduleInput>) {
  try {
    await connectToDB();
    return updateItem(
      TeacherScheduleModel, 
      TeacherScheduleInputZodSchema, 
      id, 
      data, 
      ["/dashboard/schedule"]
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw handleValidationError(error);
    }
    throw handleServerError(error);
  }
}

/** Delete Teacher Schedule */
export async function deleteTeacherSchedule(id: string) {
  try {
    await connectToDB();
    return deleteItem(
      TeacherScheduleModel, 
      TeacherScheduleZodSchema, 
      id, 
      ["/dashboard/schedule"]
    );
  } catch (error) {
    throw handleServerError(error);
  }
}