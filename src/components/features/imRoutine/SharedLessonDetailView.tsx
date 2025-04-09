'use client';

import { spacing } from '@/lib/ui/tokens';
import { cn } from '@/lib/utils';

type BaseActivity = {
  activityNumber: string;
  routines: string[];
};

type BaseLesson = {
  grade: string;
  unit: string;
  lessonNumber: string;
  activities: BaseActivity[];
};

type SharedLessonDetailViewProps<T extends BaseLesson> = {
  lessonsData: T[];
  selectedRoutines: string[];
  renderLesson: (lesson: T, selectedRoutines: string[]) => React.ReactNode;
};

export function SharedLessonDetailView<T extends BaseLesson>({
  lessonsData,
  selectedRoutines,
  renderLesson,
}: SharedLessonDetailViewProps<T>) {
  return (
    <div className="space-y-4">
      {lessonsData
        .sort((a, b) => Number(a.lessonNumber) - Number(b.lessonNumber))
        .map((lesson) => (
          <div key={lesson.lessonNumber} className={cn(spacing.sm)}>
            {renderLesson(lesson, selectedRoutines)}
          </div>
        ))}
    </div>
  );
} 