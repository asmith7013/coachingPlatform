'use client'

import { MonthlyGrid } from './MonthlyGrid';
import { DailyCompletion } from '@/hooks/domain/313/useStudentCalendarData';

interface MonthlyCalendarProps {
  dailyCompletions: DailyCompletion[];
  currentMonth?: string; // Not used for navigation, just for potential future enhancements
}

export function MonthlyCalendar({
  dailyCompletions,
  currentMonth: _currentMonth = "2025-07", // Default to July 2025 (unused for now)
}: MonthlyCalendarProps) {
  // Summer session dates - fixed, no navigation needed
  const startDate = "2025-06-30";
  const endDate = "2025-08-07";
  
  return (
    <div className="flex h-full flex-col">
      {/* Simple header without navigation */}
      <header className="flex items-center justify-center border-b border-gray-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Summer Session Progress (Mon-Thu)
        </h3>
      </header>
      
      {/* Calendar grid */}
      <MonthlyGrid 
        dailyCompletions={dailyCompletions}
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  );
}