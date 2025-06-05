'use client'

import { tv } from 'tailwind-variants'
import type { BellScheduleEvent, PeriodTime } from '@domain-types/schedule'
import { getSegmentsForPeriod, getSubjectColor } from '@transformers/domain/schedule-transforms'
import { 
  getEventContainerClasses, 
  getEventPosition, 
  formatEventDuration 
} from '@/lib/ui/styles/event-styles'

const eventCell = tv({
  slots: {
    container: 'border-r border-gray-100',
    cell: 'border-b border-gray-100 h-20 p-1 relative flex flex-col',
    eventButton: 'absolute flex flex-col overflow-hidden p-2 text-xs hover:shadow-md transition-shadow cursor-pointer',
    eventTitle: 'font-semibold truncate',
    eventDetail: 'text-xs opacity-75',
    eventButtonSelected: 'ring-2 ring-blue-500 ring-offset-1 bg-blue-100 border-blue-300 shadow-md'
  }
})

export interface ScheduleEventCellProps {
  columnIndex: number
  periodIndex: number
  periodTime: PeriodTime
  events: BellScheduleEvent[]
  onEventClick?: (event: BellScheduleEvent) => void
  isEventSelected?: (event: BellScheduleEvent) => boolean
  className?: string
}

export function ScheduleEventCell({ 
  columnIndex, 
  periodIndex, 
  periodTime, 
  events, 
  onEventClick,
  isEventSelected,
  className 
}: ScheduleEventCellProps) {
  const styles = eventCell()
  
  // Use transformer function for segment calculations
  const segments = getSegmentsForPeriod(events, periodTime.period, columnIndex)
  
  // Update segments to use getSubjectColor
  const enhancedSegments = segments.map(segment => ({
    ...segment,
    color: getSubjectColor(segment.title)
  }))
  
  return (
    <div className={styles.container({ className })}>
      <div 
        className={styles.cell({
          className: periodIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
        })}
      >
        {enhancedSegments.map((segment) => (
          <button
            key={segment.id}
            onClick={() => onEventClick?.(segment.originalEvent)}
            className={`${styles.eventButton()} ${getEventContainerClasses(segment.color, isEventSelected?.(segment.originalEvent))}`}
            style={getEventPosition(segment.position, segment.segmentDuration)}
          >
            <p className={styles.eventTitle()}>{segment.title}</p>
            {segment.isFirst && (
              <p className={styles.eventDetail()}>
                {formatEventDuration(segment.originalEvent.totalDuration)}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  )
} 