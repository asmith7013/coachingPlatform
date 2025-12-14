import React from "react";
import { CalendarDay } from "./CalendarDay";
import type { DailyVelocityStats } from "@/app/actions/scm/velocity/velocity";

interface MonthCalendarProps {
  monthDate: Date;
  sectionId: string;
  getVelocityForDate: (sectionId: string, dateStr: string) => DailyVelocityStats | null;
  isDayOff: (date: Date) => boolean;
  isWeekend: (date: Date) => boolean;
  showRampUps: boolean;
}

export function MonthCalendar({
  monthDate,
  sectionId,
  getVelocityForDate,
  isDayOff,
  isWeekend,
  showRampUps,
}: MonthCalendarProps) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Calculate padding for Monday start (getDay() returns 0=Sun, 1=Mon, ..., 6=Sat)
  const firstDayOfWeek = firstDay.getDay();
  const startPadding = firstDayOfWeek === 0 ? 4 : firstDayOfWeek - 1; // Mon=0, Tue=1, ..., Fri=4

  const totalDays = lastDay.getDate();

  const days: (Date | null)[] = [];
  for (let i = 0; i < startPadding; i++) days.push(null);
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month, d);
    const dayOfWeek = date.getDay();
    // Skip Saturday (6) and Sunday (0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      days.push(date);
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">
        {monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </h3>
      <div className="grid grid-cols-5 gap-1">
        {["M", "T", "W", "T", "F"].map((day, idx) => (
          <div key={`${day}-${idx}`} className="text-center text-sm font-medium text-gray-400 py-1">
            {day}
          </div>
        ))}
        {days.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} className="h-20" />;

          const dateStr = date.toISOString().split("T")[0];
          const stats = getVelocityForDate(sectionId, dateStr);

          return (
            <CalendarDay
              key={date.toISOString()}
              date={date}
              stats={stats}
              isWeekend={isWeekend(date)}
              isDayOff={isDayOff(date)}
              showRampUps={showRampUps}
            />
          );
        })}
      </div>
    </div>
  );
}
