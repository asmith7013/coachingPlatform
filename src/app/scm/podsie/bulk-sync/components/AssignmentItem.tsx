import type { AssignmentContent } from "@zod-schema/scm/podsie/section-config";

interface AssignmentItemProps {
  assignment: AssignmentContent;
}

// Get activity type label
const getActivityTypeLabel = (activityType?: string) => {
  switch (activityType) {
    case 'sidekick': return 'Sidekick';
    case 'mastery-check': return 'Mastery Check';
    case 'assessment': return 'Assessment';
    default: return 'Unknown';
  }
};

// Get activity type color
const getActivityTypeColor = (activityType?: string) => {
  switch (activityType) {
    case 'sidekick': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'mastery-check': return 'bg-green-100 text-green-800 border-green-300';
    case 'assessment': return 'bg-purple-100 text-purple-800 border-purple-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export function AssignmentItem({ assignment }: AssignmentItemProps) {
  return (
    <div className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">
            {assignment.lessonName}
          </h4>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Lesson ID: {assignment.unitLessonId}</span>
            {assignment.grade && (
              <>
                <span>•</span>
                <span>Grade: {assignment.grade}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Activities */}
      {assignment.podsieActivities && assignment.podsieActivities.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {assignment.podsieActivities.map((activity, actIdx) => (
            <div
              key={actIdx}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm border ${getActivityTypeColor(activity.activityType)}`}
            >
              <span className="font-medium">{getActivityTypeLabel(activity.activityType)}</span>
              <span>•</span>
              <span>{activity.totalQuestions} questions</span>
              {activity.active === false && (
                <>
                  <span>•</span>
                  <span className="text-red-600 font-medium">Inactive</span>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
