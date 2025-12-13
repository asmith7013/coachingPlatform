"use client";

import { useMemo } from "react";
import {
  useSchoolCalendarQuery,
  useDaysOffQuery,
  useLessonsQuery,
  useSectionConfigsQuery,
  useSchedulesQuery,
  useSectionDaysOffQuery,
  type ScopeAndSequenceLesson,
  type SavedUnitSchedule,
  type SectionDayOffEvent,
} from "./queries";
import {
  useUpdateSectionDatesMutation,
  useUpdateUnitDatesMutation,
  useAddDayOffMutation,
  useDeleteDayOffMutation,
  useCopySchedulesMutation,
  useClearSectionDatesMutation,
} from "./mutations";
import type { SectionConfigOption, UnitScheduleLocal, SectionSchedule } from "../components/types";

// =====================================
// TYPES
// =====================================

export interface UseCalendarPageDataResult {
  // Data
  calendar: ReturnType<typeof useSchoolCalendarQuery>["data"];
  lessons: ScopeAndSequenceLesson[];
  daysOff: string[];
  savedSchedules: SavedUnitSchedule[];
  sectionConfigs: SectionConfigOption[];
  sectionDaysOff: SectionDayOffEvent[];

  // Derived data
  unitSchedules: UnitScheduleLocal[];

  // Loading states
  isInitialLoading: boolean;
  isLoadingGradeData: boolean;
  isLoadingSchedules: boolean;

  // Mutations
  updateSectionDates: ReturnType<typeof useUpdateSectionDatesMutation>;
  updateUnitDates: ReturnType<typeof useUpdateUnitDatesMutation>;
  addDayOff: ReturnType<typeof useAddDayOffMutation>;
  deleteDayOff: ReturnType<typeof useDeleteDayOffMutation>;
  copySchedules: ReturnType<typeof useCopySchedulesMutation>;
  clearSectionDates: ReturnType<typeof useClearSectionDatesMutation>;

  // Utility
  isMutating: boolean;
}

// =====================================
// HOOK
// =====================================

