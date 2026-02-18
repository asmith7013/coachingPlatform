"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { CalendarEvent } from "@zod-schema/calendar";
import {
  useCalendarPageData,
  type SavedUnitSchedule,
} from "../../calendar-old/hooks/useCalendarPageData";
import { calendarKeys } from "../../calendar-old/hooks/queries";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateScopeSequence } from "@/hooks/scm/scope-and-sequence/mutations";
import { useScopeSequenceList } from "@/hooks/scm/scope-and-sequence/queries";
import type {
  SectionConfigOption,
  SelectionMode,
  LessonForSubsection,
  SubsectionsModalState,
} from "../../calendar-old/components";
import type { ScopeAndSequenceInput } from "@zod-schema/scm/scope-and-sequence/scope-and-sequence";

// localStorage keys
const CALENDAR2_STORAGE_KEY = "roadmaps-calendar2-selection";
const CALENDAR2_UNITS_KEY = "roadmaps-calendar2-unit-by-section";

// Default school year
const DEFAULT_SCHOOL_YEAR = "2025-2026";

// Grade options
export const GRADE_OPTIONS = [
  { value: "6", label: "Grade 6" },
  { value: "7", label: "Grade 7" },
  { value: "8", label: "Grade 8" },
  { value: "Algebra 1", label: "Algebra 1" },
];

