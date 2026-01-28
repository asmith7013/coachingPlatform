"use client";

import React from "react";
import { getSectionBadgeLabel, type UnitScheduleLocal, type SelectionMode } from "../../calendar-old/components/types";
import type { CalendarEvent } from "@zod-schema/calendar";
import { Tooltip } from "@/components/core/feedback/Tooltip";

// Same section colors as SimplifiedUnitView
const SECTION_COLORS = [
  { base: "#2563EB", light: "#DBEAFE" }, // blue
  { base: "#059669", light: "#D1FAE5" }, // green
  { base: "#D97706", light: "#FEF3C7" }, // amber
  { base: "#7C3AED", light: "#EDE9FE" }, // purple
  { base: "#DB2777", light: "#FCE7F3" }, // pink
  { base: "#0891B2", light: "#CFFAFE" }, // cyan
  { base: "#EA580C", light: "#FFEDD5" }, // orange
  { base: "#0D9488", light: "#CCFBF1" }, // teal
];

// Non-selected unit: light gray
const INACTIVE_COLOR = { base: "#9CA3AF", light: "#F3F4F6" };

function SectionBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="text-[7px] font-bold leading-none px-1 py-0.5 rounded"
      style={{ backgroundColor: "white", color }}
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

interface MonthCalendarV2Props {
  monthDate: Date;
  selectionMode: SelectionMode;
  selectedUnitIndex: number;
  getScheduleForDate: (dateStr: string) => ScheduleInfo | null;
  getSectionColorIndex: (unitIndex: number, sectionId: string, subsection?: number) => number;
  getEventsForDate: (date: Date) => CalendarEvent[];
  isDayOff: (date: Date) => boolean;
  isSectionDayOff: (date: Date) => SectionDayOffInfo;
  isWeekend: (date: Date) => boolean;
  onDateClick: (dateStr: string) => void;
  onSectionDayOffClick: (event: { date: string; name: string }) => void;
}

export function MonthCalendarV2({
  monthDate,
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
}: MonthCalendarV2Props) {
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

          // Determine color based on whether this date belongs to the selected unit
          let dateColor: { base: string; light: string } | null = null;

          if (weekend) {
            bgColor = "bg-gray-100";
            textColor = "text-gray-400";
          } else if (sectionDayOffInfo.isDayOff) {
            if (sectionDayOffInfo.event?.hasMathClass) {
              bgColor = "bg-gray-500";
              textColor = "text-white";
            } else {
              bgColor = "bg-gray-100";
              textColor = "text-gray-500";
            }
            cursor = "cursor-pointer";
          } else if (dayOff) {
            bgColor = "bg-gray-100";
            textColor = "text-gray-400";
          } else if (scheduleInfo) {
            const isSelectedUnit = scheduleInfo.unitIndex === selectedUnitIndex;

            if (isSelectedUnit) {
              // Use section-specific color
              const colorIdx = getSectionColorIndex(scheduleInfo.unitIndex, scheduleInfo.section.sectionId, scheduleInfo.section.subsection);
              dateColor = SECTION_COLORS[colorIdx % SECTION_COLORS.length];
              customBgStyle = { backgroundColor: dateColor.light };
              bgColor = "";
            } else {
              // Non-selected unit: light gray background
              dateColor = INACTIVE_COLOR;
              customBgStyle = { backgroundColor: INACTIVE_COLOR.light };
              bgColor = "";
              textColor = "text-gray-400";
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

          const hasSectionEvent = sectionDayOffInfo.isDayOff && sectionDayOffInfo.event;
          const hasScheduleBadge = scheduleInfo && !weekend && !dayOff;
          const isInactiveUnit = hasScheduleBadge && scheduleInfo.unitIndex !== selectedUnitIndex;
          const cellHeight = hasSectionEvent || hasScheduleBadge ? "h-10" : "h-7";

          const badgeColor = dateColor?.base ?? "#9CA3AF";

          return (
            <div
              key={date.toISOString()}
              onClick={handleClick}
              className={`${cellHeight} rounded text-xs flex flex-col items-center justify-start pt-0.5 relative ${bgColor} ${textColor} ${cursor} ${
                isSelecting && !weekend && !dayOff ? "hover:ring-2 hover:ring-blue-400" : ""
              } ${sectionDayOffInfo.isDayOff ? "hover:ring-2 hover:ring-gray-400" : ""}`}
              style={customBgStyle}
              title={title}
            >
              {hasScheduleBadge && (
                <div
                  className="absolute top-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: badgeColor }}
                />
              )}
              <span>{date.getDate()}</span>
              {hasScheduleBadge && !isInactiveUnit && (
                <Tooltip
                  content={
                    scheduleInfo.section.subsection !== undefined
                      ? `Section ${getSectionBadgeLabel(scheduleInfo.section.sectionId)} (Part ${scheduleInfo.section.subsection})`
                      : `Section ${getSectionBadgeLabel(scheduleInfo.section.sectionId)}`
                  }
                  position="bottom"
                >
                  <SectionBadge
                    label={
                      scheduleInfo.section.subsection !== undefined
                        ? `${getSectionBadgeLabel(scheduleInfo.section.sectionId)}.${scheduleInfo.section.subsection}`
                        : getSectionBadgeLabel(scheduleInfo.section.sectionId)
                    }
                    color={badgeColor}
                  />
                </Tooltip>
              )}
              {isInactiveUnit && (
                <span
                  className="text-[7px] font-bold leading-none px-1 py-0.5 rounded"
                  style={{ backgroundColor: "white", color: INACTIVE_COLOR.base }}
                >
                  Unit {scheduleInfo.unit.unitNumber}
                </span>
              )}
              {hasSectionEvent && (
                <span className="text-[8px] leading-tight truncate w-full text-center px-0.5">
                  {sectionDayOffInfo.event!.name}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
