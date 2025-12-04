import { CheckIcon } from "@heroicons/react/24/outline";
import type { AssignmentContent } from "@zod-schema/313/section-config";

interface ExistingAssignmentsListProps {
  assignments: AssignmentContent[];
}

export function ExistingAssignmentsList({
  assignments
}: ExistingAssignmentsListProps) {
  if (assignments.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">
        Existing Assignments ({assignments.length})
      </h2>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {assignments.map((assignment, idx) => {
          // Get the first podsie activity for display
          const firstActivity = assignment.podsieActivities?.[0];
          if (!firstActivity) return null;

          return (
            <div key={idx} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {assignment.unitLessonId}: {assignment.lessonName}
                </div>
                <div className="text-sm text-gray-600">
                  Assignment ID: {firstActivity.podsieAssignmentId} • {firstActivity.totalQuestions} questions • {firstActivity.variations ?? 3} variations • {firstActivity.activityType}
                  {assignment.podsieActivities.length > 1 && ` (+${assignment.podsieActivities.length - 1} more activities)`}
                </div>
              </div>
              <CheckIcon className="w-5 h-5 text-green-600" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
