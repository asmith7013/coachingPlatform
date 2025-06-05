import { Suspense } from 'react';
import { SingleSchool } from '@/components/domain/schools/singleSchool/SingleSchool';
import { Spinner } from '@core-components/feedback/Spinner';
import { getSchoolIdFromSlug } from '@actions/schools/schools';
import { notFound } from 'next/navigation';

interface SingleSchoolPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SingleSchoolPage({ params }: SingleSchoolPageProps) {
  const { slug } = await params;
  
  // Convert slug to ID server-side (happens once per page load)
  const schoolId = await getSchoolIdFromSlug(slug);
  
  if (!schoolId) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<Spinner />}>
        <SingleSchool schoolId={schoolId} />
      </Suspense>
    </div>
  );
} 