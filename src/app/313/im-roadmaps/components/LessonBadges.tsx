import { RoadmapsLesson } from '@zod-schema/313/roadmap';

interface LessonBadgesProps {
  lessons: RoadmapsLesson[];
  selectedLessonId: string | null;
  onLessonSelect: (lessonId: string) => void;
}

export function LessonBadges({ lessons, selectedLessonId, onLessonSelect }: LessonBadgesProps) {
  // Group lessons by section
  const lessonsBySection = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.section as string]) acc[lesson.section as string] = [];
    acc[lesson.section as string].push(lesson);
    return acc;
  }, {} as Record<string, RoadmapsLesson[]>);

  // Sort sections alphabetically
  const sortedSections = Object.keys(lessonsBySection).sort();

  return (
    <div className="space-y-4">
      {sortedSections.map((section) => (
        <div key={section}>
          <h3 className="text-sm font-medium mb-2 text-gray-700 uppercase tracking-wide">
            Section {section}
          </h3>
          <div className="space-y-2">
            {lessonsBySection[section]
              .sort((a, b) => (a.lesson || 0) - (b.lesson || 0))
              .map((lesson) => (
                <button
                  key={lesson._id}
                  onClick={() => onLessonSelect(lesson._id)}
                  className={`w-full text-left px-3 py-2 rounded-lg border transition-colors text-sm ${
                    selectedLessonId === lesson._id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="font-medium">Lesson {lesson.lesson}</div>
                  <div className={`text-xs mt-1 ${
                    selectedLessonId === lesson._id ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {lesson.lessonName}
                  </div>
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
