import { useQuery } from "@tanstack/react-query";
import { listWorkedExampleDecks } from "@/app/actions/worked-examples";
import type { WorkedExampleDeck } from "@zod-schema/scm/worked-example";

export const deactivatedDecksKeys = {
  all: ["deactivated-worked-example-decks"] as const,
};

export function useDeactivatedDecks() {
  const { data, isLoading, error } = useQuery({
    queryKey: deactivatedDecksKeys.all,
    queryFn: async () => {
      const result = await listWorkedExampleDecks({ deactivated: true });
      if (!result.success) {
        throw new Error(
          result.error || "Failed to load deactivated presentations",
        );
      }
      return result.data as WorkedExampleDeck[];
    },
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    decks: data || [],
    loading: isLoading,
    error: error?.message || null,
  };
}
