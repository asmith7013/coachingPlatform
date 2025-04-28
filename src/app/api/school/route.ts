// src/app/api/schools/route.ts
import { fetchSchoolsForApi } from "@/lib/api/fetchers/school";
import { createReferenceEndpoint } from "@/lib/api/handlers/reference-endpoint";
import type { School } from "@/lib/data-schema/zod-schema/core/school";
import type { SchoolReference } from "@/lib/types/core/reference";
import { mapSchoolToReference } from "@/lib/data-utilities/transformers/reference-mappers";

// Export GET handler directly - follows API-safe fetcher pattern
export const GET = createReferenceEndpoint<School, SchoolReference>({
  fetchFunction: fetchSchoolsForApi,
  mapItem: mapSchoolToReference,
  defaultSearchField: "schoolName",
  defaultLimit: 20,
  logPrefix: "Schools API"
});