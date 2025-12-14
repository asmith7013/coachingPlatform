import { Card } from "@/components/composed/cards/Card";
import { Heading } from "@/components/core/typography/Heading";
import { Text } from "@/components/core/typography/Text";
import type { BellSchedule } from "@zod-schema/scm/podsie/section-config";
import { BellScheduleHelpers } from "@zod-schema/scm/podsie/section-config";

interface BellScheduleDisplayProps {
  bellSchedule?: BellSchedule;
}

export function BellScheduleDisplay({ bellSchedule }: BellScheduleDisplayProps) {
  if (!bellSchedule) {
    return (
      <Card>
        <Card.Header>
          <Heading level="h2">Bell Schedule</Heading>
        </Card.Header>
        <Card.Body>
          <Text color="muted">No bell schedule configured for this section</Text>
        </Card.Body>
      </Card>
    );
  }

  const days = [
    { key: "monday", label: "Monday", schedule: bellSchedule.monday },
    { key: "tuesday", label: "Tuesday", schedule: bellSchedule.tuesday },
    { key: "wednesday", label: "Wednesday", schedule: bellSchedule.wednesday },
    { key: "thursday", label: "Thursday", schedule: bellSchedule.thursday },
    { key: "friday", label: "Friday", schedule: bellSchedule.friday },
  ];

  const totalMeetings = BellScheduleHelpers.getTotalWeeklyMeetings(bellSchedule);
  const totalMinutes = BellScheduleHelpers.getTotalWeeklyMinutes(bellSchedule);
  const averageLength = BellScheduleHelpers.getAverageMeetingLength(bellSchedule);

  return (
    <Card>
      <Card.Header>
        <Heading level="h2">Bell Schedule</Heading>
        <Text color="muted" textSize="sm">
          Weekly class meeting schedule
        </Text>
      </Card.Header>

      <Card.Body>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{totalMeetings}</div>
              <Text textSize="sm" color="muted">
                Meetings/Week
              </Text>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700">{totalMinutes}</div>
              <Text textSize="sm" color="muted">
                Minutes/Week
              </Text>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-700">{averageLength}</div>
              <Text textSize="sm" color="muted">
                Avg Minutes/Meeting
              </Text>
            </div>
          </div>

          {/* Daily Schedule */}
          <div className="space-y-2">
            <Heading level="h3" className="mb-3">
              Daily Schedule
            </Heading>
            {days.map((day) => {
              const hasClass = day.schedule && day.schedule.meetingCount > 0;
              return (
                <div
                  key={day.key}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    hasClass
                      ? "bg-white border-gray-300"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex-1">
                    <Text className="font-medium">{day.label}</Text>
                  </div>
                  {hasClass && day.schedule ? (
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="font-semibold text-blue-600">
                          {day.schedule.meetingCount}
                        </span>
                        <span className="text-gray-600">
                          {" "}
                          meeting{day.schedule.meetingCount > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold text-green-600">
                          {day.schedule.minutesPerMeeting}
                        </span>
                        <span className="text-gray-600"> min each</span>
                      </div>
                      <div className="text-sm font-semibold text-purple-600">
                        {day.schedule.meetingCount * day.schedule.minutesPerMeeting} min total
                      </div>
                    </div>
                  ) : (
                    <Text color="muted" textSize="sm">
                      No class
                    </Text>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
