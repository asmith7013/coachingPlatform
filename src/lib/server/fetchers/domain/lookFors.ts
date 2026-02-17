import { LookForModel, RubricModel } from "@mongoose-schema/look-fors";
// import { LookForZodSchema } from '@zod-schema/look-fors/look-for';
// import { RubricZodSchema } from '@zod-schema/look-fors/rubric';
// import { ensureBaseDocumentCompatibility } from "@zod-schema/base-schemas";

import { createApiSafeFetcher } from "@server/fetchers/fetcher-factory";
import { fetchById } from "@server/fetchers/fetch-by-id";
import { CollectionResponse } from "@/lib/types/core/response";
import { QueryParams } from "@/lib/types/core/query";

/**
 * API-safe fetcher for look fors
 */
export const fetchLookForsForApi = createApiSafeFetcher(
  LookForModel,
  "name",
) as (params: QueryParams) => Promise<CollectionResponse<typeof LookForModel>>;

/**
 * API-safe fetcher for rubrics
 */
export const fetchRubricsForApi = createApiSafeFetcher(RubricModel, "category");

/**
 * API-safe fetcher for coaching action plans associated with look-fors
 */
export const fetchLookForCAPsForApi = createApiSafeFetcher(
  LookForModel,
  "name",
);

/**
 * Fetches a look-for by ID - using centralized utility
 */
export async function fetchLookForByIdForApi(id: string) {
  return fetchById(LookForModel, id, "Look-for");
}
