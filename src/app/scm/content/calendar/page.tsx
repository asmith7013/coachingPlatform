"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import type { CalendarEvent } from "@zod-schema/calendar";
import { ChevronLeftIcon, ChevronRightIcon, DocumentDuplicateIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Spinner } from "@/components/core/feedback/Spinner";
import {
  AddDayOffModal,
  DeleteDayOffModal,
  CopyToSectionsModal,
  type SectionConfigOption,
  type SelectionMode,
  type LessonForSubsection,
  type SubsectionsModalState,
} from "../calendar-old/components";
import { SubsectionsModal } from "../calendar-old/components/SubsectionsModal";
import { useCalendarPageData, type SavedUnitSchedule } from "../calendar-old/hooks/useCalendarPageData";
import { SimplifiedUnitView, SECTION_COLORS } from "./components/SimplifiedUnitView";
import { MonthCalendarV2 } from "./components/MonthCalendarV2";
import { AddEntryModal } from "../edit-scope-and-sequence/components/AddEntryModal";
import { useCreateScopeSequence } from "@/hooks/scm/scope-and-sequence/mutations";
import { useScopeSequenceList } from "@/hooks/scm/scope-and-sequence/queries";
import type { ScopeAndSequenceInput } from "@zod-schema/scm/scope-and-sequence/scope-and-sequence";

// localStorage key for persisting user selections
const CALENDAR2_STORAGE_KEY = "roadmaps-calendar2-selection";

// Default school year
const DEFAULT_SCHOOL_YEAR = "2025-2026";

// Grade options
const GRADE_OPTIONS = [
  { value: "6", label: "Grade 6" },
  { value: "7", label: "Grade 7" },
  { value: "8", label: "Grade 8" },
  { value: "Algebra 1", label: "Algebra 1" },
];

