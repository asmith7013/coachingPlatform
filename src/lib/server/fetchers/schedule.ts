import { TeacherScheduleModel, BellScheduleModel } from '@mongoose-schema/schedule/schedule.model';
import { TeacherScheduleZodSchema, BellScheduleZodSchema } from '@zod-schema/schedule/schedule';
import { createApiSafeFetcher } from '@/lib/server/fetchers/fetcher-factory';

/**
 * API-safe fetcher for teacher schedules
 */
export const fetchTeacherSchedulesForApi = createApiSafeFetcher(
  TeacherScheduleModel,
  TeacherScheduleZodSchema,
  "teacher"
);

/**
 * API-safe fetcher for bell schedules
 */
export const fetchBellSchedulesForApi = createApiSafeFetcher(
  BellScheduleModel,
  BellScheduleZodSchema,
  "school"
); 