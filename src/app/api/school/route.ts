// src/app/api/schools/route.ts
import { fetchSchoolsForApi } from "@api-fetchers/school";
import { createReferenceEndpoint } from "@api-handlers/reference-endpoint";
import type { School } from "@zod-schema/core/school";
import type { SchoolReference } from "@core-types/reference";
import { mapSchoolToReference } from "@data-utilities/transformers/reference-mappers";

// Export GET handler directly - follows API-safe fetcher pattern
export const GET = createReferenceEndpoint<School, SchoolReference>({
  fetchFunction: fetchSchoolsForApi,
  mapItem: mapSchoolToReference,
  defaultSearchField: "schoolName",
  defaultLimit: 20,
  logPrefix: "Schools API"
});