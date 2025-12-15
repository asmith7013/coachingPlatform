"use client";

import { useMemo } from "react";
import {
  useSchoolCalendarQuery,
  useDaysOffQuery,
  useLessonsQuery,
  useSectionConfigsQuery,
  useSchedulesQuery,
  useSectionDaysOffQuery,
  useAssignmentContentQuery,
  type ScopeAndSequenceLesson,
  type SavedUnitSchedule,
  type SectionDayOffEvent,
  type AssignmentContentItem,
} from "./queries";
import {
  useUpdateSectionDatesMutation,
  useUpdateUnitDatesMutation,
  useAddDayOffMutation,
  useDeleteDayOffMutation,
  useCopySchedulesMutation,
  useClearSectionDatesMutation,
  useUpdateSubsectionsMutation,
} from "./mutations";
import type { SectionConfigOption, UnitScheduleLocal, SectionSchedule, LessonForSubsection } from "../components/types";

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
  assignmentContent: AssignmentContentItem[];

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
  updateSubsections: ReturnType<typeof useUpdateSubsectionsMutation>;

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
  const assignmentContentQuery = useAssignmentContentQuery(
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

  const updateSubsections = useUpdateSubsectionsMutation(selectedSection);

  // ===== DERIVED DATA =====

  // Memoize to avoid creating new arrays on every render
  const lessons = useMemo(() => lessonsQuery.data ?? [], [lessonsQuery.data]);
  const savedSchedules = useMemo(() => schedulesQuery.data ?? [], [schedulesQuery.data]);
  const assignmentContent = useMemo(() => assignmentContentQuery.data ?? [], [assignmentContentQuery.data]);

  // Build a map from scopeAndSequenceId to subsection for quick lookup
  const subsectionMap = useMemo(() => {
    const map = new Map<string, number | undefined>();
    for (const content of assignmentContent) {
      if (content.scopeAndSequenceId) {
        map.set(content.scopeAndSequenceId, content.subsection);
      }
    }
    return map;
  }, [assignmentContent]);

  // Build unit schedules from lessons and merge with saved schedules
  const unitSchedules = useMemo(() => {
    // Use composite key (grade-unitNumber) to handle Algebra 1 which combines 8th grade prerequisites + Algebra 1 curriculum
    // Now also track individual lessons per section
    interface SectionData {
      count: number;
      lessons: Array<{
        scopeAndSequenceId: string;
        unitLessonId: string;
        lessonName: string;
        lessonNumber: number;
      }>;
    }
    const groups = new Map<string, { grade: string; unitNumber: number; unitName: string; sections: Map<string, SectionData> }>();

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

      if (!group.sections.has(sectionId)) {
        group.sections.set(sectionId, { count: 0, lessons: [] });
      }
      const sectionData = group.sections.get(sectionId)!;
      sectionData.count += 1;
      sectionData.lessons.push({
        scopeAndSequenceId: String(lesson._id),
        unitLessonId: lesson.unitLessonId,
        lessonName: lesson.lessonName,
        lessonNumber: lesson.lessonNumber,
      });
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

        // Get data from scope-and-sequence
        const rampUpData = data.sections.get("Ramp Ups");
        const unitAssessmentData = data.sections.get("Unit Assessment");

        // Helper to build lessons array with subsection data
        const buildLessons = (sectionData: SectionData | undefined): LessonForSubsection[] => {
          if (!sectionData) return [];
          return sectionData.lessons
            .sort((a, b) => a.lessonNumber - b.lessonNumber)
            .map((l) => ({
              ...l,
              subsection: subsectionMap.get(l.scopeAndSequenceId),
            }));
        };

        // Build sections: Ramp Up first (if exists), then curriculum sections (A, B, C...), then Unit Test (if exists)
        // Filter out "Ramp Ups" and "Unit Assessment" since they're handled separately
        const curriculumSections = Array.from(data.sections.entries())
          .filter(([sectionId]) => sectionId !== "Ramp Ups" && sectionId !== "Unit Assessment")
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([sectionId, sectionData]) => {
            const savedSection = saved?.sections?.find((s) => s.sectionId === sectionId);
            return {
              sectionId,
              name: `Section ${sectionId}`,
              startDate: savedSection?.startDate || "",
              endDate: savedSection?.endDate || "",
              lessonCount: sectionData.count,
              lessons: buildLessons(sectionData),
            };
          });

        // Build final sections array - only include Ramp Up and Unit Test if they exist in scope-and-sequence
        const finalSections: SectionSchedule[] = [];

        // Add Ramp Up at the beginning only if it exists in scope-and-sequence
        if (rampUpData && rampUpData.count > 0) {
          const rampUpSaved = saved?.sections?.find((s) => s.sectionId === "Ramp Up");
          finalSections.push({
            sectionId: "Ramp Up",
            name: "Ramp Up",
            startDate: rampUpSaved?.startDate || "",
            endDate: rampUpSaved?.endDate || "",
            lessonCount: rampUpData.count,
            lessons: buildLessons(rampUpData),
          });
        }

        // Add curriculum sections (A, B, C, etc.)
        finalSections.push(...curriculumSections);

        // Add Unit Test at the end only if it exists in scope-and-sequence
        if (unitAssessmentData && unitAssessmentData.count > 0) {
          const unitTestSaved = saved?.sections?.find((s) => s.sectionId === "Unit Test");
          finalSections.push({
            sectionId: "Unit Test",
            name: "Unit Test",
            startDate: unitTestSaved?.startDate || "",
            endDate: unitTestSaved?.endDate || "",
            lessonCount: unitAssessmentData.count,
            lessons: buildLessons(unitAssessmentData),
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
  }, [lessons, savedSchedules, subsectionMap]);

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
    clearSectionDates.isPending ||
    updateSubsections.isPending;

  // ===== RETURN =====

  return {
    // Data
    calendar: calendarQuery.data,
    lessons,
    daysOff: daysOffQuery.data ?? [],
    savedSchedules,
    sectionConfigs: sectionConfigsQuery.data ?? [],
    sectionDaysOff: sectionDaysOffQuery.data ?? [],
    assignmentContent,

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
    updateSubsections,

    // Utility
    isMutating,
  };
}

// Re-export types for convenience
export type { ScopeAndSequenceLesson, SavedUnitSchedule, SectionDayOffEvent };
