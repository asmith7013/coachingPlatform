import { useSchools } from '@hooks/domain/useSchools';
import { useNYCPSStaffList } from '@hooks/domain/staff/useNYCPSStaff';
import { useTeacherSchedules } from '@hooks/domain/schedule/useTeacherSchedules';
import { useBellSchedules } from '@hooks/domain/schedule/useBellSchedules';

/**
 * Hook for school daily schedule view data composition
 * 
 * Follows established domain hook patterns - minimal composition only.
 * Transformation logic should be handled in components or selectors.
 * 
 * @param schoolId - The school ID to fetch data for
 * @param date - The date for the schedule view (for future filtering)
 * 
 * @example
 * ```typescript
 * const { school, staff, schedules, bellSchedule, isLoading } = useSchoolDailyView('school123', '2025-05-31');
 * 
 * if (isLoading) return <Loading />;
 * 
 * // Transform data in component using existing utilities
 * const calendarEvents = transformToCalendarEvents(schedules, staff, date);
 * ```
 */
export function useSchoolDailyView(schoolId: string, date: string) {
  // Use existing entity hooks exactly as they're designed
  const school = useSchools.byId(schoolId);
  
  const staff = useNYCPSStaffList({ 
    filters: { schools: schoolId },
    limit: 100 // Reasonable limit for school staff
  });
  
  // Use the entity hook that should already exist
  const schedules = useTeacherSchedules.list({
    filters: { school: schoolId }
    // Let the transformation happen in the component or use selectors
  });
  
  // Bell schedule data following same pattern
  const bellSchedules = useBellSchedules.list({
    filters: { school: schoolId }
  });
  
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
 * Type for the return value of useSchoolDailyView
 * Following established typing patterns
 */
export type SchoolDailyViewData = ReturnType<typeof useSchoolDailyView>; 