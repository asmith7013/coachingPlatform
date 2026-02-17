"use client";

import React, { useState } from "react";
import type { UnitWithLessons } from "../actions";
import { Tooltip } from "@/components/core/feedback/Tooltip";

interface LessonsTableProps {
  units: UnitWithLessons[];
  skillMap: Record<string, string>;
  totalLessons: number;
}

// Section badge colors (mellow pastels)
const sectionConfig: Record<string, { bg: string; text: string }> = {
  "Ramp Ups": { bg: "bg-amber-50", text: "text-amber-700" },
  A: { bg: "bg-blue-50", text: "text-blue-700" },
  B: { bg: "bg-green-50", text: "text-green-700" },
  C: { bg: "bg-purple-50", text: "text-purple-700" },
  D: { bg: "bg-rose-50", text: "text-rose-700" },
  E: { bg: "bg-cyan-50", text: "text-cyan-700" },
  F: { bg: "bg-orange-50", text: "text-orange-700" },
  "Unit Assessment": { bg: "bg-indigo-50", text: "text-indigo-700" },
};

// Unit color palette (mellow pastels)
const unitColors = [
  {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    badge: "bg-blue-500",
  },
  {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    badge: "bg-emerald-500",
  },
  {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
    badge: "bg-purple-500",
  },
  {
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    badge: "bg-rose-500",
  },
  {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    badge: "bg-amber-500",
  },
  {
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    text: "text-cyan-700",
    badge: "bg-cyan-500",
  },
  {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-700",
    badge: "bg-indigo-500",
  },
  {
    bg: "bg-teal-50",
    border: "border-teal-200",
    text: "text-teal-700",
    badge: "bg-teal-500",
  },
  {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    badge: "bg-orange-500",
  },
  {
    bg: "bg-pink-50",
    border: "border-pink-200",
    text: "text-pink-700",
    badge: "bg-pink-500",
  },
  {
    bg: "bg-lime-50",
    border: "border-lime-200",
    text: "text-lime-700",
    badge: "bg-lime-500",
  },
  {
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
    badge: "bg-violet-500",
  },
];

export function LessonsTable({
  units,
  skillMap,
  totalLessons,
}: LessonsTableProps) {
  // Track which units are open (default: all closed)
  const [openUnits, setOpenUnits] = useState<Set<number>>(new Set());

  const toggleUnit = (unitOrder: number) => {
    setOpenUnits((prev) => {
      const next = new Set(prev);
      if (next.has(unitOrder)) {
        next.delete(unitOrder);
      } else {
        next.add(unitOrder);
      }
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {units.map((unit, unitIndex) => {
        const color = unitColors[unitIndex % unitColors.length];
        const isOpen = openUnits.has(unit.order);

        return (
          <div
            key={`unit-${unit.order}`}
            className={`rounded-lg overflow-hidden border ${color.border}`}
          >
            {/* Unit Header (Accordion Button) */}
            <button
              type="button"
              onClick={() => toggleUnit(unit.order)}
              className={`w-full ${color.bg} px-4 py-3 cursor-pointer hover:opacity-90 transition-opacity`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`${color.badge} text-white text-sm font-bold px-3 py-1 rounded-full`}
                  >
                    {unit.order}
                  </span>
                  <h2
                    className={`text-base font-semibold ${color.text} text-left`}
                  >
                    {unit.unitName}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`${color.text} text-sm`}>
                    {unit.lessons.length}{" "}
                    {unit.lessons.length === 1 ? "lesson" : "lessons"}
                  </span>
                  <svg
                    className={`w-5 h-5 ${color.text} transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </button>

            {/* Unit Content - Single Table */}
            {isOpen && (
              <div className="bg-white">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
                        Lesson
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
                        Section
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-48">
                        Title
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-56">
                        Standards
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-64">
                        Learning Targets
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-48">
                        Roadmap Skills
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {unit.lessons.map((lesson, lessonIndex) => {
                      const sectionStyle = sectionConfig[
                        lesson.section || ""
                      ] || { bg: "bg-gray-50", text: "text-gray-700" };

                      // Filter standards to exclude "buildingOn"
                      const displayStandards = lesson.standards.filter(
                        (std) => std.context !== "buildingOn",
                      );

                      // Format roadmap skills
                      const formattedSkills = lesson.roadmapSkills.map(
                        (skillNum) => {
                          const title = skillMap[skillNum];
                          return title ? `${skillNum}: ${title}` : skillNum;
                        },
                      );

                      return (
                        <tr
                          key={`lesson-${unit.order}-${lesson.unitLessonId}-${lessonIndex}`}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          {/* Lesson Number */}
                          <td className="px-4 py-3 align-top">
                            <span className="text-sm font-medium text-gray-900">
                              {lesson.section?.length === 1 &&
                                `Lesson ` + lesson.unitLessonId.split(".")[1]}
                            </span>
                          </td>

                          {/* Section */}
                          <td className="px-4 py-3 align-top">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${sectionStyle.bg} ${sectionStyle.text}`}
                            >
                              {lesson.section || "-"}
                            </span>
                          </td>

                          {/* Title */}
                          <td className="px-4 py-3 align-top">
                            <p className="text-sm text-gray-900 font-medium">
                              {lesson.lessonTitle || lesson.lessonName}
                            </p>
                          </td>

                          {/* Standards */}
                          <td className="px-4 py-3 align-top">
                            {displayStandards.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {displayStandards.map((std, idx) => (
                                  <Tooltip
                                    key={idx}
                                    content={std.text}
                                    position="bottom"
                                    clickable
                                  >
                                    <span
                                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs cursor-help ${
                                        std.context === "buildingTowards"
                                          ? "bg-blue-50 text-blue-700"
                                          : "bg-gray-100 text-gray-700"
                                      }`}
                                    >
                                      {std.code}
                                      {std.context === "buildingTowards" && (
                                        <span className="ml-0.5 text-blue-400">
                                          →
                                        </span>
                                      )}
                                    </span>
                                  </Tooltip>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>

                          {/* Learning Targets */}
                          <td className="px-4 py-3 align-top">
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
                          </td>

                          {/* Roadmap Skills */}
                          <td className="px-4 py-3 align-top">
                            {formattedSkills.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {formattedSkills.map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-indigo-50 text-indigo-700"
                                    title={skill}
                                  >
                                    <span className="truncate max-w-[120px]">
                                      {skill}
                                    </span>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      {/* Footer showing total */}
      <div className="text-sm text-gray-500 text-center py-2">
        {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"} total across{" "}
        {units.length} units
      </div>
    </div>
  );
}
