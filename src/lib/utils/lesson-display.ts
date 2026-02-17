/**
 * Lesson Display Utilities
 *
 * Helper functions for formatting and displaying lesson names consistently across the application.
 * Handles the nuances of ramp-ups, assessments, and regular lessons.
 */

export type LessonType = "lesson" | "rampUp" | "assessment";

export interface LessonDisplayOptions {
  /**
   * Whether to add "Lesson X:" prefix for regular lessons
   * Default: false
   */
  showLessonNumber?: boolean;

  /**
   * The section the lesson belongs to (for fallback type detection)
   */
  section?: string;

  /**
   * Whether to use the pure title without any prefix
   * When true, returns just the title (e.g., "Division of Fractions" instead of "Ramp Up 1: Division of Fractions")
   * Default: false
   */
  usePureTitle?: boolean;
}

/**
 * Format lesson name for display, handling ramp-ups, assessments, and regular lessons intelligently
 *
 * @param lessonName - Full lesson name (may include prefix like "Ramp Up 1:")
 * @param lessonNumber - Lesson number (from unitLessonId, e.g., "2.5" -> "5")
 * @param options - Display options
 * @param lessonType - Optional explicit lesson type (preferred if available from DB)
 * @param lessonTitle - Optional pure lesson title (preferred if available from DB)
 * @returns Formatted lesson name for display
 *
 * @example
 * // Ramp Up (no prefix added)
 * formatLessonDisplay("Ramp Up 1: Division of Fractions", "1", { showLessonNumber: true })
 * // => "Ramp Up 1: Division of Fractions"
 *
 * @example
 * // Regular lesson (prefix added)
 * formatLessonDisplay("Projecting and Scaling", "1", { showLessonNumber: true })
 * // => "Lesson 1: Projecting and Scaling"
 *
 * @example
 * // Regular lesson (no prefix)
 * formatLessonDisplay("Projecting and Scaling", "1", { showLessonNumber: false })
 * // => "Projecting and Scaling"
 *
 * @example
 * // Pure title only
 * formatLessonDisplay("Ramp Up 1: Division of Fractions", "1", { usePureTitle: true }, "ramp-up", "Division of Fractions")
 * // => "Division of Fractions"
 */
export function formatLessonDisplay(
  lessonName: string,
  lessonNumber: number | string,
  options: LessonDisplayOptions = {},
  lessonType?: LessonType,
  lessonTitle?: string,
): string {
  const { showLessonNumber = false, section, usePureTitle = false } = options;

  // If pure title requested and available, return it
  if (usePureTitle && lessonTitle) {
    return lessonTitle;
  }

  // If pure title requested but not available, extract it
  if (usePureTitle) {
    return extractLessonTitle(lessonName);
  }

  // Determine lesson type if not provided
  const type = lessonType || getLessonType(lessonName, section);

  // For ramp-ups and assessments, return as-is (they already have descriptive prefixes)
  if (type === "rampUp" || type === "assessment") {
    return lessonName;
  }

  // For regular lessons, add "Lesson X:" prefix if requested
  if (showLessonNumber) {
    return `Lesson ${lessonNumber}: ${lessonName}`;
  }

  return lessonName;
}

/**
 * Extract the pure title from a lesson name (removing any prefix)
 *
 * @param lessonName - Full lesson name (may include prefix)
 * @param lessonTitle - Optional pre-extracted title from DB (preferred if available)
 * @returns Pure lesson title without prefix
 *
 * @example
 * extractLessonTitle("Ramp Up 1: Division of Fractions")
 * // => "Division of Fractions"
 *
 * @example
 * extractLessonTitle("Ramp Up #2: Points on a Coordinate Plane")
 * // => "Points on a Coordinate Plane"
 *
 * @example
 * extractLessonTitle("End of Unit Assessment 8.2")
 * // => "End of Unit Assessment 8.2"  (kept as-is for assessments)
 *
 * @example
 * extractLessonTitle("Projecting and Scaling")
 * // => "Projecting and Scaling"  (no prefix to remove)
 */
