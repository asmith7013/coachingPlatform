export type StaffType = "all" | "nycps" | "tl";

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