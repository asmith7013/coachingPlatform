// src/lib/api/fetchers/coaching-log.ts
import { CoachingLogModel } from '@/lib/data-schema/mongoose-schema/visits/coaching-log.model';
import { CoachingLogZodSchema } from '@/lib/data-schema/zod-schema/visits/coaching-log';
import { createApiSafeFetcher } from '@/lib/api/handlers/api-adapter';

/**
 * API-safe fetcher for coaching logs
 * This avoids the "use server" directive issues when importing into API routes
 */
export const fetchCoachingLogsForApi = createApiSafeFetcher(
  CoachingLogModel,
  CoachingLogZodSchema,
  "primaryStrategy" // Default search field for coaching logs
);

/**
 * Fetches a coaching log by ID
 */
export async function fetchCoachingLogByIdForApi(id: string) {
  try {
    const coachingLog = await CoachingLogModel.findById(id).lean();
    
    if (!coachingLog) {
      return {
        success: false,
        items: [],
        error: `Coaching log with ID ${id} not found`
      };
    }
    
    return {
      success: true,
      items: [coachingLog],
      total: 1
    };
  } catch (error) {
    console.error(`Error fetching coaching log by ID:`, error);
    return {
      success: false,
      items: [],
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

