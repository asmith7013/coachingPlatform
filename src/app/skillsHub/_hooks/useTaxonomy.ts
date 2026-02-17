import { useQuery } from "@tanstack/react-query";
import { fetchTaxonomyAction } from "../_actions/taxonomy.actions";

export const taxonomyKeys = {
  all: ["skills-hub-taxonomy"] as const,
};

export function useTaxonomy() {
  const { data, isLoading, error } = useQuery({
    queryKey: taxonomyKeys.all,
    queryFn: async () => {
      const result = await fetchTaxonomyAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  return {
    taxonomy: data ?? null,
    loading: isLoading,
    error: error?.message || null,
  };
}
