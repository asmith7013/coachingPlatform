import { CalendarDay } from './CalendarDay';
import { DailyCompletion } from '@/hooks/domain/313/useStudentCalendarData';

interface MonthlyGridProps {
  dailyCompletions: DailyCompletion[];
  startDate: string; // "2025-06-30"
  endDate: string;   // "2025-08-07"
}

interface CalendarDayData {
  date: string;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function MonthlyGrid({ dailyCompletions, startDate, endDate }: MonthlyGridProps) {
  const allDays = generateCalendarDays(startDate, endDate);
  const completionsMap = new Map(dailyCompletions.map(comp => [comp.date, comp]));
  
  // Filter to only show Mon-Thu (1-4, where Sunday = 0)
  const weekdaysOnly = allDays.filter(day => {
    const date = new Date(day.date + 'T00:00:00'); // Force local timezone
    const dayOfWeek = date.getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 4; // Monday(1) through Thursday(4)
  });
  
  return (
    <div className="bg-gray-200 text-xs text-gray-700 lg:flex-auto">
      {/* Day headers - only show Mon-Thu */}
      <div className="grid grid-cols-4 gap-px border-b border-gray-300 bg-gray-200 text-center text-xs font-semibold text-gray-700">
        <div className="bg-white py-2">Mon</div>
        <div className="bg-white py-2">Tue</div>
        <div className="bg-white py-2">Wed</div>
        <div className="bg-white py-2">Thu</div>
      </div>
      
      {/* Calendar grid - 4 columns instead of 7 */}
      <div className="grid grid-cols-4 gap-px bg-gray-200">
        {weekdaysOnly.map((day) => (
          <CalendarDay
            key={day.date}
            date={day.date}
            isCurrentMonth={day.isCurrentMonth}
            isToday={day.isToday}
            completions={completionsMap.get(day.date) || null}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Generate calendar days for the summer session period
 * Includes padding days to fill complete weeks
 */
function generateCalendarDays(startDate: string, endDate: string): CalendarDayData[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
  // Find the start of the week containing startDate
  const startOfWeek = new Date(start);
  startOfWeek.setDate(start.getDate() - start.getDay()); // Go back to Sunday
  
  // Find the end of the week containing endDate  
  const endOfWeek = new Date(end);
  endOfWeek.setDate(end.getDate() + (6 - end.getDay())); // Go forward to Saturday
  
  const days: CalendarDayData[] = [];
  const current = new Date(startOfWeek);
  
  while (current <= endOfWeek) {
    const dateString = current.toISOString().split('T')[0];
    const currentDate = new Date(current);
    
    days.push({
      date: dateString,
      isCurrentMonth: currentDate >= start && currentDate <= end,
      isToday: dateString === todayString
    });
    
    current.setDate(current.getDate() + 1);
  }
  
  return days;
} 