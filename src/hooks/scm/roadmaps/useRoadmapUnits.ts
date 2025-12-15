import { useQuery } from "@tanstack/react-query";
import { getRoadmapUnits } from "@/app/actions/scm/roadmaps-units";
import { RoadmapUnit } from "@zod-schema/scm/curriculum/roadmap-unit";

/**
 * Query keys for roadmap units
 */
export const roadmapUnitsKeys = {
  all: ["roadmap-units"] as const,
};

/**
 * Hook for fetching roadmap units using React Query
 */
export function useRoadmapUnits() {
  const { data, isLoading, error } = useQuery({
    queryKey: roadmapUnitsKeys.all,
    queryFn: async (): Promise<RoadmapUnit[]> => {
      const result = await getRoadmapUnits({
        successOnly: true,
        limit: 1000,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to load units");
      }

      // Server action already returns properly serialized data via toObject()
      return result.data || [];
    },
    staleTime: 5 * 60_000, // Cache for 5 minutes
  });

  return {
    units: data || [],
    loading: isLoading,
    error: error?.message || null,
  };
}
