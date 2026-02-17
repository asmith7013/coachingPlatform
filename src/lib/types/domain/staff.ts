/**
 * Staff domain types
 * Re-exports types from Zod schemas for centralized imports
 */

// Re-export types directly from the schema for centralized imports
export type {
  StaffMember,
  StaffMemberInput,
  NYCPSStaff,
  NYCPSStaffInput,
  TeachingLabStaff,
  TeachingLabStaffInput,
  Experience,
} from "@zod-schema/core/staff";

// Additional domain-specific type utilities
export type StaffType = "standard" | "nycps" | "tl" | "all";

export interface StaffFilters {
  schools?: string[];
  gradeLevelsSupported?: string[];
  subjects?: string[];
  specialGroups?: string[];
  rolesNYCPS?: string[];
  rolesTeachingLab?: string[];
  adminLevel?: string;
  search?: string;
}

/**
 * Helper function to determine staff type
 */
export function determineStaffType(staff: Record<string, unknown>): StaffType {
  if (
    "adminLevel" in staff ||
    "rolesTL" in staff ||
    "assignedDistricts" in staff
  ) {
    return "tl";
  }

  if (
    "gradeLevelsSupported" in staff ||
    "rolesNYCPS" in staff ||
    "subjects" in staff ||
    "specialGroups" in staff
  ) {
    return "nycps";
  }

  return "standard";
}

/**
 * Helper to format staff display name
 */
export function formatStaffDisplayName(staff: { staffName: string }): string {
  return staff.staffName;
}
