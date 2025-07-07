"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { LessonCompletionModel, DailyClassEventModel } from "@mongoose-schema/313/core";
import { QueryParams, DEFAULT_QUERY_PARAMS } from "@core-types/query";
import { fetchPaginatedResource } from "@data-processing/pagination/unified-pagination";
import { LessonCompletionZodSchema, DailyClassEventZodSchema, LessonCompletion, DailyClassEvent } from "@zod-schema/313/core";
import { ZodType } from "zod";

/**
 * Fetch lesson completions with optional filtering
 */
export async function fetchLessonCompletions(params: QueryParams = DEFAULT_QUERY_PARAMS) {
  return withDbConnection(async () => {
    try {
      const result = await fetchPaginatedResource(
        LessonCompletionModel,
        LessonCompletionZodSchema as ZodType<LessonCompletion>,
        params,
        {
          validSortFields: ['dateOfCompletion', 'studentName', 'teacher', 'lessonCode', 'createdAt'],
          validateSchema: false
        }
      );
      
      return result;
    } catch (error) {
      return { success: false, error: handleServerError(error) };
    }
  });
}

/**
 * Fetch lesson completion by ID
 */
export async function fetchLessonCompletionById(id: string) {
  return withDbConnection(async () => {
    try {
      const result = await LessonCompletionModel.findById(id).exec();
      
      if (!result) {
        return { success: false, error: 'Lesson completion not found' };
      }
      
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: handleServerError(error) };
    }
  });
}

/**
 * Fetch daily class events with optional filtering
 */
export async function fetchDailyClassEvents(params: QueryParams = DEFAULT_QUERY_PARAMS) {
  return withDbConnection(async () => {
    try {
      const result = await fetchPaginatedResource(
        DailyClassEventModel,
        DailyClassEventZodSchema as ZodType<DailyClassEvent>,
        params,
        {
          validSortFields: ['date', 'studentName', 'teacher', 'attendance', 'createdAt'],
          validateSchema: false
        }
      );
      
      return result;
    } catch (error) {
      return { success: false, error: handleServerError(error) };
    }
  });
}

/**
 * Fetch daily class event by ID
 */
export async function fetchDailyClassEventById(id: string) {
  return withDbConnection(async () => {
    try {
      const result = await DailyClassEventModel.findById(id).exec();
      
      if (!result) {
        return { success: false, error: 'Daily class event not found' };
      }
      
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: handleServerError(error) };
    }
  });
} 