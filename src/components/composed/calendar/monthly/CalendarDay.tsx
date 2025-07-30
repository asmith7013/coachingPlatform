import { Badge } from '@/components/core/feedback/Badge';
import { cn } from '@/lib/ui/utils/formatters';
import { DailyCompletion } from '@/hooks/domain/313/useStudentCalendarData';

interface CalendarDayProps {
  date: string; // YYYY-MM-DD format
  isCurrentMonth: boolean;
  isToday: boolean;
  completions: DailyCompletion | null;
}

export function CalendarDay({ 
  date, 
  isCurrentMonth, 
  isToday, 
  completions 
}: CalendarDayProps) {
  const dayNumber = date.split('-').pop()?.replace(/^0/, '');
  const lessons = completions?.lessons || [];
  const displayLessons = lessons.slice(0, 2); // Show max 2 badges
  const remainingCount = Math.max(0, lessons.length - 2);
  
  return (
    <div className={cn(
      "min-h-[80px] bg-white px-2 py-2 relative",
      !isCurrentMonth && "bg-gray-50 text-gray-500"
    )}>
      {/* Day number */}
      <time 
        dateTime={date}
        className={cn(
          "text-sm font-medium",
          isToday && "flex size-6 items-center justify-center rounded-full bg-indigo-600 text-white"
        )}
      >
        {dayNumber}
      </time>
      
      {/* Lesson completion badges */}
      {lessons.length > 0 && (
        <div className="mt-1 space-y-1">
          {displayLessons.map((lesson, index) => (
            <Badge
              key={`${date}-${lesson}-${index}`}
              intent="success"
              size="xs"
              className="block w-full text-center text-xs py-1"
            >
              {lesson}
            </Badge>
          ))}
          
          {remainingCount > 0 && (
            <div className="text-xs text-gray-500 text-center mt-1">
              +{remainingCount} more
            </div>
          )}
        </div>
      )}
    </div>
  );
} 