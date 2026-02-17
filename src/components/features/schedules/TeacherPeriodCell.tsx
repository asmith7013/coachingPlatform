import React from "react";
import { cn } from "@ui/utils/formatters";
import type { TeacherPeriodCellProps } from "./types";
import { getTeacherCellStyle, getEventLabel } from "./utils";
import { getEventStyling } from "./utils/schedule-styling-helpers";
// import { SessionPurposes } from '@/lib/schema/enum/shared-enums';

/**
 * TeacherPeriodCell Component
 *
 * Displays a teacher's schedule for a specific period.
 * Uses VisitScheduleBlock exclusively - no dual-mode support.
 */
export function TeacherPeriodCell({
  teacher: _teacher,
  period,
  timeSlot: _timeSlot,
  visitBlock,
  schedule,
  isSelected = false,
  onClick,
  className,
}: TeacherPeriodCellProps) {
  const periodBlock = schedule?.timeBlocks?.find(
    (block) => block.periodNumber === period,
  );

  // Event styling using visitBlock data
  if (visitBlock) {
    const eventType = visitBlock.eventType;
    const styling = getEventStyling(eventType);

    return (
      <div
        className={cn(
          "h-16 flex flex-col items-center justify-center rounded",
          styling.className,
          className,
        )}
        onClick={onClick}
      >
        <span className="font-medium text-sm">{getEventLabel(eventType)}</span>
        <span className="text-xs opacity-90">Scheduled</span>
      </div>
    );
  }

  // Use direct token classes for all cell types
  const cellClasses = getTeacherCellStyle(
    isSelected,
    periodBlock?.activityType,
  );

  return (
    <div
      className={cn(
        "h-16 rounded cursor-pointer transition-all hover:opacity-80 flex items-center justify-center",
        cellClasses,
        className,
      )}
      onClick={onClick}
    >
      <div className="text-center">
        <div className="font-medium text-sm">
          {periodBlock?.activityType === "lunch"
            ? "LUNCH"
            : periodBlock?.activityType === "prep"
              ? "PREP"
              : periodBlock?.className || "Available"}
        </div>
        {periodBlock?.room &&
          periodBlock?.activityType !== "lunch" &&
          periodBlock?.activityType !== "prep" && (
            <div className="text-xs opacity-75">Room {periodBlock.room}</div>
          )}
        <div className="text-xs">
          {isSelected ? "Selected" : "Click to select"}
        </div>
      </div>
    </div>
  );
}
