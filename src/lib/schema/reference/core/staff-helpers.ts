import { TeachingLabStaff } from "@zod-schema/core/staff";
import { NYCPSStaff } from "@zod-schema/core/staff";
import { StaffMember } from "@zod-schema/core/staff";

// Helper Functions
export function getStaffDisplayName(
  staff: StaffMember | NYCPSStaff | TeachingLabStaff,
): string {
  return staff.staffName;
}

export function getStaffRoleDisplay(
  staff: NYCPSStaff | TeachingLabStaff,
): string {
  if ("rolesNYCPS" in staff && staff.rolesNYCPS?.length) {
    return staff.rolesNYCPS[0];
  }

  if ("rolesTL" in staff && staff.rolesTL?.length) {
    return staff.rolesTL[0];
  }

  return "";
}

export function getStaffExperienceSummary(staff: NYCPSStaff): string {
  if (!staff.experience?.length) return "";

  const totalYears = staff.experience.reduce((sum, exp) => sum + exp.years, 0);
  const types = [...new Set(staff.experience.map((exp) => exp.type))];

  return `${totalYears} years (${types.join(", ")})`;
}

export function getStaffGradeLevels(staff: NYCPSStaff): string {
  if (!staff.gradeLevelsSupported?.length) return "";
  return staff.gradeLevelsSupported.join(", ");
}

export function getStaffSubjects(staff: NYCPSStaff): string {
  if (!staff.subjects?.length) return "";
  return staff.subjects.join(", ");
}

export function getStaffSpecialGroups(staff: NYCPSStaff): string {
  if (!staff.specialGroups?.length) return "";
  return staff.specialGroups.join(", ");
}
