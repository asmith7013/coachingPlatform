import { useAuthenticatedUser } from '@/hooks/auth/useAuthenticatedUser';
import { useSafeSWR } from '@/hooks/data/useSafeSWR';
import { NYCPSStaff, TeachingLabStaff } from '@/lib/data-schema/zod-schema/core/staff';

type StaffType = NYCPSStaff | TeachingLabStaff;

export function useUserStaff() {
  const { metadata, isSignedIn } = useAuthenticatedUser();
  
  // Determine the correct API endpoint based on staff type
  const apiEndpoint = (() => {
    if (!metadata.staffId || !metadata.staffType) return null;
    
    switch (metadata.staffType) {
      case 'nycps':
        return `/api/staff/${metadata.staffId}`;
      case 'teachinglab':
        return `/api/staff/${metadata.staffId}`;
      default:
        return null;
    }
  })();
  
  const { data, error, isLoading } = useSafeSWR<StaffType>(
    isSignedIn && apiEndpoint ? apiEndpoint : null,
    async () => {
      const response = await fetch(apiEndpoint!);
      if (!response.ok) {
        throw new Error('Failed to fetch staff data');
      }
      return response.json();
    },
    'useUserStaff'
  );
  
  return {
    staff: data,
    error,
    isLoading,
    staffType: metadata.staffType,
    isNYCPSStaff: metadata.staffType === 'nycps',
    isTeachingLabStaff: metadata.staffType === 'teachinglab',
  };
} 