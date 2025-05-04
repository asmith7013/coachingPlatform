import { Suspense } from 'react';
import MondayVisitsImportClient from './MondayVisitsImportClient';
import { PageHeader } from '@/components/composed/layouts/PageHeader';

export default function MondayVisitImportPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Suspense fallback={
        <div className="py-6">
          <PageHeader
            title="Loading Import Data"
            subtitle="Please wait while we prepare your import"
          />
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
            <p className="mt-4">Loading import data...</p>
          </div>
        </div>
      }>
        <MondayVisitsImportClient />
      </Suspense>
    </div>
  );
} 