// Shared hooks for roadmaps pages
// Re-export from individual page hooks directories

// From history
export {
  useAssessmentData,
  assessmentDataKeys,
  useZearnCompletions,
  zearnCompletionsKeys,
  usePodsieCompletions,
  podsieCompletionsKeys,
  useStudentsBySection,
  studentsBySectionKeys,
} from "../history/hooks";

// From progress
export { useRoadmapData, roadmapDataKeys } from "../progress/hooks";

// From mastery-grid (shared across units, mastery-grid, skills)
export { useRoadmapUnits, roadmapUnitsKeys } from "../mastery-grid/hooks/useRoadmapUnits";
export { useSections, sectionsKeys } from "../mastery-grid/hooks/useSections";

// From skills (shared for skill lookups)
export { useAllSkills, allSkillsKeys } from "../skills/hooks/useAllSkills";
export { useFilteredSkills, filteredSkillsKeys } from "../skills/hooks/useFilteredSkills";

// Re-export useSectionOptions from podsie (used by progress)
export { useSectionOptions, sectionOptionsKeys } from "@/app/scm/podsie/velocity/hooks/useSectionOptions";
