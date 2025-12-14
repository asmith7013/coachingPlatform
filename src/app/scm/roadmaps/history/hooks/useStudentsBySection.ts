import { useQuery } from "@tanstack/react-query";
import { fetchStudents } from "@/app/actions/313/students";
import { Student } from "@zod-schema/313/student/student";

/**
 * Query keys for students by section
 */
export const studentsBySectionKeys = {
  all: ["students-by-section"] as const,
};

/**
 * Hook for fetching students and building a section map using React Query
 */
export function useStudentsBySection() {
  const { data, isLoading, error } = useQuery({
    queryKey: studentsBySectionKeys.all,
    queryFn: async (): Promise<Map<string, Set<string>>> => {
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

      const sectionMap = new Map<string, Set<string>>();

      (result.items as Student[]).forEach((student) => {
        if (!sectionMap.has(student.section)) {
          sectionMap.set(student.section, new Set());
        }
        sectionMap.get(student.section)!.add(student.studentID.toString());
      });

      return sectionMap;
    },
    staleTime: 5 * 60_000, // Cache for 5 minutes
  });

  return {
    studentsBySection: data || new Map<string, Set<string>>(),
    loading: isLoading,
    error: error?.message || null,
  };
}
