"use client";

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
}

interface LessonListItemProps {
  lesson: Lesson;
  isSelected: boolean;
  onClick: () => void;
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

export function LessonListItem({ lesson, isSelected, onClick }: LessonListItemProps) {
  const im360Url = getIM360Url(lesson);

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
        isSelected
          ? 'bg-blue-50 border-l-4 border-l-blue-600'
          : 'hover:bg-gray-50 border-l-4 border-l-transparent'
      }`}
    >
      {/* Lesson Badge and Name */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
            isSelected ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'
          }`}>
            Lesson {lesson.lessonNumber}
          </span>
          <a
            href={im360Url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 hover:text-blue-800 text-xs"
            title="View on IM 360"
          >
            IM 360 →
          </a>
        </div>
        <div className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
          {lesson.lessonName}
        </div>
      </div>
    </div>
  );
}
