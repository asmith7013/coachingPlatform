'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/typography/Heading';
import { Text } from '@/components/ui/typography/Text';
import { spacing, typography } from '@/lib/ui/tokens';
import { cn } from '@/lib/utils';

type LessonDetailViewProps = {
  lessonsData: {
    grade: string;
    unit: string;
    lessonNumber: string;
    activities: {
      activityNumber: string;
      activityTitle: string;
      routines: string[];
      isWarmUp: boolean;
    }[];
  }[];
  selectedRoutines: string[];
};

export function LessonDetailView({ lessonsData, selectedRoutines }: LessonDetailViewProps) {
  return (
    <div className="">
      {lessonsData
        .sort((a, b) => Number(a.lessonNumber) - Number(b.lessonNumber))
        .map((lesson) => {
          const lessonHasSelectedRoutine = lesson.activities.some((activity) =>
            activity.routines.some((routine) =>
              selectedRoutines.includes(routine.trim())
            )
          );

          const hasMLR = lesson.activities.some((activity) =>
            activity.routines.some((routine) =>
              selectedRoutines.includes(routine.trim()) && /^MLR\d+/.test(routine.trim())
            )
          );
          
          const hasOtherRoutine = lesson.activities.some((activity) =>
            activity.routines.some((routine) =>
              selectedRoutines.includes(routine.trim()) && !/^MLR\d+/.test(routine.trim())
            )
          );

          return (
            <Card
              key={lesson.lessonNumber}
              contentClassName={cn(spacing.sm, 'sm:px-2 sm:py-2')}
              className={cn(
                'transition-all duration-150',
                spacing.sm,
                lessonHasSelectedRoutine ? 'bg-background' : 'bg-surface-hover',
                lessonHasSelectedRoutine ? 'border-2 border-text' : 'border-surface',
                'my-4'
              )}
            >
              <Heading level="h3" className={cn(lessonHasSelectedRoutine ? 'mb-4' : 'text-muted')}>
              <div className="flex items-center gap-2">
                <span className={cn('mr-2', lessonHasSelectedRoutine ? 'text-text' : 'text-muted')}>
                  Lesson {lesson.lessonNumber}
                </span>
                {hasMLR && (
                  <span className={cn(
                    'inline-block text-[10px] font-medium px-2 py-0.5 rounded',
                    'bg-primary',
                    'text-white'
                  )}>
                    MLR
                  </span>
                )}
                {hasOtherRoutine && (
                  <span className={cn(
                    'inline-block text-[10px] font-medium px-2 py-0.5 rounded',
                    'bg-secondary',
                    'text-white'
                  )}>
                    Other Routine
                  </span>
                )}
              </div>
              </Heading>
              <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lessonHasSelectedRoutine && lesson.activities.map((activity, idx) => (
                  <Card
                    key={idx}
                    className={cn(
                      // 'bg-secondary',
                      'border-surface',
                      'border-2'
                    )}
                    radius="md"
                    variant="bg-muted-900"
                    contentClassName={cn(spacing.sm, 'sm:px-2 sm:py-2')}
                  >
                    <Text size="lg" variant="text" className={cn('mb-1', typography.weight.bold)}>
                      {activity.activityNumber === 'Warm Up' ? 'Warm Up' : `Activity ${activity.activityNumber}`}
                    </Text>
                    <Text size="xs" variant="text" className={cn('text-text', 'mb-2 truncate')}>
                      {activity.activityTitle}
                    </Text>
                    {activity.routines.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {activity.routines
                          .filter((routine) =>
                            selectedRoutines.includes(routine.trim())
                          )
                          .map((routine, i) => {
                            const isMLR = /^MLR\d+/.test(routine);
                            return (
                              <span
                                key={i}
                                className={cn(
                                  'inline-block text-[10px] font-medium px-2 py-0.5 rounded',
                                  isMLR
                                    ? cn('bg-primary', 'text-white')
                                    : cn('bg-secondary', 'text-white')
                                )}
                              >
                                {routine}
                              </span>
                            );
                          })}
                      </div>
                    ) : (
                      <Text size="xs" variant="text" className={cn('italic')}>
                        No routines
                      </Text>
                    )}
                  </Card>
                ))}
              </div>
            </Card>
          );
        })}
    </div>
  );
}