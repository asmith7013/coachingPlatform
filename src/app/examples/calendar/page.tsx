'use client';

import { useState, useMemo } from 'react';
import { visitData, cycleData } from './constants';
import { getCalendarDays, isSameMonth, parseISO, findCycleForDate } from './utils';
import { Visit, CycleInfo, CalendarViewProps } from './types';
import CalendarGridView from './CalendarGridView';
import TableView from './TableView';
import ListView from './ListView';
import Legend from './Legend';
import Navigation from './Navigation';
import ViewToggle from './ViewToggle';

const CoachingCalendar = ({ visits = visitData, cycles = cycleData }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'table' | 'list'>('calendar');
  
  // Get the current month's days
  const monthDays = useMemo(() => {
    return getCalendarDays(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate]);
  
  // Filter visits for the current month
  const currentMonthVisits = useMemo(() => {
    return visits.filter(visit => {
      const visitDate = parseISO(visit.date);
      return isSameMonth(visitDate, currentDate);
    });
  }, [visits, currentDate]);
  
  // Group visits by date for easy access
  const visitsByDate = useMemo(() => {
    const grouped: Record<string, Visit[]> = {};
    visits.forEach(visit => {
      const dateKey = visit.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(visit);
    });
    return grouped;
  }, [visits]);
  
  // Check if a given date has cycle dates
  const getCycleInfo = (dateObj: Date): CycleInfo | null => {
    const result = findCycleForDate(dateObj, cycles);
    if (result) {
      return { name: result.cycleName, label: result.cycleDate.label };
    }
    return null;
  };

  // Navigation functions
  const prevMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-blue-700">Coaching Calendar</h1>
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>
        
        {/* Only show navigation controls for calendar and table views */}
        {viewMode !== 'list' && (
          <Navigation 
            currentDate={currentDate}
            prevMonth={prevMonth}
            nextMonth={nextMonth}
            setCurrentDate={setCurrentDate}
          />
        )}
      </div>
      
      {viewMode === 'calendar' ? (
        <CalendarGridView 
          monthDays={monthDays}
          visitsByDate={visitsByDate}
          getCycleInfo={getCycleInfo}
        />
      ) : viewMode === 'table' ? (
        <TableView visits={currentMonthVisits} />
      ) : (
        <ListView 
          visits={visits}
          cycles={cycles}
        />
      )}
      
      <Legend />
    </div>
  );
};

export default function CalendarPage() {
  return <CoachingCalendar />;
} 