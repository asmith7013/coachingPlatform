import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/typography/Heading';
import { Text } from '@/components/ui/typography/Text';
import { cn } from '@/lib/utils';
import type { Lesson } from '@/components/features/imRoutine/LessonDetailView';
import { NoRoutineCard } from '@/components/features/imRoutine/NoRoutineCard';
import { RoutineBadge } from '@/components/features/imRoutine/RoutineBadge';

export function renderKHLesson(
  lesson: Lesson,
  selectedRoutines: string[],
  isSelected: boolean,
  curriculum: 'ILC' | 'Kendall Hunt'
) {
  const hasSelected = lesson.activities.some((activity) =>
    activity.routines.some((r) => selectedRoutines.includes(r.trim()))
  );

  if (!hasSelected) {
    return <NoRoutineCard lessonNumber={lesson.lessonNumber} />;
  }

  return (
    <Card
      className={cn(
        'transition-all duration-150',
        isSelected ? 'border-4 border-primary' : 'border-2 border-muted',
        'bg-background'
      )}
    >
      <Heading
        level="h3"
        className="mb-4"
      >
        Lesson {lesson.lessonNumber}
      </Heading>

      <div className="space-y-4">
        {lesson.activities.map((activity, i) => {
          const hasSelectedRoutines = activity.routines.some(r => selectedRoutines.includes(r));
          if (!hasSelectedRoutines) return null;

          return (
            <div key={i} className="space-y-2">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <Text size="lg" className="font-bold text-text">
                    {activity.activityNumber === 'Warm Up'
                      ? 'Warm Up'
                      : `Activity ${activity.activityNumber}`}
                    {activity.isWarmUp && (
                      <></>
                      // <span className="ml-2 text-[10px] bg-primary text-white px-2 py-0.5 rounded">
                      //   Warm Up
                      // </span>
                    )}
                  </Text>
                  {activity.activityTitle && (
                    <Text size="sm" className="text-text">
                      {activity.activityTitle}
                    </Text>
                  )}
                </div>
              </div>
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