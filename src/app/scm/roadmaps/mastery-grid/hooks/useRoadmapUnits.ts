import { useQuery } from "@tanstack/react-query";
import { getRoadmapUnits } from "@/app/actions/313/roadmaps-units";
import { RoadmapUnit } from "@zod-schema/313/curriculum/roadmap-unit";

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

      const rawUnits = Array.isArray(result.data) ? result.data : [];
      const unitsWithStringIds = rawUnits.map(
        (unit: Record<string, unknown>): RoadmapUnit => ({
          _id: (unit._id as string)?.toString() || (unit._id as string),
          ownerIds: (unit.ownerIds as string[]) || [],
          grade: (unit.grade as string) || "",
          unitTitle: (unit.unitTitle as string) || "",
          unitNumber: (unit.unitNumber as number) || 0,
          url: (unit.url as string) || "",
          targetCount: (unit.targetCount as number) || 0,
          supportCount: (unit.supportCount as number) || 0,
          extensionCount: (unit.extensionCount as number) || 0,
          targetSkills: (unit.targetSkills as string[]) || [],
          additionalSupportSkills: (unit.additionalSupportSkills as string[]) || [],
          extensionSkills: (unit.extensionSkills as string[]) || [],
          scrapedAt: (unit.scrapedAt as string) || new Date().toISOString(),
          success: (unit.success as boolean) ?? true,
          error: unit.error as string | undefined,
          createdAt: (unit.createdAt as string) || new Date().toISOString(),
          updatedAt: (unit.updatedAt as string) || new Date().toISOString(),
        })
      );

      // Sort by createdAt ascending (oldest first)
      return unitsWithStringIds.sort(
        (a, b) =>
          new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      );
    },
    staleTime: 5 * 60_000, // Cache for 5 minutes
  });

  return {
    units: data || [],
    loading: isLoading,
    error: error?.message || null,
  };
}
