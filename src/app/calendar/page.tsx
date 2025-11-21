"use client";

import React, { useState, useEffect, useCallback } from "react";
import { fetchSchoolCalendar, getDaysOff } from "@/app/actions/calendar/school-calendar";
import { fetchScopeAndSequenceByGrade } from "@/app/actions/313/scope-and-sequence";
import { fetchUnitSchedules, upsertUnitSchedule, updateSectionDates } from "@/app/actions/calendar/unit-schedule";
import type { SchoolCalendar, CalendarEvent } from "@zod-schema/calendar";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

// Default school year
const DEFAULT_SCHOOL_YEAR = "2025-2026";

// Grade options
const GRADE_OPTIONS = [
  { value: "6", label: "Grade 6" },
  { value: "7", label: "Grade 7" },
  { value: "8", label: "Grade 8" },
  { value: "Algebra 1", label: "Algebra 1" },
];

// Color palette for units - each has base, light (odd sections), and lighter (even sections)
const UNIT_COLORS = [
  { base: "#2563EB", light: "#DBEAFE", lighter: "#EFF6FF" }, // blue
  { base: "#059669", light: "#D1FAE5", lighter: "#ECFDF5" }, // green
  { base: "#D97706", light: "#FEF3C7", lighter: "#FFFBEB" }, // amber
  { base: "#DC2626", light: "#FEE2E2", lighter: "#FEF2F2" }, // red
  { base: "#7C3AED", light: "#EDE9FE", lighter: "#F5F3FF" }, // purple
  { base: "#DB2777", light: "#FCE7F3", lighter: "#FDF2F8" }, // pink
  { base: "#0891B2", light: "#CFFAFE", lighter: "#ECFEFF" }, // cyan
  { base: "#EA580C", light: "#FFEDD5", lighter: "#FFF7ED" }, // orange
];

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
  unitNumber: number;
  sectionId: string;
} | null;

