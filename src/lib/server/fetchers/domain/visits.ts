import { VisitModel } from "@mongoose-schema/visits/visit.model";
import { createApiSafeFetcher } from "@/lib/server/fetchers/fetcher-factory";
import { fetchById } from "@/lib/server/fetchers/fetch-by-id";
import { CollectionResponse } from "@/lib/types/core/response";
import { QueryParams } from "@/lib/types/core/query";

/**
 * API-safe fetcher for visits
 */
export const fetchVisitsForApi = createApiSafeFetcher(VisitModel, "date") as (
  params: QueryParams,
) => Promise<CollectionResponse<typeof VisitModel>>;

/**
 * Fetches visit by ID - using centralized utility
 */
export async function fetchVisitByIdForApi(id: string) {
  return fetchById(VisitModel, id, "Visit");
}
