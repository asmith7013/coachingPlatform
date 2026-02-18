"use client";

import { ReactNode } from "react";
import { ScopeAndSequence } from "@zod-schema/scm/scope-and-sequence/scope-and-sequence";
import {
  BookOpenIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  PhotoIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";

interface LessonContextCardProps {
  lesson: ScopeAndSequence | null;
  /** Slot for rendering the roadmap skills list (middle column) */
  skillsSlot?: ReactNode;
}

export function LessonContextCard({
  lesson,
  skillsSlot,
}: LessonContextCardProps) {
  if (!lesson) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpenIcon className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900">
            Lesson Context
          </h3>
        </div>
        <div className="text-gray-400 text-sm text-center py-8">
          Select a lesson to see context
        </div>
      </div>
    );
  }

  const hasStandards = lesson.standards && lesson.standards.length > 0;
  const hasLearningTargets =
    lesson.learningTargets && lesson.learningTargets.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-md">
                Unit {lesson.unitNumber}
              </span>
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                Lesson {lesson.lessonNumber}
              </span>
              {lesson.section && (
                <span className="px-2.5 py-1 bg-purple-50 text-purple-600 text-xs font-medium rounded-md">
                  Section {lesson.section}
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mt-2">
              {lesson.lessonTitle || lesson.lessonName}
            </h2>
          </div>
        </div>
      </div>

      {/* Content Grid - 3 columns */}
      <div className="grid grid-cols-3 divide-x divide-gray-100">
        {/* Left Column: Learning Targets + Standards stacked */}
        <div className="p-5 overflow-y-auto max-h-[400px]">
          {/* Learning Targets */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardDocumentCheckIcon className="w-4 h-4 text-green-500" />
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Learning Targets
              </h4>
            </div>
            {hasLearningTargets ? (
              <ul className="space-y-2">
                {lesson.learningTargets!.map((target, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs text-gray-700"
                  >
                    <span className="inline-flex items-center justify-center w-4 h-4 bg-green-100 text-green-600 rounded-full text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{target}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400 italic">
                No learning targets listed
              </p>
            )}
          </div>

          {/* Standards */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AcademicCapIcon className="w-4 h-4 text-blue-500" />
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Standards
              </h4>
            </div>
            {hasStandards ? (
              <div className="space-y-3">
                {lesson.standards!.map((standard, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-100">
                        {standard.code}
                      </span>
                      {standard.context && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            standard.context === "current"
                              ? "bg-green-50 text-green-600"
                              : standard.context === "buildingOn"
                                ? "bg-sky-50 text-sky-600"
                                : "bg-purple-50 text-purple-600"
                          }`}
                        >
                          {standard.context === "current"
                            ? "current"
                            : standard.context === "buildingOn"
                              ? "building on"
                              : "building towards"}
                        </span>
                      )}
                    </div>
                    {standard.text && (
                      <p className="text-xs text-gray-600 leading-relaxed pl-0.5">
                        {standard.text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">
                No standards listed
              </p>
            )}
          </div>
        </div>

        {/* Middle Column: Roadmap Skills (slot) */}
        <div className="overflow-hidden">
          {skillsSlot ? (
            <div className="h-full">{skillsSlot}</div>
          ) : (
            <div className="p-5 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <CubeIcon className="w-4 h-4 text-purple-500" />
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Roadmap Skills
                </h4>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs text-gray-400 italic">
                  No skills data provided
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Mastery Check Preview */}
        <div className="p-5 bg-gray-50/50">
          <div className="flex items-center gap-2 mb-3">
            <PhotoIcon className="w-4 h-4 text-gray-400" />
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Mastery Check
            </h4>
          </div>
          <div className="aspect-[4/3] bg-white rounded-lg border border-gray-200 border-dashed flex items-center justify-center">
            <div className="text-center px-4">
              <PhotoIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <span className="text-gray-400 text-xs">Preview coming soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
