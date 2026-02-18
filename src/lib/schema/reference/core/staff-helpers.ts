import { Staff } from "@zod-schema/core/staff";

// Helper Functions
export function getStaffDisplayName(staff: Staff): string {
  return staff.staffName;
}

export function getStaffRoleDisplay(staff: Staff): string {
  if (staff.roles?.length) {
    return staff.roles[0];
  }
  return "";
}

export function getStaffExperienceSummary(staff: Staff): string {
  if (!staff.experience?.length) return "";

  const totalYears = staff.experience.reduce((sum, exp) => sum + exp.years, 0);
  const types = [...new Set(staff.experience.map((exp) => exp.type))];

  return `${totalYears} years (${types.join(", ")})`;
}

export function getStaffGradeLevels(staff: Staff): string {
  if (!staff.gradeLevelsSupported?.length) return "";
  return staff.gradeLevelsSupported.join(", ");
}

export function getStaffSubjects(staff: Staff): string {
  if (!staff.subjects?.length) return "";
  return staff.subjects.join(", ");
}

export function getStaffSpecialGroups(staff: Staff): string {
  if (!staff.specialGroups?.length) return "";
  return staff.specialGroups.join(", ");
}
