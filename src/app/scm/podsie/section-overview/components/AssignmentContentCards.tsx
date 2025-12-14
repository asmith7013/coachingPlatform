import { useMemo } from "react";
import { Card } from "@/components/composed/cards/Card";
import { Heading } from "@/components/core/typography/Heading";
import { Text } from "@/components/core/typography/Text";
import type { AssignmentContent } from "@zod-schema/scm/podsie/section-config";

interface AssignmentContentCardsProps {
  assignmentContent: AssignmentContent[];
}

export function AssignmentContentCards({ assignmentContent }: AssignmentContentCardsProps) {
  // Group assignments by unit
  const groupedByUnit = useMemo(() => {
    const groups = new Map<string, AssignmentContent[]>();

    for (const assignment of assignmentContent) {
      // Extract unit from unitLessonId (e.g., "3.15" -> "3", "4.RU1" -> "4")
      const unitMatch = assignment.unitLessonId.match(/^(\d+)\./);
      const unitKey = unitMatch ? unitMatch[1] : "Other";

      if (!groups.has(unitKey)) {
        groups.set(unitKey, []);
      }
      groups.get(unitKey)!.push(assignment);
    }

    // Sort by unit number
    const sorted = Array.from(groups.entries()).sort((a, b) => {
      const aNum = parseInt(a[0], 10);
      const bNum = parseInt(b[0], 10);
      return aNum - bNum;
    });

    return sorted.map(([unit, assignments]) => ({
      unit,
      assignments: assignments.sort((a, b) => a.unitLessonId.localeCompare(b.unitLessonId)),
    }));
  }, [assignmentContent]);

  if (assignmentContent.length === 0) {
    return (
      <Card>
        <Card.Header>
          <Heading level="h2">Assignment Content</Heading>
        </Card.Header>
        <Card.Body>
          <Text color="muted">No assignment content configured for this section</Text>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <Heading level="h2">Assignment Content</Heading>
        <Text color="muted" textSize="sm">
          All configured assignments for this section ({assignmentContent.length} total)
        </Text>
      </Card.Header>

      <Card.Body>
        <div className="space-y-6">
          {groupedByUnit.map(({ unit, assignments }) => (
            <div key={unit}>
              <Heading level="h3" className="mb-3">
                Unit {unit}
              </Heading>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {assignments.map((assignment) => (
                  <AssignmentCard key={assignment.scopeAndSequenceId} assignment={assignment} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}

// Individual assignment card
function AssignmentCard({ assignment }: { assignment: AssignmentContent }) {
  const hasSidekick = assignment.podsieActivities.some((a) => a.activityType === "sidekick");
  const hasMasteryCheck = assignment.podsieActivities.some((a) => a.activityType === "mastery-check");
  const hasAssessment = assignment.podsieActivities.some((a) => a.activityType === "assessment");
  const hasZearn = !!assignment.zearnActivity;

  return (
    <div
      className={`border rounded-lg p-4 ${
        assignment.active ? "bg-white border-gray-300" : "bg-gray-50 border-gray-200 opacity-60"
      }`}
    >
      {/* Lesson Header */}
      <div className="mb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-xs font-semibold text-blue-600 mb-1">
              {assignment.unitLessonId}
              {assignment.section && ` - Section ${assignment.section}`}
            </div>
            <Text className="font-medium text-sm leading-tight">
              {assignment.lessonName}
            </Text>
          </div>
          {!assignment.active && (
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
              Inactive
            </span>
          )}
        </div>
      </div>

      {/* Activity Types */}
      <div className="space-y-2">
        {/* Podsie Activities */}
        {assignment.podsieActivities.length > 0 && (
          <div className="space-y-1">
            {hasSidekick && (
              <ActivityBadge
                label="Podsie Sidekick"
                count={assignment.podsieActivities.filter((a) => a.activityType === "sidekick").length}
                color="blue"
              />
            )}
            {hasMasteryCheck && (
              <ActivityBadge
                label="Mastery Check"
                count={assignment.podsieActivities.filter((a) => a.activityType === "mastery-check").length}
                color="purple"
              />
            )}
            {hasAssessment && (
              <ActivityBadge
                label="Assessment"
                count={assignment.podsieActivities.filter((a) => a.activityType === "assessment").length}
                color="red"
              />
            )}
          </div>
        )}

        {/* Zearn */}
        {hasZearn && <ActivityBadge label="Zearn" color="green" />}

        {/* No activities */}
        {!hasSidekick && !hasMasteryCheck && !hasAssessment && !hasZearn && (
          <Text textSize="xs" color="muted">
            No activities configured
          </Text>
        )}
      </div>

      {/* Notes */}
      {assignment.notes && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <Text textSize="xs" color="muted">
            {assignment.notes}
          </Text>
        </div>
      )}
    </div>
  );
}

// Activity badge component
function ActivityBadge({
  label,
  count,
  color,
}: {
  label: string;
  count?: number;
  color: "blue" | "purple" | "red" | "green";
}) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
    red: "bg-red-100 text-red-700 border-red-200",
    green: "bg-green-100 text-green-700 border-green-200",
  };

  return (
    <div
      className={`flex items-center justify-between px-2 py-1 rounded border text-xs ${colorClasses[color]}`}
    >
      <span className="font-medium">{label}</span>
      {count !== undefined && count > 1 && (
        <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white text-[10px] font-semibold">
          ×{count}
        </span>
      )}
    </div>
  );
}
