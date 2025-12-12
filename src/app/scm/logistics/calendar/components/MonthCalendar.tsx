"use client";

import React from "react";
import { UNIT_COLORS, getSectionShade, getSectionBadgeLabel, type UnitScheduleLocal, type SelectionMode } from "./types";
import type { CalendarEvent } from "@zod-schema/calendar";

// Inline SectionBadge - renders a badge with rounded square shape (positioned on left edge of cell)
function SectionBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="absolute left-0 top-1/2 -translate-y-1/2 text-[7px] font-bold leading-none px-1 pr-1.5 py-0.5 rounded-r"
      style={{ backgroundColor: "white", color: color }}
    >
      {label}
    </span>
  );
}

interface ScheduleInfo {
  unitIndex: number;
  sectionIndex: number;
  unit: UnitScheduleLocal;
  section: UnitScheduleLocal["sections"][number];
}

interface SectionDayOffInfo {
  isDayOff: boolean;
  event?: { date: string; name: string; hasMathClass?: boolean };
}

interface MonthCalendarProps {
  monthDate: Date;
  selectionMode: SelectionMode;
  getScheduleForDate: (dateStr: string) => ScheduleInfo | null;
  getEventsForDate: (date: Date) => CalendarEvent[];
  isDayOff: (date: Date) => boolean;
  isSectionDayOff: (date: Date) => SectionDayOffInfo;
  isWeekend: (date: Date) => boolean;
  onDateClick: (dateStr: string) => void;
  onSectionDayOffClick: (event: { date: string; name: string }) => void;
}

export function MonthCalendar({
  monthDate,
  selectionMode,
  getScheduleForDate,
  getEventsForDate,
  isDayOff,
  isSectionDayOff,
  isWeekend,
  onDateClick,
  onSectionDayOffClick,
}: MonthCalendarProps) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const days: (Date | null)[] = [];
  for (let i = 0; i < startPadding; i++) days.push(null);
  for (let d = 1; d <= totalDays; d++) days.push(new Date(year, month, d));

  const isSelecting = selectionMode !== null;

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

          return (
            <CalendarDay
              key={date.toISOString()}
              date={date}
              isSelecting={isSelecting}
              getScheduleForDate={getScheduleForDate}
              getEventsForDate={getEventsForDate}
              isDayOff={isDayOff}
              isSectionDayOff={isSectionDayOff}
              isWeekend={isWeekend}
              onDateClick={onDateClick}
              onSectionDayOffClick={onSectionDayOffClick}
            />
          );
        })}
      </div>
    </div>
  );
}

interface CalendarDayProps {
  date: Date;
  isSelecting: boolean;
  getScheduleForDate: (dateStr: string) => ScheduleInfo | null;
  getEventsForDate: (date: Date) => CalendarEvent[];
  isDayOff: (date: Date) => boolean;
  isSectionDayOff: (date: Date) => SectionDayOffInfo;
  isWeekend: (date: Date) => boolean;
  onDateClick: (dateStr: string) => void;
  onSectionDayOffClick: (event: { date: string; name: string }) => void;
}

function CalendarDay({
  date,
  isSelecting,
  getScheduleForDate,
  getEventsForDate,
  isDayOff,
  isSectionDayOff,
  isWeekend,
  onDateClick,
  onSectionDayOffClick,
}: CalendarDayProps) {
  const dateStr = date.toISOString().split("T")[0];
  const events = getEventsForDate(date);
  const dayOff = isDayOff(date);
  const weekend = isWeekend(date);
  const scheduleInfo = getScheduleForDate(dateStr);
  const sectionDayOffInfo = isSectionDayOff(date);

  let bgColor = "bg-white";
  let textColor = "text-gray-900";
  let customBgStyle: React.CSSProperties = {};
  let cursor = isSelecting && !weekend && !dayOff ? "cursor-pointer" : "";

  if (weekend) {
    bgColor = "bg-gray-100";
    textColor = "text-gray-400";
  } else if (sectionDayOffInfo.isDayOff) {
    // Different colors based on whether math class happens
    if (sectionDayOffInfo.event?.hasMathClass) {
      // Math class happens - dark gray
      bgColor = "bg-gray-500";
      textColor = "text-white";
    } else {
      // No math class - light amber
      bgColor = "bg-amber-100";
      textColor = "text-amber-700";
    }
    cursor = "cursor-pointer";
  } else if (dayOff) {
    bgColor = "bg-gray-100";
    textColor = "text-gray-400";
  } else if (scheduleInfo) {
    const unitColor = UNIT_COLORS[scheduleInfo.unitIndex % UNIT_COLORS.length];
    const shade = getSectionShade(scheduleInfo.sectionIndex);
    customBgStyle = { backgroundColor: unitColor[shade] };
    bgColor = "";
    if (shade === "medium" || shade === "dark") {
      textColor = "text-white";
    }
  }

  const handleClick = () => {
    if (sectionDayOffInfo.isDayOff && sectionDayOffInfo.event) {
      onSectionDayOffClick({ date: sectionDayOffInfo.event.date, name: sectionDayOffInfo.event.name });
    } else if (!weekend && !dayOff && isSelecting) {
      onDateClick(dateStr);
    }
  };

  const title = weekend
    ? "Weekend"
    : sectionDayOffInfo.isDayOff && sectionDayOffInfo.event
    ? `${sectionDayOffInfo.event.name} (click to delete)`
    : dayOff
    ? events.map((e) => e.name).join(", ") || "Day Off"
    : scheduleInfo
    ? `${scheduleInfo.unit.unitName} - ${scheduleInfo.section.name}`
    : "";

  return (
    <div
      onClick={handleClick}
      className={`h-7 rounded text-xs flex items-center justify-center relative ${bgColor} ${textColor} ${cursor} ${
        isSelecting && !weekend && !dayOff ? "hover:ring-2 hover:ring-blue-400" : ""
      } ${sectionDayOffInfo.isDayOff ? (sectionDayOffInfo.event?.hasMathClass ? "hover:ring-2 hover:ring-gray-400" : "hover:ring-2 hover:ring-amber-400") : ""}`}
      style={customBgStyle}
      title={title}
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
}
