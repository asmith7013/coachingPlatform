import { LookForModel, RubricModel } from '@mongoose-schema/look-fors';
import { LookForZodSchema } from '@zod-schema/look-fors/look-for';
import { RubricZodSchema } from '@zod-schema/look-fors/rubric';
import { ensureBaseDocumentCompatibility } from "@zod-schema/base-schemas";

import { createApiSafeFetcher } from '@server/fetchers/fetcher-factory';
import { fetchById } from '@server/fetchers/fetch-by-id';

/**
 * API-safe fetcher for look fors
 */
export const fetchLookForsForApi = createApiSafeFetcher(
  LookForModel,
  ensureBaseDocumentCompatibility(LookForZodSchema),
  "name"
);

/**
 * API-safe fetcher for rubrics
 */
export const fetchRubricsForApi = createApiSafeFetcher(
  RubricModel,
  ensureBaseDocumentCompatibility(RubricZodSchema),
  "category"
);

/**
 * API-safe fetcher for coaching action plans associated with look-fors
 */
export const fetchLookForCAPsForApi = createApiSafeFetcher(
  LookForModel,
  ensureBaseDocumentCompatibility(LookForZodSchema),
  "name"
);

/**
 * Fetches a look-for by ID - using centralized utility
 */
export async function fetchLookForByIdForApi(id: string) {
  return fetchById(LookForModel, id, "Look-for");
} 