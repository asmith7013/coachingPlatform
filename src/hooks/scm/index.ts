/**
 * SCM (School Coaching Manager) Shared Hooks
 *
 * Centralized re-exports of React Query hooks used across SCM pages.
 * These hooks handle data fetching for:
 * - Section/class configuration
 * - Velocity and attendance tracking
 * - Roadmap units and skills
 * - Assessment and completion data
 */

// ============================================================
// SECTION & CLASS HOOKS (shared across podsie and roadmaps)
// ============================================================
export {
  useSectionOptions,
  sectionOptionsKeys,
  type SectionsBySchool,
} from "@/app/scm/podsie/velocity/hooks/useSectionOptions";

// Note: useSections has been consolidated into useSectionOptions
// Use useSectionOptions().sections for a simple string array of section names

export {
  useDaysOff,
  daysOffKeys,
} from "@/app/scm/podsie/velocity/hooks/useDaysOff";

export {
  useCurrentUnits,
  currentUnitsKeys,
} from "@/app/scm/podsie/hooks/useCurrentUnits";

// ============================================================
// VELOCITY HOOKS (podsie velocity tracking)
// ============================================================
export {
  useVelocityData,
  velocityKeys,
} from "@/app/scm/podsie/velocity/hooks/useVelocityData";

export {
  useWeeklyVelocity,
  weeklyVelocityKeys,
  type SectionWeeklyData,
} from "@/app/scm/podsie/weekly/hooks/useWeeklyVelocity";

// ============================================================
// ROADMAP HOOKS (units, skills, completion data)
// ============================================================
export {
  useRoadmapUnits,
  roadmapUnitsKeys,
} from "@/app/scm/roadmaps/mastery-grid/hooks/useRoadmapUnits";

export {
  useRoadmapData,
  roadmapDataKeys,
} from "@/app/scm/roadmaps/progress/hooks/useRoadmapData";

export {
  useAllSkills,
  allSkillsKeys,
} from "@/app/scm/roadmaps/skills/hooks/useAllSkills";

export {
  useFilteredSkills,
  filteredSkillsKeys,
} from "@/app/scm/roadmaps/skills/hooks/useFilteredSkills";

// ============================================================
// ASSESSMENT & COMPLETION HOOKS (history page data)
// ============================================================
export {
  useAssessmentData,
  assessmentDataKeys,
  type AssessmentRow,
} from "@/app/scm/roadmaps/history/hooks/useAssessmentData";

export {
  useZearnCompletions,
  zearnCompletionsKeys,
} from "@/app/scm/roadmaps/history/hooks/useZearnCompletions";

export {
  usePodsieCompletions,
  podsieCompletionsKeys,
} from "@/app/scm/roadmaps/history/hooks/usePodsieCompletions";

export {
  useStudentsBySection,
  studentsBySectionKeys,
} from "@/app/scm/roadmaps/history/hooks/useStudentsBySection";
