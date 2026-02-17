// src/lib/api/fetchers/coaching-log.ts
import { CoachingLogModel } from "@mongoose-schema/visits/coaching-log.model";
import { createApiSafeFetcher } from "@server/fetchers/fetcher-factory";
import { fetchById } from "@server/fetchers/fetch-by-id";
import { CollectionResponse } from "@/lib/types/core/response";
import { QueryParams } from "@/lib/types/core/query";

/**
 * API-safe fetcher for coaching logs
 * This avoids the "use server" directive issues when importing into API routes
 */
export const fetchCoachingLogsForApi = createApiSafeFetcher(
  CoachingLogModel,
  "primaryStrategy", // Default search field for coaching logs
) as (
  params: QueryParams,
) => Promise<CollectionResponse<typeof CoachingLogModel>>;

/**
 * Fetches a coaching log by ID - using centralized utility
 */
export async function fetchCoachingLogByIdForApi(id: string) {
  return fetchById(CoachingLogModel, id, "Coaching log");
}
