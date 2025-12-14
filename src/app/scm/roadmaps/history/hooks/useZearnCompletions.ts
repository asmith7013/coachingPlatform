import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchZearnCompletions, type ZearnHistoryRow } from "@/app/actions/313/zearn-completions";

export type { ZearnHistoryRow };

/**
 * Query keys for Zearn completions
 */
export const zearnCompletionsKeys = {
  all: ["zearn-completions"] as const,
};

/**
 * Hook for fetching Zearn completion data using React Query
 */
export function useZearnCompletions() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: zearnCompletionsKeys.all,
    queryFn: async (): Promise<ZearnHistoryRow[]> => {
      const result = await fetchZearnCompletions();

      if (!result.success || !result.items) {
        throw new Error(result.error || "Failed to load Zearn data");
      }

      return result.items;
    },
    staleTime: 60_000, // Cache for 1 minute
  });

  // Function to refetch after import
  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: zearnCompletionsKeys.all });
  };

  return {
    data: data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}
