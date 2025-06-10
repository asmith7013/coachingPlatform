// src/lib/api/fetchers/school.ts
import { SchoolModel } from '@mongoose-schema/core/school.model';
import { SchoolZodSchema } from '@zod-schema/core/school';
import { createApiSafeFetcher } from '@server/fetchers/fetcher-factory';
import { fetchById } from '@server/fetchers/fetch-by-id';
import { ensureBaseDocumentCompatibility } from "@zod-schema/base-schemas";

/**
 * API-safe fetcher for schools 
 * This avoids the "use server" directive issues when importing into API routes
 */
export const fetchSchoolsForApi = createApiSafeFetcher(
  SchoolModel,
  ensureBaseDocumentCompatibility(SchoolZodSchema),
  "schoolName" // Default search field for schools
);

/**
 * Fetches a school by ID - using centralized utility
 */
export async function fetchSchoolByIdForApi(id: string) {
  return fetchById(SchoolModel, id, "School");
}