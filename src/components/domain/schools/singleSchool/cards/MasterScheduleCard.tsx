'use client'

import { useState } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { Card } from '@composed-components/cards/Card'
import { StatisticsGrid } from '@composed-components/statistics/StatisticsGrid'
import { TeacherDailySchedule } from '@components/features/scheduling'
import { useSchoolDailyView } from '@hooks/domain/useSchoolDailyView'
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
    scheduleContainer: 'bg-gray-50 rounded-lg p-1',
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
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})

export interface MasterScheduleCardProps extends VariantProps<typeof masterScheduleCard> {
  schoolId: string
  schoolName?: string
  initialDate?: string
  className?: string
}

export function MasterScheduleCard({
  schoolId,
  schoolName,
  initialDate,
  variant,
  className
}: MasterScheduleCardProps) {
  const styles = masterScheduleCard({ variant })
  
  // State for current viewing date
  const [currentDate, setCurrentDate] = useState(
    initialDate || getTodayString()
  )
  
  // Fetch schedule data for statistics
  const { 
    school, 
    schedules, 
    isLoading, 
    error,
    hasData,
    teacherCount,
    staffCount 
  } = useSchoolDailyView(schoolId, currentDate)
  
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
      value: '1-8',
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

  return (
    <Card className={className}>
      <div className={styles.container()}>
        {/* Header with title and date navigation */}
        <div className={styles.header()}>
          <div className={styles.headerContent()}>
            <div className="flex items-center space-x-3">
              <Heading level="h3">Master Schedule</Heading>
              {hasData && !isLoading && (
                <Badge intent="success" size="sm">
                  Active
                </Badge>
              )}
            </div>
            <Text color="muted" textSize="sm">
              {schoolName || school?.schoolName || 'School'} daily teacher schedules
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
        <div className={styles.scheduleContainer()}>
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
          
          {hasData && !isLoading && (
            <TeacherDailySchedule
              schoolId={schoolId}
              initialDate={currentDate}
              className="h-[600px] bg-white rounded-md shadow-sm"
            />
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