export default function Calendar2Page() {
  const [schoolYear] = useState(DEFAULT_SCHOOL_YEAR);
  const [selectedGrade, setSelectedGrade] = useState("6");
  const [selectedSection, setSelectedSection] = useState<SectionConfigOption | null>(null);
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
  const [dayOffToDelete, setDayOffToDelete] = useState<{ date: string; name: string } | null>(null);
  const [subsectionsModal, setSubsectionsModal] = useState<SubsectionsModalState | null>(null);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);

  // Scope & sequence data for AddEntryModal
  const scopeTag = selectedGrade === "Algebra 1" ? "Algebra 1" : `Grade ${selectedGrade}`;
  const { data: scopeSequenceData } = useScopeSequenceList({ grade: selectedGrade, scopeSequenceTag: scopeTag, limit: 500 });
  const createScopeSequence = useCreateScopeSequence();

  // Selection state for interactive date picking
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(null);

  // Current month for calendar navigation
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Track pending section restore
  const [pendingSectionKey, setPendingSectionKey] = useState<string | null>(null);
  const [hasAttemptedRestore, setHasAttemptedRestore] = useState(false);

  // Load saved selection from localStorage on mount
  useEffect(() => {
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

  // Save selection to localStorage when it changes
  useEffect(() => {
    try {
      const data = {
        grade: selectedGrade,
        sectionKey: selectedSection ? `${selectedSection.school}|${selectedSection.classSection}` : null,
      };
      localStorage.setItem(CALENDAR2_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving calendar2 selection:", error);
    }
  }, [selectedGrade, selectedSection]);

  // Restore pending section once configs are loaded
  useEffect(() => {
    if (hasAttemptedRestore || !pendingSectionKey || sectionConfigs.length === 0) return;

    const [school, classSection] = pendingSectionKey.split("|");
    const section = sectionConfigs.find(
      (s: SectionConfigOption) => s.school === school && s.classSection === classSection
    );
    if (section) {
      const scopeTag = selectedGrade === "Algebra 1" ? "Algebra 1" : `Grade ${selectedGrade}`;
      if (section.scopeSequenceTag === scopeTag) {
        setSelectedSection(section);
      }
    }
    setHasAttemptedRestore(true);
  }, [pendingSectionKey, sectionConfigs, selectedGrade, hasAttemptedRestore]);

  // Reset unit index when grade or section changes
  useEffect(() => {
    setSelectedUnitIndex(0);
  }, [selectedGrade, selectedSection]);

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
    [daysOff, sectionDaysOff]
  );

  const startDateSelection = (unitKey: string, sectionId: string, type: "start" | "end", subsection?: number) => {
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
            (s as { classSection?: string }).classSection === selectedSection.classSection
        );
      }
      return savedSchedules.find((s) => s.grade === grade && s.unitNumber === unitNumber);
    },
    [savedSchedules, selectedSection]
  );

  const handleClearSectionDates = useCallback(
    (unitKey: string, sectionId: string, subsection?: number) => {
      const unit = unitSchedules.find((u) => u.unitKey === unitKey);
      if (!unit) return;

      const existingSchedule = findExistingSchedule(unit.grade, unit.unitNumber);
      if (!existingSchedule) return;

      clearSectionDates.mutate({
        unitKey,
        grade: unit.grade,
        unitNumber: unit.unitNumber,
        sectionId,
        subsection,
      });
    },
    [unitSchedules, findExistingSchedule, clearSectionDates]
  );

  const handleUnitDateChange = useCallback(
    (unitKey: string, field: "startDate" | "endDate", value: string) => {
      const unit = unitSchedules.find((u) => u.unitKey === unitKey);
      if (!unit) return;

      const existingSchedule = findExistingSchedule(unit.grade, unit.unitNumber);

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
    [unitSchedules, findExistingSchedule, updateUnitDates]
  );

  const handleDateClick = useCallback(
    (dateStr: string) => {
      if (!selectionMode) return;

      const { type, unitKey, sectionId, subsection, pendingStartDate } = selectionMode;
      const unit = unitSchedules.find((u) => u.unitKey === unitKey);
      const section = unit?.sections.find(
        (s) => s.sectionId === sectionId && s.subsection === subsection
      );

      if (!unit || !section) {
        setSelectionMode(null);
        return;
      }

      const existingSchedule = findExistingSchedule(unit.grade, unit.unitNumber);

      const startDate = type === "start"
        ? dateStr
        : (section.startDate || pendingStartDate || "");

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
        setSelectionMode({ type: "end", unitKey, sectionId, subsection, pendingStartDate: dateStr });
      } else {
        setSelectionMode(null);
      }
    },
    [selectionMode, unitSchedules, findExistingSchedule, updateSectionDates]
  );

  const handleCopyToSections = useCallback((unitNumbers: number[]) => {
    if (!selectedSection || copyTargets.size === 0 || unitNumbers.length === 0) return;

    const scopeTag = selectedGrade === "Algebra 1" ? "Algebra 1" : `Grade ${selectedGrade}`;
    const targetSections = sectionConfigs.filter(
      (s) => s.scopeSequenceTag === scopeTag && copyTargets.has(`${s.school}|${s.classSection}`)
    );

    copySchedules.mutate(
      { targetSections, unitNumbers },
      {
        onSuccess: () => {
          setShowCopyModal(false);
          setCopyTargets(new Set());
          setSelectedUnits(new Set());
        },
      }
    );
  }, [selectedSection, selectedGrade, sectionConfigs, copyTargets, copySchedules]);

  const handleAddDayOff = useCallback(
    async (
      date: string,
      name: string,
      shiftSchedule: boolean,
      targetSections: Array<{ school: string; classSection: string }>,
      hasMathClass: boolean
    ) => {
      await addDayOff.mutateAsync({ date, name, shiftSchedule, targetSections, hasMathClass });
      setShowAddDayOffModal(false);
    },
    [addDayOff]
  );

  const handleDeleteDayOff = useCallback(
    async (date: string, shiftSchedule: boolean) => {
      await deleteDayOff.mutateAsync({ date, shiftSchedule });
      setShowDeleteDayOffModal(false);
      setDayOffToDelete(null);
    },
    [deleteDayOff]
  );

  const handleOpenSubsections = useCallback(
    (unitKey: string, sectionId: string, sectionName: string, lessons: LessonForSubsection[]) => {
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
    [unitSchedules]
  );

  const handleSaveSubsections = useCallback(
    async (updates: LessonForSubsection[]) => {
      if (!subsectionsModal || !selectedSection) {
        console.error("[handleSaveSubsections] Missing modal or section");
        return;
      }

      const scopeSection = subsectionsModal.sectionId === "Ramp Up" ? "Ramp Ups" : subsectionsModal.sectionId;
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
    [subsectionsModal, selectedSection, updateSubsections, schoolYear]
  );

  const getScheduleForDate = useCallback(
    (dateStr: string) => {
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
    },
    [selectedSection, unitSchedules]
  );

  // Map (sectionId, subsection) to its color index for the selected unit
  // Matches SimplifiedUnitView flat ordering: split sections get one color per subsection
  const getSectionColorIndex = useCallback(
    (unitIndex: number, sectionId: string, subsection?: number): number => {
      if (unitIndex >= unitSchedules.length) return 0;
      const unit = unitSchedules[unitIndex];
      const seenSectionIds = new Set<string>();
      let colorIdx = 0;

      for (const section of unit.sections) {
        if (!seenSectionIds.has(section.sectionId)) {
          seenSectionIds.add(section.sectionId);
          const sectionsForId = unit.sections.filter(s => s.sectionId === section.sectionId);
          const isSplit = sectionsForId.length > 1;

          if (isSplit) {
            for (const sub of sectionsForId) {
              if (sub.sectionId === sectionId && sub.subsection === subsection) return colorIdx;
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
    [unitSchedules]
  );

  const getEventsForDate = useCallback(
    (date: Date): CalendarEvent[] => {
      if (!calendar?.events) return [];
      const dateStr = date.toISOString().split("T")[0];
      return calendar.events.filter((e) => e.date === dateStr);
    },
    [calendar]
  );

  const isDayOff = useCallback(
    (date: Date): boolean => {
      const dateStr = date.toISOString().split("T")[0];
      if (daysOff.includes(dateStr)) return true;
      if (sectionDaysOff.some((d) => d.date === dateStr)) return true;
      return false;
    },
    [daysOff, sectionDaysOff]
  );

  const isSectionDayOff = useCallback(
    (date: Date): { isDayOff: boolean; event?: { date: string; name: string; hasMathClass?: boolean } } => {
      const dateStr = date.toISOString().split("T")[0];
      const event = sectionDaysOff.find((d) => d.date === dateStr);
      return { isDayOff: !!event, event };
    },
    [sectionDaysOff]
  );

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

  const handleSectionDayOffClick = useCallback((event: { date: string; name: string }) => {
    setDayOffToDelete(event);
    setShowDeleteDayOffModal(true);
  }, []);

  const matchingSections = useMemo(() => {
    const scopeTag = selectedGrade === "Algebra 1" ? "Algebra 1" : `Grade ${selectedGrade}`;
    return sectionConfigs.filter((s) => s.scopeSequenceTag === scopeTag);
  }, [sectionConfigs, selectedGrade]);

  const selectedUnit = unitSchedules[selectedUnitIndex] ?? null;

  // Build legend entries matching the flat section/subsection layout of the selected unit
  const legendEntries = useMemo(() => {
    if (!selectedUnit) return [];
    const entries: { key: string; label: string; colorIndex: number }[] = [];
    const seenSectionIds = new Set<string>();
    let colorIdx = 0;

    for (const section of selectedUnit.sections) {
      if (!seenSectionIds.has(section.sectionId)) {
        seenSectionIds.add(section.sectionId);
        const sectionsForId = selectedUnit.sections.filter(s => s.sectionId === section.sectionId);
        const isSplit = sectionsForId.length > 1;
        const baseName = section.name
          .replace(/ \(Part \d+\)$/, "")
          .replace(/ \(Unassigned\)$/, "");

        if (isSplit) {
          for (const sub of sectionsForId) {
            const subLabel = sub.subsection !== undefined
              ? `${baseName} Pt.${sub.subsection}`
              : `${baseName} (Unassigned)`;
            entries.push({ key: `${sub.sectionId}-${sub.subsection ?? "u"}`, label: subLabel, colorIndex: colorIdx });
            colorIdx++;
          }
        } else {
          entries.push({ key: section.sectionId, label: baseName, colorIndex: colorIdx });
          colorIdx++;
        }
      }
    }
    return entries;
  }, [selectedUnit]);

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading calendar...</div>
      </div>
    );
  }

  const isContentLoading = isLoadingGradeData || isLoadingSchedules;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Unit Calendar by Section</h1>
            <p className="text-sm text-gray-500">
              {schoolYear} School Year
              {isMutating && <span className="ml-2 text-blue-600">Saving...</span>}
              {selectionMode && (
                <span className="ml-2 text-green-600">
                  Click a date to set {selectionMode.type} for Section {selectionMode.sectionId}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Grade selector */}
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setSelectedSection(null);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer"
            >
              {GRADE_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>

            {/* Section selector */}
            {sectionConfigs.length === 0 ? (
              <div className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-400">
                Loading sections...
              </div>
            ) : matchingSections.length > 0 ? (
              <div className="flex items-center gap-2">
                <select
                  value={selectedSection ? `${selectedSection.school}|${selectedSection.classSection}` : ""}
                  onChange={(e) => {
                    if (e.target.value === "") {
                      setSelectedSection(null);
                    } else {
                      const [school, classSection] = e.target.value.split("|");
                      const section = matchingSections.find(
                        (s) => s.school === school && s.classSection === classSection
                      );
                      setSelectedSection(section || null);
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer"
                >
                  <option value="">Select a class section...</option>
                  {matchingSections.map((s) => (
                    <option key={`${s.school}|${s.classSection}`} value={`${s.school}|${s.classSection}`}>
                      {s.school} - {s.classSection}
                      {s.teacher ? ` (${s.teacher})` : ""}
                    </option>
                  ))}
                </select>

                {/* Unit selector - only when section is selected */}
                {selectedSection && unitSchedules.length > 0 && (
                  <select
                    value={selectedUnitIndex}
                    onChange={(e) => setSelectedUnitIndex(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer"
                  >
                    {unitSchedules.map((u, i) => (
                      <option key={u.unitKey} value={i}>
                        {u.unitName}
                      </option>
                    ))}
                  </select>
                )}

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
            ) : null}

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

      {/* Main content - two columns: narrow left, wide right */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left column - Selected unit only */}
        <div className="w-1/3 p-4 overflow-y-auto border-r border-gray-200 relative">
          {(isContentLoading || (pendingSectionKey && sectionConfigs.length === 0)) && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
              <div className="flex items-center gap-2 text-blue-600">
                <Spinner size="sm" variant="primary" />
                <span className="text-sm font-medium">
                  {isLoadingGradeData
                    ? "Loading grade data..."
                    : pendingSectionKey
                      ? "Restoring selection..."
                      : "Loading schedules..."}
                </span>
              </div>
            </div>
          )}

          {!selectedSection && !pendingSectionKey ? (
            <div className="h-full">
              <div className="bg-white rounded-lg shadow-md p-8 h-full flex flex-col items-center justify-center text-center">
                <svg className="w-12 h-12 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-lg font-medium text-gray-900 mb-2">Select a Class Section</p>
                <p className="text-sm text-gray-500 max-w-xs">
                  Choose a grade and class section from the dropdown above to view and edit the unit schedule.
                </p>
              </div>
            </div>
          ) : selectedSection && selectedUnit ? (
            <SimplifiedUnitView
              unit={selectedUnit}
              unitIndex={selectedUnitIndex}
              selectionMode={selectionMode}
              calculateSchoolDays={calculateSchoolDays}
              onOpenSubsections={handleOpenSubsections}
              onStartDateSelection={startDateSelection}
              onClearSectionDates={handleClearSectionDates}
              onUnitDateChange={handleUnitDateChange}
              onAddLesson={() => setShowAddLessonModal(true)}
            />
          ) : (
            <div className="h-full" />
          )}
        </div>

        {/* Right column - Calendar (wider) */}
        <div className="w-2/3 p-4 overflow-y-auto bg-gray-100 relative">
          {isLoadingGradeData && (
            <div className="absolute inset-0 bg-gray-100/70 flex items-center justify-center z-10">
              <div className="flex items-center gap-2 text-blue-600">
                <Spinner size="sm" variant="primary" />
                <span className="text-sm font-medium">Updating calendar...</span>
              </div>
            </div>
          )}

          {!selectedUnit?.startDate ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-gray-400">Select a unit start date to view the calendar</p>
            </div>
          ) : (
          <>
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4 bg-white rounded-lg shadow px-4 py-2">
            <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded cursor-pointer">
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium">
              {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
            <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded cursor-pointer">
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Calendar months stacked vertically */}
          {[0, 1, 2].map((offset) => {
            const monthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
            return (
              <MonthCalendarV2
                key={monthDate.toISOString()}
                monthDate={monthDate}
                selectionMode={selectionMode}
                selectedUnitIndex={selectedUnitIndex}
                getScheduleForDate={getScheduleForDate}
                getSectionColorIndex={getSectionColorIndex}
                getEventsForDate={getEventsForDate}
                isDayOff={isDayOff}
                isSectionDayOff={isSectionDayOff}
                isWeekend={isWeekend}
                onDateClick={handleDateClick}
                onSectionDayOffClick={handleSectionDayOffClick}
              />
            );
          })}

          </>
          )}
        </div>
      </div>

      {/* Sticky footer legend - full width across page */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-2 z-20">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-gray-500 font-semibold mr-1">Legend</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 rounded border border-gray-300" />
            <span>Weekend / No School / No Math</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-500 rounded" />
            <span>Event (Math Happens)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 rounded border border-gray-300" />
            <span className="text-gray-400">Other Units</span>
          </div>
          {legendEntries.map((entry) => {
            const color = SECTION_COLORS[entry.colorIndex % SECTION_COLORS.length];
            return (
              <div key={entry.key} className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: color.light, border: `1px solid ${color.base}` }}
                />
                <span style={{ color: color.base }}>{entry.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Copy To Sections Modal */}
      {showCopyModal && selectedSection && (
        <CopyToSectionsModal
          isOpen={showCopyModal}
          onClose={() => {
            setShowCopyModal(false);
            setCopyTargets(new Set());
            setSelectedUnits(new Set());
          }}
          onCopy={handleCopyToSections}
          copying={copySchedules.isPending}
          sourceSection={selectedSection}
          otherSections={matchingSections.filter(
            (s) => !(s.school === selectedSection.school && s.classSection === selectedSection.classSection)
          )}
          copyTargets={copyTargets}
          setCopyTargets={setCopyTargets}
          unitSchedules={unitSchedules}
          selectedUnits={selectedUnits}
          setSelectedUnits={setSelectedUnits}
        />
      )}

      {/* Add Day Off Modal */}
      {showAddDayOffModal && selectedSection && (
        <AddDayOffModal
          isOpen={showAddDayOffModal}
          onClose={() => setShowAddDayOffModal(false)}
          onSubmit={handleAddDayOff}
          saving={addDayOff.isPending}
          currentSection={selectedSection}
          allSections={matchingSections}
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
          deleting={deleteDayOff.isPending}
          event={dayOffToDelete}
        />
      )}

      {/* Subsections Modal */}
      {subsectionsModal && (
        <SubsectionsModal
          isOpen={subsectionsModal.isOpen}
          sectionName={subsectionsModal.sectionName}
          lessons={subsectionsModal.lessons}
          onClose={() => setSubsectionsModal(null)}
          onSave={handleSaveSubsections}
          isSaving={updateSubsections.isPending}
        />
      )}

      {/* Add Lesson Modal */}
      <AddEntryModal
        isOpen={showAddLessonModal}
        onClose={() => setShowAddLessonModal(false)}
        onSubmit={(data: ScopeAndSequenceInput) => {
          createScopeSequence.mutate(data, {
            onSuccess: () => setShowAddLessonModal(false),
          });
        }}
        isLoading={createScopeSequence.isPending}
        defaultTag={scopeTag}
        defaultGrade={selectedGrade}
        defaultUnit={selectedUnit?.unitNumber}
        existingEntries={scopeSequenceData ?? []}
      />
    </div>
  );
}
