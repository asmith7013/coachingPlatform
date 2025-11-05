"use client";

import { Student } from "@zod-schema/313/student";
import { SkillListWithProgress } from "../../components/SkillListWithProgress";

interface Lesson {
  _id: string;
  grade: string;
  unit: string;
  unitLessonId: string;
  unitNumber: number;
  lessonNumber: number;
  lessonName: string;
  section?: string;
  scopeSequenceTag?: string;
  roadmapSkills?: string[];
  targetSkills?: string[];
}

interface LessonDetailViewProps {
  lesson: Lesson | null;
  onSkillClick?: (skillNumber: string, color: 'blue' | 'green' | 'orange' | 'purple') => void;
  masteredSkills?: string[];
  selectedSection?: string;
  selectedStudents?: Student[];
}

// Helper function to generate IM360 URL
function getIM360Url(lesson: Lesson): string {
  // Extract grade number
  const gradeNum = lesson.grade.match(/\d+/)?.[0];

  // Determine if this is Algebra 1 (grade 9)
  const isAlgebra1 = gradeNum === "9" || lesson.grade.toLowerCase().includes("algebra");

  // Build URL based on course type
  let baseUrl = "";
  if (isAlgebra1) {
    baseUrl = "https://accessim.org/9-12-aga/algebra-1";
  } else if (gradeNum === "6" || gradeNum === "7" || gradeNum === "8") {
    baseUrl = `https://accessim.org/6-8/grade-${gradeNum}`;
  }

  // Extract unit and section
  const unitMatch = lesson.unit.match(/Unit (\d+)/i);
  const unit = unitMatch ? `unit-${unitMatch[1]}` : "";

  // Try to match section in different formats: "Section A", "A", etc.
  let section = "";
  if (lesson.section) {
    const sectionMatch = lesson.section.match(/Section ([A-Z])/i) || lesson.section.match(/^([A-Z])$/i);
    section = sectionMatch ? `section-${sectionMatch[1].toLowerCase()}` : "";
  }

  const lessonNum = `lesson-${lesson.lessonNumber}`;

  return `${baseUrl}/${unit}/${section}/${lessonNum}/preparation?a=teacher`;
}

export function LessonDetailView({ lesson, onSkillClick, masteredSkills = [], selectedSection, selectedStudents = [] }: LessonDetailViewProps) {
  // Empty state
  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-2">📚</div>
          <div className="text-gray-600 font-medium mb-1">No Lesson Selected</div>
          <div className="text-gray-500 text-sm">Select a grade, unit, and lesson to view details</div>
        </div>
      </div>
    );
  }

  const im360Url = getIM360Url(lesson);

  return (
    <div>
      {/* Header Card - Lesson Title */}
      <div className="border-b border-gray-200 p-6 bg-gray-50">
        <div className="flex items-start gap-3">
          <span className="inline-flex items-center px-3 py-2 rounded-md text-sm font-semibold flex-shrink-0 bg-gray-600 text-white">
            Lesson {lesson.lessonNumber}
          </span>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {lesson.lessonName}
            </div>
            <a
              href={im360Url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm mt-1 inline-block"
            >
              Open Lesson on IM 360 →
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Roadmap Skills Section */}
        {lesson.roadmapSkills && lesson.roadmapSkills.length > 0 ? (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Roadmap Skills ({lesson.roadmapSkills.length})
            </h3>
            <SkillListWithProgress
              skillNumbers={lesson.roadmapSkills}
              selectedSection={selectedSection}
              onSkillClick={onSkillClick}
              skillType="target"
              showPrerequisites={true}
              masteredSkills={masteredSkills}
              targetSkillNumbers={lesson.targetSkills || []}
              selectedStudents={selectedStudents}
            />
          </div>
        ) : (
          <div className="border-t border-gray-200 pt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-blue-800 text-sm">
                No skills tagged to this lesson yet. Skills can be added to track roadmap and target skills for this lesson.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
