import { useQuery } from '@tanstack/react-query';
import { useAuthenticatedUser } from '@hooks/auth/useAuthenticatedUser';
import { handleClientError } from '@error';
import { isValidObjectId } from '@data-processing/validation/mongoose-validation';

/**
 * Hook to fetch the authenticated user's staff profile
 * Uses React Query for data fetching with proper caching
 * Gracefully handles missing or invalid staff IDs
 */
export function useUserStaff() {
  const { metadata, isSignedIn } = useAuthenticatedUser();
  
  // Validate staff ID format before using it
  const hasValidStaffId = metadata.staffId ? isValidObjectId(metadata.staffId) : false;
  
  // Determine if we should fetch staff data
  // Only fetch if user is signed in AND has valid staffId and staffType
  const enabled = isSignedIn && Boolean(metadata.staffId) && Boolean(metadata.staffType) && hasValidStaffId;
  
  // Determine the correct API endpoint based on staff type
  const apiEndpoint = (() => {
    if (!metadata.staffId || !metadata.staffType || !hasValidStaffId) return null;
    return `/api/staff/${metadata.staffId}?type=${metadata.staffType}`;
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
        
        // Handle 404 gracefully - staff member doesn't exist
        if (response.status === 404) {
          console.warn(`Staff member not found: ${metadata.staffId}. This may indicate outdated user metadata.`);
          return null;
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch staff data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Handle empty or invalid response
        if (!data?.data) {
          console.warn('Staff API returned empty data');
          return null;
        }
        
        // Return data directly - API already handles sanitization
        return data;
      } catch (error) {
        // Log the error but don't throw - let React Query handle it
        console.error('Error fetching staff data:', error);
        throw error instanceof Error
          ? error
          : new Error(handleClientError(error, 'Staff Fetch'));
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (staff not found)
      if (error instanceof Error && error.message.includes('404')) {
        return false;
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
  });
  
  return {
    staff: data?.data || null,
    error: isError ? error : null,
    isLoading,
    staffType: metadata.staffType,
    isNYCPSStaff: metadata.staffType === 'nycps',
    isTeachingLabStaff: metadata.staffType === 'teachinglab',
    hasStaffProfile: Boolean(data?.data),
    staffNotFound: isError && error instanceof Error && error.message.includes('404'),
    hasValidStaffId, // New field to track ObjectId validity
    refetch,
  };
}

// Export default for consistency
export default useUserStaff; 