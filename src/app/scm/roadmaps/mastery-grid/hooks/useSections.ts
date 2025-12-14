import { useQuery } from "@tanstack/react-query";
import { fetchStudents } from "@/app/actions/313/students";
import { Student } from "@zod-schema/313/student/student";

/**
 * Query keys for sections
 */
export const sectionsKeys = {
  all: ["student-sections"] as const,
};

/**
 * Hook for fetching unique sections from students using React Query
 */
export function useSections() {
  const { data, isLoading, error } = useQuery({
    queryKey: sectionsKeys.all,
    queryFn: async (): Promise<string[]> => {
      const result = await fetchStudents({
        page: 1,
        limit: 1000,
        sortBy: "lastName",
        sortOrder: "asc",
        filters: { active: true },
        search: "",
        searchFields: [],
      });

      if (!result.success || !result.items) {
        throw new Error("Failed to load students");
      }

      const uniqueSections = Array.from(
        new Set((result.items as Student[]).map((s) => s.section))
      ).sort();

      return uniqueSections;
    },
    staleTime: 5 * 60_000, // Cache for 5 minutes
  });

  return {
    sections: data || [],
    loading: isLoading,
    error: error?.message || null,
  };
}
