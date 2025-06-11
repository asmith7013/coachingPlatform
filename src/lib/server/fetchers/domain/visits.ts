import { VisitModel } from '@mongoose-schema/visits/visit.model';
import { VisitZodSchema } from '@zod-schema/visits/visit';
import { createApiSafeFetcher } from '@/lib/server/fetchers/fetcher-factory';
import { fetchById } from '@/lib/server/fetchers/fetch-by-id';
import { ensureBaseDocumentCompatibility } from "@zod-schema/base-schemas";

/**
 * API-safe fetcher for visits
 */
export const fetchVisitsForApi = createApiSafeFetcher(
  VisitModel,
  ensureBaseDocumentCompatibility(VisitZodSchema),
  "date"
);

/**
 * Fetches visit by ID - using centralized utility
 */
export async function fetchVisitByIdForApi(id: string) {
  return fetchById(VisitModel, id, "Visit");
} 