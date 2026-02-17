import { School } from "@zod-schema/core/school";
import { ImplementationExperience } from "@enums";
import { IMPLEMENTATION_INDICATORS } from "@/lib/ui/constants/coaching-log";

/**
 * Convenience function to create a district and name field
 *
 * @example
 * const school = await fetchSchool(id);
 * const displayName = getSchoolDisplayName(school);
 * // "District Name - School Name"
 */
export function getSchoolDisplayName(school: School): string {
  return `${school.district} - ${school.schoolName}`;
}

/**
 * Gets a summary of the school's grade levels
 *
 * @param school School entity
 * @param maxCount Maximum number of grade levels to include (default: 3)
 * @returns Formatted string of grade levels
 */
export function getGradeLevelsSummary(
  school: School,
  maxCount: number = 3,
): string {
  if (
    !school.gradeLevelsSupported ||
    school.gradeLevelsSupported.length === 0
  ) {
    return "No grade levels";
  }

  const shownGrades = school.gradeLevelsSupported.slice(0, maxCount);

  if (school.gradeLevelsSupported.length > maxCount) {
    return `${shownGrades.join(", ")} +${school.gradeLevelsSupported.length - maxCount} more`;
  }

  return shownGrades.join(", ");
}

/**
 * Gets the staff count with appropriate pluralization
 *
 * @param school School entity
 * @returns Formatted string with staff count
 */
export function getStaffCountDisplay(school: School): string {
  const count = school.staffListIds?.length || 0;
  return `${count} ${count === 1 ? "staff member" : "staff members"}`;
}

/**
 * Maps years of IM implementation to implementation experience category
 * Defaults to FIRST_YEAR if years is undefined/null (new schools)
 *
 * @param years - Number of years implementing IM curriculum (can be undefined)
 * @returns ImplementationExperience enum value
 */
export function getImplementationExperience(
  years: number | undefined | null,
): ImplementationExperience {
  // Default to first year if no data available
  if (years === undefined || years === null) {
    return ImplementationExperience.FIRST_YEAR;
  }

  return years <= 1
    ? ImplementationExperience.FIRST_YEAR
    : ImplementationExperience.EXPERIENCED;
}

/**
 * Gets available implementation focus options based on years of experience
 *
 * @param years - Number of years implementing IM curriculum
 * @returns Array of available focus options for the experience level
 */
export function getImplementationFocusOptions(
  years: number | undefined | null,
): readonly string[] {
  const experience = getImplementationExperience(years);

  return IMPLEMENTATION_INDICATORS[experience] || [];
}
