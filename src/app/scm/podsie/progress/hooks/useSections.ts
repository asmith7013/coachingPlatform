import { useQuery } from "@tanstack/react-query";
import { fetchStudents } from "@/app/actions/313/students";
import { Student } from "@zod-schema/313/student/student";

/**
 * Query key for sections data
 */
export const sectionsKeys = {
  all: ["sections"] as const,
  active: () => [...sectionsKeys.all, "active"] as const,
};

/**
 * Hook for fetching unique sections from active students using React Query
 */
export function useSections() {
  const { data, isLoading, error } = useQuery({
    queryKey: sectionsKeys.active(),
    queryFn: async () => {
      const result = await fetchStudents({
        page: 1,
        limit: 1000,
        sortBy: "lastName",
        sortOrder: "asc",
        filters: { active: true },
        search: "",
        searchFields: [],
      });

      if (result.success && result.items) {
        const allStudents = result.items as Student[];
        const uniqueSections = Array.from(
          new Set(allStudents.map((s) => s.section))
        ).sort();
        return uniqueSections;
      }
      throw new Error("Failed to load sections");
    },
    staleTime: 5 * 60 * 1000, // Sections rarely change, cache for 5 minutes
  });

  return {
    sections: data || [],
    loading: isLoading,
    error: error?.message || null,
  };
}
