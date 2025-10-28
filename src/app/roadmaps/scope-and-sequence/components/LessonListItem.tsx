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
      {/* Lesson Badge and Name */}
      <div className="space-y-2">
        <div>
          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
            isSelected ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'
          }`}>
            Lesson {lesson.lessonNumber}
          </span>
        </div>
        <div className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
          {lesson.lessonName}
        </div>
      </div>
    </div>
  );
}
