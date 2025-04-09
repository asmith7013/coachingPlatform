import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/typography/Heading';
import { cn } from '@/lib/utils';
import type { Lesson } from '@/components/features/imRoutine/LessonDetailView';
import { NoRoutineCard } from '@/components/features/imRoutine/NoRoutineCard';

export function renderILCLesson(lesson: Lesson, selectedRoutines: string[]) {
  // Get unique routines across all activities
  const routines = Array.from(
    new Set(lesson.activities.flatMap((act) => act.routines))
  ).filter((r) => selectedRoutines.includes(r.trim()));

  const hasRoutines = routines.length > 0;

  if (!hasRoutines) {
    return <NoRoutineCard lessonNumber={lesson.lessonNumber} />;
  }

  return (
    <Card
      className={cn(
        'transition-all duration-150 border-2',
        'bg-background border-muted'
      )}
    >
      <Heading
        level="h3"
        className="mb-2"
      >
        Lesson {lesson.lessonNumber}
      </Heading>

      <div className="flex flex-wrap gap-2">
        {routines.map((routine, i) => {
          const isMLR = /^MLR\d+/.test(routine);
          return (
            <span
              key={i}
              className={cn(
                'text-[10px] font-medium px-2 py-0.5 rounded',
                isMLR ? 'bg-primary text-white' : 'bg-secondary text-white'
              )}
            >
              {routine}
            </span>
          );
        })}
      </div>
    </Card>
  );
} 