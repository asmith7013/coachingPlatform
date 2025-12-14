import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchActivityTypes } from "../form/actions";
import { ActivityTypeConfig } from "@zod-schema/scm/incentives/activity-type-config";

export const activityTypesKeys = {
  all: ["incentives-activity-types"] as const,
};

export function useActivityTypes() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: activityTypesKeys.all,
    queryFn: async () => {
      const result = await fetchActivityTypes();
      if (typeof result === "string") {
        throw new Error(result);
      }
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch activity types");
      }
      return result.data as ActivityTypeConfig[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const reload = () => {
    queryClient.invalidateQueries({ queryKey: activityTypesKeys.all });
  };

  return {
    activityTypes: data || [],
    loading: isLoading,
    error: error?.message || null,
    reload,
  };
}
