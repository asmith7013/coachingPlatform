import React from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { Heading, Text } from '@core-components';
import { cn } from '@ui/utils/formatters';
import type { SchedulePreviewProps } from './types';

/**
 * Pure UI component for displaying schedule preview
 * Extracted from schedulesNew - all business logic removed
 */
export function SchedulePreview({
  teacherSchedules,
  isLoading = false,
  error = false,
  showTitle = true,
  maxDaysPreview: _maxDaysPreview = 3,
  className
}: SchedulePreviewProps) {
  
  // Get sample schedule for preview (first teacher's schedule)
  const sampleSchedule = teacherSchedules?.[0] || null;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Title Section */}
      {showTitle && (
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-primary" />
          <Heading 
            level="h4" 
            color="default"
            className={cn("text-primary font-medium")}
          >
            Schedule Overview
          </Heading>
        </div>
      )}
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-4 bg-gray-50 rounded-md">
          <Text textSize="sm" color="muted">Loading schedules...</Text>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex items-center justify-center py-4 bg-red-50 rounded-md">
          <Text textSize="sm" color="muted">Error loading schedules</Text>
        </div>
      )}

      {/* Schedule Content */}
      {!isLoading && !error && teacherSchedules && teacherSchedules.length > 0 && (
        <div className="space-y-2">
          {/* Schedule Stats */}
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <span className={cn(
                'rounded-full px-2 py-1',
                'text-xs font-medium',
                'bg-blue-100 text-blue-800'
              )}>
                {teacherSchedules.length} Teachers
              </span>
            </div>
            {sampleSchedule && (
              <>
                <div className="flex items-center gap-1">
                  <span className={cn(
                    'rounded-full px-2 py-1',
                    'text-xs font-medium',
                    'bg-green-100 text-green-800'
                  )}>
                    {sampleSchedule.dayIndices?.length || 0} Days
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={cn(
                    'rounded-full px-2 py-1',
                    'text-xs font-medium',
                    'bg-purple-100 text-purple-800'
                  )}>
                    {sampleSchedule.timeBlocks?.length || 0} Time Blocks
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Schedule Preview Table */}
          {sampleSchedule ? (
            <div className="border rounded-md overflow-hidden bg-white">
              <div className="px-3 py-2 bg-gray-50 border-b">
                <Text textSize="xs" color="muted">
                  Sample Schedule Preview
                </Text>
              </div>
              <div className="max-h-32 overflow-y-auto">
                                 {/* Simple schedule display */}
                 <div className="p-3 space-y-2">
                   {sampleSchedule.timeBlocks?.slice(0, 5).map((timeBlock, index) => (
                     <div key={index} className="flex justify-between items-center text-xs">
                       <span className="font-medium">Period {timeBlock.periodNumber}</span>
                       <span className="text-gray-600">{timeBlock.className}</span>
                       <span className="text-gray-500">{timeBlock.room}</span>
                     </div>
                   ))}
                   {(sampleSchedule.timeBlocks?.length || 0) > 5 && (
                     <div className="text-xs text-gray-500 text-center">
                       ...and {(sampleSchedule.timeBlocks?.length || 0) - 5} more
                     </div>
                   )}
                 </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-4 bg-gray-50 rounded-md">
              <Text textSize="sm" color="muted">
                Schedules exist but no periods defined
              </Text>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && (!teacherSchedules || teacherSchedules.length === 0) && (
        <div className="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-md border-2 border-dashed border-gray-300">
          <CalendarIcon className="h-8 w-8 text-gray-400 mb-2" />
          <Text textSize="sm" color="muted" className="text-center">
            No schedules yet
          </Text>
          <Text textSize="xs" color="muted" className="text-center mt-1">
            Add staff and schedules to see preview
          </Text>
        </div>
      )}
    </div>
  );
} 