"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchSchoolCalendar,
  getDaysOff,
  getSectionDaysOff,
} from "@/app/actions/calendar/school-calendar";
import { fetchScopeAndSequenceByGrade } from "@/app/actions/scm/scope-and-sequence";
import { getAllSectionConfigs } from "@/app/actions/scm/section-overview";
import {
  fetchUnitSchedules,
  fetchSectionUnitSchedules,
} from "@/app/actions/calendar/unit-schedule";
import type { SectionConfigOption } from "../components/types";

// =====================================
// TYPES
// =====================================

export interface ScopeAndSequenceLesson {
  _id: unknown;
  grade: string;
  unit: string;
  unitLessonId: string;
  unitNumber: number;
  lessonNumber: number;
  lessonName: string;
  section: string;
}

export interface SavedUnitSchedule {
  _id: string;
  schoolYear: string;
  grade: string;
  unitNumber: number;
  unitName: string;
  startDate?: string;
  endDate?: string;
  sections: Array<{
    sectionId: string;
    name: string;
    startDate?: string;
    endDate?: string;
  }>;
  // Section-specific fields (when fetching section schedules)
  school?: string;
  classSection?: string;
  scopeSequenceTag?: string;
}

export interface SectionDayOffEvent {
  date: string;
  name: string;
  description?: string;
  school?: string;
  classSection?: string;
  hasMathClass?: boolean;
}

// =====================================
// QUERY KEYS
// =====================================

export const calendarKeys = {
  all: ["calendar"] as const,

  // School calendar
  schoolCalendar: (schoolYear: string) =>
    [...calendarKeys.all, "school-calendar", schoolYear] as const,

  // Global days off
  daysOff: (schoolYear: string) =>
    [...calendarKeys.all, "days-off", schoolYear] as const,

  // Lessons (scope & sequence)
  lessons: (grade: string) =>
    [...calendarKeys.all, "lessons", grade] as const,

  // Grade-level schedules
  gradeSchedules: (schoolYear: string, grade: string) =>
    [...calendarKeys.all, "grade-schedules", schoolYear, grade] as const,

  // Section-specific schedules
  sectionSchedules: (
    schoolYear: string,
    scopeTag: string,
    school: string,
    classSection: string
  ) =>
    [...calendarKeys.all, "section-schedules", schoolYear, scopeTag, school, classSection] as const,

  // Section days off
  sectionDaysOff: (schoolYear: string, school: string, classSection: string) =>
    [...calendarKeys.all, "section-days-off", schoolYear, school, classSection] as const,

  // Section configs
  sectionConfigs: () =>
    [...calendarKeys.all, "section-configs"] as const,
};

// =====================================
// QUERY HOOKS
// =====================================

/**
 * Fetch school calendar for a given year
 */
export function useSchoolCalendarQuery(schoolYear: string) {
  return useQuery({
    queryKey: calendarKeys.schoolCalendar(schoolYear),
    queryFn: async () => {
      const result = await fetchSchoolCalendar(schoolYear);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch school calendar");
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch global days off for a given year
 */
export function useDaysOffQuery(schoolYear: string) {
  return useQuery({
    queryKey: calendarKeys.daysOff(schoolYear),
    queryFn: async () => {
      const result = await getDaysOff(schoolYear);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch days off");
      }
      return result.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch lessons (scope & sequence) for a grade
 */
export function useLessonsQuery(grade: string) {
  return useQuery({
    queryKey: calendarKeys.lessons(grade),
    queryFn: async () => {
      const result = await fetchScopeAndSequenceByGrade(grade);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch lessons");
      }
      return (result.data ?? []) as unknown as ScopeAndSequenceLesson[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - lessons don't change often
    enabled: !!grade,
  });
}

/**
 * Fetch all section configs
 */
export function useSectionConfigsQuery() {
  return useQuery({
    queryKey: calendarKeys.sectionConfigs(),
    queryFn: async () => {
      const result = await getAllSectionConfigs();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch section configs");
      }
      // Flatten the grouped data
      const flattened: SectionConfigOption[] = [];
      for (const group of result.data ?? []) {
        for (const section of group.sections) {
          flattened.push({
            ...section,
            school: group.school,
          });
        }
      }
      return flattened;
    },
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch schedules - either grade-level or section-specific depending on selection
 */
export function useSchedulesQuery(
  schoolYear: string,
  selectedGrade: string,
  selectedSection: SectionConfigOption | null
) {
  const scopeTag = selectedSection?.scopeSequenceTag ||
    (selectedGrade === "Algebra 1" ? "Algebra 1" : `Grade ${selectedGrade}`);

  return useQuery({
    queryKey: selectedSection
      ? calendarKeys.sectionSchedules(
          schoolYear,
          scopeTag,
          selectedSection.school,
          selectedSection.classSection
        )
      : calendarKeys.gradeSchedules(schoolYear, selectedGrade),
    queryFn: async () => {
      if (selectedSection) {
        // Fetch section-specific schedules
        const result = await fetchSectionUnitSchedules(
          schoolYear,
          scopeTag,
          selectedSection.school,
          selectedSection.classSection
        );
        if (!result.success) {
          throw new Error(result.error || "Failed to fetch section schedules");
        }
        return (result.data ?? []) as unknown as SavedUnitSchedule[];
      } else {
        // Fetch grade-level schedules
        if (selectedGrade === "Algebra 1") {
          // For Algebra 1, fetch both Grade 8 prereqs and Algebra 1 curriculum
          const [grade8Result, alg1Result] = await Promise.all([
            fetchUnitSchedules(schoolYear, "8"),
            fetchUnitSchedules(schoolYear, "Algebra 1"),
          ]);
          const combined: SavedUnitSchedule[] = [];
          if (grade8Result.success && grade8Result.data) {
            combined.push(...(grade8Result.data as unknown as SavedUnitSchedule[]));
          }
          if (alg1Result.success && alg1Result.data) {
            combined.push(...(alg1Result.data as unknown as SavedUnitSchedule[]));
          }
          return combined;
        } else {
          const result = await fetchUnitSchedules(schoolYear, selectedGrade);
          if (!result.success) {
            throw new Error(result.error || "Failed to fetch grade schedules");
          }
          return (result.data ?? []) as unknown as SavedUnitSchedule[];
        }
      }
    },
    staleTime: 30 * 1000, // 30 seconds - schedules change more frequently
    enabled: !!selectedGrade,
  });
}

/**
 * Fetch section-specific days off
 */
export function useSectionDaysOffQuery(
  schoolYear: string,
  school: string | undefined,
  classSection: string | undefined
) {
  return useQuery({
    queryKey: calendarKeys.sectionDaysOff(schoolYear, school ?? "", classSection ?? ""),
    queryFn: async () => {
      if (!school || !classSection) {
        return [];
      }
      const result = await getSectionDaysOff(schoolYear, school, classSection);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch section days off");
      }
      return (result.data ?? []) as SectionDayOffEvent[];
    },
    staleTime: 30 * 1000,
    enabled: !!school && !!classSection,
  });
}
