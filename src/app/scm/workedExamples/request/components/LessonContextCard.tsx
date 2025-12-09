"use client";

import { ScopeAndSequence } from "@zod-schema/313/curriculum/scope-and-sequence";

interface LessonContextCardProps {
  lesson: ScopeAndSequence | null;
}

export function LessonContextCard({ lesson }: LessonContextCardProps) {
  if (!lesson) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Lesson Context</h3>
        <div className="text-gray-400 text-sm text-center py-6">
          Select a lesson to see context
        </div>
      </div>
    );
  }

  const hasStandards = lesson.standards && lesson.standards.length > 0;
  const hasLearningTargets = lesson.learningTargets && lesson.learningTargets.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Lesson Context</h3>

      {/* Unit & Lesson Info */}
      <div className="mb-4">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          Unit {lesson.unitNumber}, Lesson {lesson.lessonNumber}
        </div>
        <div className="text-sm font-semibold text-gray-900">
          {lesson.lessonTitle || lesson.lessonName}
        </div>
        {lesson.section && (
          <div className="text-xs text-gray-500 mt-1">
            Section {lesson.section}
          </div>
        )}
      </div>

      {/* Standards */}
      {hasStandards && (
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Standards
          </div>
          <div className="space-y-2">
            {lesson.standards!.map((standard, idx) => (
              <div key={idx} className="text-xs">
                <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-medium mr-2">
                  {standard.code}
                </span>
                {standard.context && (
                  <span className={`text-xs ${
                    standard.context === 'current' ? 'text-green-600' :
                    standard.context === 'buildingOn' ? 'text-blue-600' :
                    'text-purple-600'
                  }`}>
                    ({standard.context === 'current' ? 'current' :
                      standard.context === 'buildingOn' ? 'building on' :
                      'building towards'})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Targets */}
      {hasLearningTargets && (
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Learning Targets
          </div>
          <ul className="space-y-1">
            {lesson.learningTargets!.map((target, idx) => (
              <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>{target}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No additional context message */}
      {!hasStandards && !hasLearningTargets && (
        <div className="text-xs text-gray-400 italic">
          No standards or learning targets available for this lesson.
        </div>
      )}
    </div>
  );
}
