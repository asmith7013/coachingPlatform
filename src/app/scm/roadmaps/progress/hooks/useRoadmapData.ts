import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { getRoadmapCompletionsBySection, type SectionRoadmapData } from "@/app/actions/313/roadmap-completions";

export type { SectionRoadmapData };

/**
 * Query keys for roadmap data
 */
export const roadmapDataKeys = {
  all: ["roadmap-data"] as const,
  bySection: (sectionId: string) => [...roadmapDataKeys.all, sectionId] as const,
};

/**
 * Hook for fetching roadmap completion data for selected sections using React Query
 */
export function useRoadmapData(selectedSections: string[]) {
  const queries = useQueries({
    queries: selectedSections.map((sectionId) => ({
      queryKey: roadmapDataKeys.bySection(sectionId),
      queryFn: async (): Promise<SectionRoadmapData | null> => {
        const result = await getRoadmapCompletionsBySection([sectionId]);

        if (!result.success) {
          console.error(`Failed to fetch roadmap data for ${sectionId}:`, result.error);
          return null;
        }

        if (!result.data || result.data.length === 0) {
          return null;
        }

        return result.data[0];
      },
      staleTime: 60_000, // Cache for 1 minute
      enabled: selectedSections.includes(sectionId),
    })),
  });

  // Build Map from query results
  const roadmapData = useMemo(() => {
    const map = new Map<string, SectionRoadmapData>();
    queries.forEach((query, index) => {
      if (query.data) {
        map.set(selectedSections[index], query.data);
      }
    });
    return map;
  }, [queries, selectedSections]);

  // Track loading section IDs
  const loadingSectionIds = useMemo(() => {
    const loading = new Set<string>();
    queries.forEach((query, index) => {
      if (query.isLoading) {
        loading.add(selectedSections[index]);
      }
    });
    return loading;
  }, [queries, selectedSections]);

  return {
    roadmapData,
    loadingSectionIds,
  };
}
