// src/lib/api/fetchers/school.ts
import { SchoolModel } from '@mongoose-schema/core/school.model';
import { SchoolZodSchema } from '@zod-schema/core/school';
import { createApiSafeFetcher } from '@/lib/server/fetchers/fetcher-factory';
import { fetchById } from '@transformers/utils/fetch-utils';
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
 * Fetches a school by ID
 */
export async function fetchSchoolByIdForApi(id: string) {
  return fetchById(SchoolModel, id, ensureBaseDocumentCompatibility(SchoolZodSchema));
}