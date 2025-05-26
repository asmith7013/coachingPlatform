// src/app/api/school/route.ts
import { fetchSchoolsForApi } from "@server/fetchers/school"; // Use your API-safe fetcher
import { createReferenceEndpoint } from "@api-handlers/reference-endpoint";
import { mapSchoolToReference } from "@query/client/selectors/reference-selectors";

// Export the result of createReferenceEndpoint directly as GET
export const GET = createReferenceEndpoint({
  fetchFunction: fetchSchoolsForApi, // Important: use API-safe fetcher, not server action
  mapItem: mapSchoolToReference,
  defaultSearchField: "schoolName",
  defaultLimit: 20,
  logPrefix: "Schools API"
});