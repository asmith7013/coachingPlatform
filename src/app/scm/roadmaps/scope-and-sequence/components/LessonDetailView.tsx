"use client";

import { Student } from "@zod-schema/scm/student/student";
import { SkillListWithProgress } from "../../components/SkillListWithProgress";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { getIM360Url } from "@/lib/utils/im360-url";

interface Lesson {
  _id: string;
  grade: string;
  unit: string;
  unitLessonId: string;
  unitNumber: number;
  lessonNumber: number;
  lessonName: string;
  section: string;
  scopeSequenceTag?: string;
  roadmapSkills?: string[];
  targetSkills?: string[];
}

interface LessonDetailViewProps {
  lesson: Lesson | null;
  onSkillClick?: (
    skillNumber: string,
    color: "blue" | "green" | "orange" | "purple",
  ) => void;
  masteredSkills?: string[];
  selectedSection?: string;
  selectedStudents?: Student[];
}

export function LessonDetailView({
  lesson,
  onSkillClick,
  masteredSkills = [],
  selectedSection,
  selectedStudents = [],
}: LessonDetailViewProps) {
  // Empty state
  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <BookOpenIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <div className="text-gray-600 font-medium mb-1">
            No Lesson Selected
          </div>
          <div className="text-gray-500 text-sm">
            Select a grade, unit, and lesson to view details
          </div>
        </div>
      </div>
    );
  }

  const im360Url = getIM360Url({
    gradeLevel: lesson.grade,
    unitNumber: lesson.unitNumber,
    lessonNumber: lesson.lessonNumber,
    section: lesson.section,
  });

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
                No skills tagged to this lesson yet. Skills can be added to
                track roadmap and target skills for this lesson.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
