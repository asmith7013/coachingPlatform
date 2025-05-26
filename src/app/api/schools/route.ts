// src/app/api/school/route.ts
import { fetchSchoolsForApi } from "@server/fetchers/school"; // Use your API-safe fetcher
import { createReferenceEndpoint, FetchFunction } from "@api-handlers/reference-endpoint";
import { mapSchoolToReference } from "@query/client/selectors/reference-selectors";
import { School } from "@/lib/schema/zod-schema/core/school";

// Export the result of createReferenceEndpoint directly as GET
export const GET = createReferenceEndpoint({
  fetchFunction: fetchSchoolsForApi as unknown as FetchFunction<School>, // Important: use API-safe fetcher, not server action
  mapItem: mapSchoolToReference,
  defaultSearchField: "schoolName",
  defaultLimit: 20,
  logPrefix: "Schools API"
});