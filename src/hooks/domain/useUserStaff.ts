import { useQuery } from '@tanstack/react-query';
import { useAuthenticatedUser } from '@/hooks/auth/useAuthenticatedUser';
import { handleClientError } from '@/lib/error/handle-client-error';
import { WithDateObjects } from '@/lib/types/core/document';
import { transformDateFields } from '@/lib/data-utilities/transformers/date-transformer';
import {
  NYCPSStaff,
  TeachingLabStaff,
} from '@/lib/data-schema/zod-schema/core/staff';

// Define types with date objects
export type NYCPSStaffWithDates = WithDateObjects<NYCPSStaff>;
export type TeachingLabStaffWithDates = WithDateObjects<TeachingLabStaff>;
export type StaffWithDates = NYCPSStaffWithDates | TeachingLabStaffWithDates;

/**
 * Hook to fetch the authenticated user's staff profile
 * Uses React Query for data fetching with proper caching
 */
export function useUserStaff() {
  const { metadata, isSignedIn } = useAuthenticatedUser();
  
  // Determine if we should fetch staff data
  const enabled = isSignedIn && Boolean(metadata.staffId) && Boolean(metadata.staffType);
  
  // Determine the correct API endpoint based on staff type
  const apiEndpoint = (() => {
    if (!metadata.staffId || !metadata.staffType) return null;
    return `/api/staff/${metadata.staffId}`;
  })();
  
  // Query key includes staff type for proper cache management
  const queryKey = [
    'staff',
    'current',
    metadata.staffId,
    metadata.staffType
  ];
  
  // Use React Query for data fetching
  const { data, error, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const response = await fetch(apiEndpoint!);
        if (!response.ok) {
          throw new Error('Failed to fetch staff data');
        }
        const data = await response.json();
        
        // Transform dates from strings to Date objects
        return {
          ...data,
          data: transformDateFields(data.data) as StaffWithDates
        };
      } catch (error) {
        throw error instanceof Error
          ? error
          : new Error(handleClientError(error, 'Staff Fetch'));
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  return {
    staff: data?.data,
    error: isError ? error : null,
    isLoading,
    staffType: metadata.staffType,
    isNYCPSStaff: metadata.staffType === 'nycps',
    isTeachingLabStaff: metadata.staffType === 'teachinglab',
    refetch,
  };
}

// Export default for consistency
export default useUserStaff; 