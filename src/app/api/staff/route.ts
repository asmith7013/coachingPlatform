import { fetchStaffForApi } from "@/lib/server/fetchers/domain/staff";
import { createReferenceEndpoint, FetchFunction } from "@api-handlers/reference-endpoint";
import { NYCPSStaff, TeachingLabStaff } from "@zod-schema/core/staff";

function mapStaffToReference(staff: NYCPSStaff | TeachingLabStaff) {
  // Check if it's NYCPS staff (has rolesNYCPS property)
  if ('rolesNYCPS' in staff) {
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
  } else {
    // TeachingLab staff
    const tl = staff as TeachingLabStaff;
    return {
      _id: tl._id,
      value: tl._id,
      label: tl.staffName,
      email: tl.email,
      staffName: tl.staffName,
      role: tl.rolesTL?.[0],
      rolesTL: tl.rolesTL,
      adminLevel: tl.adminLevel,
      assignedDistricts: tl.assignedDistricts
    };
  }
}

export const GET = createReferenceEndpoint({
  fetchFunction: fetchStaffForApi as FetchFunction<NYCPSStaff | TeachingLabStaff>,
  mapItem: mapStaffToReference,
  defaultSearchField: "staffName",
  defaultLimit: 20,
  logPrefix: "Staff API"
}); 