import { useQuery } from "@tanstack/react-query";
import { fetchStudentAssessments } from "@/app/actions/scm/student/student-assessments";

export type AssessmentRow = {
  studentId: string;
  studentName: string;
  section: string;
  schoolId: string;
  assessmentDate: string;
  skillCode: string;
  skillName: string;
  skillGrade: string;
  unit: string;
  status: string;
  attemptNumber: number;
  dateCompleted: string;
  score: string;
  passed: boolean;
};

/**
 * Query keys for assessment data
 */
export const assessmentDataKeys = {
  all: ["assessment-data"] as const,
};

/**
 * Hook for fetching student assessment data using React Query
 */
export function useAssessmentData() {
  const { data, isLoading, error } = useQuery({
    queryKey: assessmentDataKeys.all,
    queryFn: async (): Promise<AssessmentRow[]> => {
      const result = await fetchStudentAssessments();

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to load assessment data");
      }

      return result.data as AssessmentRow[];
    },
    staleTime: 60_000, // Cache for 1 minute
  });

  return {
    data: data || [],
    loading: isLoading,
    error: error?.message || null,
  };
}
