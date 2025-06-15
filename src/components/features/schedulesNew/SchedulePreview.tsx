'use client'

import React from 'react'
import { Heading, Text } from '@core-components'
import { ScheduleTable } from '@composed-components/tables/ScheduleTable'
import { CalendarIcon } from '@heroicons/react/24/outline'
import { cn } from '@ui/utils/formatters'
import type { TeacherSchedule } from '@zod-schema/schedule/schedule'

interface SchedulePreviewProps {
  teacherSchedules?: TeacherSchedule[]
  isLoading?: boolean
  error?: boolean
  showTitle?: boolean
  maxDaysPreview?: number
  className?: string
}

export function SchedulePreview({
  teacherSchedules,
  isLoading = false,
  error = false,
  showTitle = true,
  maxDaysPreview = 3,
  className
}: SchedulePreviewProps) {
  // Get sample schedule for preview (first teacher's schedule)
  const sampleSchedule = teacherSchedules?.[0]?.assignments || []

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
            {sampleSchedule.length > 0 && (
              <div className="flex items-center gap-1">
                <span className={cn(
                  'rounded-full px-2 py-1',
                  'text-xs font-medium',
                  'bg-green-100 text-green-800'
                )}>
                  {sampleSchedule.length} Days
                </span>
              </div>
            )}
            {sampleSchedule[0]?.periodNumber && (
              <div className="flex items-center gap-1">
                <span className={cn(
                  'rounded-full px-2 py-1',
                  'text-xs font-medium',
                  'bg-purple-100 text-purple-800'
                )}>
                  {sampleSchedule[0].periodNumber} Periods
                </span>
              </div>
            )}
          </div>

          {/* Schedule Preview Table */}
          {sampleSchedule.length > 0 ? (
            <div className="border rounded-md overflow-hidden bg-white">
              <div className="px-3 py-2 bg-gray-50 border-b">
                <Text textSize="xs" color="muted">
                  Sample Schedule Preview
                </Text>
              </div>
              <div className="max-h-32 overflow-y-auto">
                <ScheduleTable
                  scheduleByDay={sampleSchedule.slice(0, maxDaysPreview) as unknown as TeacherSchedule[]}
                  textSize="xs"
                  compact={true}
                  className="border-0"
                />
              </div>
              {sampleSchedule.length > maxDaysPreview && (
                <div className="px-3 py-2 bg-gray-50 border-t">
                  <Text textSize="xs" color="muted">
                    +{sampleSchedule.length - maxDaysPreview} more days
                  </Text>
                </div>
              )}
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
  )
} 