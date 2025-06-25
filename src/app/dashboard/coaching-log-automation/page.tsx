import { Suspense } from 'react';
import { CoachingLogAutomationTool } from './CoachingLogAutomationTool';

// Wrapper component to handle search params
function CoachingLogAutomationWrapper() {
  return <CoachingLogAutomationTool />;
}

export default function CoachingLogAutomationPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Coaching Log Automation</h1>
        <p className="text-gray-600 mb-8">
          Convert visit data to coaching log format and automatically fill the external form.
        </p>
        <Suspense fallback={<div>Loading...</div>}>
          <CoachingLogAutomationWrapper />
        </Suspense>
      </div>
    </div>
  );
} 