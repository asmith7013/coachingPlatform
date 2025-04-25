"use server";

import { z } from "zod";
import { TeacherScheduleModel } from "@/lib/data-schema/mongoose-schema/scheduling/schedule.model";
import { 
  TeacherScheduleZodSchema, 
  TeacherScheduleInputZodSchema,
  type TeacherSchedule,
  type TeacherScheduleInput
} from "@/lib/data-schema/zod-schema/scheduling/schedule";
import { handleServerError } from "@/lib/core/error/handle-server-error";
import { handleValidationError } from "@/lib/core/error/handle-validation-error";
import { 
  createItem,
  updateItem,
  deleteItem,
} from "@/lib/data-server/crud/crud-operations";
import { fetchPaginatedResource, type FetchParams } from "@/lib/data-utilities/pagination/paginated-query";
import { connectToDB } from "@/lib/data-server/db/connection";

// Types
export type { TeacherSchedule, TeacherScheduleInput };

/** Fetch Teacher Schedules */
export async function fetchTeacherSchedules(params: FetchParams = {}) {
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