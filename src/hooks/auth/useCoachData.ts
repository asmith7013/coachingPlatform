import { useAuthenticatedUser } from './useAuthenticatedUser';
import { useMemo } from 'react';
import type { Permission } from '@core-types/auth';
import { isValidObjectId } from '@data-processing/validation/mongoose-validation';

export interface CoachData {
  isCoach: boolean;
  coachId: string | null;
  staffRecord: Record<string, unknown> | null; // Could be populated via additional hook if needed
  canCreateVisits: boolean;
  canScheduleVisits: boolean;
  assignedSchools: string[];
  staffType: 'nycps' | 'teachinglab' | null;
  hasStaffConnection: boolean;
  hasValidStaffId: boolean; // New field to track ObjectId validity
}

/**
 * Hook for coach-specific authentication and capabilities
 * Leverages the existing useAuthenticatedUser hook and permission system
 * Now includes ObjectId validation to prevent API errors
 */
export function useCoachData(): CoachData {
  const { metadata, hasPermission, hasRole } = useAuthenticatedUser();
  
  const coachData = useMemo<CoachData>(() => {
    // Check if user has coaching permissions or roles
    const isCoach = hasRole('Coach') || 
                   hasPermission('visit.create' as Permission) || 
                   hasPermission('coaching.log.create' as Permission);
    
    // Validate staff ID format before using it
    const hasValidStaffId = metadata.staffId ? isValidObjectId(metadata.staffId) : false;
    
    // Only return staff ID if it's valid
    const coachId = hasValidStaffId ? metadata.staffId! : null;
    
    // Only consider staff connection valid if ID format is correct
    const hasStaffConnection = !!(metadata.staffId && metadata.staffType && hasValidStaffId);
    
    return {
      isCoach,
      coachId, // Will be null if invalid ObjectId
      staffRecord: null, // Could be populated via additional hook if needed
      canCreateVisits: hasPermission('visit.create' as Permission),
      canScheduleVisits: hasPermission('schedule.create' as Permission),
      assignedSchools: metadata.schoolIds || [],
      staffType: metadata.staffType || null,
      hasStaffConnection,
      hasValidStaffId // New field to track validity
    };
  }, [metadata, hasPermission, hasRole]);
  
  return coachData;
}

/**
 * Simple hook to get just the coach ID for visit creation
 * Useful for components that only need the ID
 * Now validates ObjectId format before returning
 */
export function useCoachId(): string | null {
  const { metadata } = useAuthenticatedUser();
  
  if (!metadata.staffId) return null;
  
  // Only return valid ObjectIds
  return isValidObjectId(metadata.staffId) ? metadata.staffId : null;
} 