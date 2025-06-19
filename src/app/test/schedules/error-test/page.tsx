'use client';

import { ScheduleBuilderContainer } from '@/components/features/schedulesComponents/ScheduleBuilderContainer';

/**
 * Test page to verify error handling implementation for schedulesComponents
 */
export default function ScheduleErrorTestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Schedule Components Error Handling Test</h1>
      
      <div className="space-y-8">
        {/* Test with valid schoolId */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Valid School ID Test</h2>
          <ScheduleBuilderContainer 
            schoolId="validSchoolId123" 
            date="2024-01-15"
          />
        </div>
        
        {/* Test with invalid schoolId to trigger error */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Invalid School ID Test (Should trigger error boundary)</h2>
          <ScheduleBuilderContainer 
            schoolId="invalidSchoolId" 
            date="2024-01-15"
          />
        </div>
      </div>
    </div>
  );
} 