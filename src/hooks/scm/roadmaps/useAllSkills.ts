import { useQuery } from "@tanstack/react-query";
import { fetchRoadmapsSkills } from "@actions/scm/roadmaps/roadmaps-skills";
import { RoadmapsSkill } from "@zod-schema/scm/roadmaps/roadmap-skill";

/**
 * Query keys for all skills
 */
export const allSkillsKeys = {
  all: ["all-roadmaps-skills"] as const,
};

/**
 * Hook for fetching all roadmaps skills (for filter dropdowns) using React Query
 */
export function useAllSkills() {
  const { data, isLoading, error } = useQuery({
    queryKey: allSkillsKeys.all,
    queryFn: async (): Promise<RoadmapsSkill[]> => {
      const result = await fetchRoadmapsSkills({
        page: 1,
        limit: 10000,
        sortBy: "skillNumber",
        sortOrder: "asc",
        filters: {},
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
    staleTime: 5 * 60_000, // Cache for 5 minutes
  });

  return {
    allSkills: data || [],
    loading: isLoading,
    error: error?.message || null,
  };
}
