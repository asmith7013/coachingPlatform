import type {
  TeacherSchedule,
  BellSchedule,
} from "@zod-schema/schedules/schedule-documents";
import type { Staff } from "@zod-schema/core/staff";

/**
 * Get teacher schedule by teacher ID
 * Eliminates duplicate lookup logic across components
 */
export function getTeacherSchedule(
  teacherSchedules: TeacherSchedule[],
  teacherId: string,
): TeacherSchedule | undefined {
  return teacherSchedules.find((schedule) => schedule.teacherId === teacherId);
}

/**
 * Check if bell schedule exists
 * Centralizes validation logic
 */
export function hasBellSchedule(bellSchedule: BellSchedule | null): boolean {
  return bellSchedule !== null;
}

/**
 * Check if staff data exists
 * Consistent validation logic
 */
export function hasStaff(staff: Staff[]): boolean {
  return staff.length > 0;
}

/**
 * Format schedule time range
 * Centralized time formatting utility
 */
export function formatScheduleTime(startTime: string, endTime: string): string {
  return `${startTime} - ${endTime}`;
}

/**
 * Get teacher name by ID
 * Helper to avoid repeated teacher lookup logic
 */
export function getTeacherName(staff: Staff[], teacherId: string): string {
  const teacher = staff.find((t) => t._id === teacherId);
  return teacher ? teacher.staffName : "Unknown Teacher";
}

/**
 * Get teacher display info
 * Combines name and schedule info for display
 */
export function getTeacherDisplayInfo(
  staff: Staff[],
  teacherSchedules: TeacherSchedule[],
  teacherId: string,
) {
  const teacher = staff.find((t) => t._id === teacherId);
  const schedule = getTeacherSchedule(teacherSchedules, teacherId);

  return {
    name: teacher ? teacher.staffName : "Unknown Teacher",
    hasSchedule: !!schedule,
    schedule: schedule || null,
  };
}
