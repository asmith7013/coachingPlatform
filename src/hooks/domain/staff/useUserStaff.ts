import { useQuery } from '@tanstack/react-query';
import { useAuthenticatedUser } from '@hooks/auth/useAuthenticatedUser';
import { handleClientError } from '@error';
import { WithDateObjects } from '@core-types/document';
import { 
  NYCPSStaff, 
  TeachingLabStaff, 
  NYCPSStaffZodSchema,
  TeachingLabStaffZodSchema 
} from '@zod-schema/core/staff';
import { createTransformer } from '@transformers/core/unified-transformer';
import { ensureBaseDocumentCompatibility } from '@zod-schema/base-schemas';

// Define types with date objects

// Create transformers for each staff type
const nycpsStaffTransformer = createTransformer<NYCPSStaff, WithDateObjects<NYCPSStaff>>({
  schema: ensureBaseDocumentCompatibility<NYCPSStaff>(NYCPSStaffZodSchema),
  handleDates: true,
  errorContext: 'NYCPSStaffTransformer'
});

const teachingLabStaffTransformer = createTransformer<TeachingLabStaff, WithDateObjects<TeachingLabStaff>>({
  schema: ensureBaseDocumentCompatibility<TeachingLabStaff>(TeachingLabStaffZodSchema),
  handleDates: true,
  errorContext: 'TeachingLabStaffTransformer'
});

/**
 * Hook to fetch the authenticated user's staff profile
 * Uses React Query for data fetching with proper caching
 * Gracefully handles missing or invalid staff IDs
 */
export function useUserStaff() {
  const { metadata, isSignedIn } = useAuthenticatedUser();
  
  // Determine if we should fetch staff data
  // Only fetch if user is signed in AND has both staffId and staffType
  const enabled = isSignedIn && Boolean(metadata.staffId) && Boolean(metadata.staffType);
  
  // Determine the correct API endpoint based on staff type
  const apiEndpoint = (() => {
    if (!metadata.staffId || !metadata.staffType) return null;
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
        
        // Transform data based on staff type
        if (metadata.staffType === 'nycps') {
          return {
            ...data,
            data: nycpsStaffTransformer.transformSingle(data.data)
          };
        } else {
          return {
            ...data,
            data: teachingLabStaffTransformer.transformSingle(data.data)
          };
        }
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
    refetch,
  };
}

// Export default for consistency
export default useUserStaff; 