'use client';

import React from 'react';
import { VisitScheduleTestPage } from '@/components/features/schedulesTest';

export default function VisitScheduleTestPageRoute() {
  // Test data from requirements
  const schoolId = "6839fce009387410c1960dde"; // City Island
  const date = "2024-01-15"; // Monday for testing

  return (
    <div className="min-h-screen bg-gray-50">
      <VisitScheduleTestPage 
        schoolId={schoolId}
        date={date}
      />
    </div>
  );
}
