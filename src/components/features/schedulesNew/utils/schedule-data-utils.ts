import { calculatePeriodTimeSlot } from './schedule-time-utils';

import { TeacherSchedule, BellSchedule, Period } from '@zod-schema/schedule/schedule';
import { PlannedVisit, TimeSlot } from '@zod-schema/visits/planned-visit';
import { ClassScheduleItem, BellScheduleZodSchema, ScheduleByDay } from '@zod-schema/schedule/schedule';

// Import transformer system for enhanced validation and ID handling
// import { getEntityId } from '@transformers/utils/entity-utils';
import { transformSingleItem } from '@transformers/core/unified-transformer';
import { type NYCPSStaff } from '@zod-schema/core/staff';

import type { ScheduleAssignmentType } from '@zod-schema/visits/planned-visit';
import { ensureBaseDocumentCompatibility } from '@/lib/schema/zod-schema/base-schemas';

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
    // If we have a potential MongoDB document, try to transform it
    let validatedSchedule = bellSchedule;
    if (bellSchedule && typeof bellSchedule === 'object' && '_id' in bellSchedule) {
      const compatibleSchema = ensureBaseDocumentCompatibility<BellSchedule>(BellScheduleZodSchema);
      validatedSchedule = transformSingleItem<BellSchedule>(bellSchedule, {
        schema: compatibleSchema,
        handleDates: true,
        errorContext: 'BellScheduleTransformation'
      }) || bellSchedule;
    }
  
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
      const teacherId = teacherSchedule.teacher;
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
  existingVisits: PlannedVisit[], 
  newVisit: { teacherId: string; periodNumber: number | string; portion: ScheduleAssignmentType }
): boolean {
  return existingVisits.some(visit => 
    visit.teacherId === newVisit.teacherId && 
    visit.periodNumber === newVisit.periodNumber &&
    (visit.portion === newVisit.portion || 
     visit.portion === 'full_period' || 
     newVisit.portion === 'full_period')
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
    portion: ScheduleAssignmentType;
    schoolId: string;
    date: string;
  },
  existingVisits: PlannedVisit[]
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