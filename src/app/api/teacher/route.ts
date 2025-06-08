import { fetchNYCPSStaffForApi } from "@server/fetchers/staff";
import { createReferenceEndpoint, FetchFunction } from "@api-handlers/reference-endpoint";
import { NYCPSStaff, NYCPSStaffReference } from "@zod-schema/core/staff";

// Simple direct mapping function that doesn't use the selector system
function mapStaffToReferenceSimple(staff: NYCPSStaff): NYCPSStaffReference {
  return {
    _id: staff._id,
    value: staff._id,
    label: staff.staffName,
    email: staff.email,
    staffName: staff.staffName,
    role: staff.rolesNYCPS?.[0],
    schoolCount: staff.schools?.length || 0,
    gradeLevel: staff.gradeLevelsSupported?.[0],
    subjectsCount: staff.subjects?.length || 0,
    isMondayConnected: staff.mondayUser?.isConnected || false
  };
}

// Export GET handler directly - follows same pattern as school API
export const GET = createReferenceEndpoint<NYCPSStaff, NYCPSStaffReference>({
  fetchFunction: fetchNYCPSStaffForApi as unknown as FetchFunction<NYCPSStaff>,
  mapItem: mapStaffToReferenceSimple,
  defaultSearchField: "staffName",
  defaultLimit: 20,
  logPrefix: "Teacher API"
}); 