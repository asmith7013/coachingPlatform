"use server";

import { z } from "zod";
import { TeacherScheduleModel } from "@/lib/data-schema/mongoose-schema/scheduling/schedule.model";
import { TeacherScheduleZodSchema } from "@zod-schema/scheduling/schedule";
import { handleServerError } from "@/lib/core/error/handle-server-error";
import { connectToDB } from "@/lib/data-server/db/connection";
import { FetchParams, getDefaultFetchParams } from "@/lib/data-utilities/pagination/paginated-query";
import { sanitizeSortBy } from "@/lib/data-utilities/pagination/sort-utils";

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