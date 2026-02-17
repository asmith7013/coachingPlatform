import React from "react";
import { Heading } from "@/components/core/typography";
import { cn } from "@ui/utils/formatters";
import type { NYCPSStaff } from "@zod-schema/core/staff";
import type {
  TeacherSchedule,
  BellSchedule,
} from "@zod-schema/schedules/schedule-documents";
import {
  getTeacherSchedule,
  hasBellSchedule,
  hasStaff,
} from "@/lib/schema/reference/schedules";

interface TeacherScheduleGridProps {
  teachers: NYCPSStaff[];
  teacherSchedules: TeacherSchedule[];
  bellSchedule: BellSchedule | null;
  className?: string;
}

/**
 * Displays teacher schedules in a grid/table format
 * Uses domain types directly and shared helper functions
 */
export function TeacherScheduleGrid({
  teachers,
  teacherSchedules,
  bellSchedule,
  className,
}: TeacherScheduleGridProps) {
  // Use shared validation helpers
  if (!hasBellSchedule(bellSchedule)) {
    return (
      <div className={className}>
        <Heading level="h2">Teacher Schedules</Heading>
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded">
          <div className="text-gray-600">
            Bell schedule required to display teacher schedules
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Found {teachers.length} teachers, {teacherSchedules.length} with
            schedules
          </div>
        </div>
      </div>
    );
  }

  if (!hasStaff(teachers)) {
    return (
      <div className={className}>
        <Heading level="h2">Teacher Schedules</Heading>
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded">
          <div className="text-gray-600">No teachers found for this school</div>
        </div>
      </div>
    );
  }

  // At this point, bellSchedule is guaranteed to be non-null due to hasBellSchedule check
  const timeSlots = bellSchedule!.timeBlocks || [];

  /**
   * Renders the content of a teacher period cell
   */
  const renderPeriodCell = (teacher: NYCPSStaff, periodNumber: number) => {
    // Use shared helper function instead of inline logic
    const teacherSchedule = getTeacherSchedule(teacherSchedules, teacher._id);
    const timeBlock = teacherSchedule?.timeBlocks?.find(
      (block) => block.periodNumber === periodNumber,
    );

    const isScheduled = !!timeBlock;

    return (
      <td
        key={periodNumber}
        className={cn(
          "border border-gray-300 p-2 text-center text-sm",
          isScheduled ? "bg-blue-50" : "bg-gray-50",
        )}
      >
        <div
          className={cn(
            "font-medium",
            isScheduled ? "text-blue-900" : "text-gray-500",
          )}
        >
          {timeBlock?.className || "Free"}
        </div>
        {isScheduled && timeBlock && (
          <div className="text-xs text-gray-600 mt-1">
            {timeBlock.room && <div>Room: {timeBlock.room}</div>}
            {timeBlock.subject && <div>{timeBlock.subject}</div>}
            {timeBlock.gradeLevel && <div>Grade {timeBlock.gradeLevel}</div>}
          </div>
        )}
      </td>
    );
  };

  return (
    <div className={className}>
      <Heading level="h2">
        Teacher Schedules ({teachers.length} teachers)
      </Heading>
      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 p-2 text-left">Teacher</th>
              {timeSlots.map((period) => (
                <th
                  key={period.periodNumber}
                  className="border border-gray-300 p-2 text-center min-w-[120px]"
                >
                  P{period.periodNumber}
                  <br />
                  <span className="text-xs text-gray-500">
                    {period.startTime}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher._id}>
                <td className="border border-gray-300 p-2 font-medium">
                  {teacher.staffName}
                </td>
                {timeSlots.map((period) =>
                  renderPeriodCell(teacher, period.periodNumber),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
