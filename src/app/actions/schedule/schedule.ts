"use server";

import { z, ZodType } from "zod";
import { TeacherScheduleModel, BellScheduleModel } from "@mongoose-schema/schedule/schedule.model";
import { 
  TeacherScheduleZodSchema, 
  TeacherScheduleInputZodSchema,
  BellScheduleZodSchema, 
<<<<<<< Updated upstream
  BellScheduleInputZodSchema 
=======
  BellScheduleInputZodSchema,
  BellScheduleInput,
  BellSchedule,
  TeacherScheduleInput,
  TeacherSchedule
>>>>>>> Stashed changes
} from "@zod-schema/schedule/schedule";
import { createCrudActions } from "@server/crud";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { type QueryParams } from "@core-types/query";


// ===== BELL SCHEDULE ACTIONS =====

// Create standard CRUD actions for Bell Schedules
const bellScheduleActions = createCrudActions({
  model: BellScheduleModel,
  schema: BellScheduleZodSchema as ZodType<BellSchedule>,
  inputSchema: BellScheduleInputZodSchema as ZodType<BellScheduleInput>,
  name: "Bell Schedule",
  revalidationPaths: ["/dashboard/schedule"],
  sortFields: ['school', 'bellScheduleType', 'createdAt', 'updatedAt'],
  defaultSortField: 'createdAt',
  defaultSortOrder: 'desc'
});

// Export the generated bell schedule actions with connection handling
export async function fetchBellSchedules(params: QueryParams) {
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

// Create Teacher Schedule actions
const teacherScheduleActions = createCrudActions({
  model: TeacherScheduleModel,
  schema: TeacherScheduleZodSchema as ZodType<TeacherSchedule>,
  inputSchema: TeacherScheduleInputZodSchema,
  name: "Teacher Schedule",
  revalidationPaths: ["/dashboard/schedule"],
  sortFields: ['teacher', 'school', 'createdAt', 'updatedAt'],
  defaultSortField: 'createdAt',
  defaultSortOrder: 'desc'
});

// Teacher Schedule exports using factory
export async function fetchTeacherSchedules(params: QueryParams) {
  return withDbConnection(() => teacherScheduleActions.fetch(params));
}

export async function createTeacherSchedule(data: TeacherScheduleInput) {
  return withDbConnection(() => teacherScheduleActions.create(data));
}

export async function updateTeacherSchedule(id: string, data: Partial<TeacherScheduleInput>) {
  return withDbConnection(() => teacherScheduleActions.update(id, data));
}

export async function deleteTeacherSchedule(id: string) {
  return withDbConnection(() => teacherScheduleActions.delete(id));
}

export async function fetchTeacherScheduleById(id: string) {
  return withDbConnection(() => teacherScheduleActions.fetchById(id));
}

// Specialized function (can keep as-is but with better error handling)
export async function fetchTeacherSchedulesBySchool(schoolId: string) {
  return withDbConnection(async () => {
    try {
      const schedules = await TeacherScheduleModel.find({ school: schoolId })
        .lean()
        .exec();
      
      return { 
        success: true, 
        items: schedules.map(item => TeacherScheduleZodSchema.parse(item)),
        total: schedules.length 
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