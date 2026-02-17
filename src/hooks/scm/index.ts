/**
 * SCM (School Coaching Manager) Shared Hooks
 *
 * Centralized exports of React Query hooks used across SCM pages.
 * These hooks handle data fetching for:
 * - Section/class configuration
 * - Velocity and attendance tracking
 * - Roadmap units and skills
 * - Assessment and completion data
 * - Scope and sequence management
 */

// ============================================================
// PODSIE HOOKS (velocity, sections, days off)
// ============================================================
export {
  useSectionOptions,
  sectionOptionsKeys,
  type SectionsBySchool,
} from "./podsie/useSectionOptions";

export { useDaysOff, daysOffKeys } from "./podsie/useDaysOff";

export { useCurrentUnits, currentUnitsKeys } from "./podsie/useCurrentUnits";

export { useVelocityData, velocityKeys } from "./podsie/useVelocityData";

export {
  useWeeklyVelocity,
  weeklyVelocityKeys,
  type SectionWeeklyData,
} from "./podsie/useWeeklyVelocity";

// ============================================================
// ROADMAP HOOKS (units, skills, completion data)
// ============================================================
export { useRoadmapUnits, roadmapUnitsKeys } from "./roadmaps/useRoadmapUnits";

export {
  useRoadmapData,
  roadmapDataKeys,
  type SectionRoadmapData,
} from "./roadmaps/useRoadmapData";

export { useAllSkills, allSkillsKeys } from "./roadmaps/useAllSkills";

export {
  useFilteredSkills,
  filteredSkillsKeys,
} from "./roadmaps/useFilteredSkills";

// ============================================================
// ASSESSMENT & COMPLETION HOOKS (history page data)
// ============================================================
export {
  useAssessmentData,
  assessmentDataKeys,
  type AssessmentRow,
} from "./roadmaps/useAssessmentData";

export {
  useZearnCompletions,
  zearnCompletionsKeys,
  type ZearnHistoryRow,
} from "./roadmaps/useZearnCompletions";

export {
  usePodsieCompletions,
  podsieCompletionsKeys,
  type PodsieCompletionRow,
} from "./roadmaps/usePodsieCompletions";

export {
  useStudentsBySection,
  studentsBySectionKeys,
} from "./roadmaps/useStudentsBySection";

// ============================================================
// SCOPE & SEQUENCE HOOKS (curriculum planning)
// ============================================================
export {
  useScopeSequenceList,
  useScopeSequenceById,
  useUnitsByScopeTag,
  scopeSequenceKeys,
} from "./scope-and-sequence/queries";

export {
  useCreateScopeSequence,
  useUpdateScopeSequence,
  useDeleteScopeSequence,
} from "./scope-and-sequence/mutations";

// ============================================================
// URL FILTER HOOKS
// ============================================================
export {
  useFilterParams,
  // Scope sequence tag conversions (curriculum)
  scopeTagToSlug,
  slugToScopeTag,
  // Grade conversions (content level within curriculum)
  gradeToSlug,
  slugToGrade,
  // Unit conversions
  unitToSlug,
  slugToUnit,
} from "./useFilterParams";

// ============================================================
// UTILITIES (colors, etc.)
// ============================================================
export {
  getSectionColors,
  getSectionColor,
  SCHOOL_COLOR_FAMILIES,
  type School,
} from "./utils/colors";

export {
  UNIT_COLORS,
  getUnitColor,
  getSectionShade,
  getUnitSectionColor,
  getSectionBadgeLabel,
  type UnitColor,
} from "./utils/unitColors";

// ============================================================
// TIMESHEET HOOKS
// ============================================================
export { useTimesheetEntries, timesheetKeys } from "./timesheet";
