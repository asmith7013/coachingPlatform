'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { RoutineBadge } from './RoutineBadge';

export type Lesson = {
  grade: string;
  unit: string;
  lessonNumber: string;
  activities: {
    routines: string[];
  }[];
  curriculum: 'ILC' | 'Kendall Hunt';
};

type Props = {
  selectedRoutines: string[];
  lessonsData: Lesson[];
  onSelectLesson: (lessonNumber: string) => void;
  curriculum: 'ILC' | 'Kendall Hunt';
};

export function MLRAppearsInCard({ selectedRoutines, lessonsData, onSelectLesson, curriculum }: Props) {
  const mlrRoutines = selectedRoutines.filter((r) => /^MLR\d+/.test(r));

  if (mlrRoutines.length === 0 || mlrRoutines.length > 4) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AnimatePresence mode="popLayout">
        {mlrRoutines.map((routine) => {
          const matchingLessons = lessonsData
            .filter((lesson) =>
              lesson.activities.some((activity) =>
                activity.routines.includes(routine)
              )
            )
            .map((lesson) => lesson.lessonNumber);

          if (matchingLessons.length === 0) return null;

          return (
            <motion.div
              key={routine}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="p-4 border-2 border-white rounded-md bg-primary space-y-2"
            >
              <RoutineBadge
                routine={routine}
                grade={lessonsData[0].grade}
                unit={lessonsData[0].unit}
                curriculum={curriculum}
              />

              <div className="flex items-center flex-wrap gap-2 mt-1">
                <span className="text-sm text-white font-bold">Appears in:</span>
                {matchingLessons.map((lessonNumber) => (
                  <motion.button
                    key={lessonNumber}
                    onClick={() => onSelectLesson(lessonNumber)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded",
                      "bg-secondary text-white border-2 border-white",
                      "hover:bg-white hover:text-secondary transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary",
                      "cursor-pointer"
                    )}
                  >
                    Lesson {lessonNumber}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
} 