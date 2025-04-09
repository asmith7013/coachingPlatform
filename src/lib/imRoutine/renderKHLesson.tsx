import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/typography/Heading';
import { Text } from '@/components/ui/typography/Text';
import { cn } from '@/lib/utils';
import type { Lesson } from '@/components/features/imRoutine/LessonDetailView';
import { NoRoutineCard } from '@/components/features/imRoutine/NoRoutineCard';

export function renderKHLesson(lesson: Lesson, selectedRoutines: string[]) {
  const hasSelected = lesson.activities.some((activity) =>
    activity.routines.some((r) => selectedRoutines.includes(r.trim()))
  );

  if (!hasSelected) {
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
        className="mb-4"
      >
        Lesson {lesson.lessonNumber}
      </Heading>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
        {lesson.activities
          .filter((activity) =>
            activity.routines.some((r) => selectedRoutines.includes(r.trim()))
          )
          .map((activity) => (
            <div key={activity.activityNumber} className="p-4 rounded-lg bg-surface border-2 border-border">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <Text size="lg" className="font-bold text-text">
                    {activity.activityNumber === 'Warm Up'
                      ? 'Warm Up'
                      : `Activity ${activity.activityNumber}`}
                    {activity.isWarmUp && (
                      <span className="ml-2 text-[10px] bg-primary text-white px-2 py-0.5 rounded">
                        Warm Up
                      </span>
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
                  .filter((r) => selectedRoutines.includes(r.trim()))
                  .map((routine, i) => {
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
            </div>
          ))}
      </div>
    </Card>
  );
} 