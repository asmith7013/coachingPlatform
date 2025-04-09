'use client';

import React from 'react';

export type Lesson = {
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

type Props = {
  lessonsData: Lesson[];
  selectedRoutines: string[];
  renderLesson: (lesson: Lesson, selectedRoutines: string[]) => React.ReactNode;
};

export function LessonDetailView({ lessonsData, selectedRoutines, renderLesson }: Props) {
  return (
    <div className="space-y-4">
      {lessonsData
        .sort((a, b) => Number(a.lessonNumber) - Number(b.lessonNumber))
        .map((lesson) => (
          <React.Fragment key={lesson.lessonNumber}>
            {renderLesson(lesson, selectedRoutines)}
          </React.Fragment>
        ))}
    </div>
  );
} 