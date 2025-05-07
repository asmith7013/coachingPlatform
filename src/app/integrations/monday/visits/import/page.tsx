'use client';

import { Suspense } from 'react';
import { Spinner } from '@/components/core/feedback/Spinner';
import MondayVisitImportClient from './MondayVisitImportClient';

/**
 * Monday.com Visit Import Completion Page
 * This is the page for completing the import process with any missing fields
 */
export default function ImportPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
          <div className="ml-4">Loading import data...</div>
        </div>
      </div>
    }>
      <MondayVisitImportClient />
    </Suspense>
  );
}
