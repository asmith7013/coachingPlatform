/**
 * @fileoverview DEPRECATED - This file is deprecated and will be removed.
 * Migration: Use components from @/components/features/schedulesUpdated/ instead
 * @deprecated
 */

'use client'

import React from 'react'
import { Heading, Text } from '@core-components'
import { ScheduleTable } from '@composed-components/tables/ScheduleTable'
import { CalendarIcon } from '@heroicons/react/24/outline'
import { cn } from '@ui/utils/formatters'
import type { TeacherSchedule } from '@/lib/schema/zod-schema/schedules/schedule'

interface SchedulePreviewProps {
  teacherSchedules?: TeacherSchedule[]
  isLoading?: boolean
  error?: boolean
  showTitle?: boolean
  maxDaysPreview?: number
  className?: string
}

/**
 * @deprecated Use SchedulePreview from @/components/features/schedulesUpdated/ instead.
 * This component will be removed in a future version.
 * Migration: Replace with equivalent component from schedulesUpdated feature.
 */
export function SchedulePreview({
  teacherSchedules,
  isLoading = false,
  error = false,
  showTitle = true,
  // maxDaysPreview = 3,
  className
}: SchedulePreviewProps) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('DEPRECATED: SchedulePreview from schedulesNew is deprecated. Use schedulesUpdated instead.');
  }
  // Get sample schedule for preview (first teacher's schedule)
  const sampleSchedule = teacherSchedules?.[0] || null

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
                    {sampleSchedule.dayIndices.length} Days
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={cn(
                    'rounded-full px-2 py-1',
                    'text-xs font-medium',
                    'bg-purple-100 text-purple-800'
                  )}>
                    {sampleSchedule.assignments.length} Assignments
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
                <ScheduleTable
                  schedule={sampleSchedule}
                  textSize="xs"
                  compact={true}
                  className="border-0"
                />
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
  )
} 