"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getSectionDaysOff,
  addSectionDayOff,
  deleteSectionDayOff,
} from "@/app/actions/calendar/school-calendar";
import {
  shiftSectionScheduleForward,
  shiftSectionScheduleBack,
  upsertUnitSchedule,
  updateSectionDates,
  updateUnitDates,
  upsertSectionUnitSchedule,
  updateSectionUnitDates,
  updateSectionUnitLevelDates,
  copySectionUnitSchedules,
  fetchSectionUnitSchedules,
} from "@/app/actions/calendar/unit-schedule";
import type { CalendarEvent } from "@zod-schema/calendar";
import { ChevronLeftIcon, ChevronRightIcon, DocumentDuplicateIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Spinner } from "@/components/core/feedback/Spinner";
import {
  AddDayOffModal,
  DeleteDayOffModal,
  CopyToSectionsModal,
  UnitCard,
  MonthCalendar,
  UNIT_COLORS,
  type SectionConfigOption,
  type UnitScheduleLocal,
  type SectionSchedule,
  type SelectionMode,
} from "./components";
import {
  useCalendarData,
  CALENDAR_STORAGE_KEY,
  type SavedUnitSchedule,
} from "./hooks";

// Default school year
const DEFAULT_SCHOOL_YEAR = "2025-2026";

// Grade options
const GRADE_OPTIONS = [
  { value: "6", label: "Grade 6" },
  { value: "7", label: "Grade 7" },
  { value: "8", label: "Grade 8" },
  { value: "Algebra 1", label: "Algebra 1" },
];

