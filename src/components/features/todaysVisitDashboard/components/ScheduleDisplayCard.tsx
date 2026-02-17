import React from "react";
import { Card } from "@/components/composed/cards/Card";
import { Heading } from "@/components/core/typography/Heading";
import { Text } from "@/components/core/typography/Text";
import { Badge } from "@/components/core/feedback/Badge";
import {
  ClockIcon,
  UserGroupIcon,
  AcademicCapIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useTodaysVisitData } from "../context/TodaysVisitContext";
import { formatMediumDate } from "@/lib/data-processing/transformers/utils/date-utils";

export function ScheduleDisplayCard() {
  const { todaysVisit, isLoading } = useTodaysVisitData();

  if (isLoading) {
    return (
      <Card padding="lg" className="animate-pulse">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!todaysVisit) {
    return (
      <Card padding="lg" className="text-center">
        <div className="space-y-4">
          <ClockIcon className="h-8 w-8 text-gray-400 mx-auto" />
          <Text color="muted">No schedule information available</Text>
        </div>
      </Card>
    );
  }

  const { schedule } = todaysVisit;

  return (
    <Card padding="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <ClockIcon className="h-6 w-6 text-purple-600" />
          <Heading level="h3" color="default">
            Visit Schedule
          </Heading>
          <Badge intent="info" className="text-xs">
            {formatMediumDate(schedule.date)}
          </Badge>
        </div>

        {/* Schedule Content */}
        {schedule.teachers.length === 0 ? (
          <div className="text-center py-8">
            <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <Text color="muted">
              Schedule details will be available once visit scheduling is
              implemented.
            </Text>
            <Text textSize="sm" color="muted" className="mt-2">
              Visit ID: {todaysVisit.visit._id}
            </Text>
            {todaysVisit.visit.visitScheduleId && (
              <Text textSize="sm" color="muted">
                Schedule ID: {todaysVisit.visit.visitScheduleId}
              </Text>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {schedule.teachers.map((teacher) => (
              <div key={teacher.id} className="border rounded-lg p-4 space-y-3">
                {/* Teacher Header */}
                <div className="flex items-center gap-3">
                  <UserGroupIcon className="h-5 w-5 text-blue-600" />
                  <Text color="default" className="font-medium">
                    {teacher.name}
                  </Text>
                  <Badge intent="secondary" className="text-xs">
                    {teacher.periods.length} period
                    {teacher.periods.length !== 1 ? "s" : ""}
                  </Badge>
                </div>

                {/* Periods */}
                <div className="pl-8 space-y-2">
                  {teacher.periods.map((period) => (
                    <div
                      key={period.periodNumber}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Badge intent="primary" className="text-xs min-w-fit">
                          Period {period.periodNumber}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <AcademicCapIcon className="h-4 w-4 text-gray-400" />
                          <Text textSize="sm" color="default">
                            {period.subject}
                          </Text>
                        </div>
                      </div>
                      {period.room && (
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="h-4 w-4 text-gray-400" />
                          <Text textSize="sm" color="muted">
                            {period.room}
                          </Text>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Additional Schedule Info */}
        {todaysVisit.visit.allowedPurpose && (
          <div className="border-t pt-4">
            <div className="space-y-2">
              <Text
                textSize="sm"
                color="muted"
                className="font-medium uppercase tracking-wide"
              >
                Visit Purpose
              </Text>
              <Badge intent="info">{todaysVisit.visit.allowedPurpose}</Badge>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
