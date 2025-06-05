import { TeacherScheduleZodSchema, type TeacherSchedule, BellSchedule } from '@zod-schema/schedule/schedule';

import { createReferenceTransformer, createArrayTransformer } from '@transformers/factories/reference-factory';
import { createTransformationService } from '@transformers/core/transformation-service';
import { ensureBaseDocumentCompatibility } from '@transformers/utils/response-utils';
import { getDayTypeFromDate, getDayNameFromDate } from '@transformers/utils/date-utils';

import type { NYCPSStaff } from '@zod-schema/core/staff';
import type { CalendarEvent } from '@composed-components/calendar/weekly';

// IMPORT: Use existing domain utilities instead of recreating
import { type PeriodTime } from '@domain-types/schedule';

/**
 * Simple transformation service - validation only
 */
export const scheduleTransformationService = createTransformationService({
  entityType: 'teacherSchedules',
  schema: ensureBaseDocumentCompatibility<TeacherSchedule>(TeacherScheduleZodSchema),
  handleDates: true,
  errorContext: 'ScheduleTransforms'
});

/**
 * Staff name mapping using existing reference transformer pattern
 */
export const staffToNameMap = createReferenceTransformer<NYCPSStaff, { _id: string; value: string; label: string }>(
  (staff) => staff.staffName,
  (staff) => ({ _id: staff._id, value: staff._id, label: staff.staffName })
);

export const staffCollectionToNameMap = createArrayTransformer<NYCPSStaff, { _id: string; value: string; label: string }>(
  staffToNameMap
);

/**
 * Create staff lookup map from staff collection
 * Simple utility - no complex logic
 */
export function createStaffLookupMap(staffData?: NYCPSStaff[]): Map<string, string> {
  if (!staffData) return new Map();
  
  const mappedStaff = staffCollectionToNameMap(staffData);
  return new Map(mappedStaff.map(staff => [staff._id, staff.label]));
}

/**
 * Validate and transform schedules - simple validation only
 * Business logic moved to components
 */
export function validateSchedules(schedules: unknown[]): TeacherSchedule[] {
  return scheduleTransformationService.transform(schedules);
}

// NEW: Bell Schedule Event Types (extend existing CalendarEvent)
export interface BellScheduleEvent extends CalendarEvent {
  period: number
  columnIndex: number
  startPosition: 'start' | 'middle'
  totalDuration: number
}

export interface EventSegment extends CalendarEvent {
  period: number
  segmentDuration: number
  position: 'start' | 'middle' | 'full'
  isFirst: boolean
  isLast: boolean
  parentEventId: string
  originalEvent: BellScheduleEvent
}


/**
 * Transform schedule data to BellScheduleEvents
 * USES: New direct period matching instead of time-based matching
 */
export function transformSchedulesToBellScheduleEvents(
  schedules: TeacherSchedule[],
  staffMap: Map<string, string>,
  date: string,
  periodTimes: PeriodTime[] = []
): BellScheduleEvent[] {
  const allEvents: BellScheduleEvent[] = [];
  const dayType = getDayTypeFromDate(date);
  
  // Find bell schedule from period times (reconstruct for compatibility)
  const bellSchedule: Partial<BellSchedule> = {
    _id: 'temp',
    school: '',
    bellScheduleType: 'uniform',
    classSchedule: periodTimes.map(pt => ({
      periodNum: pt.period,
      startTime: pt.start,
      endTime: pt.end,
      dayType: 'uniform'
    }))
  };
  
  // Transform each teacher schedule using direct period matching
  for (let i = 0; i < schedules.length; i++) {
    const teacherSchedule = schedules[i];
    // console.log(`\n--- Processing teacher ${i}: ${teacherSchedule.teacher} ---`);
    
    const events = transformScheduleToEvents(
      teacherSchedule,
      bellSchedule as BellSchedule,
      date,
      dayType
    );
    
    console.log(`Teacher ${i} generated ${events.length} events`);
    
    // ✅ FIX: Use array index directly instead of staffMap lookup
    const columnIndex = i; // This ensures headers match data order
    // console.log(`Teacher ${i} column index: ${columnIndex} (FIXED - using array index)`);
    
    const eventsWithColumnIndex = events.map(event => ({
      ...event,
      columnIndex,
      day: 0 // Day is not used in bell schedule grid
    }));
    
    allEvents.push(...eventsWithColumnIndex);
  }
  
  return allEvents;
}

/**
 * Calculate event segments for rendering a multi-period event
 * Pure transformation logic - no side effects
 */
export function calculateEventSegments(event: BellScheduleEvent): EventSegment[] {
  const segments: EventSegment[] = []
  let remainingDuration = event.totalDuration
  let currentPeriod = event.period
  
  // First segment
  if (event.startPosition === 'middle') {
    const firstDuration = Math.min(0.5, remainingDuration)
    segments.push({
      ...event,
      period: currentPeriod,
      segmentDuration: firstDuration,
      position: 'middle',
      isFirst: true,
      isLast: remainingDuration <= 0.5,
      parentEventId: event.id,
      originalEvent: event
    })
    remainingDuration -= firstDuration
    currentPeriod++
  } else {
    const firstDuration = Math.min(1, remainingDuration)
    segments.push({
      ...event,
      period: currentPeriod,
      segmentDuration: firstDuration,
      position: firstDuration === 1 ? 'full' : 'start',
      isFirst: true,
      isLast: remainingDuration <= 1,
      parentEventId: event.id,
      originalEvent: event
    })
    remainingDuration -= firstDuration
    currentPeriod++
  }
  
  // Middle segments (full periods)
  while (remainingDuration >= 1) {
    segments.push({
      ...event,
      id: `${event.id}-segment-${currentPeriod}`,
      period: currentPeriod,
      segmentDuration: 1,
      position: 'full',
      isFirst: false,
      isLast: remainingDuration === 1,
      parentEventId: event.id,
      originalEvent: event
    })
    remainingDuration -= 1
    currentPeriod++
  }
  
  // Final partial segment
  if (remainingDuration > 0) {
    segments.push({
      ...event,
      id: `${event.id}-segment-${currentPeriod}`,
      period: currentPeriod,
      segmentDuration: remainingDuration,
      position: 'start',
      isFirst: false,
      isLast: true,
      parentEventId: event.id,
      originalEvent: event
    })
  }
  
  // Update isLast for actual final segment
  if (segments.length > 0) {
    segments.forEach(segment => segment.isLast = false)
    segments[segments.length - 1].isLast = true
  }
  
  return segments
}

