'use client';

import React from 'react';
import { normalize, isMLR, mlrNum } from '@/lib/utils/routineUtils';

type LessonCompactViewProps = {
  lessonsData: {
    grade: string;
    unit: string;
    lessonNumber: string;
    activities: {
      activityNumber: string;
      activityTitle: string;
      routines: string[];
    }[];
  }[];
  selectedRoutines: string[]; // Accept selectedRoutines as a prop
};

export function LessonCompactView({ lessonsData, selectedRoutines }: LessonCompactViewProps) {
  return (
    <div className="space-y-4">
      {lessonsData
        .sort((a, b) => Number(a.lessonNumber) - Number(b.lessonNumber))
        .map((lesson) => {
          // Aggregate routines from all activities in this lesson that are in selectedRoutines.
          const aggSet = new Set<string>();
          lesson.activities.forEach((activity) => {
            activity.routines.forEach((routine) => {
              const trimmed = routine.trim();
              if (selectedRoutines.includes(trimmed)) {
                aggSet.add(trimmed);
              }
            });
          });
          const aggArray = Array.from(aggSet);
          const sortedAgg = aggArray.sort((a, b) => {
            const A = normalize(a);
            const B = normalize(b);
            const aIsMLR = isMLR(A);
            const bIsMLR = isMLR(B);
            if (aIsMLR && bIsMLR) return mlrNum(A) - mlrNum(B);
            if (aIsMLR) return -1;
            if (bIsMLR) return 1;
            return A.localeCompare(B);
          });
          return (
            <div
              key={lesson.lessonNumber}
              className="border rounded-xl shadow p-4 bg-white flex items-center justify-between"
            >
              <h3 className="text-md font-bold text-gray-800">
                Lesson {lesson.lessonNumber}
              </h3>
              <div className="flex flex-wrap gap-1">
                {sortedAgg.length > 0 ? (
                  sortedAgg.map((routine, i) => {
                    const isMLR = /^MLR\d+/.test(routine);
                    return (
                      <span
                        key={`${routine}-${i}`}
                        className={`inline-block ${
                          isMLR
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        } text-[10px] font-medium px-2 py-0.5 rounded`}
                      >
                        {routine}
                      </span>
                    );
                  })
                ) : (
                  <></>
                  // <p className="italic text-[11px] text-gray-500">No routines</p>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
} 