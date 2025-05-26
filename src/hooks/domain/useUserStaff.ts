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
import { createTransformer, ensureBaseDocumentCompatibility } from '@transformers/core/unified-transformer';

// Define types with date objects
export type NYCPSStaffWithDates = WithDateObjects<NYCPSStaff>;
export type TeachingLabStaffWithDates = WithDateObjects<TeachingLabStaff>;
export type StaffWithDates = NYCPSStaffWithDates | TeachingLabStaffWithDates;

// Create transformers for each staff type
const nycpsStaffTransformer = createTransformer<NYCPSStaff, NYCPSStaffWithDates>({
  schema: ensureBaseDocumentCompatibility<NYCPSStaff>(NYCPSStaffZodSchema),
  handleDates: true,
  errorContext: 'NYCPSStaffTransformer'
});

const teachingLabStaffTransformer = createTransformer<TeachingLabStaff, TeachingLabStaffWithDates>({
  schema: ensureBaseDocumentCompatibility<TeachingLabStaff>(TeachingLabStaffZodSchema),
  handleDates: true,
  errorContext: 'TeachingLabStaffTransformer'
});

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