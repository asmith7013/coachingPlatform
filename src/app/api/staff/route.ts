import { fetchNYCPSStaffForApi } from "@/lib/server/fetchers/domain/staff";
import { createReferenceEndpoint, FetchFunction } from "@api-handlers/reference-endpoint";
import { NYCPSStaff, NYCPSStaffReference } from "@zod-schema/core/staff";

function mapStaffToReference(staff: NYCPSStaff): NYCPSStaffReference {
  return {
    _id: staff._id,
    value: staff._id,
    label: staff.staffName,
    email: staff.email,
    staffName: staff.staffName,
    role: staff.rolesNYCPS?.[0],
    rolesNYCPS: staff.rolesNYCPS,
    gradeLevelsSupported: staff.gradeLevelsSupported,
    schoolCount: staff.schoolIds?.length || 0,
    subjectsCount: staff.subjects?.length || 0,
    gradeLevel: staff.gradeLevelsSupported?.[0],
    isMondayConnected: staff.mondayUser?.isConnected || false
  };
}

export const GET = createReferenceEndpoint({
  fetchFunction: fetchNYCPSStaffForApi as unknown as FetchFunction<NYCPSStaff>,
  mapItem: mapStaffToReference,
  defaultSearchField: "staffName", 
  defaultLimit: 20,
  logPrefix: "Staff API"
}); 