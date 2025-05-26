// src/app/api/schools/route.ts
import { fetchSchoolsForApi } from "@server/fetchers/school";
import { createReferenceEndpoint, FetchFunction } from "@api-handlers/reference-endpoint";
import type { School } from "@zod-schema/core/school";
import type { SchoolReference } from "@zod-schema/core/school";
import { mapSchoolToReference } from "@query/client/selectors/reference-selectors";
import { SchoolWithDates } from "@/hooks/domain/useSchools";

// Export GET handler directly - follows API-safe fetcher pattern
export const GET = createReferenceEndpoint<School, SchoolReference>({
  fetchFunction: fetchSchoolsForApi as unknown as FetchFunction<SchoolWithDates>,
  mapItem: mapSchoolToReference,
  defaultSearchField: "schoolName",
  defaultLimit: 20,
  logPrefix: "Schools API"
});