export function extractLessonTitle(
  lessonName: string,
  lessonTitle?: string,
): string {
  // If title already provided from DB, use it
  if (lessonTitle) {
    return lessonTitle;
  }

  // Remove "Ramp Up #N:" or "Ramp Up N:" prefix
  const withoutRampUp = lessonName.replace(/^Ramp Up #?\d+:\s*/i, "");

  // For assessments, keep the full name (it's already the title)
  if (lessonName.match(/^End of Unit Assessment/i)) {
    return lessonName;
  }

  return withoutRampUp;
}

/**
 * Get the lesson type category from lessonName and section
 *
 * @param lessonName - Full lesson name
 * @param section - Lesson section (fallback indicator)
 * @param lessonType - Optional explicit lesson type from DB (preferred if available)
 * @returns Lesson type category
 *
 * @example
 * getLessonType("Ramp Up 1: Division of Fractions")
 * // => "ramp-up"
 *
 * @example
 * getLessonType("End of Unit Assessment 8.2")
 * // => "unit-assessment"
 *
 * @example
 * getLessonType("Projecting and Scaling", "A")
 * // => "lesson"
 */
export function getLessonType(
  lessonName: string,
  section?: string,
  lessonType?: LessonType,
): LessonType {
  // If type already provided from DB, use it
  if (lessonType) {
    return lessonType;
  }

  // Check lesson name for indicators
  if (/^Ramp Up/i.test(lessonName)) {
    return "rampUp";
  }

  if (/^End of Unit Assessment/i.test(lessonName)) {
    return "assessment";
  }

  // Fallback: check section
  if (section === "Ramp Ups") {
    return "rampUp";
  }

  if (section === "Unit Assessment") {
    return "assessment";
  }

  return "lesson";
}

/**
 * Build a complete display name from components (useful when constructing from DB fields)
 *
 * @param lessonType - Lesson type
 * @param lessonNumber - Lesson number
 * @param lessonTitle - Pure lesson title
 * @param options - Display options
 * @returns Complete formatted lesson name
 *
 * @example
 * buildLessonDisplayName("ramp-up", 1, "Division of Fractions")
 * // => "Ramp Up 1: Division of Fractions"
 *
 * @example
 * buildLessonDisplayName("lesson", 5, "More Dilations", { showLessonNumber: true })
 * // => "Lesson 5: More Dilations"
 *
 * @example
 * buildLessonDisplayName("lesson", 5, "More Dilations", { showLessonNumber: false })
 * // => "More Dilations"
 *
 * @example
 * buildLessonDisplayName("unit-assessment", 1, "End of Unit Assessment 8.2")
 * // => "End of Unit Assessment 8.2"
 */
export function buildLessonDisplayName(
  lessonType: LessonType,
  lessonNumber: number | string,
  lessonTitle: string,
  options: LessonDisplayOptions = {},
): string {
  const { showLessonNumber = false } = options;

  switch (lessonType) {
    case "rampUp":
      return `Ramp Up ${lessonNumber}: ${lessonTitle}`;

    case "assessment":
      return lessonTitle; // Title already includes "End of Unit Assessment"

    case "lesson":
      if (showLessonNumber) {
        return `Lesson ${lessonNumber}: ${lessonTitle}`;
      }
      return lessonTitle;

    default:
      return lessonTitle;
  }
}

/**
 * Standardize ramp-up naming format (remove # symbol for consistency)
 *
 * @param lessonName - Lesson name that may have "Ramp Up #N:" format
 * @returns Lesson name with standardized "Ramp Up N:" format
 *
 * @example
 * standardizeRampUpName("Ramp Up #2: Points on a Coordinate Plane")
 * // => "Ramp Up 2: Points on a Coordinate Plane"
 *
 * @example
 * standardizeRampUpName("Ramp Up 1: Division of Fractions")
 * // => "Ramp Up 1: Division of Fractions"  (already standardized)
 */
export function standardizeRampUpName(lessonName: string): string {
  return lessonName.replace(/^Ramp Up #(\d+):/i, "Ramp Up $1:");
}
