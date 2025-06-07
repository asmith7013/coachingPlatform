'use client'

import { useState } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { Card } from '@composed-components/cards/Card'
import { StatisticsGrid } from '@composed-components/statistics/StatisticsGrid'
import { ModeToggle } from '@/components/core/fields/ModeToggle'
import { TeacherDailySchedule } from '@components/features/scheduleBuilder/TeacherDailySchedule'
import { SchedulingInterface } from '@components/features/scheduleBuilder/SchedulingInterface'
import { PlannedVisitsColumn } from '@components/features/scheduleBuilder/PlannedVisitsColumn'

import { useThreeZoneScheduling } from '@components/features/scheduleBuilder/hooks/useThreeZoneScheduling'
import { useSchoolDailyView } from '@hooks/domain/useSchoolDailyView'
import { useVisitScheduling } from '@hooks/domain/useVisitScheduling'
import { Text, Heading } from '@core-components/typography'
import { Badge } from '@core-components/feedback'
import { 
  CalendarDaysIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { navigateDate, getTodayString, isToday, formatLongDate } from '@transformers/utils/date-utils'
import type { VisitPortion } from '@components/features/scheduleBuilder/types'


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

type ScheduleMode = 'view' | 'schedule'

export interface MasterScheduleCardProps extends VariantProps<typeof masterScheduleCard> {
  schoolId: string
  schoolName?: string
  initialDate?: string
  className?: string
  /** Enable scheduling mode by default */
  defaultMode?: ScheduleMode
  /** Show planned visits column (default: true) */
  showPlannedVisits?: boolean
  /** Callback when visit is scheduled */
  onVisitScheduled?: (visitData: { 
    teacherId: string
    periodNumber: number
    portion: VisitPortion
    purpose?: string 
  }) => void
  /** Callback when visit is modified */
  onVisitModified?: (visitId: string, visitData: Partial<{
    teacherId: string
    periodNumber: number
    portion: VisitPortion
    purpose?: string
  }>) => void
  /** Callback when visit is deleted */
  onVisitDeleted?: (visitId: string) => void
}

export function MasterScheduleCard({
  schoolId,
  schoolName,
  initialDate,
  variant,
  className,
  defaultMode = 'schedule',
  showPlannedVisits: _showPlannedVisits = true,
  onVisitScheduled,
  onVisitModified: _onVisitModified,
  onVisitDeleted: _onVisitDeleted
}: MasterScheduleCardProps) {
  const styles = masterScheduleCard({ variant })
  
  // State management
  const [currentDate, setCurrentDate] = useState(initialDate || getTodayString())
  const [mode, setMode] = useState<ScheduleMode>(defaultMode)
  
  // Data fetching
  const { 
    school, 
    schedules, 
    staff,
    bellSchedule,
    isLoading, 
    error,
    hasData,
    teacherCount,
    staffCount 
  } = useSchoolDailyView(schoolId, currentDate)
  
  // Visit scheduling hook
  const visitScheduling = useVisitScheduling({
    schoolId,
    date: currentDate,
    onVisitScheduled: (visit) => {
      onVisitScheduled?.({
        teacherId: visit.teacherId,
        periodNumber: visit.periodNumber,
        portion: visit.portion,
        purpose: visit.purpose
      })
    },
    onError: (error) => {
      console.error('Visit scheduling error:', error)
    }
  })

  // Three-zone scheduling
  const threeZoneScheduling = useThreeZoneScheduling({
    date: currentDate,
    existingVisits: [], // Use visitScheduling.visits when compatible types are resolved
    onVisitScheduled: async (visit) => {
      // Get teacher name from staff data using _id and staffName
      const teacher = staff?.find(s => s._id === visit.teacherId)
      const teacherName = teacher?.staffName || visit.teacherId

      // Schedule visit using the hook
      await visitScheduling.scheduleVisit({
        schoolId,
        teacherId: visit.teacherId,
        teacherName,
        periodNumber: visit.periodNumber,
        portion: visit.portion,
        purpose: visit.purpose,
        date: currentDate
      })
    },
    onError: (error) => {
      console.error('Scheduling error:', error)
    }
  })
  
  // Statistics data
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
  
  // Mode toggle options
  const modeOptions = [
    { value: 'view' as const, label: 'View', icon: EyeIcon },
    { value: 'schedule' as const, label: 'Schedule', icon: CalendarIcon }
  ]
  
  // Event handlers
  const handleModeChange = (newMode: ScheduleMode) => {
    setMode(newMode)
    if (newMode === 'view') {
      threeZoneScheduling.clearSelection()
    }
  }
  
  const handlePeriodPortionSelect = (periodNumber: number, portion: VisitPortion) => {
    if (mode === 'schedule') {
      threeZoneScheduling.selectPeriodPortion(periodNumber, portion)
    }
  }
  
  const handleScheduleVisit = async (purpose?: string) => {
    if (mode === 'schedule') {
      const result = await threeZoneScheduling.scheduleVisit(purpose)
      if (result.success) {
        setMode('view')
      }
    }
  }
  
  // Date navigation
  const handlePrevDay = () => setCurrentDate(navigateDate(currentDate, 'prev'))
  const handleNextDay = () => setCurrentDate(navigateDate(currentDate, 'next'))
  const handleToday = () => setCurrentDate(navigateDate(currentDate, 'today'))
  
  const displayDate = formatLongDate(currentDate)
  const isCurrentlyToday = isToday(currentDate)

  // Use actual visits from the scheduling hook
  const currentVisits = visitScheduling.visits
  
  // Get period times from bell schedule
  const periodTimes = bellSchedule?.classSchedule.map((period, index) => ({
    period: index + 1,
    start: period.startTime,
    end: period.endTime
  })) || []

  // Render view mode with frozen column layout
  const renderViewMode = () => (
    <div className="flex h-[600px] bg-white rounded-md shadow-sm overflow-hidden">
      {/* Frozen Planned Visits Column */}
      <PlannedVisitsColumn
        visits={currentVisits}
        periodTimes={periodTimes}
        className="border-r border-gray-200"
      />
      
      {/* Main Teacher Schedule (scrollable) */}
      <div className="flex-1 overflow-x-auto">
        <TeacherDailySchedule
          schoolId={schoolId}
          initialDate={currentDate}
          className="h-full"
        />
      </div>
    </div>
  )

  // Render schedule mode with three-zone interface
  const renderScheduleMode = () => (
    <div className="flex h-[600px] bg-white rounded-md shadow-sm overflow-hidden">
      {/* Frozen Planned Visits Column */}
      <PlannedVisitsColumn
        visits={currentVisits}
        periodTimes={periodTimes}
        className="border-r border-gray-200"
      />
      
      {/* Three-Zone Scheduling Interface */}
      <div className="flex-1 overflow-hidden">
        <SchedulingInterface
          scheduling={threeZoneScheduling}
          staff={staff || []}
          bellSchedule={bellSchedule!}
          onPeriodPortionSelect={handlePeriodPortionSelect}
          onScheduleVisit={handleScheduleVisit}
        />
      </div>
    </div>
  )

  return (
    <Card className={className}>
      <div className={styles.container()}>
        {/* Header */}
        <div className={styles.header()}>
          <div className={styles.headerContent()}>
            <div className="flex items-center space-x-3">
              <Heading level="h3">Master Schedule</Heading>
              {hasData && !isLoading && (
                <Badge intent="success" size="sm">Active</Badge>
              )}
              {mode === 'schedule' && (
                <Badge intent="primary" size="sm">Scheduling Mode</Badge>
              )}
            </div>
            <Text color="muted" textSize="sm">
              {schoolName || school?.schoolName || 'School'} daily teacher schedules
            </Text>
          </div>
          
          <div className={styles.headerActions()}>
            {/* Mode Toggle */}
            <ModeToggle
              options={modeOptions}
              value={mode}
              onChange={handleModeChange}
            />
            
            {/* Date Navigation */}
            <div className={styles.dateNavigation()}>
              <button
                onClick={handlePrevDay}
                className={styles.dateButton()}
                aria-label="Previous day"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <div className={styles.currentDate()}>{displayDate}</div>
              <button
                onClick={handleNextDay}
                className={styles.dateButton()}
                aria-label="Next day"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
            
            {!isCurrentlyToday && (
              <button onClick={handleToday} className={styles.todayButton()}>
                Today
              </button>
            )}
          </div>
        </div>
        
        {/* Statistics */}
        {hasData && !isLoading && (
          <StatisticsGrid
            statistics={scheduleStatistics}
            columns={4}
            spacing="md"
            cardSize="sm"
          />
        )}
        
        {/* Content */}
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
            <>
              {mode === 'view' ? (
                renderViewMode()
              ) : (
                renderScheduleMode()
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  )
}

export default MasterScheduleCard 