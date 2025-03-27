'use client';

import React from 'react';

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
    <div className="space-y-4">
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
            <div
              key={lesson.lessonNumber}
              className={`rounded-xl shadow p-4 ${lessonHasSelectedRoutine ? 'bg-white' : 'bg-gray-50'} ${
                lessonHasSelectedRoutine ? 'border-2 border-black' : 'border border-gray-200'
              }`}
            >
              <h3 className={`text-md font-bold ${lessonHasSelectedRoutine ? 'text-gray-800 mb-4' : 'text-gray-400'}`}>
                <span className='mr-2'>Lesson {lesson.lessonNumber}</span>
                {hasMLR && <span className={`inline-block bg-purple-100 text-purple-800 text-[10px] font-medium px-2 py-0.5 mx-1 rounded`}>
                    MLR
                </span>}
                {hasOtherRoutine && <span className={`inline-block bg-blue-100 text-blue-800 text-[10px] font-medium px-2 py-0.5 mx-1 rounded`}>
                    Other Routine
                </span>}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {lessonHasSelectedRoutine && lesson.activities.map((activity, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 border border-gray-200 rounded-md p-3"
                  >
                    <p className="font-medium text-xs mb-1">
                       {activity.activityNumber === 'Warm Up' ? 'Warm Up' : `Activity ${activity.activityNumber}`}
                    </p>
                    <p className="text-xs text-gray-700 mb-2 truncate">
                      {activity.activityTitle}
                    </p>
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
                      <p className="italic text-[11px] text-gray-500">
                        {/* No routines */}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
    </div>
  );
} 