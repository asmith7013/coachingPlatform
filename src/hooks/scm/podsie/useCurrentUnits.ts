import { useQuery } from "@tanstack/react-query";
import {
  getCurrentUnitsForAllSections,
  type CurrentUnitInfo,
} from "@/app/actions/calendar/current-unit";

/**
 * Query keys for current units
 */
export const currentUnitsKeys = {
  all: ["current-units"] as const,
  byYear: (schoolYear: string) =>
    [...currentUnitsKeys.all, schoolYear] as const,
};

/**
 * Hook for fetching current units for all sections using React Query
 */
export function useCurrentUnits(schoolYear: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: currentUnitsKeys.byYear(schoolYear),
    queryFn: async (): Promise<CurrentUnitInfo[]> => {
      const result = await getCurrentUnitsForAllSections(schoolYear);
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error("Failed to load current units");
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    currentUnits: data || [],
    loading: isLoading,
    error: error?.message || null,
  };
}
