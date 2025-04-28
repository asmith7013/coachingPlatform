// src/app/api/school/route.ts
import { fetchSchoolsForApi } from "@api/fetchers/school"; // Use your API-safe fetcher
import { createReferenceEndpoint } from "@api/handlers/reference-endpoint";
import { mapSchoolToReference } from "@data-utilities/transformers/reference-mappers";

// Export the result of createReferenceEndpoint directly as GET
export const GET = createReferenceEndpoint({
  fetchFunction: fetchSchoolsForApi, // Important: use API-safe fetcher, not server action
  mapItem: mapSchoolToReference,
  defaultSearchField: "schoolName",
  defaultLimit: 20,
  logPrefix: "Schools API"
});