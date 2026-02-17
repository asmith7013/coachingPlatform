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
import type {
  SectionConfigOption,
  UnitScheduleLocal,
  SectionSchedule,
  LessonForSubsection,
} from "../components/types";

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
  selectedSection: SectionConfigOption | null,
): UseCalendarPageDataResult {
  // ===== QUERIES =====

  const calendarQuery = useSchoolCalendarQuery(schoolYear);
  const daysOffQuery = useDaysOffQuery(schoolYear);
  const lessonsQuery = useLessonsQuery(selectedGrade);
  const sectionConfigsQuery = useSectionConfigsQuery();
  const schedulesQuery = useSchedulesQuery(
    schoolYear,
    selectedGrade,
    selectedSection,
  );
  const sectionDaysOffQuery = useSectionDaysOffQuery(
    schoolYear,
    selectedSection?.school,
    selectedSection?.classSection,
  );
  const assignmentContentQuery = useAssignmentContentQuery(
    selectedSection?.school,
    selectedSection?.classSection,
  );

  // ===== MUTATIONS =====

  const updateSectionDates = useUpdateSectionDatesMutation(
    schoolYear,
    selectedGrade,
    selectedSection,
  );

  const updateUnitDates = useUpdateUnitDatesMutation(
    schoolYear,
    selectedGrade,
    selectedSection,
  );

  const addDayOff = useAddDayOffMutation(
    schoolYear,
    selectedGrade,
    selectedSection,
    daysOffQuery.data ?? [],
  );

  const deleteDayOff = useDeleteDayOffMutation(
    schoolYear,
    selectedGrade,
    selectedSection,
    daysOffQuery.data ?? [],
  );

  const copySchedules = useCopySchedulesMutation(
    schoolYear,
    selectedGrade,
    selectedSection,
  );

  const clearSectionDates = useClearSectionDatesMutation(
    schoolYear,
    selectedGrade,
    selectedSection,
  );

  const updateSubsections = useUpdateSubsectionsMutation(selectedSection);

  // ===== DERIVED DATA =====

  // Memoize to avoid creating new arrays on every render
  const lessons = useMemo(() => lessonsQuery.data ?? [], [lessonsQuery.data]);
  const savedSchedules = useMemo(
    () => schedulesQuery.data ?? [],
    [schedulesQuery.data],
  );
  const assignmentContent = useMemo(
    () => assignmentContentQuery.data ?? [],
    [assignmentContentQuery.data],
  );

  // Build a map from scopeAndSequenceId to subsection for quick lookup
  const subsectionMap = useMemo(() => {
    const map = new Map<string, number | undefined>();
    for (const content of assignmentContent) {
      if (content.scopeAndSequenceId) {
        map.set(content.scopeAndSequenceId, content.subsection);
      }
    }
    // Debug: log subsection assignments
    const withSubsection = Array.from(map.entries()).filter(
      ([, sub]) => sub !== undefined,
    );
    if (withSubsection.length > 0) {
      console.log(
        "[useCalendarPageData] Lessons with subsections:",
        withSubsection.length,
      );
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
    const groups = new Map<
      string,
      {
        grade: string;
        unitNumber: number;
        unitName: string;
        sections: Map<string, SectionData>;
      }
    >();

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
          (s) => s.grade === data.grade && s.unitNumber === data.unitNumber,
        );

        // Get data from scope-and-sequence
        const rampUpData = data.sections.get("Ramp Ups");
        const unitAssessmentData = data.sections.get("Unit Assessment");

        // Helper to build lessons array with subsection data
        const buildLessons = (
          sectionData: SectionData | undefined,
        ): LessonForSubsection[] => {
          if (!sectionData) return [];
          return sectionData.lessons
            .sort((a, b) => a.lessonNumber - b.lessonNumber)
            .map((l) => ({
              ...l,
              subsection: subsectionMap.get(l.scopeAndSequenceId),
            }));
        };

        // Helper to build section rows, splitting by subsection if lessons have subsections assigned
        const buildSectionRows = (
          sectionId: string,
          baseName: string,
          sectionData: SectionData | undefined,
        ): SectionSchedule[] => {
          if (!sectionData) return [];

          const lessonsWithSubsection = buildLessons(sectionData);

          // Check if any lessons have subsections assigned
          const hasSubsections = lessonsWithSubsection.some(
            (l) => l.subsection !== undefined,
          );

          if (!hasSubsections) {
            // No subsections - return single row as before
            const savedSection = saved?.sections?.find(
              (s) => s.sectionId === sectionId && s.subsection === undefined,
            );
            return [
              {
                sectionId,
                name: baseName,
                startDate: savedSection?.startDate || "",
                endDate: savedSection?.endDate || "",
                lessonCount: lessonsWithSubsection.length,
                lessons: lessonsWithSubsection,
              },
            ];
          }

          // Group lessons by subsection
          const groups = new Map<number | undefined, LessonForSubsection[]>();
          for (const lesson of lessonsWithSubsection) {
            const key = lesson.subsection;
            if (!groups.has(key)) {
              groups.set(key, []);
            }
            groups.get(key)!.push(lesson);
          }

          // Build rows for each subsection group
          const rows: SectionSchedule[] = [];

          // Sort subsection keys: undefined first, then 1, 2, 3...
          const sortedKeys = Array.from(groups.keys()).sort((a, b) => {
            if (a === undefined) return -1;
            if (b === undefined) return 1;
            return a - b;
          });

          for (const subsectionKey of sortedKeys) {
            const groupLessons = groups.get(subsectionKey)!;
            const savedSection = saved?.sections?.find(
              (s) =>
                s.sectionId === sectionId && s.subsection === subsectionKey,
            );

            // Build name: "Section A (Part 1)" or just "Section A" for unassigned
            const rowName =
              subsectionKey !== undefined
                ? `${baseName} (Part ${subsectionKey})`
                : `${baseName} (Unassigned)`;

            rows.push({
              sectionId,
              subsection: subsectionKey,
              name: rowName,
              startDate: savedSection?.startDate || "",
              endDate: savedSection?.endDate || "",
              lessonCount: groupLessons.length,
              lessons: groupLessons,
            });
          }

          return rows;
        };

        // Build final sections array - only include Ramp Up and Unit Test if they exist in scope-and-sequence
        const finalSections: SectionSchedule[] = [];

        // Add Ramp Up at the beginning only if it exists in scope-and-sequence
        if (rampUpData && rampUpData.count > 0) {
          finalSections.push(
            ...buildSectionRows("Ramp Up", "Ramp Up", rampUpData),
          );
        }

        // Add curriculum sections (A, B, C, etc.) - now split by subsection if needed
        const curriculumSectionIds = Array.from(data.sections.entries())
          .filter(
            ([sectionId]) =>
              sectionId !== "Ramp Ups" && sectionId !== "Unit Assessment",
          )
          .sort(([a], [b]) => a.localeCompare(b));

        for (const [sectionId, sectionData] of curriculumSectionIds) {
          finalSections.push(
            ...buildSectionRows(sectionId, `Section ${sectionId}`, sectionData),
          );
        }

        // Add Unit Test at the end only if it exists in scope-and-sequence
        if (unitAssessmentData && unitAssessmentData.count > 0) {
          finalSections.push(
            ...buildSectionRows("Unit Test", "Unit Test", unitAssessmentData),
          );
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
