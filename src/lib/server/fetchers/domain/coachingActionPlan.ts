import { createApiSafeFetcher } from "@server/fetchers/fetcher-factory";
import { fetchById } from "@server/fetchers/fetch-by-id";
import { CoachingActionPlanModel } from "@/lib/schema/mongoose-schema/core/cap.core.model";
import { CollectionResponse } from "@/lib/types/core/response";
import { QueryParams } from "@/lib/types/core/query";

/**
 * Fetch coaching action plan by ID
 */
export async function fetchCoachingActionPlanById(id: string) {
  return fetchById(
    CoachingActionPlanModel,
    id,
    "Coaching action plan"
  );
}

/**
 * API-safe fetcher for coaching action plans
 * Creates paginated, filtered, and sorted results for API consumption
 */
export const fetchCoachingActionPlansForApi = createApiSafeFetcher(
  CoachingActionPlanModel,
  "title" // Default search field
) as (params: QueryParams) => Promise<CollectionResponse<typeof CoachingActionPlanModel>>;