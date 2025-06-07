import { TeacherScheduleZodSchema, type TeacherSchedule, BellSchedule } from '@zod-schema/schedule/schedule';

import { createReferenceTransformer, createArrayTransformer } from '@transformers/factories/reference-factory';
import { createTransformationService } from '@transformers/core/transformation-service';
import { ensureBaseDocumentCompatibility } from '@transformers/utils/response-utils';
import { getDayTypeFromDate, getDayNameFromDate } from '@transformers/utils/date-utils';
import { calculateDuration } from '@/components/features/scheduleBuilder/utils/visit-time-calculator';
import { getSubjectColor } from '@/components/features/scheduleBuilder/utils/visit-time-calculator';

import type { NYCPSStaff } from '@zod-schema/core/staff';
import type { BellScheduleEvent, EventSegment } from '../types';

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
 * Validate and transform schedules - simple validation only
 * Business logic moved to components
 */
export function validateSchedules(schedules: unknown[]): TeacherSchedule[] {
  return scheduleTransformationService.transform(schedules);
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

