import type { 
    TeacherSchedule, 
    BellSchedule
} from '@zod-schema/schedule/schedule';
import type { Visit, TimeSlot } from '@zod-schema/visits/visit';
import { type NYCPSStaff } from '@zod-schema/core/staff';
import { ScheduleAssignment } from '@enums';
import { calculatePeriodTimeSlot } from './schedule-time-utils';

/**
 * ✅ HELPER FUNCTIONS: Work with schema types directly, no transformations
 */

// Find an assignment for a specific teacher and period
export function findAssignmentForTeacher(
  teacherSchedules: TeacherSchedule[],
  teacherId: string,
  periodNum: number
) {
  const schedule = teacherSchedules.find(s => s.teacherId === teacherId);
  if (!schedule) return undefined;
  return schedule.assignments.find(a => a.periodNumber === periodNum);
}

// Find a period for a specific teacher (alias for findAssignmentForTeacher)
export function findPeriodForTeacher(
  teacherSchedules: TeacherSchedule[],
  teacherId: string,
  periodNum: number
) {
  return findAssignmentForTeacher(teacherSchedules, teacherId, periodNum);
}

// Get time block by period number
export function getTimeBlockByPeriod(
  timeBlocks: BellSchedule['timeBlocks'],
  periodNum: number
) {
  return timeBlocks.find(block => block.periodNumber === periodNum);
}

// Check if teacher has any assignments scheduled
export function hasScheduledAssignments(
  teacherSchedules: TeacherSchedule[],
  teacherId: string
): boolean {
  const schedule = teacherSchedules.find(s => s.teacherId === teacherId);
  return (schedule?.assignments?.length ?? 0) > 0;
}

// Get all assignments for a teacher
export function getAllAssignmentsForTeacher(
  teacherSchedules: TeacherSchedule[],
  teacherId: string
) {
  const schedule = teacherSchedules.find(s => s.teacherId === teacherId);
  if (!schedule) return [];
  return schedule.assignments;
}

// Extract teacher name from visit
export function extractTeacherName(_visit: Visit, _teachers: NYCPSStaff[]): string {
  // No events on Visit; use visitScheduleId to look up events if needed
  // Placeholder: return unknown
  return 'Unknown Teacher';
}

/**
 * Transform staff data to Teacher interface for UI display
 * Enhanced with transformer system for validation when possible
 */
export function transformStaffToTeachers(staff: NYCPSStaff[]): NYCPSStaff[] {
    // Just return the staff directly - no transformation needed
    return staff;
  }

/**
 * Generate time slots from bell schedule data
 * Enhanced with defensive programming and validation
 */
export function generateTimeSlotsFromBellSchedule(bellSchedule: BellSchedule | null): TimeSlot[] {
    if (!bellSchedule?.timeBlocks) {
      // Default time slots if no bell schedule - using proper TimeSlot schema
      return [
        { startTime: '08:00', endTime: '08:45', periodNum: 1 },
        { startTime: '08:45', endTime: '09:30', periodNum: 2 },
        { startTime: '09:30', endTime: '10:15', periodNum: 3 },
        { startTime: '10:15', endTime: '11:00', periodNum: 4 },
        { startTime: '11:00', endTime: '11:50', periodNum: 5 },
        { startTime: '11:50', endTime: '12:30', periodNum: 6 } // Lunch period
      ];
    }
    return bellSchedule.timeBlocks.map((block) => ({
      startTime: block.startTime,
      endTime: block.endTime,
      periodNum: block.periodNumber
    }));
  }

/**
 * Transform teacher schedules to UI format
 */
export function transformTeacherSchedules(
    schedules: TeacherSchedule[] | null
  ): Record<string, Record<number | string, ReturnType<typeof findAssignmentForTeacher>>> {
    const teacherScheduleMap: Record<string, Record<number | string, ReturnType<typeof findAssignmentForTeacher>>> = {};
    if (!schedules) return teacherScheduleMap;
    schedules.forEach(teacherSchedule => {
      const teacherId = teacherSchedule.teacherId;
      teacherScheduleMap[teacherId] = {};
      teacherSchedule.assignments.forEach((assignment) => {
        teacherScheduleMap[teacherId][assignment.periodNumber] = assignment;
      });
    });
    return teacherScheduleMap;
  }

/**
 * Check for visit conflicts
 */
export function checkVisitConflicts(
  _existingVisits: Visit[], 
  _newVisit: { teacherId: string; periodNumber: number | string; portion: ScheduleAssignment }
): boolean {
  // No events on Visit; conflict logic must be implemented with VisitSchedule/events if needed
  return false;
}

/**
 * Get time slot for a period number with fallback calculation
 */
export function getTimeSlotForPeriod(
  timeSlots: TimeSlot[], 
  periodNumber: number | string
): { startTime: string; endTime: string } {
  const timeSlot = timeSlots.find(slot => slot.periodNum === periodNumber);
  if (timeSlot) {
    return {
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime
    };
  }
  // Use time utility for fallback calculation
  return calculatePeriodTimeSlot(periodNumber);
}

/**
 * Validate visit data before scheduling
 */
export function validateVisitData(
  data: {
    teacherId: string;
    teacherName: string;
    periodNumber: number;
    portion: ScheduleAssignment;
    schoolId: string;
    date: string;
  },
  _existingVisits: Visit[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.teacherId) errors.push('Teacher ID is required');
  if (!data.teacherName) errors.push('Teacher name is required');
  if (!data.periodNumber || data.periodNumber < 1) errors.push('Valid period number is required');
  if (!data.portion) errors.push('Visit portion is required');
  if (!data.schoolId) errors.push('School ID is required');
  if (!data.date) errors.push('Date is required');
  // Check for existing visit conflicts (logic must be implemented with VisitSchedule/events)
  return { isValid: errors.length === 0, errors };
}
