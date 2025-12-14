"use client";

import { useState, useEffect, useCallback } from "react";
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
import type { SchoolCalendar } from "@zod-schema/calendar";
import type { SectionConfigOption } from "../components/types";

// localStorage key for persisting user selections
const CALENDAR_STORAGE_KEY = "roadmaps-calendar-selection";

interface CalendarStorageData {
  grade: string;
  sectionKey: string | null; // "school|classSection" format
}

interface ScopeAndSequenceLesson {
  _id: unknown;
  grade: string;
  unit: string;
  unitLessonId: string;
  unitNumber: number;
  lessonNumber: number;
  lessonName: string;
  section: string;
}

interface SavedUnitSchedule {
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
}

interface UseCalendarDataOptions {
  schoolYear: string;
  selectedGrade: string;
  selectedSection: SectionConfigOption | null;
}

// Type for section day off events
interface SectionDayOffEvent {
  date: string;
  name: string;
  description?: string;
  school?: string;
  classSection?: string;
  hasMathClass?: boolean;
}

interface UseCalendarDataResult {
  // Data
  calendar: SchoolCalendar | null;
  lessons: ScopeAndSequenceLesson[];
  daysOff: string[];
  savedSchedules: SavedUnitSchedule[];
  allSectionConfigs: SectionConfigOption[];
  sectionDaysOff: SectionDayOffEvent[];

  // Loading states
  initialLoading: boolean;
  loadingGradeData: boolean;
  loadingSchedules: boolean;

  // State for pending section restore
  pendingSectionKey: string | null;

  // Setters (for mutations that happen in the main component)
  setSavedSchedules: React.Dispatch<React.SetStateAction<SavedUnitSchedule[]>>;
  setSectionDaysOff: React.Dispatch<React.SetStateAction<SectionDayOffEvent[]>>;
  setLoadingSchedules: React.Dispatch<React.SetStateAction<boolean>>;

  // Actions
  reloadGradeLevelSchedules: () => Promise<void>;
}

