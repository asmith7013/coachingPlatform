// src/lib/api/fetchers/coaching-log.ts
import { CoachingLogModel } from '@mongoose-schema/visits/coaching-log.model';
import { CoachingLogZodSchema } from '@zod-schema/visits/coaching-log';
import { createApiSafeFetcher } from '@/lib/server/fetchers/fetcher-factory';
import { fetchById } from '@transformers/utils/fetch-utils';

/**
 * API-safe fetcher for coaching logs
 * This avoids the "use server" directive issues when importing into API routes
 */
export const fetchCoachingLogsForApi = createApiSafeFetcher(
  CoachingLogModel,
  CoachingLogZodSchema,
  "primaryStrategy" // Default search field for coaching logs
);

export async function fetchCoachingLogByIdForApi(id: string) {
  return fetchById(CoachingLogModel, id, CoachingLogZodSchema);
}

