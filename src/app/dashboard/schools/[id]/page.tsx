import { Suspense } from 'react';
import { SchoolDetailView } from '@components/domain/schools/SchoolDetailView';
import { Spinner } from '@components/core/feedback/Spinner';

interface SchoolDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SchoolDetailPage({ params }: SchoolDetailPageProps) {
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<Spinner />}>
        <SchoolDetailView schoolId={id} />
      </Suspense>
    </div>
  );
} 