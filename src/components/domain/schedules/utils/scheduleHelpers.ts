import { SchedulePeriodUI, WashingtonTeacher } from '../data/scheduleTypes';
import type { TeacherActivity } from '../data/scheduleTypes';

/**
 * Gets teachers by period and activity
 * @param periodNum - The period number
 * @param activity - The activity type
 * @param teachers - Array of teacher data
 * @returns Array of teachers with the specified activity in the specified period
 */
export const getTeachersByPeriodAndActivity = (
  periodNum: number, 
  activity: TeacherActivity,
  teachers: WashingtonTeacher[]
): WashingtonTeacher[] => {
  // Safety check for undefined or empty teachers array
  if (!teachers || !Array.isArray(teachers) || teachers.length === 0) {
    return [];
  }
  
  try {
    return teachers.filter(teacher => {
      // Check if teacher and scheduleByDay exist
      if (!teacher || !teacher.scheduleByDay || !Array.isArray(teacher.scheduleByDay)) {
        return false;
      }
      
      // Get the uniform day schedule (or first day if no uniform exists)
      const daySchedule = teacher.scheduleByDay.find(day => day.day === 'uniform') || teacher.scheduleByDay[0];
      
      // Check if periods array exists
      if (!daySchedule || !daySchedule.periods || !Array.isArray(daySchedule.periods)) {
        return false;
      }
      
      // Find the period that matches the periodNum
      const periodData = daySchedule.periods.find(p => p.periodNum === periodNum);
      
      // Return true if the period exists and the activity matches
      return periodData && periodData.activity === activity;
    });
  } catch (error) {
    console.error(`Error in getTeachersByPeriodAndActivity for period ${periodNum}, activity ${activity}:`, error);
    return [];
  }
};

/**
 * Generates schedule data from periods for saving
 * @param periods - Array of period data
 * @param selectedSchool - ID of the selected school
 * @returns Partial teacher schedule object
 */
export const generateScheduleData = (periods: SchedulePeriodUI[], selectedSchool: string) => {
  const scheduleByDay = [{
    day: "uniform",
    periods: periods
      .filter(p => p.what || p.who.length > 0)
      .map((p) => ({
        periodNum: p.id,
        className: p.what,
        periodType: "class",
        room: p.roomInfo || ""
      }))
  }];

  return {
    school: selectedSchool,
    scheduleByDay,
    owners: [] as string[]
  };
};

/**
 * Validates the schedule before saving
 * @param periods - Array of period data
 * @param validateTimeFn - Function to validate time strings
 * @returns Boolean indicating if the schedule is valid
 */
export const validateSchedule = (
  periods: SchedulePeriodUI[], 
  validateTimeFn: (time: string) => boolean
): boolean => {
  const incompleteFields = periods
    .filter(p => p.what || p.who.length > 0) // Only check periods with data
    .some(p => 
      !validateTimeFn(p.startTime) || 
      !validateTimeFn(p.endTime) ||
      !p.what ||
      p.who.length === 0
    );
    
  return !incompleteFields;
}; 