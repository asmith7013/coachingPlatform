'use client';

import { cn } from '@/lib/utils';
import { spacing, textColors, backgroundColors, borderColors, radii } from '@/lib/ui/tokens';

type LessonCompactViewProps = {
  lessons: {
    id: string;
    title: string;
    routines: {
      id: string;
      name: string;
      grade: string;
      unit: string;
      lesson: string;
    }[];
  }[];
  selectedRoutines: string[];
};

export function LessonCompactView({ lessons, selectedRoutines }: LessonCompactViewProps) {
  // Sort lessons by title
  const sortedLessons = [...lessons].sort((a, b) => a.title.localeCompare(b.title));

  // Aggregate routines by lesson
  const aggregatedRoutines = sortedLessons.map(lesson => {
    const routines = lesson.routines.filter(routine => 
      selectedRoutines.includes(routine.id)
    );
    return {
      ...lesson,
      routines
    };
  });

  return (
    <div className="space-y-4">
      {aggregatedRoutines.map((lesson) => (
        <div
          key={lesson.id}
          className={cn(
            spacing.md,
            borderColors.default,
            radii.md,
            backgroundColors.white,
            'border'
          )}
        >
          <h3 className={cn(textColors.primary, 'font-medium mb-2')}>
            {lesson.title}
          </h3>
          {lesson.routines.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {lesson.routines.map((routine) => (
                <span
                  key={routine.id}
                  className={cn(
                    spacing.sm,
                    backgroundColors.surfaceHover,
                    textColors.secondary,
                    radii.sm,
                    'text-sm'
                  )}
                >
                  {routine.name}
                </span>
              ))}
            </div>
          ) : (
            <p className={cn(textColors.muted, 'text-sm')}>
              No routines selected for this lesson
            </p>
          )}
        </div>
      ))}
    </div>
  );
} 