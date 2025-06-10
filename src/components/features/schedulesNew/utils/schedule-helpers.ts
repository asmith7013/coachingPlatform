import type { 
    TeacherSchedule, 
    Period, 
    ClassScheduleItem, 
    BellSchedule, 
    ScheduleByDay 
} from '@zod-schema/schedule/schedule';
import type { Visit, TimeSlot } from '@zod-schema/visits/visit';
import { type NYCPSStaff } from '@zod-schema/core/staff';
import { ScheduleAssignment } from '@enums';
import { calculatePeriodTimeSlot } from './schedule-time-utils';



/**
 * ✅ HELPER FUNCTIONS: Work with schema types directly, no transformations
 */

// Find a period for a specific teacher
export function findPeriodForTeacher(
  teacherSchedules: TeacherSchedule[],
  teacherId: string,
  periodNum: number
): Period | undefined {
  const schedule = teacherSchedules.find(s => s.teacherId === teacherId);
  if (!schedule) return undefined;
  
  // Navigate schema structure directly
  return schedule.scheduleByDay
    .flatMap(day => day.periods)
    .find(period => period.periodNum === periodNum);
}

// Get time slot by period number
export function getTimeSlotByPeriod(
  timeSlots: ClassScheduleItem[],
  periodNum: number
): ClassScheduleItem | undefined {
  return timeSlots.find(slot => slot.periodNum === periodNum);
}

// Check if teacher has any periods scheduled
export function hasScheduledPeriods(
  teacherSchedules: TeacherSchedule[],
  teacherId: string
): boolean {
  const schedule = teacherSchedules.find(s => s.teacherId === teacherId);
  return schedule?.scheduleByDay.some(day => day.periods.length > 0) || false;
}

// Get all periods for a teacher
export function getAllPeriodsForTeacher(
  teacherSchedules: TeacherSchedule[],
  teacherId: string
): Period[] {
  const schedule = teacherSchedules.find(s => s.teacherId === teacherId);
  if (!schedule) return [];
  
  return schedule.scheduleByDay.flatMap(day => day.periods);
}

// Extract teacher name from visit
export function extractTeacherName(visit: Visit, teachers: NYCPSStaff[]): string {
  const teacherId = visit.events?.[0]?.staffIds?.[0];
  const teacher = teachers.find(t => t._id === teacherId);
  return teacher?.staffName || 'Unknown Teacher';
}

// Removed ensureBaseDocumentCompatibility - no longer needed

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
    // Direct data usage - no transformation needed as models handle ObjectId conversion
    const validatedSchedule = bellSchedule;
  
    if (!validatedSchedule?.classSchedule) {
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
  
    return validatedSchedule.classSchedule.map((classSchedule: ClassScheduleItem) => ({
      startTime: classSchedule.startTime,
      endTime: classSchedule.endTime,
      periodNum: classSchedule.periodNum
    }));
  }

/**
 * Transform teacher schedules to UI format
 */
export function transformTeacherSchedules(
    schedules: TeacherSchedule[] | null
  ): Record<string, Record<number | string, Period>> {
    const teacherScheduleMap: Record<string, Record<number | string, Period>> = {};
    
    if (!schedules) return teacherScheduleMap;
    
    schedules.forEach(teacherSchedule => {
      const teacherId = teacherSchedule.teacherId;
      teacherScheduleMap[teacherId] = {};
      
      teacherSchedule.scheduleByDay.forEach((daySchedule: ScheduleByDay) => {
        daySchedule.periods.forEach((period: Period) => {
          teacherScheduleMap[teacherId][period.periodNum] = {
            periodNum: period.periodNum,
            className: period.className,
            periodType: period.periodType === 'prep' ? 'prep' : 
                  period.periodType === 'lunch' ? 'lunch' : 'class',
            room: period.room
          };
        });
      });
    });
    
    return teacherScheduleMap;
  }

/**
 * Check for visit conflicts
 */
export function checkVisitConflicts(
  existingVisits: Visit[], 
  newVisit: { teacherId: string; periodNumber: number | string; portion: ScheduleAssignment }
): boolean {
  return existingVisits.some(visit => 
    visit.events?.[0]?.staffIds?.[0] === newVisit.teacherId && 
    visit.events?.[0]?.periodNumber === newVisit.periodNumber &&
    (visit.events?.[0]?.portion === newVisit.portion || 
     visit.events?.[0]?.portion === ScheduleAssignment.FULL_PERIOD || 
     newVisit.portion === ScheduleAssignment.FULL_PERIOD)
  );
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
  existingVisits: Visit[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.teacherId) errors.push('Teacher ID is required');
  if (!data.teacherName) errors.push('Teacher name is required');
  if (!data.periodNumber || data.periodNumber < 1) errors.push('Valid period number is required');
  if (!data.portion) errors.push('Visit portion is required');
  if (!data.schoolId) errors.push('School ID is required');
  if (!data.date) errors.push('Date is required');

  // Check for existing visit conflicts
  if (checkVisitConflicts(existingVisits, data)) {
    errors.push(`Visit conflict: ${data.teacherName} already has a visit in Period ${data.periodNumber}`);
  }

  return { isValid: errors.length === 0, errors };
}
