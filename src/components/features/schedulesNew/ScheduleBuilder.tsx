import React from 'react';
import { ScheduleProvider } from './context';
import { PlanningStatusBar } from './PlanningStatusBar';
import { ScheduleGrid } from './ScheduleGrid';
import { ScheduleLegend } from './ScheduleLegend';
import { SelectionStatusFooter } from './SelectionStatusFooter';

interface ScheduleBuilderProps {
  schoolId: string;
  date: string;
}

export function ScheduleBuilder({ schoolId, date }: ScheduleBuilderProps) {
  return (
    <ScheduleProvider schoolId={schoolId} date={date}>
      <div className="space-y-4">
        {/* Planning Status Bar - shows teacher planning status */}
        <PlanningStatusBar />
        
        {/* Main Schedule Grid */}
        <ScheduleGrid />
        
        {/* Selection Status Footer - shows current selections */}
        <SelectionStatusFooter />
        
        {/* Schedule Legend - explains how to use the interface */}
        <ScheduleLegend />
      </div>
    </ScheduleProvider>
  );
} 