import { useQuery } from "@tanstack/react-query";
import { fetchRoadmapsSkills } from "@actions/313/roadmaps-skills";
import { RoadmapsSkill } from "@zod-schema/313/curriculum/roadmap-skill";

/**
 * Query keys for filtered skills
 */
export const filteredSkillsKeys = {
  all: ["filtered-roadmaps-skills"] as const,
  byGradeAndUnit: (grade: string, unit: string) =>
    [...filteredSkillsKeys.all, grade, unit] as const,
};

/**
 * Hook for fetching filtered roadmaps skills by grade and unit using React Query
 */
export function useFilteredSkills(selectedGrade: string, selectedUnit: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: filteredSkillsKeys.byGradeAndUnit(selectedGrade, selectedUnit),
    queryFn: async (): Promise<RoadmapsSkill[]> => {
      const filters: Record<string, unknown> = {
        "units.grade": selectedGrade,
      };

      if (selectedUnit) {
        filters["units.unitTitle"] = selectedUnit;
      }

      const result = await fetchRoadmapsSkills({
        page: 1,
        filters,
        limit: 10000,
        sortBy: "skillNumber",
        sortOrder: "asc" as const,
      });

      if (!result.success || !result.items) {
        throw new Error(result.error || "Failed to load skills");
      }

      // Sort by skill number
      return (result.items as RoadmapsSkill[]).sort((a, b) => {
        const numA = parseInt(a.skillNumber) || 0;
        const numB = parseInt(b.skillNumber) || 0;
        return numA - numB;
      });
    },
    enabled: !!selectedGrade, // Only fetch when grade is selected
    staleTime: 60_000, // Cache for 1 minute
  });

  return {
    skills: data || [],
    loading: isLoading,
    error: error?.message || null,
  };
}
