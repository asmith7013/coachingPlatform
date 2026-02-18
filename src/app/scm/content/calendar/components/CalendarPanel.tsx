"use client";

import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Spinner } from "@/components/core/feedback/Spinner";
import type { CalendarEvent } from "@zod-schema/calendar";
import type { SelectionMode } from "../../calendar-old/components";
import type {
  UnitScheduleLocal,
  SectionSchedule,
} from "../../calendar-old/components/types";
import { MonthCalendarV2 } from "./MonthCalendarV2";

interface CalendarPanelProps {
  isLoading: boolean;
  currentMonth: Date;
  prevMonth: () => void;
  nextMonth: () => void;
  selectionMode: SelectionMode;
  selectedUnitIndex: number;
  getScheduleForDate: (dateStr: string) => {
    unitIndex: number;
    sectionIndex: number;
    unit: UnitScheduleLocal;
    section: SectionSchedule;
  } | null;
  getSectionColorIndex: (
    unitIndex: number,
    sectionId: string,
    subsection?: number,
  ) => number;
  getEventsForDate: (date: Date) => CalendarEvent[];
  isDayOff: (date: Date) => boolean;
  isSectionDayOff: (date: Date) => {
    isDayOff: boolean;
    event?: { date: string; name: string; hasMathClass?: boolean };
  };
  isWeekend: (date: Date) => boolean;
  onDateClick: (dateStr: string) => void;
  onSectionDayOffClick: (event: { date: string; name: string }) => void;
  onAddEvent?: (dateStr: string) => void;
}

export function CalendarPanel({
  isLoading,
  currentMonth,
  prevMonth,
  nextMonth,
  selectionMode,
  selectedUnitIndex,
  getScheduleForDate,
  getSectionColorIndex,
  getEventsForDate,
  isDayOff,
  isSectionDayOff,
  isWeekend,
  onDateClick,
  onSectionDayOffClick,
  onAddEvent,
}: CalendarPanelProps) {
  return (
    <div className="w-2/3 p-4 overflow-y-auto bg-gray-100 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100/70 flex items-center justify-center z-10">
          <div className="flex items-center gap-2 text-blue-600">
            <Spinner size="sm" variant="primary" />
            <span className="text-sm font-medium">Updating calendar...</span>
          </div>
        </div>
      )}

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4 bg-white rounded-lg shadow px-4 py-2">
        <button
          onClick={prevMonth}
          className="p-1 hover:bg-gray-100 rounded cursor-pointer"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium">
          {currentMonth.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <button
          onClick={nextMonth}
          className="p-1 hover:bg-gray-100 rounded cursor-pointer"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Calendar months stacked vertically */}
      {[0, 1, 2].map((offset) => {
        const monthDate = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + offset,
          1,
        );
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
            onDateClick={onDateClick}
            onSectionDayOffClick={onSectionDayOffClick}
            onAddEvent={onAddEvent}
          />
        );
      })}
    </div>
  );
}
