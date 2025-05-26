import { CoachingLog } from "@zod-schema/visits/coaching-log";

/**
 * Determines if a coaching log has micro PL
 * @returns Always a boolean value
 */
export function hasMicroPL(log: CoachingLog): boolean {
  if (!log.microPLTopic || !log.microPLDuration) {
    return false;
  }
  return log.microPLDuration > 0;
}


/**
 * Determines if a coaching log has modeling
 * @returns Always a boolean value
 */
export function hasModel(log: CoachingLog): boolean {
  if (!log.modelTopic || !log.modelDuration) {
    return false;
  }
  return log.modelDuration > 0;
}

/**
 * Gets the total duration in minutes
 */
export function getTotalDurationMinutes(log: CoachingLog): number {
  return log.totalDuration === 'Full day - 6 hours' ? 360 : 180;
}

/**
 * Gets a summary of coaching activities
 */
export function getCoachingActivitySummary(log: CoachingLog): string {
  const activities = [];
  
  if (log.microPLTopic) activities.push('Micro PL');
  if (log.modelTopic) activities.push('Modeling');
  if (log.adminMeet) activities.push('Admin Meeting');
  
  return activities.length ? activities.join(', ') : 'No specific activities recorded';
}

/**
 * Gets a color class based on coaching log touchpoint
 */
export function getTouchpointColorClass(log: CoachingLog): string {
  const touchpoint = log.solvesTouchpoint.toLowerCase();
  
  if (touchpoint.includes('teacher support')) return 'bg-blue-100 text-blue-800';
  if (touchpoint.includes('leader support')) return 'bg-purple-100 text-purple-800';
  return 'bg-indigo-100 text-indigo-800';
}

/**
 * Calculates the time spent on specific activities
 */
export function getActivityDurations(log: CoachingLog): { 
  microPL: number, 
  modeling: number, 
  admin: number, 
  total: number 
} {
  return {
    microPL: log.microPLDuration || 0,
    modeling: log.modelDuration || 0,
    admin: log.adminMeetDuration || 0,
    total: (log.microPLDuration || 0) + (log.modelDuration || 0) + (log.adminMeetDuration || 0)
  };
}