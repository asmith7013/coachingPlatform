import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { getSectionVelocityByDateRange } from "@/app/actions/scm/podsie/velocity/velocity";

/**
 * Query keys for weekly velocity data
 */
export const weeklyVelocityKeys = {
  all: ["weekly-velocity"] as const,
  section: (
    section: string,
    school: string,
    startDate: string,
    endDate: string,
  ) =>
    [...weeklyVelocityKeys.all, section, school, startDate, endDate] as const,
};

interface SectionConfig {
  section: string;
  school: string;
}

export interface SectionWeeklyData {
  section: string;
  school: string;
  totalMasteryChecks: number;
  totalStudents: number;
  masteryChecksPerStudent: number;
  attendance: {
    present: number;
    late: number;
    absent: number;
    total: number;
  };
}

/**
 * Hook for fetching weekly velocity data for multiple sections using React Query
 */
export function useWeeklyVelocity(
  sections: readonly SectionConfig[],
  startDate: string,
  endDate: string,
) {
  const queries = useQueries({
    queries: sections.map(({ section, school }) => ({
      queryKey: weeklyVelocityKeys.section(section, school, startDate, endDate),
      queryFn: async (): Promise<SectionWeeklyData | null> => {
        const result = await getSectionVelocityByDateRange(
          section,
          school,
          startDate,
          endDate,
          true, // includeNotTracked
          true, // includeStudentDetails
        );

        if (!result.success) {
          console.error(`Failed to fetch data for ${section}:`, result.error);
          return null;
        }

        // Aggregate data for the week
        const dailyStats = result.data || [];
        const studentDetails = result.studentDetails || [];

        // Count total mastery checks from all days
        let totalMasteryChecks = 0;
        const attendanceCounts = { present: 0, late: 0, absent: 0, total: 0 };

        for (const day of dailyStats) {
          totalMasteryChecks += day.byActivityType.masteryChecks;
        }

        // Calculate attendance from student details
        for (const student of studentDetails) {
          for (const [date, dayData] of Object.entries(student.dailyProgress)) {
            if (date >= startDate && date <= endDate) {
              if (dayData.attendance === "present") {
                attendanceCounts.present++;
                attendanceCounts.total++;
              } else if (dayData.attendance === "late") {
                attendanceCounts.late++;
                attendanceCounts.total++;
              } else if (dayData.attendance === "absent") {
                attendanceCounts.absent++;
                attendanceCounts.total++;
              }
            }
          }
        }

        const totalStudents = studentDetails.length;
        const masteryChecksPerStudent =
          totalStudents > 0
            ? Math.round((totalMasteryChecks / totalStudents) * 10) / 10
            : 0;

        return {
          section,
          school,
          totalMasteryChecks,
          totalStudents,
          masteryChecksPerStudent,
          attendance: attendanceCounts,
        };
      },
      staleTime: 60_000, // Cache for 1 minute
    })),
  });

  // Build Map from query results
  const sectionData = useMemo(() => {
    const map = new Map<string, SectionWeeklyData>();
    queries.forEach((query) => {
      if (query.data) {
        map.set(query.data.section, query.data);
      }
    });
    return map;
  }, [queries]);

  // Compute loading state
  const loading = queries.some((q) => q.isLoading);
  const error = queries.find((q) => q.error)?.error?.message || null;

  return {
    sectionData,
    loading,
    error,
  };
}
