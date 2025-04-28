import { StaffType } from "@domain-types/staff";

export function determineStaffType(staff: unknown): StaffType {
  if (typeof staff !== "object" || staff === null) {
    return "all";
  }

  if ("gradeLevelsSupported" in staff) {
    return "nycps";
  }

  if ("adminLevel" in staff) {
    return "tl";
  }

  return "all";
}