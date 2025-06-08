import { CoachingActionPlanModel } from '@mongoose-schema/core/coaching-action-plan.model';
import { CoachingActionPlanZodSchema } from '@zod-schema/core/cap';
import { createApiSafeFetcher } from '@/lib/server/fetchers/fetcher-factory';
import { fetchById } from '@transformers/utils/fetch-utils';
import { ensureBaseDocumentCompatibility } from "@zod-schema/base-schemas";

/**
 * API-safe fetcher for coaching action plans 
 * This avoids the "use server" directive issues when importing into API routes
 */
export const fetchCoachingActionPlansForApi = createApiSafeFetcher(
  CoachingActionPlanModel,
  ensureBaseDocumentCompatibility(CoachingActionPlanZodSchema),
  "title" // Default search field for coaching action plans
);

/**
 * Fetches a coaching action plan by ID
 */
export async function fetchCoachingActionPlanByIdForApi(id: string) {
  return fetchById(CoachingActionPlanModel, id, ensureBaseDocumentCompatibility(CoachingActionPlanZodSchema));
} 