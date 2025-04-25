"use server";

import { z } from "zod";
import { TeacherScheduleModel, BellScheduleModel } from "@/lib/data-schema/mongoose-schema/scheduling/schedule.model";
import { 
  TeacherScheduleZodSchema, 
  BellScheduleZodSchema 
} from "@zod-schema/scheduling/schedule";
import { handleServerError } from "@/lib/core/error/handle-server-error";
import { connectToDB } from "@/lib/data-server/db/connection";
import { createItem } from "@data-server/crud/crud-operations";
import { FetchParams, getDefaultFetchParams, fetchPaginatedResource } from "@/lib/data-utilities/pagination/paginated-query";
import { sanitizeSortBy } from "@/lib/data-utilities/pagination/sort-utils";

// Valid sort fields for schedules
const validSortFields = ['createdAt', 'updatedAt', 'teacher', 'school'];

// Types
export type TeacherSchedule = z.infer<typeof TeacherScheduleZodSchema>;
export type BellSchedule = z.infer<typeof BellScheduleZodSchema>;

/** Fetch Teacher Schedules */
export async function fetchSchedules(params: FetchParams = {}) {
  try {
    await connectToDB();
    
    // Sanitize sortBy to ensure it's a valid field name
    const safeSortBy = sanitizeSortBy(params.sortBy, validSortFields, 'createdAt');
    
    const fetchParams = getDefaultFetchParams({
      ...params,
      sortBy: safeSortBy,
      sortOrder: params.sortOrder ?? "desc"
    });

    console.log("Fetching schedules with params:", fetchParams);
    
    return fetchPaginatedResource(
      TeacherScheduleModel,
      TeacherScheduleZodSchema,
      fetchParams
    );
  } catch (error) {
    throw new Error(handleServerError(error));
  }
}

/** Create Teacher Schedule */
export async function createTeacherSchedule(data: TeacherSchedule) {
  try {
    await connectToDB();
    return createItem(
      TeacherScheduleModel, 
      TeacherScheduleZodSchema, 
      data, 
      ["/dashboard/schedule"]
    );
  } catch (error) {
    throw new Error(handleServerError(error));
  }
}

/** Create Bell Schedule */
export async function createBellSchedule(data: BellSchedule) {
  try {
    await connectToDB();
    return createItem(
      BellScheduleModel, 
      BellScheduleZodSchema, 
      data, 
      ["/dashboard/schedule"]
    );
  } catch (error) {
    throw new Error(handleServerError(error));
  }
} 