import { useQuery } from "@tanstack/react-query";
import { listWorkedExampleDecks } from "@/app/actions/worked-examples";
import type { WorkedExampleDeck } from "@zod-schema/scm/worked-example";

export const workedExampleDecksKeys = {
  all: ["worked-example-decks"] as const,
};

export function useWorkedExampleDecks() {
  const { data, isLoading, error } = useQuery({
    queryKey: workedExampleDecksKeys.all,
    queryFn: async () => {
      const result = await listWorkedExampleDecks();
      if (!result.success) {
        throw new Error(result.error || "Failed to load presentations");
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
