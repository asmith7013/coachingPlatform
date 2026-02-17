"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MLRAppearsInCard } from "../routines/MLRAppearsInCard";

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
  curriculum: "ILC" | "Kendall Hunt";
};

type Props = {
  lessonsData: Lesson[];
  selectedRoutines: string[];
  selectedLesson?: string;
  setSelectedLesson: (lesson: string) => void;
  curriculum: "ILC" | "Kendall Hunt";
  renderLessonContent: (
    lesson: Lesson,
    selectedRoutines: string[],
    isSelected: boolean,
  ) => React.ReactNode;
};

export function LessonDetailView({
  lessonsData,
  selectedRoutines,
  selectedLesson,
  setSelectedLesson,
  curriculum,
  renderLessonContent,
}: Props) {
  const lessonRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [justSelectedLesson, setJustSelectedLesson] = React.useState<
    string | null
  >(null);

  useEffect(() => {
    if (selectedLesson && lessonRefs.current[selectedLesson]) {
      lessonRefs.current[selectedLesson]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setJustSelectedLesson(selectedLesson);
      // Reset the pulse animation after it completes
      const timer = setTimeout(() => setJustSelectedLesson(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [selectedLesson]);

  return (
    <div className="space-y-4">
      <MLRAppearsInCard
        selectedRoutines={selectedRoutines}
        lessonsData={lessonsData}
        onSelectLesson={setSelectedLesson}
        curriculum={curriculum}
      />
      {lessonsData
        .sort((a, b) => Number(a.lessonNumber) - Number(b.lessonNumber))
        .map((lesson) => {
          const isSelected = lesson.lessonNumber === selectedLesson;
          const isPulsing = lesson.lessonNumber === justSelectedLesson;

          return (
            <motion.div
              key={lesson.lessonNumber}
              ref={(el) => {
                lessonRefs.current[lesson.lessonNumber] = el;
              }}
              className="scroll-mt-20"
              animate={
                isPulsing
                  ? {
                      scale: [1, 1.02, 1],
                      transition: { duration: 0.5 },
                    }
                  : {}
              }
            >
              {renderLessonContent(lesson, selectedRoutines, isSelected)}
            </motion.div>
          );
        })}
    </div>
  );
}
