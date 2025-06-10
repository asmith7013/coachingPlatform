'use client'

import { useState } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { Card } from '@composed-components/cards/Card'
// StatisticsGrid now handled within ScheduleBuilder
import { ModeToggle } from '@/components/core/fields/ModeToggle'
// import { ScheduleBuilder } from '@/components/features/schedulesNew'

// ScheduleBuilder now provides its own context, no need for direct hook usage
import { Text, Heading } from '@core-components/typography'
import { Badge } from '@core-components/feedback'
import { 
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { navigateDate, getTodayString, isToday, formatLongDate } from '@/lib/data-processing/transformers/utils/date-utils'
import type { ScheduleAssignment } from '@domain-types/schedule'


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
    scheduleContainer: 'space-y-4',
    emptyState: 'text-center py-12 text-gray-500',
    loadingState: 'text-center py-12'
  },
  variants: {
    variant: {
      default: {},
      compact: {
        container: 'space-y-4',
        scheduleContainer: 'space-y-2'
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
    portion: ScheduleAssignment
    purpose?: string 
  }) => void
  /** Callback when visit is modified */
  onVisitModified?: (visitId: string, visitData: Partial<{
    teacherId: string
    periodNumber: number
    portion: ScheduleAssignment
    purpose?: string
  }>) => void
  /** Callback when visit is deleted */
  onVisitDeleted?: (visitId: string) => void
}

export function MasterScheduleCard({
  // schoolId,
  schoolName,
  initialDate,
  variant,
  className,
  defaultMode = 'schedule',
  showPlannedVisits: _showPlannedVisits = true,
  onVisitScheduled: _onVisitScheduled,
  onVisitModified: _onVisitModified,
  onVisitDeleted: _onVisitDeleted
}: MasterScheduleCardProps) {
  const styles = masterScheduleCard({ variant })
  
  // State management
  const [currentDate, setCurrentDate] = useState(initialDate || getTodayString())
  const [mode, setMode] = useState<ScheduleMode>(defaultMode)
  
  // Note: ScheduleBuilder now manages its own state via context
  // We remove the direct hook usage to prevent duplication
  const isLoading = false;
  const error = null;
  const hasData = true; // ScheduleBuilder will handle its own loading states
  
  // Mode toggle options
  const modeOptions = [
    { value: 'view' as const, label: 'View', icon: EyeIcon },
    { value: 'schedule' as const, label: 'Schedule', icon: CalendarIcon }
  ]
  
  // Event handlers
  const handleModeChange = (newMode: ScheduleMode) => {
    setMode(newMode)
    // The new interface handles mode internally
  }
  
  // Date navigation
  const handlePrevDay = () => setCurrentDate(navigateDate(currentDate, 'prev'))
  const handleNextDay = () => setCurrentDate(navigateDate(currentDate, 'next'))
  const handleToday = () => setCurrentDate(navigateDate(currentDate, 'today'))
  
  const displayDate = formatLongDate(currentDate)
  const isCurrentlyToday = isToday(currentDate)

  // New unified schedule interface using context architecture
  const renderScheduleInterface = () => (
    // <ScheduleBuilder schoolId={schoolId} date={currentDate} />
    <div>
      <Text>Schedule Builder</Text>
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
              {schoolName || 'School'} daily teacher schedules
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
        
        {/* Statistics - now handled within ScheduleBuilder */}
        
        {/* Content */}
        <div className={styles.scheduleContainer()}>
          {isLoading && (
            <div className={styles.loadingState()}>
              <Text color="muted">Loading schedule...</Text>
            </div>
          )}
          
          {error && !isLoading && (
            <div className={styles.emptyState()}>
              <Text color="muted">Error loading schedule</Text>
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
          
          {hasData && !isLoading && renderScheduleInterface()}
        </div>
      </div>
    </Card>
  )
}

export default MasterScheduleCard 