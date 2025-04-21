import { Card } from '@/components/composed/cards/Card';
import { Heading } from '@/components/core/typography/Heading';
import { cn } from '@/lib/utils';
import type { Lesson } from '@/components/features/imRoutine/LessonDetailView';
import { NoRoutineCard } from '@/components/features/imRoutine/NoRoutineCard';
import { RoutineBadge } from '@/components/features/imRoutine/RoutineBadge';

export function renderILCLesson(
  lesson: Lesson,
  selectedRoutines: string[],
  isSelected: boolean,
  curriculum: 'ILC' | 'Kendall Hunt'
) {
  // Get unique routines across all activities
  const routines = Array.from(
    new Set(lesson.activities.flatMap((act) => act.routines))
  ).filter((r) => selectedRoutines.includes(r.trim()));

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
        {lesson.activities.map((activity, i) => {
          const hasSelectedRoutines = activity.routines.some(r => selectedRoutines.includes(r));
          if (!hasSelectedRoutines) return null;

          return (
            <div key={i} className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {activity.routines
                  .filter(routine => selectedRoutines.includes(routine))
                  .map((routine, i) => (
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