"use server";

import { z } from "zod";
import { TeacherScheduleModel } from "@/models/scheduling/schedule.model";
import { TeacherScheduleZodSchema } from "@/lib/zod-schema/scheduling/schedule";
import { handleServerError } from "@/lib/error/handleServerError";
import { connectToDB } from "@/lib/db";
import { FetchParams, getDefaultFetchParams } from "@/lib/server-utils/fetchPaginatedResource";
import { sanitizeSortBy } from "@/lib/server-utils/sanitizeSortBy";

// Valid sort fields for schedules
const validSortFields = ['createdAt', 'updatedAt', 'teacher', 'school'];

export type TeacherSchedule = z.infer<typeof TeacherScheduleZodSchema>;

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
    
    // Build mongoose query
    const { page, limit, filters } = fetchParams;
    const skip = (page - 1) * limit;
    
    // Execute the query with pagination
    const [items, total] = await Promise.all([
      TeacherScheduleModel.find(filters)
        .sort({ [fetchParams.sortBy]: fetchParams.sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TeacherScheduleModel.countDocuments(filters)
    ]);
    
    // Validate items against schema
    const validatedItems = items.map(item => 
      TeacherScheduleZodSchema.parse(item)
    );
    
    return {
      items: validatedItems,
      total,
      empty: items.length === 0
    };
  } catch (error) {
    throw new Error(handleServerError(error));
  }
} 