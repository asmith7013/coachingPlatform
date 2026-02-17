import { Card } from "@/components/composed/cards/Card";
import { Heading } from "@/components/core/typography/Heading";
import { Text } from "@/components/core/typography/Text";
import { cn } from "@ui/utils/formatters";

type KHLesson = {
  grade: string;
  unit: string;
  lessonNumber: string;
  activities: {
    activityNumber: string;
    activityTitle?: string;
    isWarmUp?: boolean;
    routines: string[];
  }[];
};

export function KHLesson({
  lesson,
  selectedRoutines,
}: {
  lesson: KHLesson;
  selectedRoutines: string[];
}) {
  const hasSelected = lesson.activities.some((activity) =>
    activity.routines.some((r) => selectedRoutines.includes(r.trim())),
  );

  return (
    <Card
      className={cn(
        "p-6 border-2 shadow-sm space-y-4",
        hasSelected
          ? "bg-background border-muted"
          : "bg-surface border-surface",
      )}
    >
      <Heading
        level="h3"
        className={cn("mb-2 text-primary", !hasSelected && "text-muted")}
      >
        Lesson {lesson.lessonNumber}
      </Heading>

      {hasSelected ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface">
          {lesson.activities
            .filter((activity) =>
              activity.routines.some((r) =>
                selectedRoutines.includes(r.trim()),
              ),
            )
            .map((activity) => (
              <div
                key={activity.activityNumber}
                className="p-4 rounded-lg border-2 border-outline bg-surface"
              >
                <div className="mb-2 space-y-1">
                  <Text textSize="sm" className="font-medium text-text">
                    {activity.activityNumber === "Warm Up"
                      ? "Warm Up"
                      : `Activity ${activity.activityNumber}`}
                  </Text>
                  {activity.activityTitle && (
                    <Text textSize="sm" className="text-muted">
                      {activity.activityTitle}
                    </Text>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {activity.routines
                    .filter((r) => selectedRoutines.includes(r.trim()))
                    .map((routine, i) => {
                      const isMLR = /^MLR\d+/.test(routine);
                      return (
                        <span
                          key={i}
                          className={cn(
                            "text-[10px] font-medium px-2 py-0.5 rounded",
                            isMLR
                              ? "bg-primary text-white"
                              : "bg-secondary text-white",
                          )}
                        >
                          {routine}
                        </span>
                      );
                    })}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <Text textSize="sm" className="italic text-muted">
          No routines for this lesson.
        </Text>
      )}
    </Card>
  );
}
