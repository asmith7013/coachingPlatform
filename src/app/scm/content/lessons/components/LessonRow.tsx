"use client";

import React from "react";
import type { LessonData } from "../actions";

interface LessonRowProps {
  lesson: LessonData;
  skillMap: Record<string, string>;
}

// Lesson type badge colors
const lessonTypeConfig: Record<string, { bg: string; text: string; label: string }> = {
  lesson: { bg: "bg-green-50", text: "text-green-700", label: "Lesson" },
  rampUp: { bg: "bg-amber-50", text: "text-amber-700", label: "Ramp Up" },
  assessment: { bg: "bg-purple-50", text: "text-purple-700", label: "Assessment" },
};

export function LessonRow({ lesson, skillMap }: LessonRowProps) {
  const typeConfig = lessonTypeConfig[lesson.lessonType || "lesson"] || lessonTypeConfig.lesson;

  // Filter standards to exclude "buildingOn"
  const displayStandards = lesson.standards.filter(
    (std) => std.context !== "buildingOn"
  );

  // Format roadmap skills as "number: title"
  const formattedSkills = lesson.roadmapSkills.map((skillNum) => {
    const title = skillMap[skillNum];
    return title ? `${skillNum}: ${title}` : skillNum;
  });

  return (
    <div className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-gray-50 transition-colors items-start">
      {/* Lesson ID */}
      <div className="col-span-1">
        <span className="font-mono text-sm font-medium text-gray-900">
          {lesson.unitLessonId}
        </span>
      </div>

      {/* Section */}
      <div className="col-span-1">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeConfig.bg} ${typeConfig.text}`}>
          {lesson.section || "-"}
        </span>
      </div>

      {/* Title */}
      <div className="col-span-2">
        <p className="text-sm text-gray-900 font-medium">
          {lesson.lessonTitle || lesson.lessonName}
        </p>
        {lesson.lessonType && lesson.lessonType !== "lesson" && (
          <span className={`inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-xs ${typeConfig.bg} ${typeConfig.text}`}>
            {typeConfig.label}
          </span>
        )}
      </div>

      {/* Standards */}
      <div className="col-span-3">
        {displayStandards.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {displayStandards.map((std, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs ${
                  std.context === "buildingTowards"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                }`}
                title={std.text}
              >
                {std.code}
                {std.context === "buildingTowards" && (
                  <span className="ml-0.5 text-blue-400">→</span>
                )}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )}
      </div>

      {/* Learning Targets */}
      <div className="col-span-3">
        {lesson.learningTargets.length > 0 ? (
          <ul className="text-xs text-gray-600 space-y-0.5">
            {lesson.learningTargets.map((target, idx) => (
              <li key={idx} className="line-clamp-2">
                {target}
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )}
      </div>

      {/* Roadmap Skills */}
      <div className="col-span-2">
        {formattedSkills.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {formattedSkills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-indigo-50 text-indigo-700"
                title={skill}
              >
                <span className="truncate max-w-[120px]">{skill}</span>
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )}
      </div>
    </div>
  );
}
