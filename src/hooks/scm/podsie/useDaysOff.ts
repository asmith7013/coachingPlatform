import { useQuery } from "@tanstack/react-query";
import { getDaysOff } from "@/app/actions/calendar/school-calendar";

/**
 * Query keys for days off
 */
export const daysOffKeys = {
  all: ["days-off"] as const,
  byYear: (schoolYear: string) => [...daysOffKeys.all, schoolYear] as const,
};

/**
 * Hook for fetching days off for a school year using React Query
 */
export function useDaysOff(schoolYear: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: daysOffKeys.byYear(schoolYear),
    queryFn: async () => {
      const result = await getDaysOff(schoolYear);
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error("Failed to load days off");
    },
    staleTime: 10 * 60 * 1000, // Days off rarely change, cache for 10 minutes
  });

  return {
    daysOff: data || [],
    loading: isLoading,
    error: error?.message || null,
  };
}
