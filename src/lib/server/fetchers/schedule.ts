import { TeacherScheduleModel, BellScheduleModel } from '@mongoose-schema/schedule/schedule.model';
import { TeacherScheduleZodSchema, BellScheduleZodSchema } from '@zod-schema/schedule/schedule';
import { createApiSafeFetcher } from '@/lib/server/fetchers/fetcher-factory';
import { ensureBaseDocumentCompatibility } from "@zod-schema/base-schemas";

/**
 * API-safe fetcher for teacher schedules
 */
export const fetchTeacherSchedulesForApi = createApiSafeFetcher(
  TeacherScheduleModel,
  ensureBaseDocumentCompatibility(TeacherScheduleZodSchema),
  "teacher"
);

/**
 * API-safe fetcher for bell schedules
 */
export const fetchBellSchedulesForApi = createApiSafeFetcher(
  BellScheduleModel,
  ensureBaseDocumentCompatibility(BellScheduleZodSchema),
  "school"
);

 