import { useSchools } from '@/hooks/domain/useSchools';
import { useNYCPSStaffList } from '@/hooks/domain/staff/useNYCPSStaff';
import { useTeacherSchedules } from '@/hooks/domain/schedules/useTeacherSchedules';
import { useBellSchedules } from '@/hooks/domain/schedules/useBellSchedules';
import { logError } from '@error/core/logging';
import { createScheduleDataErrorContext } from '../utils/schedule-error-utils';

/**
 * Hook for schedule feature daily school data composition
 * 
 * Feature-specific version that follows established domain hook patterns.
 * Minimal composition only - transformation logic handled in consuming components.
 * 
 * @param schoolId - The school ID to fetch data for
 * @param date - The date for the schedule view (for future filtering)
 */
export function useScheduleDailyView(schoolId: string, date: string) {
  // Use existing entity hooks exactly as they're designed
  const school = useSchools.byId(schoolId);
  
  const staff = useNYCPSStaffList({ 
    filters: { schoolIds: schoolId },
    limit: 100 // Reasonable limit for school staff
  });
  
  // Use the entity hook for teacher schedules
  const schedules = useTeacherSchedules.list({
    filters: { schoolId: schoolId }
  });
  
  // Bell schedule data following same pattern
  const bellSchedules = useBellSchedules.list({
    filters: { schoolId: schoolId }
  });

  // Log data quality issues for debugging
  if (process.env.NODE_ENV === 'development') {
    if (!school.isLoading && !school.error && !school.data) {
      logError(
        new Error('School data not found'),
        createScheduleDataErrorContext('dailyView', schoolId, date, {
          operation: 'schoolDataCheck',
          severity: 'warning'
        })
      );
    }

    if (!staff.isLoading && !staff.error && (!staff.items || staff.items.length === 0)) {
      logError(
        new Error('No staff data found'),
        createScheduleDataErrorContext('dailyView', schoolId, date, {
          operation: 'staffDataCheck',
          severity: 'warning'
        })
      );
    }

    if (!schedules.isLoading && !schedules.error && (!schedules.items || schedules.items.length === 0)) {
      logError(
        new Error('No teacher schedules found'),
        createScheduleDataErrorContext('dailyView', schoolId, date, {
          operation: 'schedulesDataCheck',
          severity: 'info'
        })
      );
    }

    if (!bellSchedules.isLoading && !bellSchedules.error && (!bellSchedules.items || bellSchedules.items.length === 0)) {
      logError(
        new Error('No bell schedule found'),
        createScheduleDataErrorContext('dailyView', schoolId, date, {
          operation: 'bellScheduleDataCheck',
          severity: 'warning'
        })
      );
    }
  }
  
  // Minimal composition - no custom logic
  return {
    // Raw data following established patterns
    school: school.data,
    staff: staff.items || [],
    schedules: schedules.items || [],
    
    // Bell schedule data
    bellSchedule: bellSchedules.items?.[0], // Usually one bell schedule per school
    
    // Standard loading/error composition from other domain hooks
    isLoading: school.isLoading || staff.isLoading || schedules.isLoading || bellSchedules.isLoading,
    error: school.error || staff.error || schedules.error || bellSchedules.error,
    
    // Meta information
    date,
    schoolId,
    
    // Simple computed properties (no complex logic)
    hasData: !!school.data && (staff.items?.length || 0) > 0 && (schedules.items?.length || 0) > 0 && !!bellSchedules.items?.[0],
    teacherCount: schedules.items?.length || 0,
    staffCount: staff.items?.length || 0
  };
}

/**
 * Type for the return value of useScheduleDailyView
 * Following established typing patterns
 */
export type ScheduleDailyViewData = ReturnType<typeof useScheduleDailyView>; 