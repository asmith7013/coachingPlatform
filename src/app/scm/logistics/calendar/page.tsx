"use client";

import React, { useState, useEffect, useCallback } from "react";
import { fetchSchoolCalendar, getDaysOff } from "@/app/actions/calendar/school-calendar";
import { fetchScopeAndSequenceByGrade } from "@/app/actions/313/scope-and-sequence";
import { getAllSectionConfigs } from "@/app/actions/313/section-overview";
import {
  fetchUnitSchedules,
  upsertUnitSchedule,
  updateSectionDates,
  updateUnitDates,
  fetchSectionUnitSchedules,
  upsertSectionUnitSchedule,
  updateSectionUnitDates,
  updateSectionUnitLevelDates,
  copySectionUnitSchedules,
} from "@/app/actions/calendar/unit-schedule";
import type { SchoolCalendar, CalendarEvent } from "@zod-schema/calendar";
import { ChevronLeftIcon, ChevronRightIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { Spinner } from "@/components/core/feedback/Spinner";

// Default school year
const DEFAULT_SCHOOL_YEAR = "2025-2026";

// Grade options
const GRADE_OPTIONS = [
  { value: "6", label: "Grade 6" },
  { value: "7", label: "Grade 7" },
  { value: "8", label: "Grade 8" },
  { value: "Algebra 1", label: "Algebra 1" },
];

// Color palette for units - each has base, light (100), medium (500), dark (900) for section rotation
// Sections rotate: A=light, B=medium, C=dark, D=light, E=medium, F=dark...
const UNIT_COLORS = [
  { base: "#2563EB", light: "#DBEAFE", medium: "#3B82F6", dark: "#1E3A8A" }, // blue (100, 500, 900)
  { base: "#059669", light: "#D1FAE5", medium: "#10B981", dark: "#064E3B" }, // green (100, 500, 900)
  { base: "#D97706", light: "#FEF3C7", medium: "#F59E0B", dark: "#78350F" }, // amber (100, 500, 900)
  { base: "#0D9488", light: "#CCFBF1", medium: "#14B8A6", dark: "#134E4A" }, // teal (100, 500, 900)
  { base: "#7C3AED", light: "#EDE9FE", medium: "#8B5CF6", dark: "#4C1D95" }, // purple (100, 500, 900)
  { base: "#DB2777", light: "#FCE7F3", medium: "#EC4899", dark: "#831843" }, // pink (100, 500, 900)
  { base: "#0891B2", light: "#CFFAFE", medium: "#06B6D4", dark: "#164E63" }, // cyan (100, 500, 900)
  { base: "#EA580C", light: "#FFEDD5", medium: "#F97316", dark: "#7C2D12" }, // orange (100, 500, 900)
];

// Get shade for a section based on its index (0=light, 1=medium, 2=dark, 3=light, ...)
const getSectionShade = (sectionIndex: number): "light" | "medium" | "dark" => {
  const shadeIndex = sectionIndex % 3;
  return shadeIndex === 0 ? "light" : shadeIndex === 1 ? "medium" : "dark";
};


// Get display label for section badge (Ramp Up -> R, Unit Test -> T, otherwise use sectionId)
const getSectionBadgeLabel = (sectionId: string): string => {
  if (sectionId === "Ramp Up") return "R";
  if (sectionId === "Unit Test") return "T";
  return sectionId;
};

// Render a badge with rounded square shape (positioned on left edge of cell)
const SectionBadge = ({ label, color }: { label: string; color: string }) => {
  return (
    <span
      className="absolute left-0 top-1/2 -translate-y-1/2 text-[7px] font-bold leading-none px-1 pr-1.5 py-0.5 rounded-r"
      style={{ backgroundColor: "white", color: color }}
    >
      {label}
    </span>
  );
};

// Types
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

interface SectionSchedule {
  sectionId: string;
  name: string;
  startDate: string;
  endDate: string;
  lessonCount: number;
}

interface UnitScheduleLocal {
  unitKey: string; // Composite key: "grade-unitNumber" for uniqueness
  grade: string;
  unitNumber: number;
  unitName: string;
  startDate: string;
  endDate: string;
  sections: SectionSchedule[];
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

// Selection mode for interactive date picking
type SelectionMode = {
  type: "start" | "end";
  unitKey: string;
  sectionId: string;
} | null;

// Section config type from API
interface SectionConfigOption {
  id: string;
  classSection: string;
  teacher?: string;
  gradeLevel: string;
  scopeSequenceTag?: string;
  school: string;
}

// localStorage key for persisting user selections
const CALENDAR_STORAGE_KEY = "roadmaps-calendar-selection";

interface CalendarStorageData {
  grade: string;
  sectionKey: string | null; // "school|classSection" format
}

export default function CalendarPage() {
  const [schoolYear] = useState(DEFAULT_SCHOOL_YEAR);
  const [selectedGrade, setSelectedGrade] = useState("6");
  const [calendar, setCalendar] = useState<SchoolCalendar | null>(null);
  const [lessons, setLessons] = useState<ScopeAndSequenceLesson[]>([]);
  const [daysOff, setDaysOff] = useState<string[]>([]);
  const [savedSchedules, setSavedSchedules] = useState<SavedUnitSchedule[]>([]);
  const [initialLoading, setInitialLoading] = useState(true); // Initial page load (calendar, days off)
  const [loadingGradeData, setLoadingGradeData] = useState(false); // Loading lessons/schedules when grade changes
  const [loadingSchedules, setLoadingSchedules] = useState(false); // Loading section-specific schedules
  const [saving, setSaving] = useState(false);
  const [unitSchedules, setUnitSchedules] = useState<UnitScheduleLocal[]>([]);

  // Section config state
  const [allSectionConfigs, setAllSectionConfigs] = useState<SectionConfigOption[]>([]);
  const [selectedSection, setSelectedSection] = useState<SectionConfigOption | null>(null);
  const [pendingSectionKey, setPendingSectionKey] = useState<string | null>(null); // For restoring section after configs load
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copyTargets, setCopyTargets] = useState<Set<string>>(new Set()); // Set of "school|classSection" keys

  // Load saved selection from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CALENDAR_STORAGE_KEY);
      if (saved) {
        const data: CalendarStorageData = JSON.parse(saved);
        if (data.grade) {
          setSelectedGrade(data.grade);
        }
        if (data.sectionKey) {
          setPendingSectionKey(data.sectionKey);
        }
      }
    } catch (error) {
      console.error("Error loading saved calendar selection:", error);
    }
  }, []);

  // Save selection to localStorage when it changes
  useEffect(() => {
    try {
      const data: CalendarStorageData = {
        grade: selectedGrade,
        sectionKey: selectedSection ? `${selectedSection.school}|${selectedSection.classSection}` : null,
      };
      localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving calendar selection:", error);
    }
  }, [selectedGrade, selectedSection]);

  // Selection state for interactive date picking
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(null);

  // Current month for calendar navigation (start from current month)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Load section configs once on mount
  useEffect(() => {
    const loadSectionConfigs = async () => {
      const result = await getAllSectionConfigs();
      if (result.success && result.data) {
        // Flatten the grouped data into a single array with school included
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

  // Restore pending section once configs are loaded
  useEffect(() => {
    if (pendingSectionKey && allSectionConfigs.length > 0) {
      const [school, classSection] = pendingSectionKey.split('|');
      const section = allSectionConfigs.find(
        s => s.school === school && s.classSection === classSection
      );
      if (section) {
        // Verify the section matches the selected grade's scope tag
        const scopeTag = selectedGrade === 'Algebra 1' ? 'Algebra 1' : `Grade ${selectedGrade}`;
        if (section.scopeSequenceTag === scopeTag) {
          setSelectedSection(section);
        }
      }
      setPendingSectionKey(null); // Clear pending after attempting restore
    }
  }, [pendingSectionKey, allSectionConfigs, selectedGrade]);

  // Load calendar and days off once on mount (these don't change with grade)
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

  // Load lessons and schedules when grade changes (lazy load - header stays visible)
  useEffect(() => {
    const loadGradeData = async () => {
      setLoadingGradeData(true);
      try {
        // Fetch grade-level schedules (default behavior)
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

  // Load section-specific schedules when section changes (lazy load - no full page reload)
  useEffect(() => {
    if (!selectedSection) return; // Only run when a section is selected

    const loadSectionSchedules = async () => {
      setLoadingSchedules(true);
      try {
        // Use scopeSequenceTag to fetch all schedules for this curriculum
        // scopeSequenceTag handles multi-grade curricula like "Algebra 1" which includes Grade 8 prereqs
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

  // Build unit schedules from lessons and merge with saved schedules
  useEffect(() => {
    // Use composite key (grade-unitNumber) to handle Algebra 1 which combines 8th grade prerequisites + Algebra 1 curriculum
    const groups: Map<string, { grade: string; unitNumber: number; unitName: string; sections: Map<string, number> }> = new Map();

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
        if (a.grade === '8' && b.grade === 'Algebra 1') return -1;
        if (a.grade === 'Algebra 1' && b.grade === '8') return 1;
        // Otherwise sort by unit number
        return a.unitNumber - b.unitNumber;
      })
      .map(([unitKey, data]) => {
        // Find saved schedule matching grade and unitNumber
        const saved = savedSchedules.find(s => s.grade === data.grade && s.unitNumber === data.unitNumber);

        // Get counts from scope-and-sequence data
        const rampUpCount = data.sections.get("Ramp Ups") || 0;
        const unitAssessmentCount = data.sections.get("Unit Assessment") || 0;

        // Build sections: Ramp Up first (if exists), then curriculum sections (A, B, C...), then Unit Test (if exists)
        // Filter out "Ramp Ups" and "Unit Assessment" since they're handled separately
        const curriculumSections = Array.from(data.sections.entries())
          .filter(([sectionId]) => sectionId !== "Ramp Ups" && sectionId !== "Unit Assessment")
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([sectionId, lessonCount]) => {
            const savedSection = saved?.sections?.find(s => s.sectionId === sectionId);
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
          const rampUpSaved = saved?.sections?.find(s => s.sectionId === "Ramp Up");
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
          const unitTestSaved = saved?.sections?.find(s => s.sectionId === "Unit Test");
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

    setUnitSchedules(schedules);
  }, [lessons, savedSchedules]);

  // Calculate school days between two dates (excludes weekends and days off)
  const calculateSchoolDays = useCallback((startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate + "T12:00:00");
    const end = new Date(endDate + "T12:00:00");
    const daysOffSet = new Set(daysOff);

    let count = 0;
    const current = new Date(start);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      const dateStr = current.toISOString().split('T')[0];

      // Count if it's a weekday and not a day off
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !daysOffSet.has(dateStr)) {
        count++;
      }

      current.setDate(current.getDate() + 1);
    }

    return count;
  }, [daysOff]);

  // Handle clicking a section to start date selection
  const startDateSelection = (unitKey: string, sectionId: string, type: "start" | "end") => {
    setSelectionMode({ type, unitKey, sectionId });
  };

  // Clear dates for a section
  const clearSectionDates = useCallback(async (unitKey: string, sectionId: string) => {
    // Update local state
    setUnitSchedules((prev) =>
      prev.map((unit) => {
        if (unit.unitKey !== unitKey) return unit;
        return {
          ...unit,
          sections: unit.sections.map((section) => {
            if (section.sectionId !== sectionId) return section;
            return { ...section, startDate: "", endDate: "" };
          }),
        };
      })
    );

    // Get current unit data for saving
    const unit = unitSchedules.find(u => u.unitKey === unitKey);
    if (!unit) return;

    // When a section is selected, check for section-specific schedule; otherwise check for grade-level schedule
    const existingSchedule = selectedSection
      ? savedSchedules.find(s =>
          s.grade === unit.grade &&
          s.unitNumber === unit.unitNumber &&
          (s as unknown as { school?: string; classSection?: string }).school === selectedSection.school &&
          (s as unknown as { school?: string; classSection?: string }).classSection === selectedSection.classSection
        )
      : savedSchedules.find(s => s.grade === unit.grade && s.unitNumber === unit.unitNumber);

    // Get the scopeSequenceTag for this section
    const scopeTag = selectedSection?.scopeSequenceTag || (selectedGrade === 'Algebra 1' ? 'Algebra 1' : `Grade ${selectedGrade}`);

    setSaving(true);
    try {
      if (existingSchedule) {
        // Use section-specific or grade-level function based on selection
        const result = selectedSection
          ? await updateSectionUnitDates(
              schoolYear,
              scopeTag,
              unit.grade,
              selectedSection.school,
              selectedSection.classSection,
              unit.unitNumber,
              sectionId,
              "",
              ""
            )
          : await updateSectionDates(schoolYear, unit.grade, unit.unitNumber, sectionId, "", "");

        // Update saved schedules directly with the returned data
        if (result.success && result.data) {
          setSavedSchedules(prev =>
            prev.map(s => (s.grade === unit.grade && s.unitNumber === unit.unitNumber)
              ? result.data as unknown as SavedUnitSchedule
              : s
            )
          );
        }
      }
    } catch (error) {
      console.error("Error clearing dates:", error);
    } finally {
      setSaving(false);
    }
  }, [unitSchedules, savedSchedules, schoolYear, selectedSection, selectedGrade]);

  // Handle updating unit-level dates
  const handleUnitDateChange = useCallback(async (
    unitKey: string,
    field: 'startDate' | 'endDate',
    value: string
  ) => {
    // Update local state immediately
    setUnitSchedules((prev) =>
      prev.map((unit) => {
        if (unit.unitKey !== unitKey) return unit;
        return { ...unit, [field]: value };
      })
    );

    // Get current unit data for saving
    const unit = unitSchedules.find(u => u.unitKey === unitKey);
    if (!unit) return;

    const newStartDate = field === 'startDate' ? value : unit.startDate;
    const newEndDate = field === 'endDate' ? value : unit.endDate;

    // When a section is selected, check for section-specific schedule; otherwise check for grade-level schedule
    const existingSchedule = selectedSection
      ? savedSchedules.find(s =>
          s.grade === unit.grade &&
          s.unitNumber === unit.unitNumber &&
          (s as unknown as { school?: string; classSection?: string }).school === selectedSection.school &&
          (s as unknown as { school?: string; classSection?: string }).classSection === selectedSection.classSection
        )
      : savedSchedules.find(s => s.grade === unit.grade && s.unitNumber === unit.unitNumber);

    // Get the scopeSequenceTag for this section
    const scopeTag = selectedSection?.scopeSequenceTag || (selectedGrade === 'Algebra 1' ? 'Algebra 1' : `Grade ${selectedGrade}`);

    setSaving(true);
    try {
      if (existingSchedule) {
        // Use section-specific or grade-level function based on selection
        const result = selectedSection
          ? await updateSectionUnitLevelDates(
              schoolYear,
              scopeTag,
              unit.grade,
              selectedSection.school,
              selectedSection.classSection,
              unit.unitNumber,
              newStartDate,
              newEndDate
            )
          : await updateUnitDates(
              schoolYear,
              unit.grade,
              unit.unitNumber,
              newStartDate,
              newEndDate
            );
        if (result.success && result.data) {
          setSavedSchedules(prev =>
            prev.map(s => (s.grade === unit.grade && s.unitNumber === unit.unitNumber)
              ? result.data as unknown as SavedUnitSchedule
              : s
            )
          );
        }
      } else {
        // Create new schedule with unit dates
        const result = selectedSection
          ? await upsertSectionUnitSchedule({
              schoolYear,
              grade: unit.grade,
              scopeSequenceTag: scopeTag,
              school: selectedSection.school,
              classSection: selectedSection.classSection,
              unitNumber: unit.unitNumber,
              unitName: unit.unitName,
              startDate: newStartDate,
              endDate: newEndDate,
              sections: unit.sections.map(s => ({
                sectionId: s.sectionId,
                name: s.name,
                startDate: s.startDate,
                endDate: s.endDate,
                lessonCount: s.lessonCount,
              })),
            })
          : await upsertUnitSchedule({
              schoolYear,
              grade: unit.grade,
              unitNumber: unit.unitNumber,
              unitName: unit.unitName,
              startDate: newStartDate,
              endDate: newEndDate,
              sections: unit.sections.map(s => ({
                sectionId: s.sectionId,
                name: s.name,
                startDate: s.startDate,
                endDate: s.endDate,
                lessonCount: s.lessonCount,
              })),
            });
        if (result.success && result.data) {
          setSavedSchedules(prev => [...prev, result.data as unknown as SavedUnitSchedule]);
        }
      }
    } catch (error) {
      console.error("Error saving unit date:", error);
    } finally {
      setSaving(false);
    }
  }, [unitSchedules, savedSchedules, schoolYear, selectedSection, selectedGrade]);

  // Handle clicking a date in the calendar
  const handleDateClick = useCallback(async (dateStr: string) => {
    if (!selectionMode) return;

    const { type, unitKey, sectionId } = selectionMode;

    // Update local state
    setUnitSchedules((prev) =>
      prev.map((unit) => {
        if (unit.unitKey !== unitKey) return unit;
        return {
          ...unit,
          sections: unit.sections.map((section) => {
            if (section.sectionId !== sectionId) return section;
            return { ...section, [type === "start" ? "startDate" : "endDate"]: dateStr };
          }),
        };
      })
    );

    // Get current section data for saving
    const unit = unitSchedules.find(u => u.unitKey === unitKey);
    const section = unit?.sections.find(s => s.sectionId === sectionId);
    if (!unit || !section) {
      setSelectionMode(null);
      return;
    }

    const newStartDate = type === "start" ? dateStr : section.startDate;
    const newEndDate = type === "end" ? dateStr : section.endDate;

    // Save to DB - use the unit's grade (important for Algebra 1 which has mixed grades)
    // When a section is selected, check for section-specific schedule; otherwise check for grade-level schedule
    const existingSchedule = selectedSection
      ? savedSchedules.find(s =>
          s.grade === unit.grade &&
          s.unitNumber === unit.unitNumber &&
          (s as unknown as { school?: string; classSection?: string }).school === selectedSection.school &&
          (s as unknown as { school?: string; classSection?: string }).classSection === selectedSection.classSection
        )
      : savedSchedules.find(s => s.grade === unit.grade && s.unitNumber === unit.unitNumber);

    // Get the scopeSequenceTag for this section
    const scopeTag = selectedSection?.scopeSequenceTag || (selectedGrade === 'Algebra 1' ? 'Algebra 1' : `Grade ${selectedGrade}`);

    setSaving(true);
    try {
      if (existingSchedule) {
        // Use section-specific or grade-level function based on selection
        const result = selectedSection
          ? await updateSectionUnitDates(
              schoolYear,
              scopeTag,
              unit.grade,
              selectedSection.school,
              selectedSection.classSection,
              unit.unitNumber,
              sectionId,
              newStartDate,
              newEndDate
            )
          : await updateSectionDates(
              schoolYear,
              unit.grade,
              unit.unitNumber,
              sectionId,
              newStartDate,
              newEndDate
            );
        if (result.success && result.data) {
          setSavedSchedules(prev =>
            prev.map(s => (s.grade === unit.grade && s.unitNumber === unit.unitNumber) ? result.data as unknown as SavedUnitSchedule : s)
          );
        }
      } else {
        // Create new schedule
        const result = selectedSection
          ? await upsertSectionUnitSchedule({
              schoolYear,
              grade: unit.grade,
              scopeSequenceTag: scopeTag,
              school: selectedSection.school,
              classSection: selectedSection.classSection,
              unitNumber: unit.unitNumber,
              unitName: unit.unitName,
              sections: unit.sections.map(s => ({
                sectionId: s.sectionId,
                name: s.name,
                startDate: s.sectionId === sectionId ? newStartDate : s.startDate,
                endDate: s.sectionId === sectionId ? newEndDate : s.endDate,
                lessonCount: s.lessonCount,
              })),
            })
          : await upsertUnitSchedule({
              schoolYear,
              grade: unit.grade,
              unitNumber: unit.unitNumber,
              unitName: unit.unitName,
              sections: unit.sections.map(s => ({
                sectionId: s.sectionId,
                name: s.name,
                startDate: s.sectionId === sectionId ? newStartDate : s.startDate,
                endDate: s.sectionId === sectionId ? newEndDate : s.endDate,
                lessonCount: s.lessonCount,
              })),
            });
        if (result.success && result.data) {
          setSavedSchedules(prev => [...prev, result.data as unknown as SavedUnitSchedule]);
        }
      }
    } catch (error) {
      console.error("Error saving date:", error);
    } finally {
      setSaving(false);
    }

    // If we just set start date, auto-switch to end date selection
    if (type === "start") {
      setSelectionMode({ type: "end", unitKey, sectionId });
    } else {
      setSelectionMode(null);
    }
  }, [selectionMode, unitSchedules, savedSchedules, schoolYear, selectedSection, selectedGrade]);

  // Handle copying schedules TO other sections
  const handleCopyToSections = useCallback(async () => {
    if (!selectedSection || copyTargets.size === 0) return;

    const scopeTag = selectedGrade === 'Algebra 1' ? 'Algebra 1' : `Grade ${selectedGrade}`;

    // Get target sections from the copyTargets set
    const targetSections = allSectionConfigs.filter(
      s => s.scopeSequenceTag === scopeTag && copyTargets.has(`${s.school}|${s.classSection}`)
    );

    setCopying(true);
    try {
      // Copy to each target section
      for (const target of targetSections) {
        await copySectionUnitSchedules(
          schoolYear,
          scopeTag,
          selectedSection.school,
          selectedSection.classSection,
          target.school,
          target.classSection
        );
      }

      setShowCopyModal(false);
      setCopyTargets(new Set());
    } catch (error) {
      console.error("Error copying schedules:", error);
    } finally {
      setCopying(false);
    }
  }, [selectedSection, selectedGrade, schoolYear, copyTargets, allSectionConfigs]);

  // Get unit/section info for a date
  const getScheduleForDate = (dateStr: string) => {
    for (let i = 0; i < unitSchedules.length; i++) {
      const unit = unitSchedules[i];
      for (let j = 0; j < unit.sections.length; j++) {
        const section = unit.sections[j];
        if (section.startDate && section.endDate && dateStr >= section.startDate && dateStr <= section.endDate) {
          return { unitIndex: i, sectionIndex: j, unit, section };
        }
      }
    }
    return null;
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    if (!calendar?.events) return [];
    const dateStr = date.toISOString().split("T")[0];
    return calendar.events.filter((e) => e.date === dateStr);
  };

  const isDayOff = (date: Date): boolean => {
    const dateStr = date.toISOString().split("T")[0];
    return daysOff.includes(dateStr);
  };

  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const prevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Render a single month calendar
  const renderMonth = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startPadding; i++) days.push(null);
    for (let d = 1; d <= totalDays; d++) days.push(new Date(year, month, d));

    return (
      <div className="bg-white rounded-lg shadow p-3 mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          {monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <div className="grid grid-cols-7 gap-0.5">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
            <div key={`${day}-${idx}`} className="text-center text-xs font-medium text-gray-400 py-0.5">
              {day}
            </div>
          ))}
          {days.map((date, idx) => {
            if (!date) return <div key={`empty-${idx}`} className="h-7" />;

            const dateStr = date.toISOString().split("T")[0];
            const events = getEventsForDate(date);
            const dayOff = isDayOff(date);
            const weekend = isWeekend(date);
            const scheduleInfo = getScheduleForDate(dateStr);

            // Check if this date is being selected
            const isSelecting = selectionMode !== null;

            let bgColor = "bg-white";
            let textColor = "text-gray-900";
            let customBgStyle: React.CSSProperties = {};
            const cursor = isSelecting && !weekend && !dayOff ? "cursor-pointer" : "";

            if (weekend || dayOff) {
              bgColor = "bg-gray-100";
              textColor = "text-gray-400";
            } else if (scheduleInfo) {
              const unitColor = UNIT_COLORS[scheduleInfo.unitIndex % UNIT_COLORS.length];
              // Rotate through light → medium → dark based on section index
              const shade = getSectionShade(scheduleInfo.sectionIndex);
              customBgStyle = { backgroundColor: unitColor[shade] };
              // Clear bg-white class so inline style takes effect
              bgColor = "";
              // Use white text for medium and dark shades
              if (shade === "medium" || shade === "dark") {
                textColor = "text-white";
              }
            }

            return (
              <div
                key={date.toISOString()}
                onClick={() => {
                  if (!weekend && !dayOff && isSelecting) {
                    handleDateClick(dateStr);
                  }
                }}
                className={`h-7 rounded text-xs flex items-center justify-center relative ${bgColor} ${textColor} ${cursor} ${
                  isSelecting && !weekend && !dayOff ? "hover:ring-2 hover:ring-blue-400" : ""
                }`}
                style={customBgStyle}
                title={
                  weekend
                    ? "Weekend"
                    : dayOff
                    ? events.map((e) => e.name).join(", ") || "Day Off"
                    : scheduleInfo
                    ? `${scheduleInfo.unit.unitName} - ${scheduleInfo.section.name}`
                    : ""
                }
              >
                {scheduleInfo && !weekend && !dayOff && (
                  <>
                    <div
                      className="absolute top-0 left-0 right-0 h-0.5"
                      style={{ backgroundColor: UNIT_COLORS[scheduleInfo.unitIndex % UNIT_COLORS.length].base }}
                    />
                    <SectionBadge
                      label={getSectionBadgeLabel(scheduleInfo.section.sectionId)}
                      color={UNIT_COLORS[scheduleInfo.unitIndex % UNIT_COLORS.length].base}
                    />
                  </>
                )}
                {date.getDate()}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading calendar...</div>
      </div>
    );
  }

  // Combined loading state for content section (grade changes or section changes)
  const isContentLoading = loadingGradeData || loadingSchedules;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Unit Calendar by Section</h1>
            <p className="text-sm text-gray-500">
              {schoolYear} School Year
              {saving && <span className="ml-2 text-blue-600">Saving...</span>}
              {selectionMode && (
                <span className="ml-2 text-green-600">
                  Click a date to set {selectionMode.type} for Section {selectionMode.sectionId}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setSelectedSection(null); // Reset section when grade changes
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer"
            >
              {GRADE_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>

            {/* Section selector - shows sections matching the selected grade's scope sequence tag */}
            {(() => {
              const scopeTag = selectedGrade === 'Algebra 1' ? 'Algebra 1' : `Grade ${selectedGrade}`;
              const matchingSections = allSectionConfigs.filter(s => s.scopeSequenceTag === scopeTag);

              if (matchingSections.length === 0) return null;

              return (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedSection ? `${selectedSection.school}|${selectedSection.classSection}` : ''}
                    onChange={async (e) => {
                      if (e.target.value === '') {
                        setSelectedSection(null);
                        // Reload grade-level schedules
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
                      } else {
                        const [school, classSection] = e.target.value.split('|');
                        const section = matchingSections.find(s => s.school === school && s.classSection === classSection);
                        setSelectedSection(section || null);
                      }
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer"
                  >
                    <option value="">Select a class section...</option>
                    {matchingSections.map((s) => (
                      <option key={`${s.school}|${s.classSection}`} value={`${s.school}|${s.classSection}`}>
                        {s.school} - {s.classSection}{s.teacher ? ` (${s.teacher})` : ''}
                      </option>
                    ))}
                  </select>

                  {/* Copy from section button */}
                  {selectedSection && matchingSections.length > 1 && (
                    <button
                      onClick={() => setShowCopyModal(true)}
                      className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 cursor-pointer"
                      title="Copy schedule from another section"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                      Copy
                    </button>
                  )}
                </div>
              );
            })()}

            {selectionMode && (
              <button
                onClick={() => setSelectionMode(null)}
                className="px-3 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer"
              >
                Cancel Selection
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content - two columns */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left column - Unit cards */}
        <div className="w-1/2 p-4 overflow-y-auto border-r border-gray-200 relative">
          {/* Show prompt to select a section if none selected */}
          {!selectedSection ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-medium mb-2">Select a Class Section</p>
              <p className="text-sm text-center max-w-xs">
                Choose a grade and class section from the dropdown above to view and edit the unit schedule.
              </p>
            </div>
          ) : (
            <>
              {/* Loading overlay for grade/section data changes */}
              {isContentLoading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Spinner size="sm" variant="primary" />
                    <span className="text-sm font-medium">
                      {loadingGradeData ? 'Loading grade data...' : 'Loading schedules...'}
                    </span>
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {unitSchedules.map((unit, unitIndex) => {
              const unitColor = UNIT_COLORS[unitIndex % UNIT_COLORS.length];

              return (
                <div
                  key={`unit-card-${unit.unitKey}`}
                  className="bg-white rounded-lg shadow overflow-hidden"
                  style={{ borderLeft: `4px solid ${unitColor.base}` }}
                >
                  {/* Unit Header */}
                  <div
                    className="px-3 py-2 font-semibold text-sm flex items-center justify-between"
                    style={{ backgroundColor: unitColor.light, color: unitColor.base }}
                  >
                    <span>{unit.unitName}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={unit.startDate || ''}
                        onChange={(e) => handleUnitDateChange(unit.unitKey, 'startDate', e.target.value)}
                        className="text-xs px-2 py-1 rounded border border-current/30 bg-white/50"
                        style={{ color: unitColor.base }}
                        title="Unit Start Date"
                      />
                      <span className="text-xs">to</span>
                      <input
                        type="date"
                        value={unit.endDate || ''}
                        onChange={(e) => handleUnitDateChange(unit.unitKey, 'endDate', e.target.value)}
                        className="text-xs px-2 py-1 rounded border border-current/30 bg-white/50"
                        style={{ color: unitColor.base }}
                        title="Unit End Date"
                      />
                    </div>
                  </div>

                  {/* Sections */}
                  <div className="divide-y divide-gray-100">
                    {unit.sections.map((section) => {
                      const isSelected = selectionMode?.unitKey === unit.unitKey && selectionMode?.sectionId === section.sectionId;
                      const isSelectingStart = isSelected && selectionMode?.type === "start";
                      const isSelectingEnd = isSelected && selectionMode?.type === "end";
                      const allocatedDays = section.startDate && section.endDate
                        ? calculateSchoolDays(section.startDate, section.endDate)
                        : null;

                      return (
                        <div
                          key={`unit-${unit.unitKey}-section-${section.sectionId}`}
                          className="flex items-center px-3 py-1.5"
                          style={{ backgroundColor: isSelected ? unitColor.light : undefined }}
                        >
                          {/* Section name */}
                          <div className="flex-1 text-sm text-gray-700">
                            {section.name}
                          </div>

                          {/* Allocated days */}
                          <div className="w-14 text-xs text-center">
                            {allocatedDays !== null ? (
                              <span style={{ color: allocatedDays >= section.lessonCount ? unitColor.base : '#DC2626' }}>
                                {allocatedDays} days
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>

                          {/* Lesson count */}
                          <div className="w-16 text-xs text-center text-gray-500">
                            {`${section.lessonCount} Lessons`}
                          </div>

                          {/* Start button */}
                          <div className="w-20 text-center">
                            <button
                              onClick={() => startDateSelection(unit.unitKey, section.sectionId, "start")}
                              className="text-xs px-2 py-1 rounded cursor-pointer"
                              style={{
                                backgroundColor: isSelectingStart ? unitColor.base : unitColor.light,
                                color: isSelectingStart ? "white" : unitColor.base
                              }}
                            >
                              {section.startDate
                                ? new Date(section.startDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                : "Set Start"}
                            </button>
                          </div>

                          {/* End button */}
                          <div className="w-20 text-center">
                            <button
                              onClick={() => startDateSelection(unit.unitKey, section.sectionId, "end")}
                              className="text-xs px-2 py-1 rounded cursor-pointer"
                              style={{
                                backgroundColor: isSelectingEnd ? unitColor.base : unitColor.light,
                                color: isSelectingEnd ? "white" : unitColor.base
                              }}
                            >
                              {section.endDate
                                ? new Date(section.endDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                : "Set End"}
                            </button>
                          </div>

                          {/* Clear button */}
                          <div className="w-6 text-center">
                            {(section.startDate || section.endDate) && (
                              <button
                                onClick={() => clearSectionDates(unit.unitKey, section.sectionId)}
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded p-1 cursor-pointer"
                                title="Clear dates"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
              </div>
            </>
          )}
        </div>

        {/* Right column - Calendar */}
        <div className="w-1/2 p-4 overflow-y-auto bg-gray-100 relative">
          {/* Loading overlay for grade data changes */}
          {loadingGradeData && (
            <div className="absolute inset-0 bg-gray-100/70 flex items-center justify-center z-10">
              <div className="flex items-center gap-2 text-blue-600">
                <Spinner size="sm" variant="primary" />
                <span className="text-sm font-medium">Updating calendar...</span>
              </div>
            </div>
          )}
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4 bg-white rounded-lg shadow px-4 py-2">
            <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded">
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium">
              {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
            <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Calendar months stacked vertically */}
          {[0, 1, 2].map((offset) => {
            const monthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
            return <div key={monthDate.toISOString()}>{renderMonth(monthDate)}</div>;
          })}

          {/* Legend */}
          <div className="bg-white rounded-lg shadow p-3 mt-4">
            <h4 className="text-xs font-semibold text-gray-500 mb-2">Legend</h4>
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-100 rounded border border-gray-300" />
                <span>Weekend / Day Off</span>
              </div>
              {unitSchedules.slice(0, 6).map((unit, index) => (
                <div key={unit.unitNumber} className="flex items-center gap-1">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: UNIT_COLORS[index % UNIT_COLORS.length].light }}
                  />
                  <span>U{unit.unitNumber}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copy To Sections Modal */}
      {showCopyModal && selectedSection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Copy Schedule To Other Sections</h2>
              <p className="text-sm text-gray-500 mt-1">
                Copy the schedule from <span className="font-medium">{selectedSection.school} - {selectedSection.classSection}</span> to the selected sections below.
              </p>
            </div>
            <div className="px-6 py-4 max-h-64 overflow-y-auto">
              {(() => {
                const scopeTag = selectedGrade === 'Algebra 1' ? 'Algebra 1' : `Grade ${selectedGrade}`;
                const otherSections = allSectionConfigs.filter(
                  s => s.scopeSequenceTag === scopeTag &&
                       !(s.school === selectedSection.school && s.classSection === selectedSection.classSection)
                );

                if (otherSections.length === 0) {
                  return (
                    <p className="text-sm text-gray-500 text-center py-4">No other sections available to copy to.</p>
                  );
                }

                const allSelected = otherSections.every(s => copyTargets.has(`${s.school}|${s.classSection}`));

                return (
                  <div className="space-y-2">
                    {/* Select All */}
                    <label className="flex items-center gap-3 px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCopyTargets(new Set(otherSections.map(s => `${s.school}|${s.classSection}`)));
                          } else {
                            setCopyTargets(new Set());
                          }
                        }}
                        disabled={copying}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="font-medium text-gray-700">Select All</span>
                    </label>

                    {otherSections.map((section) => {
                      const key = `${section.school}|${section.classSection}`;
                      const isChecked = copyTargets.has(key);

                      return (
                        <label
                          key={key}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                            isChecked
                              ? 'border-blue-300 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const newTargets = new Set(copyTargets);
                              if (e.target.checked) {
                                newTargets.add(key);
                              } else {
                                newTargets.delete(key);
                              }
                              setCopyTargets(newTargets);
                            }}
                            disabled={copying}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {section.school} - {section.classSection}
                            </div>
                            {section.teacher && (
                              <div className="text-sm text-gray-500">{section.teacher}</div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {copyTargets.size} section{copyTargets.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCopyModal(false);
                    setCopyTargets(new Set());
                  }}
                  disabled={copying}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCopyToSections}
                  disabled={copying || copyTargets.size === 0}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {copying ? (
                    <>
                      <Spinner size="xs" variant="default" className="border-white border-t-blue-200" />
                      Copying...
                    </>
                  ) : (
                    <>
                      <DocumentDuplicateIcon className="h-4 w-4" />
                      Copy to {copyTargets.size} Section{copyTargets.size !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
