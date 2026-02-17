import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchActivityData,
  ActivityDataFilters,
  StudentActivityRecord,
} from "../data/actions";

export const activityDataKeys = {
  all: ["incentives-activity-data"] as const,
  filtered: (filters: ActivityDataFilters) =>
    [...activityDataKeys.all, filters] as const,
};

export function useActivityData(filters: ActivityDataFilters) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: activityDataKeys.filtered(filters),
    queryFn: async () => {
      const result = await fetchActivityData(filters);
      if (typeof result === "string") {
        throw new Error(result);
      }
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch activity data");
      }
      return result.data as StudentActivityRecord[];
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  const refetch = () => {
    queryClient.invalidateQueries({
      queryKey: activityDataKeys.filtered(filters),
    });
  };

  return {
    records: data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}
