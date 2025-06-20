import type { VisitScheduleBlock } from '@zod-schema/schedules/schedule-events';
import type { NYCPSStaff } from '@zod-schema/core/staff';
import { ScheduleAssignmentType } from '@enums';
import type { DropZoneItem } from '../types';

// =====================================
// TEACHER HELPERS - Keep existing logic
// =====================================

/**
 * Gets teacher name by ID with fallback
 * Simplified - just handles the actual use case
 */
export const getTeacherName = (teachers: NYCPSStaff[], teacherId: string): string => {
  return teachers.find(t => t._id === teacherId)?.staffName || 'Unknown Teacher';
};

/**
 * Gets teacher by ID
 * Keep simple - just the direct lookup
 */
export const getTeacherById = (teachers: NYCPSStaff[], teacherId: string): NYCPSStaff | undefined => {
  return teachers.find(t => t._id === teacherId);
};

// =====================================
// VISITSCHEDULEBLOCK HELPERS - Single data structure
// =====================================

/**
 * Core helper - copy isScheduled pattern from VisitScheduleGrid
 */
export const isPortionScheduled = (
  visitBlocks: VisitScheduleBlock[], 
  teacherId: string, 
  periodNumber: number, 
  portion: ScheduleAssignmentType
): boolean => {
  if (!visitBlocks) return false;
  
  return visitBlocks.some(block => 
    block.periodNumber === periodNumber && 
    block.portion === portion &&
    block.staffIds?.includes(teacherId)
  );
};

/**
 * Gets all blocks for a specific period
 */
export const getBlocksForPeriod = (visitBlocks: VisitScheduleBlock[], period: number): VisitScheduleBlock[] => {
  return visitBlocks.filter(block => block.periodNumber === period);
};

/**
 * Gets blocks for a specific teacher and period
 */
export const getBlocksForTeacherPeriod = (
  visitBlocks: VisitScheduleBlock[], 
  teacherId: string, 
  period: number
): VisitScheduleBlock[] => {
  return visitBlocks.filter(block => 
    block.periodNumber === period && 
    block.staffIds?.includes(teacherId)
  );
};

export const hasBlockInPeriod = (visitBlocks: VisitScheduleBlock[], period: number): boolean => {
  return visitBlocks.some(block => block.periodNumber === period);
};

export const hasTeacherBlockInPeriod = (
  visitBlocks: VisitScheduleBlock[], 
  teacherId: string, 
  period: number
): boolean => {
  return visitBlocks.some(block => 
    block.periodNumber === period && 
    block.staffIds?.includes(teacherId)
  );
};

// =====================================
// PLANNING STATUS HELPERS
// =====================================

/**
 * Computes teacher planning status from VisitScheduleBlock data
 */
export const getTeacherPlanningStatus = (visitBlocks: VisitScheduleBlock[], teacherId: string) => {
  let hasObservation = false;
  let hasMeeting = false;
  
  visitBlocks.forEach(block => {
    if (block.staffIds?.includes(teacherId)) {
      if (block.eventType === 'Observation') {
        hasObservation = true;
      } else if (['Debrief', 'Co-Planning', 'PLC'].includes(block.eventType)) {
        hasMeeting = true;
      }
    }
  });
  
  return {
    observation: hasObservation,
    meeting: hasMeeting
  };
};

// =====================================
// EVENT TYPE HELPERS
// =====================================

/**
 * Gets event label from eventType
 */
export const getEventLabel = (eventType: string): string => {
  switch (eventType) {
    case 'Observation':
      return 'Observation';
    case 'Debrief':
      return 'Debrief';
    case 'Co-Planning':
      return 'Co-Planning';
    case 'PLC':
      return 'PLC';
    default:
      return 'Visit';
  }
};

// =====================================
// SCHEDULE PORTION HELPERS
// =====================================

export const getPortionLabel = (portion: ScheduleAssignmentType): string => {
  switch (portion) {
    case 'full_period':
      return 'Full Period';
    case 'first_half':
      return 'First Half';
    case 'second_half':
      return 'Second Half';
    default:
      return 'Unknown';
  }
};

/**
 * Availability checking using VisitScheduleBlock structure
 */
export const isPeriodPortionAvailable = (
  visitBlocks: VisitScheduleBlock[], 
  teacherId: string, 
  period: number, 
  portion: ScheduleAssignmentType
): boolean => {
  // Check if already scheduled
  if (isPortionScheduled(visitBlocks, teacherId, period, portion)) {
    return false;
  }
  
  // Check for full period conflicts
  const hasFullPeriod = isPortionScheduled(
    visitBlocks, 
    teacherId, 
    period, 
    'full_period' as ScheduleAssignmentType
  );
  
  if (hasFullPeriod) return false;
  
  // If requesting full period, check for any existing portions
  if (portion === 'full_period') {
    const hasAnyPortion = visitBlocks.some(block =>
      block.periodNumber === period &&
      block.staffIds?.includes(teacherId)
    );
    return !hasAnyPortion;
  }
  
  return true;
};

// =====================================
// UTILITY FUNCTIONS
// =====================================

/**
 * Create drop zone items from VisitScheduleBlock data
 */
export const createDropZoneItems = (
  visitBlocks: VisitScheduleBlock[], 
  period: number, 
  teachers: NYCPSStaff[]
): DropZoneItem[] => {
  const periodBlocks = getBlocksForPeriod(visitBlocks, period);
  
  return periodBlocks.map((block, index) => ({
    id: `block-${period}-${index}`,
    blockId: `${block.periodNumber}-${block.portion}-${index}`,
    teacherId: block.staffIds?.[0] || 'unknown',
    teacherName: getTeacherName(teachers, block.staffIds?.[0] || 'unknown'),
    portion: block.portion,
    purpose: block.eventType
  }));
};

/**
 * Gets total scheduled blocks count
 */
export const getTotalBlocksCount = (visitBlocks: VisitScheduleBlock[]): number => {
  return visitBlocks.length;
}; 