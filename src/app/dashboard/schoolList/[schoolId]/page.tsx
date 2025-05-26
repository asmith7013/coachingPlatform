import { queryKeys } from '@query/core/keys';
import { fetchSchoolById } from '@actions/schools/schools';
import { fetchNYCPSStaff } from '@actions/staff/operations';
import { prefetchQueries } from '@query/server/prefetch';
import { DashboardPage } from '@components/composed/layouts/DashboardPage';
import SchoolDetailClient from './client';

export default async function SchoolDetailPage({ params }: { params: { schoolId: string } }) {
  // Use the prefetchQueries utility to create a dehydrated state
  const dehydratedState = await prefetchQueries([
    {
      // Prefetch the school details
      queryKey: [...queryKeys.entities.detail('schools', params.schoolId)],
      queryFn: () => fetchSchoolById(params.schoolId)
    },
    {
      // Prefetch related staff data
      queryKey: [...queryKeys.entities.list('nycps-staff', { 
        filters: { schools: [params.schoolId] } 
      })],
      queryFn: () => fetchNYCPSStaff({ 
        page: 1,
        limit: 50,
        sortBy: 'staffName',
        sortOrder: 'asc',
        filters: { schools: [params.schoolId] }
      })
    }
  ]);
  
  // Get the school name for the page title (optional)
  let title = "School Details";
  try {
    const schoolData = await fetchSchoolById(params.schoolId);
    if (schoolData.success && schoolData.items && schoolData.items.length > 0) {
      title = schoolData.items[0].schoolName || "School Details";
    }
  } catch (error) {
    // Fall back to default title if fetch fails
    console.error("Error fetching school name:", error);
  }
  
  return (
    <DashboardPage
      title={title}
      description="View and manage school details"
      dehydratedState={dehydratedState}
    >
      <SchoolDetailClient schoolId={params.schoolId} />
    </DashboardPage>
  );
}