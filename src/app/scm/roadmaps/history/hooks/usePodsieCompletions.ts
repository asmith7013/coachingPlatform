import { useQuery } from "@tanstack/react-query";
import { fetchPodsieCompletions, type PodsieCompletionRow } from "@/app/actions/313/podsie-history";

export type { PodsieCompletionRow };

/**
 * Query keys for Podsie completions
 */
export const podsieCompletionsKeys = {
  all: ["podsie-completions"] as const,
};

/**
 * Hook for fetching Podsie completion data using React Query
 */
export function usePodsieCompletions() {
  const { data, isLoading, error } = useQuery({
    queryKey: podsieCompletionsKeys.all,
    queryFn: async (): Promise<PodsieCompletionRow[]> => {
      const result = await fetchPodsieCompletions();

      if (!result.success) {
        throw new Error(result.error || "Failed to load Podsie data");
      }

      return result.data;
    },
    staleTime: 60_000, // Cache for 1 minute
  });

  return {
    data: data || [],
    loading: isLoading,
    error: error?.message || null,
  };
}
