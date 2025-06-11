import { createApiSafeFetcher } from "@server/fetchers/fetcher-factory";
import { fetchById } from "@server/fetchers/fetch-by-id";
import { CoachingActionPlanModel } from "@mongoose-schema/core/coaching-action-plan.model";
import { CoachingActionPlanZodSchema } from "@zod-schema/core/cap";
import { ensureBaseDocumentCompatibility } from "@/lib/schema/zod-schema/base-schemas";

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
  ensureBaseDocumentCompatibility(CoachingActionPlanZodSchema),
  "title" // Default search field
); 