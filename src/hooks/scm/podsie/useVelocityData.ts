import { useQueries, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import {
  getSectionVelocityByDateRange,
  type DailyVelocityStats,
  type StudentDailyData,
} from "@/app/actions/scm/velocity/velocity";
import { fetchSectionUnitSchedules } from "@/app/actions/calendar/unit-schedule";
import type { UnitSchedule } from "@zod-schema/calendar";
import type { SectionOption } from "@/components/composed/section-visualization";

/**
 * Query keys for velocity data
 */
export const velocityKeys = {
  all: ["velocity"] as const,
  section: (sectionId: string, includeNotTracked: boolean) =>
    [...velocityKeys.all, "section", sectionId, includeNotTracked] as const,
  unitSchedule: (sectionId: string, schoolYear: string) =>
    [...velocityKeys.all, "unit-schedule", sectionId, schoolYear] as const,
};

interface VelocityQueryResult {
  sectionId: string;
  velocityData: DailyVelocityStats[];
  studentDetails: StudentDailyData[];
}

interface UnitScheduleQueryResult {
  sectionId: string;
  schedules: UnitSchedule[];
}

// School year date range
const SCHOOL_YEAR_START = "2025-09-01";
const SCHOOL_YEAR_END = "2026-06-30";

/**
 * Hook for fetching velocity data for multiple sections using React Query
 */
export function useVelocityData(
  selectedSections: string[],
  sectionOptions: SectionOption[],
  schoolYear: string,
  includeNotTracked: boolean
) {
  const queryClient = useQueryClient();

  // Create queries for velocity data for each selected section
  const velocityQueries = useQueries({
    queries: selectedSections.map((sectionId) => {
      const section = sectionOptions.find((s) => s.id === sectionId);
      return {
        queryKey: velocityKeys.section(sectionId, includeNotTracked),
        queryFn: async (): Promise<VelocityQueryResult> => {
          if (!section) {
            throw new Error(`Section ${sectionId} not found`);
          }

          const result = await getSectionVelocityByDateRange(
            section.classSection,
            section.school,
            SCHOOL_YEAR_START,
            SCHOOL_YEAR_END,
            includeNotTracked,
            true // includeStudentDetails
          );

          if (!result.success || !result.data) {
            throw new Error("Failed to load velocity data");
          }

          return {
            sectionId,
            velocityData: result.data,
            studentDetails: result.studentDetails || [],
          };
        },
        enabled: Boolean(section),
        staleTime: 60_000, // Cache for 1 minute
      };
    }),
  });

  // Create queries for unit schedules for each selected section
  const unitScheduleQueries = useQueries({
    queries: selectedSections.map((sectionId) => {
      const section = sectionOptions.find((s) => s.id === sectionId);
      return {
        queryKey: velocityKeys.unitSchedule(sectionId, schoolYear),
        queryFn: async (): Promise<UnitScheduleQueryResult> => {
          if (!section) {
            throw new Error(`Section ${sectionId} not found`);
          }

          const scopeTag = section.scopeSequenceTag || `Grade ${section.gradeLevel}`;
          const result = await fetchSectionUnitSchedules(
            schoolYear,
            scopeTag,
            section.school,
            section.classSection
          );

          if (!result.success) {
            throw new Error("Failed to load unit schedules");
          }

          return {
            sectionId,
            schedules: result.data || [],
          };
        },
        enabled: Boolean(section),
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      };
    }),
  });

  // Build Maps from query results
  const velocityData = useMemo(() => {
    const map = new Map<string, DailyVelocityStats[]>();
    velocityQueries.forEach((query) => {
      if (query.data) {
        map.set(query.data.sectionId, query.data.velocityData);
      }
    });
    return map;
  }, [velocityQueries]);

  const detailData = useMemo(() => {
    const map = new Map<string, StudentDailyData[]>();
    velocityQueries.forEach((query) => {
      if (query.data) {
        map.set(query.data.sectionId, query.data.studentDetails);
      }
    });
    return map;
  }, [velocityQueries]);

  const unitScheduleData = useMemo(() => {
    const map = new Map<string, UnitSchedule[]>();
    unitScheduleQueries.forEach((query) => {
      if (query.data) {
        map.set(query.data.sectionId, query.data.schedules);
      }
    });
    return map;
  }, [unitScheduleQueries]);

  // Compute loading section IDs
  const loadingSectionIds = useMemo(() => {
    const loading = new Set<string>();
    velocityQueries.forEach((query, index) => {
      if (query.isLoading) {
        loading.add(selectedSections[index]);
      }
    });
    return loading;
  }, [velocityQueries, selectedSections]);

  // Overall loading state (true if initial load with no sections having data)
  const isInitialLoading =
    selectedSections.length > 0 &&
    velocityQueries.every((q) => q.isLoading) &&
    velocityData.size === 0;

  /**
   * Invalidate velocity data for a specific section
   */
  const invalidateSection = useCallback(
    (sectionId: string) => {
      queryClient.invalidateQueries({
        queryKey: velocityKeys.section(sectionId, includeNotTracked),
      });
    },
    [queryClient, includeNotTracked]
  );

  /**
   * Invalidate all velocity data
   */
  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: velocityKeys.all });
  }, [queryClient]);

  return {
    velocityData,
    detailData,
    unitScheduleData,
    loadingSectionIds,
    isInitialLoading,
    invalidateSection,
    invalidateAll,
  };
}
