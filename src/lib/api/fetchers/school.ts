// src/lib/api/fetchers/school.ts
import { SchoolModel } from '@mongoose-schema/core/school.model';
import { SchoolZodSchema } from '@zod-schema/core/school';
import { createApiSafeFetcher } from '@lib/api/handlers/api-adapter';
import { fetchById } from '@data-utilities/transformers/fetch-by-id';

/**
 * API-safe fetcher for schools 
 * This avoids the "use server" directive issues when importing into API routes
 */
export const fetchSchoolsForApi = createApiSafeFetcher(
  SchoolModel,
  SchoolZodSchema,
  "schoolName" // Default search field for schools
);

/**
 * Fetches a school by ID
 */
export async function fetchSchoolByIdForApi(id: string) {
  return fetchById(SchoolModel, id, SchoolZodSchema);
}