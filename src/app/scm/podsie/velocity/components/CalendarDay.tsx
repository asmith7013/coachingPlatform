import React from "react";
import { UserIcon } from "@heroicons/react/24/outline";
import type { DailyVelocityStats } from "@/app/actions/313/velocity/velocity";

interface CalendarDayProps {
  date: Date;
  stats: DailyVelocityStats | null;
  isWeekend: boolean;
  isDayOff: boolean;
}

export function CalendarDay({ date, stats, isWeekend, isDayOff }: CalendarDayProps) {
  let bgColor = "bg-white";
  let textColor = "text-gray-900";

  if (isWeekend || isDayOff) {
    bgColor = "bg-gray-100";
    textColor = "text-gray-400";
  }

  return (
    <div className={`h-20 rounded ${bgColor} ${textColor} p-1 flex flex-col`}>
      {/* Date number at top */}
      <div className="text-xs font-medium mb-0.5">{date.getDate()}</div>

      {stats && !isWeekend && !isDayOff && (
        <div className="flex-1 flex flex-col justify-between">
          {/* Velocity score and students present */}
          <div className="text-center">
            <div className="text-base font-bold text-blue-600 leading-tight">
              {stats.averageVelocity.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-0.5 text-[9px] text-gray-500 leading-tight">
              <span>{stats.studentsPresent}</span>
              <UserIcon className="h-2.5 w-2.5" />
            </div>
          </div>

          {/* Activity badges at bottom */}
          <div className="flex gap-0.5 flex-wrap justify-center items-end">
            {stats.byLessonType.lessons > 0 && (
              <span className="text-[8px] px-1 py-0.5 bg-blue-500 text-white rounded font-bold leading-none">
                Lesson: {stats.byLessonType.lessons}
              </span>
            )}
            {stats.byLessonType.rampUps > 0 && (
              <span className="text-[8px] px-1 py-0.5 bg-orange-500 text-white rounded font-bold leading-none">
                Ramp Up: {stats.byLessonType.rampUps}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
