import { Card } from '@/components/composed/cards/Card';
import { Heading } from '@/components/core/typography/Heading';
import { cn } from '@ui/utils/formatters';
import type { Lesson } from '@/components/domain/imRoutine/LessonDetailView';
import { NoRoutineCard } from '@/components/domain/imRoutine/NoRoutineCard';
import { RoutineBadge } from '@/components/domain/imRoutine/RoutineBadge';

// Define activity type to avoid implicit any
interface Activity {
  routines: string[];
  name?: string;
  description?: string;
  customProperties?: Record<string, unknown>;
}

export function renderILCLesson(
  lesson: Lesson,
  selectedRoutines: string[],
  isSelected: boolean,
  curriculum: 'ILC' | 'Kendall Hunt'
) {
  // Get unique routines across all activities
  const routines = Array.from(
    new Set(lesson.activities.flatMap((act: Activity) => act.routines))
  ).filter((r: string) => selectedRoutines.includes(r.trim()));

  const hasRoutines = routines.length > 0;

  if (!hasRoutines) {
    return <NoRoutineCard lessonNumber={lesson.lessonNumber} />;
  }

  const cardClasses = cn(
    'transition-all duration-150',
    isSelected ? 'border-4 border-primary' : 'border-2 border-muted',
    'bg-background'
  );

  return (
    <Card className={cardClasses}>
      <Heading
        level="h3"
        className="mb-2"
      >
        Lesson {lesson.lessonNumber}
      </Heading>

      <div className="space-y-4">
        {lesson.activities.map((activity: Activity, i: number) => {
          const hasSelectedRoutines = activity.routines.some((r: string) => selectedRoutines.includes(r));
          if (!hasSelectedRoutines) return null;

          return (
            <div key={i} className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {activity.routines
                  .filter((routine: string) => selectedRoutines.includes(routine))
                  .map((routine: string, i: number) => (
                    <RoutineBadge
                      key={i}
                      routine={routine}
                      grade={lesson.grade}
                      unit={lesson.unit}
                      curriculum={curriculum}
                    />
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
} 