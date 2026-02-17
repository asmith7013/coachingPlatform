import React from "react";
import { Heading, Text } from "@/components/core/typography";
import type { BellSchedule } from "@zod-schema/schedules/schedule-documents";

interface BellScheduleDisplayComponentProps {
  bellSchedule: BellSchedule;
  className?: string;
}

/**
 * Displays bell schedule information in a grid layout
 * Uses domain types directly from schema
 */
export function BellScheduleDisplayComponent({
  bellSchedule,
  className,
}: BellScheduleDisplayComponentProps) {
  const { name, timeBlocks } = bellSchedule;

  return (
    <div className={className}>
      <Heading level="h2">Bell Schedule: {name}</Heading>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
        {timeBlocks?.map((period) => (
          <div key={period.periodNumber} className="p-2 bg-gray-100 rounded">
            <Text className="font-medium">
              Period {period.periodNumber}: {period.periodName}
            </Text>
            <Text className="text-sm text-gray-600">
              {period.startTime} - {period.endTime}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}
