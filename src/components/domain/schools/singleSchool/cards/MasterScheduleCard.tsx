'use client'

import { useState, useMemo } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { Card } from '@composed-components/cards/Card'
import { StatisticsGrid } from '@composed-components/statistics/StatisticsGrid'
import { BellScheduleGrid } from '@components/composed/calendar/schedule/BellScheduleGrid'
import { useSchoolDailyView } from '@hooks/domain/schedule/useSchoolDailyView'
import { useAdaptiveHeight } from '@hooks/ui'
import { Text, Heading } from '@core-components/typography'
import { Badge } from '@core-components/feedback'
import { 
  CalendarDaysIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { navigateDate, getTodayString, isToday, formatLongDate } from '@transformers/utils/date-utils'
import type { PeriodTime } from '@domain-types/schedule'
import type { BellScheduleEvent, ScheduleColumn } from '@domain-types/schedule'

const masterScheduleCard = tv({
  slots: {
    container: 'space-y-6',
    header: 'flex items-center justify-between',
    headerContent: 'space-y-1',
    headerActions: 'flex items-center space-x-3',
    dateNavigation: 'flex items-center space-x-2',
    dateButton: 'flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors',
    currentDate: 'px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md min-w-[120px] text-center',
    todayButton: 'px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md border border-indigo-200 transition-colors',
    scheduleContainer: 'bg-white rounded-lg border overflow-hidden',
    emptyState: 'text-center py-12 text-gray-500',
    loadingState: 'text-center py-12'
  },
  variants: {
    variant: {
      default: {},
      compact: {
        container: 'space-y-4',
        scheduleContainer: 'p-0'
      }
    },
    height: {
      auto: {
        scheduleContainer: 'min-h-[400px] max-h-[90vh]'
      },
      sm: {
        scheduleContainer: 'h-96'
      },
      md: {
        scheduleContainer: 'h-[600px]'
      },
      lg: {
        scheduleContainer: 'h-[800px]'
      },
      xl: {
        scheduleContainer: 'h-[1000px]'
      },
      responsive: {
        scheduleContainer: ''
      }
    }
  },
  defaultVariants: {
    variant: 'default',
    height: 'responsive'
  }
})

export interface MasterScheduleCardProps extends VariantProps<typeof masterScheduleCard> {
  schoolId: string
  schoolName?: string
  initialDate?: string
  className?: string
  height?: 'auto' | 'sm' | 'md' | 'lg' | 'xl' | 'responsive'
  interactive?: boolean
}

export function MasterScheduleCard({
  schoolId,
  schoolName,
  initialDate,
  variant,
  height = 'responsive',
  className,
  interactive = true
}: MasterScheduleCardProps) {
  const styles = masterScheduleCard({ variant, height })
  
  // State for current viewing date
  const [currentDate, setCurrentDate] = useState(
    initialDate || getTodayString()
  )
  
  // Fetch schedule data for statistics
  const { 
    school, 
    schedules, 
    bellSchedule,
    staff,
    isLoading, 
    error,
    hasData,
    teacherCount,
    staffCount 
  } = useSchoolDailyView(schoolId, currentDate)
  
  // Transform data for BellScheduleGrid
  const { columns, events, periodTimes } = useMemo(() => {
    // Create period times from bell schedule
    const periods: PeriodTime[] = bellSchedule?.classSchedule?.map((period, index) => ({
      period: period.periodNum || index + 1,
      start: period.startTime,
      end: period.endTime
    })) || []

    // Create columns from teacher schedules
    const scheduleColumns: ScheduleColumn[] = [
      // Add planned visits column for interactive mode
      ...(interactive ? [{
        id: 'planned-visits',
        title: 'Planned Visits',
        subtitle: 'Coach Assignments'
      }] : []),
      
      // Then add teacher columns
      ...schedules.map((schedule, index) => {
        const teacher = staff.find(s => s._id === schedule.teacher)
        return {
          id: schedule._id || `teacher-${index}`,
          title: teacher?.staffName || `Teacher ${index + 1}`,
          subtitle: schedule.scheduleByDay[0]?.periods[0]?.room ? 
            `Room ${schedule.scheduleByDay[0].periods[0].room}` : undefined
        }
      })
    ]

    // Create events from schedule data
    const scheduleEvents: BellScheduleEvent[] = []
    schedules.forEach((schedule, teacherIndex) => {
      schedule.scheduleByDay.forEach(day => {
        day.periods.forEach(period => {
          if (period.className && period.periodType !== 'Prep') {
            // Find matching bell schedule period for timing
            const bellPeriod = bellSchedule?.classSchedule?.find(
              item => item.periodNum === period.periodNum
            )
            
            if (bellPeriod) {
              scheduleEvents.push({
                id: `${schedule._id}-${period.periodNum}-${day.day}`,
                title: period.className,
                startTime: bellPeriod.startTime,
                duration: 1, // Default duration, could calculate from bell schedule
                color: 'blue', // Default color, could use getSubjectColor
                day: 0, // Not used in bell schedule grid
                period: period.periodNum,
                columnIndex: teacherIndex,
                startPosition: 'start' as const,
                totalDuration: 1,
                teacherId: schedule.teacher || schedule._id || `teacher-${teacherIndex}`
              })
            }
          }
        })
      })
    })

    return {
      columns: scheduleColumns,
      events: scheduleEvents,
      periodTimes: periods
    }
  }, [schedules, staff, bellSchedule, interactive])

  // NEW: Responsive height calculation
  const { isSmall } = useAdaptiveHeight({
    minHeight: 400,
    maxHeight: typeof window !== 'undefined' && window.innerHeight ? window.innerHeight * 0.85 : 800,
    breakpoints: {
      sm: 400,
      md: 600, 
      lg: 800,
      xl: 1000
    }
  })

  // NEW: Content-based height calculation
  const contentMetrics = useMemo(() => ({
    teacherCount: columns.length,
    periodCount: periodTimes.length,
    hasTeacherSchedules: schedules.length > 0 && staff.length > 0,
    hasActiveAssignments: false,
    accountabilityVariant: (columns.length > 8 || isSmall) ? 'compact' as const : 'default' as const
  }), [columns.length, periodTimes.length, schedules.length, staff.length, isSmall])

  const { contentAnalysis } = useAdaptiveHeight({
    contentMetrics,
    breakpoints: {
      sm: 400,
      md: 600,
      lg: 800,
      xl: 1000
    }
  })

  // Calculate dynamic style for responsive height
  const dynamicScheduleStyle = useMemo(() => {
    if (height !== 'responsive') return {}
    
    // Calculate final height using content-based calculation and responsive constraints
    const finalHeight = Math.max(
      400, // minimum height
      Math.min(
        contentAnalysis?.recommended || 400,
        typeof window !== 'undefined' && window.innerHeight ? window.innerHeight * 0.85 : 800
      )
    )
    
    return {
      height: `${finalHeight}px`,
      maxHeight: '85vh' // Fallback for very large screens
    }
  }, [height, contentAnalysis])
  
  // Calculate statistics for the grid
  const scheduleStatistics = [
    {
      id: 'teachers',
      icon: UserGroupIcon,
      value: teacherCount,
      label: 'Teachers',
      color: 'blue' as const
    },
    {
      id: 'staff',
      icon: UserGroupIcon,
      value: staffCount,
      label: 'Total Staff',
      color: 'green' as const
    },
    {
      id: 'classes',
      icon: AcademicCapIcon,
      value: schedules.reduce((total, schedule) => 
        total + schedule.scheduleByDay.reduce((dayTotal, day) => 
          dayTotal + day.periods.filter(p => p.periodType === 'class').length, 0
        ), 0
      ),
      label: 'Classes Today',
      color: 'purple' as const
    },
    {
      id: 'periods',
      icon: ClockIcon,
      value: periodTimes.length.toString(),
      label: 'Periods',
      color: 'orange' as const
    }
  ]
  
  // Date navigation handlers
  const handlePrevDay = () => {
    setCurrentDate(navigateDate(currentDate, 'prev'))
  }
  
  const handleNextDay = () => {
    setCurrentDate(navigateDate(currentDate, 'next'))
  }
  
  const handleToday = () => {
    setCurrentDate(navigateDate(currentDate, 'today'))
  }
  
  // Format current date for display using utility
  const displayDate = formatLongDate(currentDate)
  
  // Check if current date is today
  const todayCheck = isToday(currentDate)

  // Event handlers for schedule interactions
  const handleEventClick = (event: BellScheduleEvent) => {
    console.log('Event clicked:', event)
    // Could open a modal or navigate to class details
  }

  return (
    <Card className={className}>
      <div className={styles.container()}>
        {/* Header with title and date navigation */}
        <div className={styles.header()}>
          <div className={styles.headerContent()}>
            <div className="flex items-center space-x-3">
              <Heading level="h3">Master Schedule</Heading>
              {hasData && !isLoading && (
                <Badge intent="primary" size="sm">
                  {columns.length} Teachers
                </Badge>
              )}
            </div>
            <Text color="muted" textSize="sm">
              {schoolName || school?.schoolName || 'School'} daily class schedules and teacher assignments
            </Text>
          </div>
          
          <div className={styles.headerActions()}>
            <div className={styles.dateNavigation()}>
              <button
                onClick={handlePrevDay}
                className={styles.dateButton()}
                aria-label="Previous day"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              
              <div className={styles.currentDate()}>
                {displayDate}
              </div>
              
              <button
                onClick={handleNextDay}
                className={styles.dateButton()}
                aria-label="Next day"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
            
            {!todayCheck && (
              <button
                onClick={handleToday}
                className={styles.todayButton()}
              >
                Today
              </button>
            )}
          </div>
        </div>
        
        {/* Statistics Grid */}
        {hasData && !isLoading && (
          <StatisticsGrid
            statistics={scheduleStatistics}
            columns={4}
            spacing="md"
            cardSize="sm"
          />
        )}
        
        {/* Schedule Display */}
        <div 
          className={styles.scheduleContainer()}
          style={height === 'responsive' ? dynamicScheduleStyle : undefined}
        >
          {isLoading && (
            <div className={styles.loadingState()}>
              <Text color="muted">Loading schedule...</Text>
            </div>
          )}
          
          {error && !isLoading && (
            <div className={styles.emptyState()}>
              <Text color="muted">Error loading schedule: {error.message || String(error)}</Text>
            </div>
          )}
          
          {!hasData && !isLoading && !error && (
            <div className={styles.emptyState()}>
              <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <Text color="muted">No schedule data available for this date</Text>
              <Text color="muted" textSize="sm">
                Try selecting a different date or check if schedules have been created.
              </Text>
            </div>
          )}
          
          {hasData && !isLoading && periodTimes.length > 0 && columns.length > 0 && (
            <BellScheduleGrid
              columns={columns}
              events={events}
              periodTimes={periodTimes}
              onEventClick={handleEventClick}
              interactive={interactive}
              className="h-full"
            />
          )}
          
          {hasData && !isLoading && (periodTimes.length === 0 || columns.length === 0) && (
            <div className={styles.emptyState()}>
              <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <Text color="muted">No class schedules found</Text>
              <Text color="muted" textSize="sm">
                {periodTimes.length === 0 ? 'No bell schedule periods configured.' : 'No teacher schedules available for this date.'}
              </Text>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

/**
 * Default export for convenient importing
 */
export default MasterScheduleCard 