export function useCalendarState() {
  const queryClient = useQueryClient();
  const [schoolYear] = useState(DEFAULT_SCHOOL_YEAR);
  const [selectedGrade, setSelectedGrade] = useState("6");
  const [selectedSection, setSelectedSection] =
    useState<SectionConfigOption | null>(null);
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);

  // Use the React Query powered hook
  const {
    calendar,
    daysOff,
    sectionConfigs,
    sectionDaysOff,
    unitSchedules,
    savedSchedules,
    isInitialLoading,
    isLoadingGradeData,
    isLoadingSchedules,
    isMutating,
    updateSectionDates,
    updateUnitDates,
    addDayOff,
    deleteDayOff,
    copySchedules,
    clearSectionDates,
    updateSubsections,
  } = useCalendarPageData(schoolYear, selectedGrade, selectedSection);

  // Modal and UI state
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyTargets, setCopyTargets] = useState<Set<string>>(new Set());
  const [selectedUnits, setSelectedUnits] = useState<Set<number>>(new Set());
  const [showAddDayOffModal, setShowAddDayOffModal] = useState(false);
  const [showDeleteDayOffModal, setShowDeleteDayOffModal] = useState(false);
  const [dayOffToDelete, setDayOffToDelete] = useState<{
    date: string;
    name: string;
  } | null>(null);
  const [subsectionsModal, setSubsectionsModal] =
    useState<SubsectionsModalState | null>(null);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);

  // Scope & sequence data for AddEntryModal
  const scopeTag =
    selectedGrade === "Algebra 1" ? "Algebra 1" : `Grade ${selectedGrade}`;
  const { data: scopeSequenceData } = useScopeSequenceList({
    grade: selectedGrade,
    scopeSequenceTag: scopeTag,
    limit: 500,
  });
  const createScopeSequence = useCreateScopeSequence();

  // Selection state for interactive date picking
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(null);

  // Date preloaded when clicking + on a calendar cell
  const [addEventDate, setAddEventDate] = useState<string | null>(null);

  // Current month for calendar navigation
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Track pending section restore
  const [pendingSectionKey, setPendingSectionKey] = useState<string | null>(
    null,
  );
  const [hasAttemptedRestore, setHasAttemptedRestore] = useState(false);

  // Load saved selection from URL (priority) or localStorage on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlGrade = urlParams.get("g");
    const urlSection = urlParams.get("section");

    if (urlGrade) {
      const grade = urlGrade === "alg-1" ? "Algebra 1" : urlGrade;
      setSelectedGrade(grade);
      if (urlSection) setPendingSectionKey(urlSection);
      return;
    }

    try {
      const saved = localStorage.getItem(CALENDAR2_STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.grade) setSelectedGrade(data.grade);
        if (data.sectionKey) setPendingSectionKey(data.sectionKey);
      }
    } catch (error) {
      console.error("Error loading saved calendar2 selection:", error);
    }
  }, []);

  // Save selection to localStorage and URL when it changes
  useEffect(() => {
    try {
      const data = {
        grade: selectedGrade,
        sectionKey: selectedSection
          ? `${selectedSection.school}|${selectedSection.classSection}`
          : null,
      };
      localStorage.setItem(CALENDAR2_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving calendar2 selection:", error);
    }

    // Sync to URL
    const params = new URLSearchParams(window.location.search);
    params.set("g", selectedGrade === "Algebra 1" ? "alg-1" : selectedGrade);
    if (selectedSection) {
      params.set("section", selectedSection.classSection);
    } else {
      params.delete("section");
    }
    const qs = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${qs ? `?${qs}` : ""}`,
    );
  }, [selectedGrade, selectedSection]);

  // Restore pending section once configs are loaded
  useEffect(() => {
    if (
      hasAttemptedRestore ||
      !pendingSectionKey ||
      sectionConfigs.length === 0
    )
      return;

    let section: SectionConfigOption | undefined;
    if (pendingSectionKey.includes("|")) {
      // localStorage format: "school|classSection"
      const [school, classSection] = pendingSectionKey.split("|");
      section = sectionConfigs.find(
        (s: SectionConfigOption) =>
          s.school === school && s.classSection === classSection,
      );
    } else {
      // URL format: just "classSection"
      section = sectionConfigs.find(
        (s: SectionConfigOption) => s.classSection === pendingSectionKey,
      );
    }

    if (section) {
      const scopeTag =
        selectedGrade === "Algebra 1" ? "Algebra 1" : `Grade ${selectedGrade}`;
      if (section.scopeSequenceTag === scopeTag) {
        setSelectedSection(section);
      }
    }
    setHasAttemptedRestore(true);
  }, [pendingSectionKey, sectionConfigs, selectedGrade, hasAttemptedRestore]);

  // Restore saved unit index when section changes, or reset to 0
  useEffect(() => {
    if (selectedSection) {
      try {
        const sectionKey = `${selectedSection.school}|${selectedSection.classSection}`;
        const saved = localStorage.getItem(CALENDAR2_UNITS_KEY);
        if (saved) {
          const map = JSON.parse(saved);
          const savedIndex = map[sectionKey];
          if (typeof savedIndex === "number" && savedIndex >= 0) {
            setSelectedUnitIndex(savedIndex);
            return;
          }
        }
      } catch {
        // ignore
      }
    }
    setSelectedUnitIndex(0);
  }, [selectedGrade, selectedSection]);

  // Save unit index per section to localStorage
  useEffect(() => {
    if (!selectedSection) return;
    try {
      const sectionKey = `${selectedSection.school}|${selectedSection.classSection}`;
      const saved = localStorage.getItem(CALENDAR2_UNITS_KEY);
      const map = saved ? JSON.parse(saved) : {};
      map[sectionKey] = selectedUnitIndex;
      localStorage.setItem(CALENDAR2_UNITS_KEY, JSON.stringify(map));
    } catch {
      // ignore
    }
  }, [selectedSection, selectedUnitIndex]);

  // Clamp unit index when unitSchedules changes
  useEffect(() => {
    if (unitSchedules.length > 0 && selectedUnitIndex >= unitSchedules.length) {
      setSelectedUnitIndex(0);
    }
  }, [unitSchedules, selectedUnitIndex]);

  // Calculate school days between two dates
  const calculateSchoolDays = useCallback(
    (startDate: string, endDate: string): number => {
      if (!startDate || !endDate) return 0;

      const start = new Date(startDate + "T12:00:00");
      const end = new Date(endDate + "T12:00:00");
      const daysOffSet = new Set(daysOff);

      for (const event of sectionDaysOff) {
        daysOffSet.add(event.date);
      }

      let count = 0;
      const current = new Date(start);

      while (current <= end) {
        const dayOfWeek = current.getDay();
        const dateStr = current.toISOString().split("T")[0];

        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !daysOffSet.has(dateStr)) {
          count++;
        }

        current.setDate(current.getDate() + 1);
      }

      return count;
    },
    [daysOff, sectionDaysOff],
  );

  const startDateSelection = (
    unitKey: string,
    sectionId: string,
    type: "start" | "end",
    subsection?: number,
  ) => {
    setSelectionMode({ type, unitKey, sectionId, subsection });
  };

  const findExistingSchedule = useCallback(
    (grade: string, unitNumber: number): SavedUnitSchedule | undefined => {
      if (selectedSection) {
        return savedSchedules.find(
          (s) =>
            s.grade === grade &&
            s.unitNumber === unitNumber &&
            (s as { school?: string }).school === selectedSection.school &&
            (s as { classSection?: string }).classSection ===
              selectedSection.classSection,
        );
      }
      return savedSchedules.find(
        (s) => s.grade === grade && s.unitNumber === unitNumber,
      );
    },
    [savedSchedules, selectedSection],
  );

  const handleClearSectionDates = useCallback(
    (unitKey: string, sectionId: string, subsection?: number) => {
      const unit = unitSchedules.find((u) => u.unitKey === unitKey);
      if (!unit) return;

      const existingSchedule = findExistingSchedule(
        unit.grade,
        unit.unitNumber,
      );
      if (!existingSchedule) return;

      clearSectionDates.mutate({
        unitKey,
        grade: unit.grade,
        unitNumber: unit.unitNumber,
        sectionId,
        subsection,
      });
    },
    [unitSchedules, findExistingSchedule, clearSectionDates],
  );

  const handleUnitDateChange = useCallback(
    (unitKey: string, field: "startDate" | "endDate", value: string) => {
      const unit = unitSchedules.find((u) => u.unitKey === unitKey);
      if (!unit) return;

      const existingSchedule = findExistingSchedule(
        unit.grade,
        unit.unitNumber,
      );

      updateUnitDates.mutate({
        unitKey,
        grade: unit.grade,
        unitNumber: unit.unitNumber,
        unitName: unit.unitName,
        startDate: field === "startDate" ? value : unit.startDate,
        endDate: field === "endDate" ? value : unit.endDate,
        sections: unit.sections,
        existingScheduleId: existingSchedule?._id,
      });
    },
    [unitSchedules, findExistingSchedule, updateUnitDates],
  );

  const handleDateClick = useCallback(
    (dateStr: string) => {
      if (!selectionMode) return;

      const { type, unitKey, sectionId, subsection, pendingStartDate } =
        selectionMode;
      const unit = unitSchedules.find((u) => u.unitKey === unitKey);
      const section = unit?.sections.find(
        (s) => s.sectionId === sectionId && s.subsection === subsection,
      );

      if (!unit || !section) {
        setSelectionMode(null);
        return;
      }

      const existingSchedule = findExistingSchedule(
        unit.grade,
        unit.unitNumber,
      );

      const startDate =
        type === "start"
          ? dateStr
          : section.startDate || pendingStartDate || "";

      updateSectionDates.mutate({
        unitKey,
        grade: unit.grade,
        unitNumber: unit.unitNumber,
        unitName: unit.unitName,
        sectionId,
        subsection,
        startDate,
        endDate: type === "end" ? dateStr : section.endDate,
        sections: unit.sections,
        existingScheduleId: existingSchedule?._id,
      });

      if (type === "start") {
        setSelectionMode({
          type: "end",
          unitKey,
          sectionId,
          subsection,
          pendingStartDate: dateStr,
        });
      } else {
        setSelectionMode(null);

        // Auto-update unit end date to reflect the latest section end date
        const allEndDates = unit.sections
          .map((s) =>
            s.sectionId === sectionId && s.subsection === subsection
              ? dateStr
              : s.endDate,
          )
          .filter(Boolean);
        if (allEndDates.length > 0) {
          const maxEnd = allEndDates.sort().pop()!;
          if (maxEnd !== unit.endDate) {
            handleUnitDateChange(unitKey, "endDate", maxEnd);
          }
        }
      }
    },
    [
      selectionMode,
      unitSchedules,
      findExistingSchedule,
      updateSectionDates,
      handleUnitDateChange,
    ],
  );

  const handleCopyToSections = useCallback(
    (unitNumbers: number[]) => {
      if (
        !selectedSection ||
        copyTargets.size === 0 ||
        unitNumbers.length === 0
      )
        return;

      const scopeTag =
        selectedGrade === "Algebra 1" ? "Algebra 1" : `Grade ${selectedGrade}`;
      const targetSections = sectionConfigs.filter(
        (s) =>
          s.scopeSequenceTag === scopeTag &&
          copyTargets.has(`${s.school}|${s.classSection}`),
      );

      copySchedules.mutate(
        { targetSections, unitNumbers },
        {
          onSuccess: () => {
            setShowCopyModal(false);
            setCopyTargets(new Set());
            setSelectedUnits(new Set());
          },
        },
      );
    },
    [
      selectedSection,
      selectedGrade,
      sectionConfigs,
      copyTargets,
      copySchedules,
    ],
  );

  const handleAddDayOff = useCallback(
    async (
      date: string,
      name: string,
      shiftSchedule: boolean,
      targetSections: Array<{ school: string; classSection: string }>,
      hasMathClass: boolean,
    ) => {
      await addDayOff.mutateAsync({
        date,
        name,
        shiftSchedule,
        targetSections,
        hasMathClass,
      });
      setShowAddDayOffModal(false);
    },
    [addDayOff],
  );

  const handleDeleteDayOff = useCallback(
    async (date: string, shiftSchedule: boolean) => {
      await deleteDayOff.mutateAsync({ date, shiftSchedule });
      setShowDeleteDayOffModal(false);
      setDayOffToDelete(null);
    },
    [deleteDayOff],
  );

  const handleOpenSubsections = useCallback(
    (
      unitKey: string,
      sectionId: string,
      sectionName: string,
      lessons: LessonForSubsection[],
    ) => {
      const unit = unitSchedules.find((u) => u.unitKey === unitKey);
      if (!unit) return;

      setSubsectionsModal({
        isOpen: true,
        unitKey,
        sectionId,
        sectionName: `${unit.unitName} - ${sectionName}`,
        lessons,
        grade: unit.grade,
      });
    },
    [unitSchedules],
  );

  const handleSaveSubsections = useCallback(
    async (updates: LessonForSubsection[]) => {
      if (!subsectionsModal || !selectedSection) {
        console.error("[handleSaveSubsections] Missing modal or section");
        return;
      }

      const scopeSection =
        subsectionsModal.sectionId === "Ramp Up"
          ? "Ramp Ups"
          : subsectionsModal.sectionId;
      const unitKeyParts = subsectionsModal.unitKey.split("-");
      const unitNumber = parseInt(unitKeyParts[unitKeyParts.length - 1], 10);

      try {
        await updateSubsections.mutateAsync({
          updates: updates.map((lesson) => ({
            scopeAndSequenceId: lesson.scopeAndSequenceId,
            unitLessonId: lesson.unitLessonId,
            lessonName: lesson.lessonName,
            section: scopeSection,
            subsection: lesson.subsection ?? null,
            grade: subsectionsModal.grade,
          })),
          scheduleSync: {
            schoolYear,
            unitNumber,
            sectionId: subsectionsModal.sectionId,
          },
        });
        setSubsectionsModal(null);
      } catch (error) {
        console.error("[handleSaveSubsections] Error:", error);
      }
    },
    [subsectionsModal, selectedSection, updateSubsections, schoolYear],
  );

  const getScheduleForDate = useCallback(
    (dateStr: string) => {
      if (!selectedSection) return null;

      for (let i = 0; i < unitSchedules.length; i++) {
        const unit = unitSchedules[i];
        for (let j = 0; j < unit.sections.length; j++) {
          const section = unit.sections[j];
          if (
            section.startDate &&
            section.endDate &&
            dateStr >= section.startDate &&
            dateStr <= section.endDate
          ) {
            return { unitIndex: i, sectionIndex: j, unit, section };
          }
        }
      }
      return null;
    },
    [selectedSection, unitSchedules],
  );

  const getSectionColorIndex = useCallback(
    (unitIndex: number, sectionId: string, subsection?: number): number => {
      if (unitIndex >= unitSchedules.length) return 0;
      const unit = unitSchedules[unitIndex];
      const seenSectionIds = new Set<string>();
      let colorIdx = 0;

      for (const section of unit.sections) {
        if (!seenSectionIds.has(section.sectionId)) {
          seenSectionIds.add(section.sectionId);
          const sectionsForId = unit.sections.filter(
            (s) => s.sectionId === section.sectionId,
          );
          const isSplit = sectionsForId.length > 1;

          if (isSplit) {
            for (const sub of sectionsForId) {
              if (sub.sectionId === sectionId && sub.subsection === subsection)
                return colorIdx;
              colorIdx++;
            }
          } else {
            if (section.sectionId === sectionId) return colorIdx;
            colorIdx++;
          }
        }
      }
      return 0;
    },
    [unitSchedules],
  );

  const getEventsForDate = useCallback(
    (date: Date): CalendarEvent[] => {
      if (!calendar?.events) return [];
      const dateStr = date.toISOString().split("T")[0];
      return calendar.events.filter((e) => e.date === dateStr);
    },
    [calendar],
  );

  const isDayOff = useCallback(
    (date: Date): boolean => {
      const dateStr = date.toISOString().split("T")[0];
      if (daysOff.includes(dateStr)) return true;
      if (sectionDaysOff.some((d) => d.date === dateStr)) return true;
      return false;
    },
    [daysOff, sectionDaysOff],
  );

  const isSectionDayOff = useCallback(
    (
      date: Date,
    ): {
      isDayOff: boolean;
      event?: { date: string; name: string; hasMathClass?: boolean };
    } => {
      const dateStr = date.toISOString().split("T")[0];
      const event = sectionDaysOff.find((d) => d.date === dateStr);
      return { isDayOff: !!event, event };
    },
    [sectionDaysOff],
  );

  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const prevMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  };

  const handleAddEvent = useCallback((dateStr: string) => {
    setAddEventDate(dateStr);
    setShowAddDayOffModal(true);
  }, []);

  const handleSectionDayOffClick = useCallback(
    (event: { date: string; name: string }) => {
      setDayOffToDelete(event);
      setShowDeleteDayOffModal(true);
    },
    [],
  );

  const matchingSections = useMemo(() => {
    const scopeTag =
      selectedGrade === "Algebra 1" ? "Algebra 1" : `Grade ${selectedGrade}`;
    return sectionConfigs.filter((s) => s.scopeSequenceTag === scopeTag);
  }, [sectionConfigs, selectedGrade]);

  const selectedUnit = unitSchedules[selectedUnitIndex] ?? null;

  // Build legend entries
  const legendEntries = useMemo(() => {
    if (!selectedUnit) return [];
    const entries: { key: string; label: string; colorIndex: number }[] = [];
    const seenSectionIds = new Set<string>();
    let colorIdx = 0;

    for (const section of selectedUnit.sections) {
      if (!seenSectionIds.has(section.sectionId)) {
        seenSectionIds.add(section.sectionId);
        const sectionsForId = selectedUnit.sections.filter(
          (s) => s.sectionId === section.sectionId,
        );
        const isSplit = sectionsForId.length > 1;
        const baseName = section.name
          .replace(/ \(Part \d+\)$/, "")
          .replace(/ \(Unassigned\)$/, "");

        if (isSplit) {
          for (const sub of sectionsForId) {
            const subLabel =
              sub.subsection !== undefined
                ? `${baseName} Pt.${sub.subsection}`
                : `${baseName} (Unassigned)`;
            entries.push({
              key: `${sub.sectionId}-${sub.subsection ?? "u"}`,
              label: subLabel,
              colorIndex: colorIdx,
            });
            colorIdx++;
          }
        } else {
          entries.push({
            key: section.sectionId,
            label: baseName,
            colorIndex: colorIdx,
          });
          colorIdx++;
        }
      }
    }
    return entries;
  }, [selectedUnit]);

  const isContentLoading = isLoadingGradeData || isLoadingSchedules;

  const handleAddLesson = useCallback(
    (data: ScopeAndSequenceInput) => {
      createScopeSequence.mutate(data, {
        onSuccess: () => {
          setShowAddLessonModal(false);
          queryClient.invalidateQueries({
            queryKey: calendarKeys.lessons(selectedGrade),
          });
        },
      });
    },
    [createScopeSequence, queryClient, selectedGrade],
  );

  return {
    // Core state
    schoolYear,
    selectedGrade,
    setSelectedGrade,
    selectedSection,
    setSelectedSection,
    selectedUnitIndex,
    setSelectedUnitIndex,
    selectionMode,
    setSelectionMode,
    currentMonth,

    // Data
    sectionConfigs,
    unitSchedules,
    selectedUnit,
    matchingSections,
    legendEntries,
    scopeTag,
    scopeSequenceData,

    // Loading states
    isInitialLoading,
    isLoadingGradeData,
    isContentLoading,
    isMutating,
    pendingSectionKey,

    // Add event from cell
    addEventDate,
    setAddEventDate,
    handleAddEvent,

    // Modal state
    showCopyModal,
    setShowCopyModal,
    copyTargets,
    setCopyTargets,
    selectedUnits,
    setSelectedUnits,
    showAddDayOffModal,
    setShowAddDayOffModal,
    showDeleteDayOffModal,
    setShowDeleteDayOffModal,
    dayOffToDelete,
    setDayOffToDelete,
    subsectionsModal,
    setSubsectionsModal,
    showAddLessonModal,
    setShowAddLessonModal,

    // Mutation pending states
    copySchedulesPending: copySchedules.isPending,
    addDayOffPending: addDayOff.isPending,
    deleteDayOffPending: deleteDayOff.isPending,
    updateSubsectionsPending: updateSubsections.isPending,
    createScopeSequencePending: createScopeSequence.isPending,

    // Calendar callbacks
    prevMonth,
    nextMonth,
    getScheduleForDate,
    getSectionColorIndex,
    getEventsForDate,
    isDayOff,
    isSectionDayOff,
    isWeekend,
    handleDateClick,
    handleSectionDayOffClick,

    // Unit/section callbacks
    calculateSchoolDays,
    startDateSelection,
    handleClearSectionDates,
    handleUnitDateChange,
    handleOpenSubsections,

    // Modal callbacks
    handleCopyToSections,
    handleAddDayOff,
    handleDeleteDayOff,
    handleSaveSubsections,
    handleAddLesson,
  };
}

export type CalendarState = ReturnType<typeof useCalendarState>;
