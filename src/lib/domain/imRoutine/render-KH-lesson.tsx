import { Card } from '@/components/composed/cards/Card';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { cn } from '@ui/utils/formatters';
import type { Lesson } from '@/components/domain/imRoutine/lessons/LessonView';
import { NoRoutineCard } from '@/components/domain/imRoutine/lessons/NoRoutineCard';
import { RoutineBadge } from '@/components/domain/imRoutine/routines/RoutineBadge';

// Define activity type to avoid implicit any
interface Activity {
  routines: string[];
  name?: string;
  description?: string;
  customProperties?: Record<string, unknown>;
  activityNumber?: string | number;
  activityTitle?: string;
  isWarmUp?: boolean;
}

export function renderKHLesson(
  lesson: Lesson,
  selectedRoutines: string[],
  isSelected: boolean,
  curriculum: 'ILC' | 'Kendall Hunt'
) {
  const hasSelected = lesson.activities.some((activity: Activity) =>
    activity.routines.some((r: string) => selectedRoutines.includes(r.trim()))
  );

  if (!hasSelected) {
    return <NoRoutineCard lessonNumber={lesson.lessonNumber} />;
  }

  const cardClasses = cn(
    'p-4 border rounded shadow-sm',
    'transition-all duration-150',
    isSelected ? 'border-4 border-primary' : 'border-2 border-muted'
  );

  return (
    <Card className={cardClasses}>
      <Heading
        level="h3"
        className="text-lg font-semibold mb-2"
      >
        Lesson {lesson.lessonNumber}
      </Heading>

      <div className="space-y-4">
        {lesson.activities.map((activity: Activity, i: number) => {
          const hasSelectedRoutines = activity.routines.some((r: string) => selectedRoutines.includes(r));
          if (!hasSelectedRoutines) return null;

          return (
            <div key={i} className="space-y-2">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <Text textSize="lg" weight="bold" color="default">
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
                    <Text textSize="sm" color="default">
                      {activity.activityTitle}
                    </Text>
                  )}
                </div>
              </div>
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