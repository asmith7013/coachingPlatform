import React from 'react';
import { TodaysVisitProvider } from './context/TodaysVisitContext';
import { VisitOverviewCard } from './components/VisitOverviewCard';
import { FocusAndGoalsCard } from './components/FocusAndGoalsCard';
import { MetricsToMeasureCard } from './components/MetricsToMeasureCard';
import { ScheduleDisplayCard } from './components/ScheduleDisplayCard';

interface TodaysVisitDashboardProps {
  coachId?: string;
  schoolId?: string;
  className?: string;
}

export function TodaysVisitDashboard({ 
  coachId, 
  schoolId, 
  className = '' 
}: TodaysVisitDashboardProps) {
  return (
    <TodaysVisitProvider coachId={coachId} schoolId={schoolId}>
      <div className={`space-y-6 ${className}`}>
        <VisitOverviewCard />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FocusAndGoalsCard />
          <MetricsToMeasureCard />
        </div>
        <ScheduleDisplayCard />
      </div>
    </TodaysVisitProvider>
  );
} 