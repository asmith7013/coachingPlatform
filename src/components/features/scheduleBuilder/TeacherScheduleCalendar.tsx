'use client'

import { useMemo } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { formatLongDate } from '@transformers/utils/date-utils'
import { radiiTop, radii } from '@ui-tokens'

import { ScheduleGrid } from '@components/features/scheduleBuilder/ScheduleGrid'
import type { BellScheduleEvent } from '@components/features/scheduleBuilder/transformers/schedule-transforms'

import { useScheduleDisplay } from '@hooks/domain/useScheduleDisplay'
import { createTeacherColumns } from '@/components/features/scheduleBuilder/utils/event-builders'
import type { BellSchedule, TeacherSchedule } from '@zod-schema/schedule/schedule'

const teacherScheduleCalendar = tv({
  slots: {
    container: ['flex h-full flex-col overflow-hidden', radii.lg],
    header: ['flex flex-none items-center justify-between px-6 py-4', radiiTop.lg],
    title: 'text-base font-semibold text-gray-900',
    subtitle: 'text-sm text-gray-600',
    content: 'flex-1 overflow-hidden'
  },
  variants: {
    variant: {
      default: {},
      compact: {
        header: 'px-4 py-3',
        title: 'text-sm font-medium'
      }
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})

export interface TeacherScheduleCalendarProps extends VariantProps<typeof teacherScheduleCalendar> {
  schoolName: string
  date: string
  schedules: TeacherSchedule[]
  staff: Array<{ _id: string; staffName: string }>
  bellSchedule?: BellSchedule
  onEventClick?: (event: BellScheduleEvent) => void
  onNavigateDate?: (direction: 'prev' | 'next' | 'today') => void
  className?: string
}

export function TeacherScheduleCalendar({
  schoolName,
  date,
  schedules,
  staff,
  bellSchedule,
  onEventClick,
  onNavigateDate,
  variant,
  className
}: TeacherScheduleCalendarProps) {
  const styles = teacherScheduleCalendar({ variant })
  
  // Use shared hook for all transformation logic
  const { validatedSchedules, staffMap, periodTimes, events, hasBellSchedule, error: scheduleError } = useScheduleDisplay(
    schedules, 
    staff, 
    date, 
    bellSchedule
  )
  
  // Create schedule columns using domain factory
  const scheduleColumns = useMemo(() => {
    return createTeacherColumns(validatedSchedules, staffMap)
  }, [validatedSchedules, staffMap])

  // Handle missing bell schedule or errors
  if (!hasBellSchedule || scheduleError) {
    return (
      <div className={styles.container({ className })}>
        <header className={styles.header()}>
          <div>
            <h1 className={styles.title()}>
              {schoolName} - Teacher Schedules
            </h1>
            <p className={styles.subtitle()}>
              {formatLongDate(date)}
            </p>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-red-600 mb-2">
              {scheduleError || 'Bell schedule required'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container({ className })}>
      {/* Custom header for teacher schedule view */}
      <header className={styles.header()}>
        <div>
          <h1 className={styles.title()}>
            {schoolName} - Teacher Schedules
          </h1>
          <p className={styles.subtitle()}>
            {formatLongDate(date)}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center rounded-md bg-white shadow-sm">
            <button
              type="button"
              onClick={() => onNavigateDate?.('prev')}
              className="flex h-8 w-8 items-center justify-center rounded-l-md border-y border-l border-gray-300 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Previous day</span>
              ←
            </button>
            <button
              type="button"
              onClick={() => onNavigateDate?.('today')}
              className="h-8 border-y border-gray-300 px-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 flex items-center justify-center"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => onNavigateDate?.('next')}
              className="flex h-8 w-8 items-center justify-center rounded-r-md border-y border-r border-gray-300 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Next day</span>
              →
            </button>
          </div>
        </div>
      </header>

      <div className={styles.content()}>
        <ScheduleGrid
          columns={scheduleColumns}
          events={events}
          periodTimes={periodTimes}
          onEventClick={onEventClick}
        />
      </div>
    </div>
  )
} 