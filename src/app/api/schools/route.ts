// src/app/api/school/route.ts
import { fetchSchoolsForApi } from "@/lib/server/fetchers/domain/school"; // Use your API-safe fetcher
import { createReferenceEndpoint, FetchFunction } from "@api-handlers/reference-endpoint";
import { School, SchoolReference } from "@/lib/schema/zod-schema/core/school";

// Simple direct mapping function that doesn't use the selector system
function mapSchoolToReferenceSimple(school: School): SchoolReference {
  return {
    _id: school._id,
    value: school._id,
    label: school.schoolName,
    schoolNumber: school.schoolNumber,
    district: school.district,
    gradeLevels: school.gradeLevelsSupported,
    staffCount: school.staffList?.length || 0,
  };
}

// Export the result of createReferenceEndpoint directly as GET
export const GET = createReferenceEndpoint({
  fetchFunction: fetchSchoolsForApi as unknown as FetchFunction<School>, // Important: use API-safe fetcher, not server action
  mapItem: mapSchoolToReferenceSimple,
  defaultSearchField: "schoolName",
  defaultLimit: 20,
  logPrefix: "Schools API"
});