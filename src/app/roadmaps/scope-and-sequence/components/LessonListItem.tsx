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

export function LessonListItem({ lesson, isSelected, onClick }: LessonListItemProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
        isSelected
          ? 'bg-blue-50 border-l-4 border-l-blue-600'
          : 'hover:bg-gray-50 border-l-4 border-l-transparent'
      }`}
    >
      {/* Lesson ID and Name */}
      <div className={`font-medium mb-2 ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
        {lesson.unitLessonId} - {lesson.lessonName}
      </div>

      {/* Additional Info */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Lesson:</span>
          <span className="font-medium text-gray-700">{lesson.lessonNumber}</span>
        </div>
        {lesson.section && (
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Section:</span>
            <span className="font-medium text-purple-600">{lesson.section}</span>
          </div>
        )}
        {lesson.scopeSequenceTag && (
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {lesson.scopeSequenceTag}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