export function useCalendarPageData(
  schoolYear: string,
  selectedGrade: string,
  selectedSection: SectionConfigOption | null
): UseCalendarPageDataResult {
  // ===== QUERIES =====

  const calendarQuery = useSchoolCalendarQuery(schoolYear);
  const daysOffQuery = useDaysOffQuery(schoolYear);
  const lessonsQuery = useLessonsQuery(selectedGrade);
  const sectionConfigsQuery = useSectionConfigsQuery();
  const schedulesQuery = useSchedulesQuery(schoolYear, selectedGrade, selectedSection);
  const sectionDaysOffQuery = useSectionDaysOffQuery(
    schoolYear,
    selectedSection?.school,
    selectedSection?.classSection
  );

  // ===== MUTATIONS =====

  const updateSectionDates = useUpdateSectionDatesMutation(
    schoolYear,
    selectedGrade,
    selectedSection
  );

  const updateUnitDates = useUpdateUnitDatesMutation(
    schoolYear,
    selectedGrade,
    selectedSection
  );

  const addDayOff = useAddDayOffMutation(
    schoolYear,
    selectedGrade,
    selectedSection,
    daysOffQuery.data ?? []
  );

  const deleteDayOff = useDeleteDayOffMutation(
    schoolYear,
    selectedGrade,
    selectedSection,
    daysOffQuery.data ?? []
  );

  const copySchedules = useCopySchedulesMutation(
    schoolYear,
    selectedGrade,
    selectedSection
  );

  const clearSectionDates = useClearSectionDatesMutation(
    schoolYear,
    selectedGrade,
    selectedSection
  );

  // ===== DERIVED DATA =====

  // Memoize to avoid creating new arrays on every render
  const lessons = useMemo(() => lessonsQuery.data ?? [], [lessonsQuery.data]);
  const savedSchedules = useMemo(() => schedulesQuery.data ?? [], [schedulesQuery.data]);

  // Build unit schedules from lessons and merge with saved schedules
  const unitSchedules = useMemo(() => {
    // Use composite key (grade-unitNumber) to handle Algebra 1 which combines 8th grade prerequisites + Algebra 1 curriculum
    const groups = new Map<string, { grade: string; unitNumber: number; unitName: string; sections: Map<string, number> }>();

    for (const lesson of lessons) {
      if (!lesson.unitNumber) continue;

      const unitKey = `${lesson.grade}-${lesson.unitNumber}`;

      if (!groups.has(unitKey)) {
        groups.set(unitKey, {
          grade: lesson.grade,
          unitNumber: lesson.unitNumber,
          unitName: lesson.unit || `Unit ${lesson.unitNumber}`,
          sections: new Map(),
        });
      }
      const group = groups.get(unitKey)!;
      const sectionId = lesson.section || "Unknown";
      const currentCount = group.sections.get(sectionId) || 0;
      group.sections.set(sectionId, currentCount + 1);
    }

    // Sort: 8th grade prerequisites first (by unit number), then Algebra 1 (by unit number)
    const schedules: UnitScheduleLocal[] = Array.from(groups.entries())
      .sort(([, a], [, b]) => {
        // If one is grade 8 and other is Algebra 1, grade 8 comes first
        if (a.grade === "8" && b.grade === "Algebra 1") return -1;
        if (a.grade === "Algebra 1" && b.grade === "8") return 1;
        // Otherwise sort by unit number
        return a.unitNumber - b.unitNumber;
      })
      .map(([unitKey, data]) => {
        // Find saved schedule matching grade and unitNumber
        const saved = savedSchedules.find(
          (s) => s.grade === data.grade && s.unitNumber === data.unitNumber
        );

        // Get counts from scope-and-sequence data
        const rampUpCount = data.sections.get("Ramp Ups") || 0;
        const unitAssessmentCount = data.sections.get("Unit Assessment") || 0;

        // Build sections: Ramp Up first (if exists), then curriculum sections (A, B, C...), then Unit Test (if exists)
        // Filter out "Ramp Ups" and "Unit Assessment" since they're handled separately
        const curriculumSections = Array.from(data.sections.entries())
          .filter(([sectionId]) => sectionId !== "Ramp Ups" && sectionId !== "Unit Assessment")
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([sectionId, lessonCount]) => {
            const savedSection = saved?.sections?.find((s) => s.sectionId === sectionId);
            return {
              sectionId,
              name: `Section ${sectionId}`,
              startDate: savedSection?.startDate || "",
              endDate: savedSection?.endDate || "",
              lessonCount,
            };
          });

        // Build final sections array - only include Ramp Up and Unit Test if they exist in scope-and-sequence
        const finalSections: SectionSchedule[] = [];

        // Add Ramp Up at the beginning only if it exists in scope-and-sequence
        if (rampUpCount > 0) {
          const rampUpSaved = saved?.sections?.find((s) => s.sectionId === "Ramp Up");
          finalSections.push({
            sectionId: "Ramp Up",
            name: "Ramp Up",
            startDate: rampUpSaved?.startDate || "",
            endDate: rampUpSaved?.endDate || "",
            lessonCount: rampUpCount,
          });
        }

        // Add curriculum sections (A, B, C, etc.)
        finalSections.push(...curriculumSections);

        // Add Unit Test at the end only if it exists in scope-and-sequence
        if (unitAssessmentCount > 0) {
          const unitTestSaved = saved?.sections?.find((s) => s.sectionId === "Unit Test");
          finalSections.push({
            sectionId: "Unit Test",
            name: "Unit Test",
            startDate: unitTestSaved?.startDate || "",
            endDate: unitTestSaved?.endDate || "",
            lessonCount: unitAssessmentCount,
          });
        }

        return {
          unitKey,
          grade: data.grade,
          unitNumber: data.unitNumber,
          unitName: data.unitName,
          startDate: saved?.startDate || "",
          endDate: saved?.endDate || "",
          sections: finalSections,
        };
      });

    return schedules;
  }, [lessons, savedSchedules]);

  // ===== LOADING STATES =====

  const isInitialLoading = calendarQuery.isLoading || daysOffQuery.isLoading;
  const isLoadingGradeData = lessonsQuery.isLoading;
  const isLoadingSchedules = schedulesQuery.isLoading;

  const isMutating =
    updateSectionDates.isPending ||
    updateUnitDates.isPending ||
    addDayOff.isPending ||
    deleteDayOff.isPending ||
    copySchedules.isPending ||
    clearSectionDates.isPending;

  // ===== RETURN =====

  return {
    // Data
    calendar: calendarQuery.data,
    lessons,
    daysOff: daysOffQuery.data ?? [],
    savedSchedules,
    sectionConfigs: sectionConfigsQuery.data ?? [],
    sectionDaysOff: sectionDaysOffQuery.data ?? [],

    // Derived data
    unitSchedules,

    // Loading states
    isInitialLoading,
    isLoadingGradeData,
    isLoadingSchedules,

    // Mutations
    updateSectionDates,
    updateUnitDates,
    addDayOff,
    deleteDayOff,
    copySchedules,
    clearSectionDates,

    // Utility
    isMutating,
  };
}

// Re-export types for convenience
export type { ScopeAndSequenceLesson, SavedUnitSchedule, SectionDayOffEvent };
