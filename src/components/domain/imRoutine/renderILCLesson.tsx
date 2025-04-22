import { Card } from '@/components/composed/cards/Card';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { cn } from '@/lib/utils/general';

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
        color={hasRoutines ? 'default' : 'muted'}
        className="mb-2"
      >
        Lesson {lesson.lessonNumber}
      </Heading>

      {hasRoutines ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routines.map((routine, i) => {
            const isMLR = /^MLR\d+/.test(routine);
            return (
              <div
                key={i}
                className="p-4 rounded-md bg-surface border-2 border-outline flex items-center"
              >
                <span
                  className={cn(
                    'text-[10px] font-medium px-2 py-0.5 rounded',
                    isMLR ? 'bg-primary text-white' : 'bg-secondary text-white'
                  )}
                >
                  {routine}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <Text 
          textSize="sm" 
          color="muted"
          className="italic"
        >
          No routines for this lesson.
        </Text>
      )}
    </Card>
  );
} 