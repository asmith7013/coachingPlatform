"use client";

import { ReactNode } from "react";
import { SCOPE_SEQUENCE_TAG_OPTIONS } from "@schema/enum/scm";

interface UnitData {
  unitNumber: number;
  unitName: string;
  grade: string;
  lessonCount: number;
}

interface LessonData {
  _id: string;
  unitNumber: number;
  lessonNumber: number;
  unitLessonId: string;
  lessonName: string;
  lessonType?: string;
  lessonTitle?: string;
  unit: string;
  grade: string;
  section?: string;
  scopeSequenceTag: string;
  roadmapSkills?: string[];
  targetSkills?: string[];
}

interface RequestHeaderProps {
  selectedGrade: string;
  selectedUnitNumber: number | null;
  selectedLessonId: string | null;
  units: UnitData[];
  lessons: LessonData[];
  onGradeChange: (value: string) => void;
  onUnitChange: (value: number | null) => void;
  onLessonChange: (value: string | null) => void;
  studentFilterSlot?: ReactNode;
}

// Format lesson name for dropdown display
function formatLessonLabel(lesson: LessonData): string {
  const title = lesson.lessonTitle || lesson.lessonName;

  // For ramp-ups: "Ramp Up: Title"
  if (lesson.lessonType === "rampUp" || lesson.section === "Ramp Ups") {
    return `Ramp Up: ${title.replace(/^Ramp Up \d+:\s*/i, "")}`;
  }

  // For assessments: just the title (no prefix)
  if (
    lesson.lessonType === "assessment" ||
    lesson.section === "Unit Assessment"
  ) {
    return title;
  }

  // For regular lessons: "Lesson X: Title"
  return `Lesson ${lesson.lessonNumber}: ${title}`;
}

export function RequestHeader({
  selectedGrade,
  selectedUnitNumber,
  selectedLessonId,
  units,
  lessons,
  onGradeChange,
  onUnitChange,
  onLessonChange,
  studentFilterSlot,
}: RequestHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex gap-6">
        {/* Left side: Title and filters */}
        <div className="flex-1">
          <div className="mb-4">
            <h1 className="text-3xl font-bold mb-2">Plan Worked Example</h1>
            <p className="text-gray-600">
              Help identify what students are struggling with so we can create
              worked examples.
            </p>
          </div>

          {/* Filters Row */}
          <div className="flex gap-4 items-end">
            {/* Grade Filter */}
            <div className="flex-1">
              <label
                htmlFor="grade-filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Curriculum
              </label>
              <select
                id="grade-filter"
                value={selectedGrade}
                onChange={(e) => onGradeChange(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                  !selectedGrade
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-300"
                }`}
              >
                <option value="">Select Curriculum</option>
                {SCOPE_SEQUENCE_TAG_OPTIONS.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit Filter */}
            <div className="flex-1">
              <label
                htmlFor="unit-filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Unit
              </label>
              <select
                id="unit-filter"
                value={selectedUnitNumber?.toString() || ""}
                onChange={(e) =>
                  onUnitChange(e.target.value ? parseInt(e.target.value) : null)
                }
                disabled={!selectedGrade}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer"
              >
                <option value="">
                  {selectedGrade ? "Select Unit" : "Select a curriculum first"}
                </option>
                {units.map((unit) => (
                  <option key={unit.unitNumber} value={unit.unitNumber}>
                    Unit {unit.unitNumber}:{" "}
                    {unit.unitName.replace(/^Unit \d+\s*[-:]\s*/, "")}
                  </option>
                ))}
              </select>
            </div>

            {/* Lesson Filter */}
            <div className="flex-1">
              <label
                htmlFor="lesson-filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Lesson
              </label>
              <select
                id="lesson-filter"
                value={selectedLessonId || ""}
                onChange={(e) => onLessonChange(e.target.value || null)}
                disabled={selectedUnitNumber === null}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer"
              >
                <option value="">
                  {selectedUnitNumber !== null
                    ? "Select Lesson"
                    : "Select a unit first"}
                </option>
                {lessons.map((lesson) => (
                  <option key={lesson._id} value={lesson._id}>
                    {formatLessonLabel(lesson)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Vertical Divider */}
        {studentFilterSlot && <div className="w-px bg-gray-200 self-stretch" />}

        {/* Right side: Student Filter */}
        {studentFilterSlot && (
          <div className="w-72 flex-shrink-0">
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Student Filter
              </h2>
              <p className="text-sm text-gray-600">View mastery progress</p>
            </div>
            {studentFilterSlot}
          </div>
        )}
      </div>
    </div>
  );
}