export default function CalendarPage() {
  const [schoolYear] = useState(DEFAULT_SCHOOL_YEAR);
  const [selectedGrade, setSelectedGrade] = useState("6");
  const [calendar, setCalendar] = useState<SchoolCalendar | null>(null);
  const [lessons, setLessons] = useState<ScopeAndSequenceLesson[]>([]);
  const [daysOff, setDaysOff] = useState<string[]>([]);
  const [savedSchedules, setSavedSchedules] = useState<SavedUnitSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unitSchedules, setUnitSchedules] = useState<UnitScheduleLocal[]>([]);

  // Selection state for interactive date picking
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(null);

  // Current month for calendar navigation (start from current month)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [calendarResult, lessonsResult, daysOffResult, schedulesResult] = await Promise.all([
          fetchSchoolCalendar(schoolYear),
          fetchScopeAndSequenceByGrade(selectedGrade),
          getDaysOff(schoolYear),
          fetchUnitSchedules(schoolYear, selectedGrade),
        ]);

        if (calendarResult.success && calendarResult.data) {
          setCalendar(calendarResult.data);
        }
        if (lessonsResult.success && lessonsResult.data) {
          setLessons(lessonsResult.data as unknown as ScopeAndSequenceLesson[]);
        }
        if (daysOffResult.success && daysOffResult.data) {
          setDaysOff(daysOffResult.data);
        }
        if (schedulesResult.success && schedulesResult.data) {
          setSavedSchedules(schedulesResult.data as unknown as SavedUnitSchedule[]);
        }
      } catch (error) {
        console.error("Error loading calendar data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [schoolYear, selectedGrade]);

  // Build unit schedules from lessons and merge with saved schedules
  useEffect(() => {
    const groups: Map<number, { unitName: string; sections: Map<string, number> }> = new Map();

    for (const lesson of lessons) {
      if (!lesson.unitNumber) continue;

      if (!groups.has(lesson.unitNumber)) {
        groups.set(lesson.unitNumber, {
          unitName: lesson.unit || `Unit ${lesson.unitNumber}`,
          sections: new Map(),
        });
      }
      const group = groups.get(lesson.unitNumber)!;
      const sectionId = lesson.section || "Unknown";
      const currentCount = group.sections.get(sectionId) || 0;
      group.sections.set(sectionId, currentCount + 1);
    }

    const schedules: UnitScheduleLocal[] = Array.from(groups.entries())
      .sort(([a], [b]) => a - b)
      .map(([unitNumber, data]) => {
        const saved = savedSchedules.find(s => s.unitNumber === unitNumber);

        return {
          unitNumber,
          unitName: data.unitName,
          startDate: saved?.startDate || "",
          endDate: saved?.endDate || "",
          sections: Array.from(data.sections.entries())
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
            }),
        };
      });

    setUnitSchedules(schedules);
  }, [lessons, savedSchedules]);

  // Handle clicking a section to start date selection
  const startDateSelection = (unitNumber: number, sectionId: string, type: "start" | "end") => {
    setSelectionMode({ type, unitNumber, sectionId });
  };

  // Clear dates for a section
  const clearSectionDates = useCallback(async (unitNumber: number, sectionId: string) => {
    // Update local state
    setUnitSchedules((prev) =>
      prev.map((unit) => {
        if (unit.unitNumber !== unitNumber) return unit;
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
    const unit = unitSchedules.find(u => u.unitNumber === unitNumber);
    if (!unit) return;

    const existingSchedule = savedSchedules.find(s => s.unitNumber === unitNumber);

    setSaving(true);
    try {
      if (existingSchedule) {
        await updateSectionDates(schoolYear, selectedGrade, unitNumber, sectionId, "", "");
        // Refresh saved schedules
        const result = await fetchUnitSchedules(schoolYear, selectedGrade);
        if (result.success && result.data) {
          setSavedSchedules(result.data as unknown as SavedUnitSchedule[]);
        }
      }
    } catch (error) {
      console.error("Error clearing dates:", error);
    } finally {
      setSaving(false);
    }
  }, [unitSchedules, savedSchedules, schoolYear, selectedGrade]);

  // Handle clicking a date in the calendar
  const handleDateClick = useCallback(async (dateStr: string) => {
    if (!selectionMode) return;

    const { type, unitNumber, sectionId } = selectionMode;

    // Update local state
    setUnitSchedules((prev) =>
      prev.map((unit) => {
        if (unit.unitNumber !== unitNumber) return unit;
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
    const unit = unitSchedules.find(u => u.unitNumber === unitNumber);
    const section = unit?.sections.find(s => s.sectionId === sectionId);
    if (!unit || !section) {
      setSelectionMode(null);
      return;
    }

    const newStartDate = type === "start" ? dateStr : section.startDate;
    const newEndDate = type === "end" ? dateStr : section.endDate;

    // Save to DB
    const existingSchedule = savedSchedules.find(s => s.unitNumber === unitNumber);

    setSaving(true);
    try {
      if (existingSchedule) {
        const result = await updateSectionDates(
          schoolYear,
          selectedGrade,
          unitNumber,
          sectionId,
          newStartDate,
          newEndDate
        );
        if (result.success && result.data) {
          setSavedSchedules(prev =>
            prev.map(s => s.unitNumber === unitNumber ? result.data as unknown as SavedUnitSchedule : s)
          );
        }
      } else {
        const result = await upsertUnitSchedule({
          schoolYear,
          grade: selectedGrade,
          unitNumber,
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
      setSelectionMode({ type: "end", unitNumber, sectionId });
    } else {
      setSelectionMode(null);
    }
  }, [selectionMode, unitSchedules, savedSchedules, schoolYear, selectedGrade]);

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
            let customBg = "";
            let cursor = isSelecting && !weekend && !dayOff ? "cursor-pointer" : "";

            // Check if this is the first day of a section (for left border)
            const isFirstDayOfSection = scheduleInfo && scheduleInfo.section.startDate === dateStr;

            if (weekend || dayOff) {
              bgColor = "bg-gray-100";
              textColor = "text-gray-400";
            } else if (scheduleInfo) {
              const unitColor = UNIT_COLORS[scheduleInfo.unitIndex % UNIT_COLORS.length];
              // Alternate between light and lighter based on section index
              customBg = scheduleInfo.sectionIndex % 2 === 0 ? unitColor.light : unitColor.lighter;
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
                style={{
                  ...(customBg ? { backgroundColor: customBg } : {}),
                  ...(isFirstDayOfSection ? {
                    borderLeft: `3px solid ${UNIT_COLORS[scheduleInfo!.unitIndex % UNIT_COLORS.length].base}`,
                    borderRadius: '4px 2px 2px 4px'
                  } : {})
                }}
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
                    <span
                      className="absolute -top-0.5 -right-0.5 text-[8px] font-bold leading-none px-1 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: UNIT_COLORS[scheduleInfo.unitIndex % UNIT_COLORS.length].base }}
                    >
                      {scheduleInfo.section.sectionId}
                    </span>
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

  // Get unit index for coloring
  const getUnitIndex = (unitNumber: number) => {
    return unitSchedules.findIndex(u => u.unitNumber === unitNumber);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">School Year Calendar</h1>
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
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {GRADE_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
            {selectionMode && (
              <button
                onClick={() => setSelectionMode(null)}
                className="px-3 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel Selection
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content - two columns */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left column - Units table */}
        <div className="w-1/2 p-4 overflow-y-auto border-r border-gray-200">
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Unit Schedule - Grade {selectedGrade}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Click &quot;Set Start&quot; or &quot;Set End&quot;, then click a date on the calendar
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit / Section</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Lessons</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Start</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">End</th>
                    <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {unitSchedules.map((unit, unitIndex) => (
                    <React.Fragment key={`unit-group-${unit.unitNumber}`}>
                      {/* Unit Header */}
                      <tr
                        className="bg-gray-50"
                        style={{ borderLeft: `4px solid ${UNIT_COLORS[unitIndex % UNIT_COLORS.length].base}` }}
                      >
                        <td colSpan={5} className="px-3 py-2 font-semibold text-sm text-gray-900">
                          {unit.unitName}
                        </td>
                      </tr>
                      {/* Section Rows */}
                      {unit.sections.map((section) => {
                        const isSelected = selectionMode?.unitNumber === unit.unitNumber && selectionMode?.sectionId === section.sectionId;
                        const isSelectingStart = isSelected && selectionMode?.type === "start";
                        const isSelectingEnd = isSelected && selectionMode?.type === "end";
                        const unitColor = UNIT_COLORS[unitIndex % UNIT_COLORS.length];

                        return (
                          <tr
                            key={`unit-${unit.unitNumber}-section-${section.sectionId}`}
                            style={{
                              borderLeft: `4px solid ${unitColor.base}`,
                              backgroundColor: isSelected ? unitColor.light : undefined
                            }}
                          >
                            <td className="px-3 py-1.5 pl-6 text-sm text-gray-700">
                              {section.name}
                            </td>
                            <td className="px-3 py-1.5 text-xs text-center text-gray-500">
                              {section.lessonCount}
                            </td>
                            <td className="px-3 py-1.5 text-center">
                              {section.startDate ? (
                                <button
                                  onClick={() => startDateSelection(unit.unitNumber, section.sectionId, "start")}
                                  className="text-xs px-2 py-1 rounded"
                                  style={{
                                    backgroundColor: isSelectingStart ? unitColor.base : unitColor.light,
                                    color: isSelectingStart ? "white" : unitColor.base
                                  }}
                                >
                                  {new Date(section.startDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </button>
                              ) : (
                                <button
                                  onClick={() => startDateSelection(unit.unitNumber, section.sectionId, "start")}
                                  className="text-xs px-2 py-1 rounded"
                                  style={{
                                    backgroundColor: isSelectingStart ? unitColor.base : unitColor.light,
                                    color: isSelectingStart ? "white" : unitColor.base
                                  }}
                                >
                                  Set Start
                                </button>
                              )}
                            </td>
                            <td className="px-3 py-1.5 text-center">
                              {section.endDate ? (
                                <button
                                  onClick={() => startDateSelection(unit.unitNumber, section.sectionId, "end")}
                                  className="text-xs px-2 py-1 rounded"
                                  style={{
                                    backgroundColor: isSelectingEnd ? unitColor.base : unitColor.light,
                                    color: isSelectingEnd ? "white" : unitColor.base
                                  }}
                                >
                                  {new Date(section.endDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </button>
                              ) : (
                                <button
                                  onClick={() => startDateSelection(unit.unitNumber, section.sectionId, "end")}
                                  className="text-xs px-2 py-1 rounded"
                                  style={{
                                    backgroundColor: isSelectingEnd ? unitColor.base : unitColor.light,
                                    color: isSelectingEnd ? "white" : unitColor.base
                                  }}
                                >
                                  Set End
                                </button>
                              )}
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              {(section.startDate || section.endDate) && (
                                <button
                                  onClick={() => clearSectionDates(unit.unitNumber, section.sectionId)}
                                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded p-1"
                                  title="Clear dates"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Days Off Summary */}
          <div className="mt-4 bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Days Off</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {calendar?.events
                ?.filter((e) => ["holiday", "school_closed"].includes(e.type))
                .sort((a, b) => a.date.localeCompare(b.date))
                .slice(0, 12)
                .map((event) => (
                  <div key={event.date} className="flex items-center gap-1">
                    <span className="text-gray-400">
                      {new Date(event.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <span className="text-gray-600 truncate">{event.name}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right column - Calendar */}
        <div className="w-1/2 p-4 overflow-y-auto bg-gray-100">
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
    </div>
  );
}
