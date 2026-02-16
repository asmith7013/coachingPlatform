"use client";

interface AnalysisSidebarProps {
  gradeLevel: string;
  unitNumber: number | null;
  lessonNumber: number | null;
  masteryCheckImage: { preview?: string | null; uploadedUrl?: string | null };
  learningGoals: (string | object)[];
}

export function AnalysisSidebar({
  gradeLevel,
  unitNumber,
  lessonNumber,
  masteryCheckImage,
  learningGoals,
}: AnalysisSidebarProps) {
  return (
    <div className="w-[30%] bg-[#6B7280] rounded-lg p-4">
      <div className="sticky top-8 space-y-4">
        {/* Unit and Lesson Badges */}
        {(unitNumber || lessonNumber) && (
          <div className="flex flex-wrap gap-2">
            {gradeLevel && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">
                Grade {gradeLevel}
              </span>
            )}
            {unitNumber && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">
                Unit {unitNumber}
              </span>
            )}
            {lessonNumber !== null && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">
                Lesson {lessonNumber}
              </span>
            )}
          </div>
        )}

        {/* Task Image */}
        {(masteryCheckImage.preview ||
          masteryCheckImage.uploadedUrl) && (
          <div className="bg-white rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Task
            </h4>
            <img
              src={
                masteryCheckImage.preview ||
                masteryCheckImage.uploadedUrl ||
                ""
              }
              alt="Task"
              className="w-full rounded border border-gray-200"
            />
          </div>
        )}

        {/* Learning Targets */}
        {learningGoals && learningGoals.length > 0 && (
          <div className="bg-white rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Learning Targets
            </h4>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              {learningGoals.map((goal, i) => (
                <li key={i}>
                  {typeof goal === "string" ? goal : JSON.stringify(goal)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
