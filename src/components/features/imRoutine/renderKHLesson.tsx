import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/typography/Heading';
import { Text } from '@/components/ui/typography/Text';
import { cn } from '@/lib/utils';

type KHLesson = {
  grade: string;
  unit: string;
  lessonNumber: string;
  activities: {
    activityNumber: string;
    activityTitle?: string;
    isWarmUp?: boolean;
    routines: string[];
  }[];
};

export function renderKHLesson(lesson: KHLesson, selectedRoutines: string[]) {
  const hasSelected = lesson.activities.some((activity) =>
    activity.routines.some((r) => selectedRoutines.includes(r.trim()))
  );

  return (
    <Card
      className={cn(
        'transition-all duration-150 border-2',
        hasSelected ? 'bg-background border-muted' : 'bg-surface border-surface'
      )}
    >
      <Heading
        level="h3"
        className={cn('mb-4', !hasSelected && 'text-muted')}
      >
        Lesson {lesson.lessonNumber}
      </Heading>

      {hasSelected ? (
        <div className="space-y-4">
          {lesson.activities
            .filter((activity) =>
              activity.routines.some((r) => selectedRoutines.includes(r.trim()))
            )
            .map((activity) => (
              <div key={activity.activityNumber} className="p-4 rounded-lg bg-background border border-outline">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Text size="sm" className="font-medium">
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
                      <Text size="sm" className="text-muted">
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
      ) : (
        <Text size="sm" className="italic text-muted">
          No routines for this lesson.
        </Text>
      )}
    </Card>
  );
} 