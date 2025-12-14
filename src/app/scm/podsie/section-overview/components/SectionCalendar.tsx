import { useMemo } from "react";
import { Card } from "@/components/composed/cards/Card";
import { Heading } from "@/components/core/typography/Heading";
import { Text } from "@/components/core/typography/Text";
import type { SectionConfig } from "@zod-schema/scm/podsie/section-config";
import type { DailyAttendanceStats } from "@/app/actions/scm/section-overview";
import type { DailyVelocityStats } from "@/app/actions/scm/velocity/velocity";
import { BellScheduleHelpers } from "@zod-schema/scm/podsie/section-config";

interface SectionCalendarProps {
  config: SectionConfig;
  schoolCalendar?: {
    id: string;
    schoolYear: string;
    startDate: string;
    endDate: string;
    events: Array<{
      date: string;
      name: string;
      hasMathClass: boolean;
      description?: string;
      school?: string;
      classSection?: string;
    }>;
  };
  attendanceData: DailyAttendanceStats[];
  velocityData: DailyVelocityStats[];
  currentMonth: number;
  currentYear: number;
}

export function SectionCalendar({
  config,
  schoolCalendar,
  attendanceData,
  velocityData,
  currentMonth,
  currentYear,
}: SectionCalendarProps) {
  // Create maps for quick lookups
  const attendanceByDate = useMemo(() => {
    const map = new Map<string, DailyAttendanceStats>();
    for (const item of attendanceData) {
      map.set(item.date, item);
    }
    return map;
  }, [attendanceData]);

  const velocityByDate = useMemo(() => {
    const map = new Map<string, DailyVelocityStats>();
    for (const item of velocityData) {
      map.set(item.date, item);
    }
    return map;
  }, [velocityData]);

  const daysOffSet = useMemo(() => {
    if (!schoolCalendar) return new Set<string>();
    return new Set(schoolCalendar.events.map((e) => e.date));
  }, [schoolCalendar]);

  // Calculate days for the meeting schedule based on bell schedule
  const meetingDays = useMemo(() => {
    if (!config.bellSchedule) return new Set<number>();
    const days = new Set<number>();
    if (config.bellSchedule.monday && config.bellSchedule.monday.meetingCount > 0) days.add(1);
    if (config.bellSchedule.tuesday && config.bellSchedule.tuesday.meetingCount > 0) days.add(2);
    if (config.bellSchedule.wednesday && config.bellSchedule.wednesday.meetingCount > 0) days.add(3);
    if (config.bellSchedule.thursday && config.bellSchedule.thursday.meetingCount > 0) days.add(4);
    if (config.bellSchedule.friday && config.bellSchedule.friday.meetingCount > 0) days.add(5);
    return days;
  }, [config.bellSchedule]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startPadding; i++) days.push(null);
    for (let d = 1; d <= totalDays; d++) days.push(new Date(currentYear, currentMonth, d));

    return days;
  }, [currentMonth, currentYear]);

  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const isClassDay = (date: Date): boolean => {
    const dayOfWeek = date.getDay();
    return meetingDays.has(dayOfWeek);
  };

  const isDayOff = (date: Date): boolean => {
    const dateStr = date.toISOString().split("T")[0];
    return daysOffSet.has(dateStr);
  };

  const getEventForDate = (date: Date) => {
    if (!schoolCalendar) return null;
    const dateStr = date.toISOString().split("T")[0];
    return schoolCalendar.events.find((e) => e.date === dateStr);
  };

  return (
    <Card>
      <Card.Header>
        <Heading level="h2">Class Calendar</Heading>
        <Text color="muted" textSize="sm">
          {config.classSection} - {config.school} - Grade {config.gradeLevel}
          {config.bellSchedule && (
            <>
              {" • "}
              {BellScheduleHelpers.getTotalWeeklyMeetings(config.bellSchedule)} meetings/week
            </>
          )}
        </Text>
      </Card.Header>

      <Card.Body>
        <div className="space-y-4">
          {/* Month Header */}
          <div className="text-center">
            <Heading level="h3">
              {new Date(currentYear, currentMonth).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </Heading>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((date, idx) => {
              if (!date) {
                return <div key={`empty-${idx}`} className="h-24 bg-gray-50" />;
              }

              const dateStr = date.toISOString().split("T")[0];
              const attendance = attendanceByDate.get(dateStr);
              const velocity = velocityByDate.get(dateStr);
              const weekend = isWeekend(date);
              const dayOff = isDayOff(date);
              const classDay = isClassDay(date);
              const event = getEventForDate(date);

              let bgColor = "bg-white";
              let borderColor = "border-gray-200";

              if (weekend) {
                bgColor = "bg-gray-100";
              } else if (dayOff) {
                bgColor = "bg-red-50";
                borderColor = "border-red-200";
              } else if (!classDay) {
                bgColor = "bg-gray-50";
              }

              return (
                <div
                  key={date.toISOString()}
                  className={`h-24 border ${borderColor} ${bgColor} p-1 rounded-sm flex flex-col`}
                >
                  {/* Date number */}
                  <div className="text-xs font-semibold text-gray-700 mb-1">
                    {date.getDate()}
                  </div>

                  {/* Event info */}
                  {event && (
                    <div className="text-[10px] text-red-600 font-medium mb-1 truncate" title={event.name}>
                      {event.name}
                    </div>
                  )}

                  {/* Attendance stats */}
                  {attendance && !weekend && !dayOff && classDay && (
                    <div className="space-y-0.5 text-[10px]">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Present:</span>
                        <span className="font-semibold text-green-600">{attendance.present}</span>
                      </div>
                      {attendance.late > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Late:</span>
                          <span className="font-semibold text-yellow-600">{attendance.late}</span>
                        </div>
                      )}
                      {attendance.absent > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Absent:</span>
                          <span className="font-semibold text-red-600">{attendance.absent}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Velocity stats */}
                  {velocity && !weekend && !dayOff && classDay && velocity.studentsPresent > 0 && (
                    <div className="mt-auto pt-1 border-t border-gray-200">
                      <div className="text-[10px] flex justify-between items-center">
                        <span className="text-gray-600">Velocity:</span>
                        <span className="font-bold text-blue-600">
                          {velocity.averageVelocity.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <Text textSize="xs" className="font-semibold mb-2">
                  Attendance
                </Text>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-600 rounded"></div>
                    <span>Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-600 rounded"></div>
                    <span>Late</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-600 rounded"></div>
                    <span>Absent</span>
                  </div>
                </div>
              </div>
              <div>
                <Text textSize="xs" className="font-semibold mb-2">
                  Velocity
                </Text>
                <Text textSize="xs" color="muted">
                  Average mastery checks completed per student present that day
                </Text>
              </div>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
