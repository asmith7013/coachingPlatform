// src/lib/api/fetchers/coaching-log.ts
import { CoachingLogModel } from '@mongoose-schema/visits/coaching-log.model';
import { CoachingLogZodSchema } from '@zod-schema/visits/coaching-log';
import { createApiSafeFetcher } from '@server/fetchers/fetcher-factory';
import { fetchById } from '@server/fetchers/fetch-by-id';
import { ensureBaseDocumentCompatibility } from "@zod-schema/base-schemas";

/**
 * API-safe fetcher for coaching logs
 * This avoids the "use server" directive issues when importing into API routes
 */
export const fetchCoachingLogsForApi = createApiSafeFetcher(
  CoachingLogModel,
  ensureBaseDocumentCompatibility(CoachingLogZodSchema),
  "primaryStrategy" // Default search field for coaching logs
);

/**
 * Fetches a coaching log by ID - using centralized utility
 */
export async function fetchCoachingLogByIdForApi(id: string) {
  return fetchById(CoachingLogModel, id, "Coaching log");
}

