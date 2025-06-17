/**
 * @fileoverview DEPRECATED - This file is deprecated and will be removed.
 * Migration: Use components from @/components/features/schedulesUpdated/ instead
 * @deprecated
 */

import React from 'react';
import { PlanningStatusBar } from './PlanningStatusBar';
import { ScheduleGrid } from './ScheduleGrid';
import { ScheduleLegend } from './ScheduleLegend';
// import { SelectionStatusFooter } from './SelectionStatusFooter';
import { ScheduleProvider } from './context';
import type { ScheduleBuilderProps } from './types';

/**
 * @deprecated Use ScheduleBuilder from @/components/features/schedulesUpdated/ instead.
 * This component will be removed in a future version.
 * Migration: Replace with equivalent component from schedulesUpdated feature.
 */
export function ScheduleBuilder({ 
  schoolId, 
  date, 
  mode = 'create',
  visitId 
}: ScheduleBuilderProps) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('DEPRECATED: ScheduleBuilder from schedulesNew is deprecated. Use schedulesUpdated instead.');
  }
  // ✅ IMPROVEMENT: Context now uses focused hooks internally
  // Components can gradually migrate to use focused hooks directly
  // This eliminates the god object while maintaining backward compatibility
  
  return (
    <ScheduleProvider 
      schoolId={schoolId} 
      date={date}
      mode={mode}
      visitId={visitId}
    >
      <div className="space-y-4">
        {/* Planning Status Bar - shows teacher planning status */}
        <PlanningStatusBar />
        
        {/* Main Schedule Grid */}
        <ScheduleGrid />
        
        {/* Selection Status Footer - shows current selections */}
        {/* <SelectionStatusFooter /> */}
        
        {/* Schedule Legend - explains how to use the interface */}
        <ScheduleLegend />
      </div>
    </ScheduleProvider>
  );
} 