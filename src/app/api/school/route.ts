// src/app/api/schools/route.ts
import { fetchSchoolsForApi } from "@/lib/server/fetchers/domain/school";
import { createReferenceEndpoint, FetchFunction } from "@api-handlers/reference-endpoint";
import { School, SchoolReference } from "@zod-schema/core/school";

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

// Export GET handler directly - follows API-safe fetcher pattern
export const GET = createReferenceEndpoint<School, SchoolReference>({
  fetchFunction: fetchSchoolsForApi as unknown as FetchFunction<School>,
  mapItem: mapSchoolToReferenceSimple,
  defaultSearchField: "schoolName",
  defaultLimit: 20,
  logPrefix: "Schools API"
});