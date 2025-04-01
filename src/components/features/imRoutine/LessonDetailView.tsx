'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/typography/Heading';
import { Text } from '@/components/ui/typography/Text';
import { spacing, textColors, colorVariants } from '@/lib/ui/tokens';
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
                  contentClassName="px-2 py-2 sm:px-2 sm:py-2"
                  className={cn(
                    'transition-all duration-150', spacing.sm,
                    lessonHasSelectedRoutine ? colorVariants.surface : 'bg-gray-50',
                    lessonHasSelectedRoutine ? 'border-2 border-black bg-white' : 'border border-gray-200', 'my-4'
                  )}
                  // padding="md"
                  // radius="xl"
                >
                  <Heading level={3} className={cn(lessonHasSelectedRoutine ? 'mb-4' : 'text-gray-400')}>
                    <span className={cn('mr-2', lessonHasSelectedRoutine ? '' : textColors.muted)}>Lesson {lesson.lessonNumber}</span>
                    {hasMLR && (
                      <span className="inline-block bg-purple-100 text-purple-800 text-[10px] font-medium px-2 py-0.5 mx-1 rounded">
                        MLR
                      </span>
                    )}
                    {hasOtherRoutine && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-[10px] font-medium px-2 py-0.5 mx-1 rounded">
                        Other Routine
                      </span>
                    )}
                  </Heading>
                  <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lessonHasSelectedRoutine && lesson.activities.map((activity, idx) => (
                      <Card
                        key={idx}
                        className="bg-gray-50 border border-gray-200"
                        radius="md"
                        contentClassName="px-2 py-2 sm:px-2 sm:py-2"
                      >
                        <Text size="lg" className="font-bold mb-1">
                          {activity.activityNumber === 'Warm Up' ? 'Warm Up' : `Activity ${activity.activityNumber}`}
                        </Text>
                        <Text  size="xs" className="mb-2 truncate text-grey-400">
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
                                    className={`inline-block ${
                                      isMLR
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-blue-100 text-blue-800'
                                    } text-[10px] font-medium px-2 py-0.5 rounded`}
                                  >
                                    {routine}
                                  </span>
                                );
                              })}
                          </div>
                        ) : (
                          <Text size="xs" className="italic">
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