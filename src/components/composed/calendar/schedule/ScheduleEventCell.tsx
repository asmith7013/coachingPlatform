'use client'

import { tv } from 'tailwind-variants'
import type { BellScheduleEvent, PeriodTime, EventSegment } from './types'
import { getSegmentsForPeriod, getSubjectColor } from '@transformers/domain/schedule-transforms'

const eventCell = tv({
  slots: {
    container: 'border-r border-gray-100',
    cell: 'border-b border-gray-100 h-20 p-1 relative flex flex-col',
    eventButton: 'absolute flex flex-col overflow-hidden p-2 text-xs hover:shadow-md transition-shadow cursor-pointer',
    eventTitle: 'font-semibold truncate',
    eventDetail: 'text-xs opacity-75'
  }
})

export interface ScheduleEventCellProps {
  columnIndex: number
  periodIndex: number
  periodTime: PeriodTime
  events: BellScheduleEvent[]
  onEventClick?: (event: BellScheduleEvent) => void
  className?: string
}

export function ScheduleEventCell({ 
  columnIndex, 
  periodIndex, 
  periodTime, 
  events, 
  onEventClick,
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
  
  const getEventClasses = (color: BellScheduleEvent['color']): string => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-700 border border-blue-200',
      green: 'bg-green-50 text-green-700 border border-green-200',
      purple: 'bg-purple-50 text-purple-700 border border-purple-200',
      yellow: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      pink: 'bg-pink-50 text-pink-700 border border-pink-200',
      gray: 'bg-gray-50 text-gray-700 border border-gray-200'
    }
    return colorMap[color] || colorMap.gray
  }
  
  const getSegmentPosition = (segment: EventSegment): React.CSSProperties => {
    if (segment.position === 'full') {
      return { top: '0', bottom: '0', left: '0', right: '0' }
    } else if (segment.position === 'start') {
      return { 
        top: '0', 
        height: segment.segmentDuration === 0.5 ? '50%' : '100%', 
        left: '0', 
        right: '0' 
      }
    } else if (segment.position === 'middle') {
      return { top: '50%', bottom: '0', left: '0', right: '0' }
    }
    return { top: '0', bottom: '0', left: '0', right: '0' }
  }
  
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
            className={`${styles.eventButton()} ${getEventClasses(segment.color)}`}
            style={getSegmentPosition(segment)}
          >
            <p className={styles.eventTitle()}>{segment.title}</p>
            {segment.isFirst && (
              <p className={styles.eventDetail()}>
                {segment.originalEvent.totalDuration === 0.5 ? 'Half' : 
                 segment.originalEvent.totalDuration === 1 ? 'Full' :
                 `${segment.originalEvent.totalDuration}p`}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  )
} 