/**
 * Get segments for specific period/column
 * Simple filtering and transformation
 */
export function getSegmentsForPeriod(
  events: BellScheduleEvent[], 
  period: number, 
  columnIndex: number
): EventSegment[] {
  return events
    .filter(event => event.columnIndex === columnIndex)
    .flatMap(calculateEventSegments)
    .filter(segment => segment.period === period)
}

/**
 * Validate event span fits within available periods
 * Simple validation logic
 */
export function validateEventSpan(
  event: BellScheduleEvent, 
  totalPeriods: number
): boolean {
  const segments = calculateEventSegments(event)
  const endPeriod = segments.length > 0 ? segments[segments.length - 1].period : event.period
  return endPeriod <= totalPeriods
}

/**
 * Transform teacher schedule to calendar events using direct period matching
 * NO time-based matching - uses explicit period numbers
 */
export function transformScheduleToEvents(
  teacherSchedule: TeacherSchedule,
  bellSchedule: BellSchedule,
  targetDate: string,
  dayType: string = 'uniform'
): BellScheduleEvent[] {
  const events: BellScheduleEvent[] = [];
  
  // Get the actual day name from the date for matching
  const dayName = getDayNameFromDate(targetDate);
  
  // Find the day schedule for the target date using day name, not day type
  const daySchedule = teacherSchedule.scheduleByDay.find(
    day => day.day.toLowerCase() === dayName.toLowerCase()
  );
  
  if (!daySchedule?.periods?.length) {
    return events;
  }
  
  // Transform each period to a calendar event
  for (const period of daySchedule.periods) {
    // Direct period number matching - find bell schedule entry with same period number
    const bellPeriod = bellSchedule.classSchedule.find(
      classItem => classItem.periodNum === period.periodNum && 
                   (classItem.dayType === dayType || classItem.dayType === 'uniform')
    );
    
    if (bellPeriod) {
      const event = {
        id: `${teacherSchedule._id}-${period.periodNum}`,
        title: period.className,
        startTime: bellPeriod.startTime,
        duration: calculateDuration(bellPeriod.startTime, bellPeriod.endTime),
        color: getSubjectColor(period.className),
        day: 0, // Will be set by calling component
        period: period.periodNum, // Direct assignment from period
        columnIndex: 0, // Will be set by calling component
        startPosition: 'start' as const,
        totalDuration: 1
      };
      
      events.push(event);
      // console.log(`    Period ${period.periodNum}: ${period.className} → ${bellPeriod.startTime}`);
    }
  }
  
  return events.sort((a, b) => a.period - b.period);
}

/**
 * Calculate duration in 5-minute increments from start and end times
 */
export function calculateDuration(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  return Math.round((endMinutes - startMinutes) / 5); // Convert to 5-minute increments
}

// /**
//  * Get period timing information from bell schedule
//  */
// export function getPeriodTiming(
//   periodNum: number, 
//   bellSchedule: BellSchedule,
//   dayType: string = 'uniform'
// ): { start: string; end: string } | null {
//   const bellPeriod = bellSchedule.classSchedule.find(
//     item => item.periodNum === periodNum && 
//             (item.dayType === dayType || item.dayType === 'uniform')
//   );
  
//   return bellPeriod ? {
//     start: bellPeriod.startTime,
//     end: bellPeriod.endTime
//   } : null;
// }

/**
 * Get all period times for a day from bell schedule
 */
export function getAllPeriodTimes(
  bellSchedule: BellSchedule,
  dayType: string = 'uniform'
): Array<{ period: number; start: string; end: string }> {
  return bellSchedule.classSchedule
    .filter(item => item.dayType === dayType || item.dayType === 'uniform')
    .map(item => ({
      period: item.periodNum,
      start: item.startTime,
      end: item.endTime
    }))
    .sort((a, b) => a.period - b.period);
}

/**
 * Subject color mapping (moved from schedule-calendar-utils.ts)
 */
export function getSubjectColor(className: string): CalendarEvent['color'] {
  const SUBJECT_COLORS = {
    'math': 'blue',
    'english': 'blue', 
    'ela': 'blue',
    'science': 'blue',
    'history': 'blue',
    'social': 'blue',
    'prep': 'gray',
    'lunch': 'pink', 
    'meeting': 'pink',
    'sped': 'purple'
  } as const;
  
  const lowerClassName = className.toLowerCase();
  for (const [subject, color] of Object.entries(SUBJECT_COLORS)) {
    if (lowerClassName.includes(subject)) return color;
  }
  
  return 'blue'; // Default to blue
} 