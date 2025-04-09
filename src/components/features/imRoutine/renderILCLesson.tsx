import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/typography/Heading';
import { Text } from '@/components/ui/typography/Text';
import { cn } from '@/lib/utils';

type ILCLesson = {
  grade: string;
  unit: string;
  lessonNumber: string;
  activities: {
    activityNumber: string;
    routines: string[];
  }[];
};

export function renderILCLesson(lesson: ILCLesson, selectedRoutines: string[]) {
  // Get unique routines across all activities
  const routines = Array.from(
    new Set(lesson.activities.flatMap((act) => act.routines))
  ).filter((r) => selectedRoutines.includes(r.trim()));

  const hasRoutines = routines.length > 0;

  return (
    <Card
      className={cn(
        'transition-all duration-150 border-2',
        hasRoutines ? 'bg-background border-muted' : 'bg-surface border-surface'
      )}
    >
      <Heading
        level="h3"
        className={cn('mb-2', !hasRoutines && 'text-muted')}
      >
        Lesson {lesson.lessonNumber}
      </Heading>

      {hasRoutines ? (
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
      ) : (
        <Text size="sm" className="italic text-muted">
          No routines for this lesson.
        </Text>
      )}
    </Card>
  );
} 