export function useCalendarData({
  schoolYear,
  selectedGrade,
  selectedSection,
}: UseCalendarDataOptions): UseCalendarDataResult {
  const [calendar, setCalendar] = useState<SchoolCalendar | null>(null);
  const [lessons, setLessons] = useState<ScopeAndSequenceLesson[]>([]);
  const [daysOff, setDaysOff] = useState<string[]>([]);
  const [savedSchedules, setSavedSchedules] = useState<SavedUnitSchedule[]>([]);
  const [allSectionConfigs, setAllSectionConfigs] = useState<SectionConfigOption[]>([]);
  const [sectionDaysOff, setSectionDaysOff] = useState<SectionDayOffEvent[]>([]);

  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingGradeData, setLoadingGradeData] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [pendingSectionKey, setPendingSectionKey] = useState<string | null>(null);

  // Load saved selection from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CALENDAR_STORAGE_KEY);
      if (saved) {
        const data: CalendarStorageData = JSON.parse(saved);
        if (data.sectionKey) {
          setPendingSectionKey(data.sectionKey);
        }
      }
    } catch (error) {
      console.error("Error loading saved calendar selection:", error);
    }
  }, []);

  // Load section configs once on mount
  useEffect(() => {
    const loadSectionConfigs = async () => {
      const result = await getAllSectionConfigs();
      if (result.success && result.data) {
        const flattened: SectionConfigOption[] = [];
        for (const group of result.data) {
          for (const section of group.sections) {
            flattened.push({
              ...section,
              school: group.school,
            });
          }
        }
        setAllSectionConfigs(flattened);
      }
    };
    loadSectionConfigs();
  }, []);

  // Load calendar and days off once on mount
  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      try {
        const [calendarResult, daysOffResult] = await Promise.all([
          fetchSchoolCalendar(schoolYear),
          getDaysOff(schoolYear),
        ]);

        if (calendarResult.success && calendarResult.data) {
          setCalendar(calendarResult.data);
        }
        if (daysOffResult.success && daysOffResult.data) {
          setDaysOff(daysOffResult.data);
        }
      } catch (error) {
        console.error("Error loading initial calendar data:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();
  }, [schoolYear]);

  // Load lessons and schedules when grade changes
  useEffect(() => {
    const loadGradeData = async () => {
      setLoadingGradeData(true);
      try {
        const scheduleFetches = selectedGrade === 'Algebra 1'
          ? Promise.all([
              fetchUnitSchedules(schoolYear, '8'),
              fetchUnitSchedules(schoolYear, 'Algebra 1'),
            ]).then(([grade8Result, alg1Result]) => {
              const combined: SavedUnitSchedule[] = [];
              if (grade8Result.success && grade8Result.data) {
                combined.push(...(grade8Result.data as unknown as SavedUnitSchedule[]));
              }
              if (alg1Result.success && alg1Result.data) {
                combined.push(...(alg1Result.data as unknown as SavedUnitSchedule[]));
              }
              return { success: true, data: combined };
            })
          : fetchUnitSchedules(schoolYear, selectedGrade).then(result => ({
              success: result.success,
              data: result.success ? result.data as unknown as SavedUnitSchedule[] : undefined
            }));

        const [lessonsResult, schedulesResult] = await Promise.all([
          fetchScopeAndSequenceByGrade(selectedGrade),
          scheduleFetches,
        ]);

        if (lessonsResult.success && lessonsResult.data) {
          setLessons(lessonsResult.data as unknown as ScopeAndSequenceLesson[]);
        }
        if (schedulesResult.success && schedulesResult.data) {
          setSavedSchedules(schedulesResult.data);
        } else {
          setSavedSchedules([]);
        }
      } catch (error) {
        console.error("Error loading grade data:", error);
      } finally {
        setLoadingGradeData(false);
      }
    };

    loadGradeData();
  }, [schoolYear, selectedGrade]);

  // Load section-specific schedules when section changes
  useEffect(() => {
    if (!selectedSection) return;

    const loadSectionSchedules = async () => {
      setLoadingSchedules(true);
      try {
        const scopeTag = selectedSection.scopeSequenceTag || (selectedGrade === 'Algebra 1' ? 'Algebra 1' : `Grade ${selectedGrade}`);
        const result = await fetchSectionUnitSchedules(
          schoolYear,
          scopeTag,
          selectedSection.school,
          selectedSection.classSection
        );
        if (result.success && result.data) {
          setSavedSchedules(result.data as unknown as SavedUnitSchedule[]);
        } else {
          setSavedSchedules([]);
        }
      } catch (error) {
        console.error("Error loading section schedules:", error);
      } finally {
        setLoadingSchedules(false);
      }
    };

    loadSectionSchedules();
  }, [selectedSection, schoolYear, selectedGrade]);

  // Load section-specific days off when section changes
  useEffect(() => {
    if (!selectedSection) {
      setSectionDaysOff([]);
      return;
    }

    const loadSectionDaysOff = async () => {
      try {
        const result = await getSectionDaysOff(
          schoolYear,
          selectedSection.school,
          selectedSection.classSection
        );
        if (result.success && result.data) {
          setSectionDaysOff(result.data);
        } else {
          setSectionDaysOff([]);
        }
      } catch (error) {
        console.error("Error loading section days off:", error);
        setSectionDaysOff([]);
      }
    };

    loadSectionDaysOff();
  }, [selectedSection, schoolYear]);

  // Reload grade-level schedules (used when clearing section selection)
  const reloadGradeLevelSchedules = useCallback(async () => {
    setLoadingSchedules(true);
    try {
      const result = selectedGrade === 'Algebra 1'
        ? await Promise.all([
            fetchUnitSchedules(schoolYear, '8'),
            fetchUnitSchedules(schoolYear, 'Algebra 1'),
          ]).then(([grade8Result, alg1Result]) => {
            const combined: SavedUnitSchedule[] = [];
            if (grade8Result.success && grade8Result.data) {
              combined.push(...(grade8Result.data as unknown as SavedUnitSchedule[]));
            }
            if (alg1Result.success && alg1Result.data) {
              combined.push(...(alg1Result.data as unknown as SavedUnitSchedule[]));
            }
            return { success: true, data: combined };
          })
        : await fetchUnitSchedules(schoolYear, selectedGrade).then(result => ({
            success: result.success,
            data: result.success ? result.data as unknown as SavedUnitSchedule[] : undefined
          }));
      if (result.success && result.data) {
        setSavedSchedules(result.data);
      } else {
        setSavedSchedules([]);
      }
    } finally {
      setLoadingSchedules(false);
    }
  }, [selectedGrade, schoolYear]);

  return {
    calendar,
    lessons,
    daysOff,
    savedSchedules,
    allSectionConfigs,
    sectionDaysOff,
    initialLoading,
    loadingGradeData,
    loadingSchedules,
    pendingSectionKey,
    setSavedSchedules,
    setSectionDaysOff,
    setLoadingSchedules,
    reloadGradeLevelSchedules,
  };
}

// Export types for use in other components
export type { ScopeAndSequenceLesson, SavedUnitSchedule, CalendarStorageData, SectionDayOffEvent };
export { CALENDAR_STORAGE_KEY };
