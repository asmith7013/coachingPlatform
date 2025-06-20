import React from 'react';
import { Button } from '@/components/core/Button';
import { Heading, Text } from '@/components/core/typography';
import { ScheduleAssignment, ScheduleAssignmentType } from '@enums';
import type { BellSchedule, VisitSchedule } from '@zod-schema/schedules/schedule-documents';

interface VisitScheduleGridProps {
  bellSchedule: BellSchedule;
  selectedTeacher: string;
  visitSchedule?: VisitSchedule | null;
  onPeriodSchedule: (periodNumber: number, portion: ScheduleAssignmentType) => void;
}

export const VisitScheduleGrid: React.FC<VisitScheduleGridProps> = ({
  bellSchedule,
  selectedTeacher,
  visitSchedule,
  onPeriodSchedule
}) => {
  // Use bell schedule time blocks directly
  const timeSlots = bellSchedule.timeBlocks || [];

  // Helper to check if a period/portion is already scheduled for the selected teacher
  const isScheduled = (periodNumber: number, portion: ScheduleAssignmentType): boolean => {
    if (!visitSchedule?.timeBlocks) return false;
    
    return visitSchedule.timeBlocks.some(block => 
      block.periodNumber === periodNumber && 
      block.portion === portion &&
      block.staffIds?.includes(selectedTeacher)
    );
  };

  return (
    <div className="space-y-4">
      <Heading level="h2">Schedule Visit Periods</Heading>
      <Text className="text-gray-600">
        Click on period segments to schedule visits. Blue = scheduled.
      </Text>
      
      <div className="grid gap-4">
        {timeSlots.map((timeSlot) => (
          <div key={timeSlot.periodNumber} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <Text className="font-semibold">
                  Period {timeSlot.periodNumber}
                  {timeSlot.periodName && `: ${timeSlot.periodName}`}
                </Text>
                <Text className="text-sm text-gray-600">
                  {timeSlot.startTime} - {timeSlot.endTime}
                </Text>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Button
                intent={isScheduled(timeSlot.periodNumber, ScheduleAssignment.FIRST_HALF) ? "primary" : "secondary"}
                appearance={isScheduled(timeSlot.periodNumber, ScheduleAssignment.FIRST_HALF) ? "solid" : "outline"}
                textSize="sm"
                onClick={() => {
                  console.log('💆 Button clicked: First Half, Period', timeSlot.periodNumber);
                  onPeriodSchedule(timeSlot.periodNumber, ScheduleAssignment.FIRST_HALF);
                }}
                className="text-xs"
              >
                First Half
              </Button>
              
              <Button
                intent={isScheduled(timeSlot.periodNumber, ScheduleAssignment.SECOND_HALF) ? "primary" : "secondary"}
                appearance={isScheduled(timeSlot.periodNumber, ScheduleAssignment.SECOND_HALF) ? "solid" : "outline"}
                textSize="sm"
                onClick={() => {
                  console.log('💆 Button clicked: Second Half, Period', timeSlot.periodNumber);
                  onPeriodSchedule(timeSlot.periodNumber, ScheduleAssignment.SECOND_HALF);
                }}
                className="text-xs"
              >
                Second Half
              </Button>
              
              <Button
                intent={isScheduled(timeSlot.periodNumber, ScheduleAssignment.FULL_PERIOD) ? "primary" : "secondary"}
                appearance={isScheduled(timeSlot.periodNumber, ScheduleAssignment.FULL_PERIOD) ? "solid" : "outline"}
                textSize="sm"
                onClick={() => {
                  console.log('💆 Button clicked: Full Period, Period', timeSlot.periodNumber);
                  onPeriodSchedule(timeSlot.periodNumber, ScheduleAssignment.FULL_PERIOD);
                }}
                className="text-xs"
              >
                Full Period
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 