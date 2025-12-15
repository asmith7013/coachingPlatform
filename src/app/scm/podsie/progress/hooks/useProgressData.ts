import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { fetchRampUpProgress } from "@/app/actions/scm/podsie/podsie-sync";
import { ProgressData, LessonConfig } from "../types";

/**
 * Query key factory for podsie progress data
 */
export const progressKeys = {
  all: ["podsie-progress"] as const,
  bySection: (section: string) => [...progressKeys.all, section] as const,
  byUnit: (section: string, unitCode: string) =>
    [...progressKeys.bySection(section), unitCode] as const,
};

/**
 * Hook for fetching and managing Podsie progress data using React Query
 */
export function useProgressData(
  selectedSection: string,
  selectedUnit: number | null,
  lessons: LessonConfig[],
  school?: string
) {
  const queryClient = useQueryClient();

  // Derive unitCode from lessons (all lessons in a unit share the same grade)
  const grade = lessons[0]?.grade || "8";
  const unitCode = selectedUnit !== null ? `${grade}.${selectedUnit}` : "";

  // Determine if query should be enabled
  const enabled = Boolean(
    selectedSection && selectedUnit !== null && lessons.length > 0
  );

  const queryKey = useMemo(() =>
    school
      ? [...progressKeys.byUnit(selectedSection, unitCode), school]
      : progressKeys.byUnit(selectedSection, unitCode),
    [selectedSection, unitCode, school]
  );

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await fetchRampUpProgress(selectedSection, unitCode, undefined, undefined, school);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error || "Failed to load progress");
    },
    enabled,
    staleTime: 30_000, // Consider data fresh for 30 seconds
  });

  /**
   * Update progress data in the cache (for optimistic updates after sync)
   * Replaces data for a specific assignment while keeping other data intact
   */
  const updateProgressForAssignment = useCallback(
    (podsieAssignmentId: string, newData: ProgressData[]) => {
      queryClient.setQueryData<ProgressData[]>(queryKey, (prevData) => {
        if (!prevData) return newData;
        const filtered = prevData.filter(
          (p) => p.podsieAssignmentId !== podsieAssignmentId
        );
        const assignmentData = newData.filter(
          (p) => p.podsieAssignmentId === podsieAssignmentId
        );
        return [...filtered, ...assignmentData];
      });
    },
    [queryClient, queryKey]
  );

  /**
   * Replace all progress data in the cache
   */
  const setProgressData = useCallback(
    (newData: ProgressData[] | ((prev: ProgressData[]) => ProgressData[])) => {
      queryClient.setQueryData<ProgressData[]>(queryKey, (prevData) => {
        if (typeof newData === "function") {
          return newData(prevData || []);
        }
        return newData;
      });
    },
    [queryClient, queryKey]
  );

  /**
   * Invalidate and refetch progress data
   */
  const refetchProgress = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  return {
    progressData: data || [],
    loading: isLoading,
    error: error?.message || null,
    // Cache update methods
    setProgressData,
    updateProgressForAssignment,
    refetchProgress,
  };
}
