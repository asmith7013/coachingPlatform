// src/lib/api/fetchers/school.ts
import { SchoolModel } from "@mongoose-schema/core/school.model";
import { createApiSafeFetcher } from "@server/fetchers/fetcher-factory";
import { fetchById } from "@server/fetchers/fetch-by-id";
import { CollectionResponse } from "@/lib/types/core/response";
import { QueryParams } from "@/lib/types/core/query";

/**
 * API-safe fetcher for schools
 * This avoids the "use server" directive issues when importing into API routes
 */
export const fetchSchoolsForApi = createApiSafeFetcher(
  SchoolModel,
  "schoolName", // Default search field for schools
) as (params: QueryParams) => Promise<CollectionResponse<typeof SchoolModel>>;

/**
 * Fetches a school by ID - using centralized utility
 */
export async function fetchSchoolByIdForApi(id: string) {
  return fetchById(SchoolModel, id, "School");
}
