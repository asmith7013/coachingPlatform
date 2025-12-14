import { useQuery } from "@tanstack/react-query";
import { fetchStudentsBySection } from "../form/actions";

export const studentsForSectionKeys = {
  all: ["incentives-students"] as const,
  bySection: (section: string, grade: string) =>
    [...studentsForSectionKeys.all, section, grade] as const,
};

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
}

export function useStudentsForSection(section: string, grade: string = "8") {
  const { data, isLoading, error } = useQuery({
    queryKey: studentsForSectionKeys.bySection(section, grade),
    queryFn: async () => {
      const result = await fetchStudentsBySection(section, grade);
      if (typeof result === "string") {
        throw new Error(result);
      }
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch students");
      }
      return result.data as Student[];
    },
    enabled: !!section,
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    students: data || [],
    loading: isLoading,
    error: error?.message || null,
  };
}