export default function CalendarPage() {
  const [schoolYear] = useState(DEFAULT_SCHOOL_YEAR);
  const [selectedGrade, setSelectedGrade] = useState("6");
  const [selectedSection, setSelectedSection] = useState<SectionConfigOption | null>(null);
  const [saving, setSaving] = useState(false);
  const [unitSchedules, setUnitSchedules] = useState<UnitScheduleLocal[]>([]);

  // Use the custom hook for data loading
  const {
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
    // _setLoadingSchedules,
    reloadGradeLevelSchedules,
  } = useCalendarData({ schoolYear, selectedGrade, selectedSection });

  // Modal and UI state
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copyTargets, setCopyTargets] = useState<Set<string>>(new Set());
  const [showAddDayOffModal, setShowAddDayOffModal] = useState(false);
  const [showDeleteDayOffModal, setShowDeleteDayOffModal] = useState(false);
  const [dayOffToDelete, setDayOffToDelete] = useState<{ date: string; name: string } | null>(null);
  const [addingDayOff, setAddingDayOff] = useState(false);
  const [deletingDayOff, setDeletingDayOff] = useState(false);

  // Load saved grade selection from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CALENDAR_STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.grade) {
          setSelectedGrade(data.grade);
        }
      }
    } catch (error) {
      console.error("Error loading saved calendar selection:", error);
    }
  }, []);

  // Save selection to localStorage when it changes
  useEffect(() => {
    try {
      const data = {
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

  // Track if we've attempted to restore the section
  const [hasAttemptedRestore, setHasAttemptedRestore] = useState(false);

  // Restore pending section once configs are loaded
  useEffect(() => {
    if (hasAttemptedRestore || !pendingSectionKey || allSectionConfigs.length === 0) return;

    const [school, classSection] = pendingSectionKey.split('|');
    const section = allSectionConfigs.find(
      s => s.school === school && s.classSection === classSection
    );
    if (section) {
      const scopeTag = selectedGrade === 'Algebra 1' ? 'Algebra 1' : `Grade ${selectedGrade}`;
      if (section.scopeSequenceTag === scopeTag) {
        setSelectedSection(section);
      }
    }
    setHasAttemptedRestore(true);
  }, [pendingSectionKey, allSectionConfigs, selectedGrade, hasAttemptedRestore]);

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
  }, [unitSchedules, savedSchedules, schoolYear, selectedSection, selectedGrade, setSavedSchedules]);

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
  }, [unitSchedules, savedSchedules, schoolYear, selectedSection, selectedGrade, setSavedSchedules]);

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
  }, [selectionMode, unitSchedules, savedSchedules, schoolYear, selectedSection, selectedGrade, setSavedSchedules]);

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

  // Handle adding a section event
  const handleAddDayOff = useCallback(async (
    date: string,
    name: string,
    shiftSchedule: boolean,
    targetSections: Array<{ school: string; classSection: string }>,
    hasMathClass: boolean
  ) => {
    if (!selectedSection) return;

    setAddingDayOff(true);
    try {
      const scopeTag = selectedSection.scopeSequenceTag || (selectedGrade === 'Algebra 1' ? 'Algebra 1' : `Grade ${selectedGrade}`);

      // Add the event for each target section
      for (const target of targetSections) {
        await addSectionDayOff(schoolYear, {
          date,
          name,
          school: target.school,
          classSection: target.classSection,
          hasMathClass,
        });

        // Shift schedule if requested
        if (shiftSchedule) {
          await shiftSectionScheduleForward(
            schoolYear,
            scopeTag,
            target.school,
            target.classSection,
            date,
            daysOff
          );
        }
      }

      // Refresh section days off
      const result = await getSectionDaysOff(schoolYear, selectedSection.school, selectedSection.classSection);
      if (result.success && result.data) {
        setSectionDaysOff(result.data);
      }

      // Refresh schedules if we shifted
      if (shiftSchedule) {
        const schedulesResult = await fetchSectionUnitSchedules(
          schoolYear,
          scopeTag,
          selectedSection.school,
          selectedSection.classSection
        );
        if (schedulesResult.success && schedulesResult.data) {
          setSavedSchedules(schedulesResult.data as unknown as SavedUnitSchedule[]);
        }
      }

      setShowAddDayOffModal(false);
    } catch (error) {
      console.error("Error adding day off:", error);
    } finally {
      setAddingDayOff(false);
    }
  }, [selectedSection, selectedGrade, schoolYear, daysOff, setSectionDaysOff, setSavedSchedules]);

  // Handle deleting a section day off
  const handleDeleteDayOff = useCallback(async (
    date: string,
    shiftSchedule: boolean
  ) => {
    if (!selectedSection) return;

    setDeletingDayOff(true);
    try {
      const scopeTag = selectedSection.scopeSequenceTag || (selectedGrade === 'Algebra 1' ? 'Algebra 1' : `Grade ${selectedGrade}`);

      // Delete the day off
      await deleteSectionDayOff(
        schoolYear,
        date,
        selectedSection.school,
        selectedSection.classSection
      );

      // Shift schedule back if requested
      if (shiftSchedule) {
        await shiftSectionScheduleBack(
          schoolYear,
          scopeTag,
          selectedSection.school,
          selectedSection.classSection,
          date,
          daysOff
        );
      }

      // Refresh section days off
      const result = await getSectionDaysOff(schoolYear, selectedSection.school, selectedSection.classSection);
      if (result.success && result.data) {
        setSectionDaysOff(result.data);
      }

      // Refresh schedules if we shifted
      if (shiftSchedule) {
        const schedulesResult = await fetchSectionUnitSchedules(
          schoolYear,
          scopeTag,
          selectedSection.school,
          selectedSection.classSection
        );
        if (schedulesResult.success && schedulesResult.data) {
          setSavedSchedules(schedulesResult.data as unknown as SavedUnitSchedule[]);
        }
      }

      setShowDeleteDayOffModal(false);
      setDayOffToDelete(null);
    } catch (error) {
      console.error("Error deleting day off:", error);
    } finally {
      setDeletingDayOff(false);
    }
  }, [selectedSection, selectedGrade, schoolYear, daysOff, setSavedSchedules, setSectionDaysOff]);

  // Get unit/section info for a date (only when a section is selected)
  const getScheduleForDate = (dateStr: string) => {
    // Don't show schedule colors until a section is selected
    if (!selectedSection) return null;

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
    // Check global days off
    if (daysOff.includes(dateStr)) return true;
    // Check section-specific days off
    if (sectionDaysOff.some(d => d.date === dateStr)) return true;
    return false;
  };

  // Check if a date is a section-specific day off (for visual distinction)
  const isSectionDayOff = (date: Date): { isDayOff: boolean; event?: { date: string; name: string; hasMathClass?: boolean } } => {
    const dateStr = date.toISOString().split("T")[0];
    const event = sectionDaysOff.find(d => d.date === dateStr);
    return { isDayOff: !!event, event };
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

  // Handler for clicking on a section day off in the calendar
  const handleSectionDayOffClick = useCallback((event: { date: string; name: string }) => {
    setDayOffToDelete(event);
    setShowDeleteDayOffModal(true);
  }, []);

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

              // Show loading state while section configs are loading
              if (allSectionConfigs.length === 0) {
                return (
                  <div className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-400">
                    Loading sections...
                  </div>
                );
              }

              if (matchingSections.length === 0) return null;

              return (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedSection ? `${selectedSection.school}|${selectedSection.classSection}` : ''}
                    onChange={async (e) => {
                      if (e.target.value === '') {
                        setSelectedSection(null);
                        reloadGradeLevelSchedules();
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

                  {/* Add Event button */}
                  {selectedSection && (
                    <button
                      onClick={() => setShowAddDayOffModal(true)}
                      className="flex items-center gap-1 px-3 py-2 text-sm bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 cursor-pointer"
                      title="Add an event for this section"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Event
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
          {/* Loading overlay for grade/section data changes - covers entire column */}
          {(isContentLoading || (pendingSectionKey && allSectionConfigs.length === 0)) && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
              <div className="flex items-center gap-2 text-blue-600">
                <Spinner size="sm" variant="primary" />
                <span className="text-sm font-medium">
                  {loadingGradeData ? 'Loading grade data...' : pendingSectionKey ? 'Restoring selection...' : 'Loading schedules...'}
                </span>
              </div>
            </div>
          )}
          {/* Show prompt to select a section if none selected and not waiting for restore */}
          {!selectedSection && !pendingSectionKey ? (
            <div className="h-full">
              <div className="bg-white rounded-lg shadow-md p-8 h-full flex flex-col items-center justify-center text-center">
                <svg className="w-12 h-12 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-medium text-gray-900 mb-2">Select a Class Section</p>
                <p className="text-sm text-gray-500 max-w-xs">
                  Choose a grade and class section from the dropdown above to view and edit the unit schedule.
                </p>
              </div>
            </div>
          ) : selectedSection ? (
            <div className="space-y-3">
              {unitSchedules.map((unit, unitIndex) => (
                <UnitCard
                  key={`unit-card-${unit.unitKey}`}
                  unit={unit}
                  unitIndex={unitIndex}
                  selectionMode={selectionMode}
                  calculateSchoolDays={calculateSchoolDays}
                  onStartDateSelection={startDateSelection}
                  onClearSectionDates={clearSectionDates}
                  onUnitDateChange={handleUnitDateChange}
                />
              ))}
            </div>
          ) : (
            /* Waiting for section restore - show empty placeholder, loading overlay covers it */
            <div className="h-full" />
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
            return (
              <MonthCalendar
                key={monthDate.toISOString()}
                monthDate={monthDate}
                selectionMode={selectionMode}
                getScheduleForDate={getScheduleForDate}
                getEventsForDate={getEventsForDate}
                isDayOff={isDayOff}
                isSectionDayOff={isSectionDayOff}
                isWeekend={isWeekend}
                onDateClick={handleDateClick}
                onSectionDayOffClick={handleSectionDayOffClick}
              />
            );
          })}

          {/* Legend */}
          <div className="bg-white rounded-lg shadow p-3 mt-4">
            <h4 className="text-xs font-semibold text-gray-500 mb-2">Legend</h4>
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-100 rounded border border-gray-300" />
                <span>Weekend / No School</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-amber-100 rounded border border-amber-300" />
                <span>No Math Class</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-500 rounded" />
                <span>Event (Math Happens)</span>
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
        <CopyToSectionsModal
          isOpen={showCopyModal}
          onClose={() => {
            setShowCopyModal(false);
            setCopyTargets(new Set());
          }}
          onCopy={handleCopyToSections}
          copying={copying}
          sourceSection={selectedSection}
          otherSections={allSectionConfigs.filter(
            s => s.scopeSequenceTag === (selectedGrade === 'Algebra 1' ? 'Algebra 1' : `Grade ${selectedGrade}`) &&
                 !(s.school === selectedSection.school && s.classSection === selectedSection.classSection)
          )}
          copyTargets={copyTargets}
          setCopyTargets={setCopyTargets}
        />
      )}

      {/* Add Day Off Modal */}
      {showAddDayOffModal && selectedSection && (
        <AddDayOffModal
          isOpen={showAddDayOffModal}
          onClose={() => setShowAddDayOffModal(false)}
          onSubmit={handleAddDayOff}
          saving={addingDayOff}
          currentSection={selectedSection}
          allSections={allSectionConfigs.filter(s => s.scopeSequenceTag === (selectedGrade === 'Algebra 1' ? 'Algebra 1' : `Grade ${selectedGrade}`))}
          unitSchedules={unitSchedules}
        />
      )}

      {/* Delete Day Off Modal */}
      {showDeleteDayOffModal && dayOffToDelete && selectedSection && (
        <DeleteDayOffModal
          isOpen={showDeleteDayOffModal}
          onClose={() => {
            setShowDeleteDayOffModal(false);
            setDayOffToDelete(null);
          }}
          onConfirm={handleDeleteDayOff}
          deleting={deletingDayOff}
          event={dayOffToDelete}
        />
      )}
    </div>
  );
}
