import { useAuthenticatedUser } from './useAuthenticatedUser';
import { useMemo } from 'react';
import type { Permission } from '@core-types/auth';

export interface CoachData {
  isCoach: boolean;
  coachId: string | null;
  staffRecord: Record<string, unknown> | null; // Could be populated via additional hook if needed
  canCreateVisits: boolean;
  canScheduleVisits: boolean;
  assignedSchools: string[];
  staffType: 'nycps' | 'teachinglab' | null;
  hasStaffConnection: boolean;
}

/**
 * Hook for coach-specific authentication and capabilities
 * Leverages the existing useAuthenticatedUser hook and permission system
 */
export function useCoachData(): CoachData {
  const { metadata, hasPermission, hasRole } = useAuthenticatedUser();
  
  const coachData = useMemo<CoachData>(() => {
    // Check if user has coaching permissions or roles
    const isCoach = hasRole('Coach') || 
                   hasPermission('visit.create' as Permission) || 
                   hasPermission('coaching.log.create' as Permission);
    
    const hasStaffConnection = !!(metadata.staffId && metadata.staffType);
    
    return {
      isCoach,
      coachId: metadata.staffId || null,
      staffRecord: null, // Could be populated via additional hook if needed
      canCreateVisits: hasPermission('visit.create' as Permission),
      canScheduleVisits: hasPermission('schedule.create' as Permission),
      assignedSchools: metadata.schoolIds || [],
      staffType: metadata.staffType || null,
      hasStaffConnection
    };
  }, [metadata, hasPermission, hasRole]);
  
  return coachData;
}

/**
 * Simple hook to get just the coach ID for visit creation
 * Useful for components that only need the ID
 */
export function useCoachId(): string | null {
  const { metadata } = useAuthenticatedUser();
  return metadata.staffId || null;
} 