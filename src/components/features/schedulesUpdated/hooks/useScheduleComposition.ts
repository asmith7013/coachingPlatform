import { useMemo } from 'react';
import { logError } from '@error/core/logging';
import { createScheduleDataErrorContext } from '../utils/schedule-error-utils';
import { useSchools } from '@/hooks/domain/useSchools';
import { useNYCPSStaffList } from '@/hooks/domain/staff/useNYCPSStaff';
import { useBellSchedules, useTeacherSchedules, useVisitSchedules } from '@/hooks/domain/schedules';
import { useVisits } from '@/hooks/domain/useVisits';
import type { BellSchedule, TeacherSchedule, VisitSchedule } from '@zod-schema/schedules/schedule-documents';
import type { Visit } from '@zod-schema/visits/visit';
import type { NYCPSStaff } from '@zod-schema/core/staff';
import type { School } from '@zod-schema/core/school';

export interface UseScheduleCompositionProps {
  schoolId: string;
  date: string;
  mode?: 'create' | 'edit';
  visitId?: string;
}

export interface ScheduleCompositionData {
  school?: School;
  teachers: NYCPSStaff[];
  bellSchedule?: BellSchedule;
  teacherSchedules: TeacherSchedule[];
  visitSchedules: VisitSchedule[];
  visits: Visit[];
  isLoading: boolean;
  error: unknown;
}

/**
 * Pure data composition hook with error handling
 * Delegates entirely to domain hooks following established patterns
 */
export function useScheduleComposition({ 
  schoolId, 
  date, 
  mode = 'create', 
  visitId 
}: UseScheduleCompositionProps): ScheduleCompositionData {
  // Domain hook delegation only
  const school = useSchools.byId(schoolId);
  const staff = useNYCPSStaffList({ 
    filters: { schoolIds: schoolId },
    limit: 100
  });
  
  const bellSchedules = useBellSchedules.list({ 
    filters: { schoolId } 
  });
  const teacherSchedules = useTeacherSchedules.list({ 
    filters: { schoolId } 
  });
  const visitSchedules = useVisitSchedules.list({ 
    filters: { schoolId, date } 
  });
  
  const visits = useVisits.list({
    filters: { schoolId, date },
    enabled: mode === 'create'
  });
  const editVisit = useVisits.byId(visitId || '', { 
    enabled: mode === 'edit' && !!visitId
  });

  // Error logging for data quality issues
  const compositionData = useMemo(() => {
    const errorContext = createScheduleDataErrorContext('composition', schoolId, date, { mode, visitId });
    
    // Log data quality warnings
    if (!school.data && !school.isLoading && !school.error) {
      logError(
        new Error('School data not found'), 
        { ...errorContext, severity: 'warning', operation: 'schoolDataCheck' }
      );
    }
    
    if (staff.items?.length === 0 && !staff.isLoading && !staff.error) {
      logError(
        new Error('No staff found for school'), 
        { ...errorContext, severity: 'warning', operation: 'staffDataCheck' }
      );
    }

    if (bellSchedules.items?.length === 0 && !bellSchedules.isLoading && !bellSchedules.error) {
      logError(
        new Error('No bell schedule found for school'), 
        { ...errorContext, severity: 'warning', operation: 'bellScheduleCheck' }
      );
    }

    return {
      // Schema types directly - no transformations
      school: school.data,
      teachers: staff.items || [],
      bellSchedule: bellSchedules.items?.[0],
      teacherSchedules: teacherSchedules.items || [],
      visitSchedules: visitSchedules.items || [],
      
      // Visit coordination
      visits: mode === 'edit' && editVisit.data 
        ? [editVisit.data] 
        : visits.items || [],
      
      // Standard loading/error composition
      isLoading: school.isLoading || staff.isLoading || bellSchedules.isLoading || 
                 teacherSchedules.isLoading || visitSchedules.isLoading ||
                 (mode === 'create' && visits.isLoading) ||
                 (mode === 'edit' && editVisit.isLoading),
                 
      error: school.error || staff.error || bellSchedules.error || 
             teacherSchedules.error || visitSchedules.error ||
             (mode === 'create' && visits.error) ||
             (mode === 'edit' && editVisit.error)
    };
  }, [
    school, staff, bellSchedules, teacherSchedules, visitSchedules, 
    visits, editVisit, mode, schoolId, date, visitId
  ]);

  return compositionData;
} 