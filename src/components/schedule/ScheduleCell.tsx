'use client'

import { useMemo } from 'react'
import { tv } from 'tailwind-variants'
import type { ScheduleCellProps, EventSegment } from './types'
import { getSegmentsForPeriod, getSubjectColor } from '@lib/transformers/domain/schedule-transforms'

const scheduleCell = tv({
  slots: {
    container: 'border-r border-gray-100',
    cell: 'border-b border-gray-100 h-20 relative flex flex-col',
    eventButton: 'absolute flex flex-col overflow-hidden p-2 text-xs hover:shadow-md transition-shadow cursor-pointer',
    eventTitle: 'font-semibold truncate',
    eventDetail: 'text-xs opacity-75',
    emptyState: 'text-gray-400 text-xs font-medium flex items-center justify-center h-full'
  },
  variants: {
    cellType: {
      teacher: '',
      planned: '',
      period: 'bg-gray-100'
    },
    isSelected: {
      true: 'ring-2 ring-blue-400 bg-blue-50/20',
      false: ''
    },
    interactive: {
      true: 'cursor-pointer hover:bg-gray-50/50',
      false: ''
    }
  }
})

/**
 * Consolidated ScheduleCell component
 * Unifies cell rendering from ScheduleEventCell and other cell implementations
 * Uses existing transformers for consistent data processing
 */
export function ScheduleCell({
  columnIndex,
  periodIndex,
  periodTime,
  events,
  cellType,
  interactive = false,
  isSelected = false,
  onEventClick,
  className
}: ScheduleCellProps) {
  const styles = scheduleCell()

  // Use existing transformer for event filtering and segment calculation
  const segments = useMemo(() => 
    getSegmentsForPeriod(events, periodTime.period, columnIndex),
    [events, periodTime.period, columnIndex]
  )

  // Enhance segments with colors using existing transformer
  const enhancedSegments = useMemo(() => 
    segments.map(segment => ({
      ...segment,
      color: getSubjectColor(segment.title)
    })),
    [segments]
  )

  // Get cell background based on period index (alternating pattern)
  const getCellBackground = (): string => {
    return periodIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
  }

  // Get event button classes based on color
  const getEventClasses = (color: string): string => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-700 border border-blue-200',
      green: 'bg-green-50 text-green-700 border border-green-200',
      purple: 'bg-purple-50 text-purple-700 border border-purple-200',
      yellow: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      pink: 'bg-pink-50 text-pink-700 border border-pink-200',
      gray: 'bg-gray-50 text-gray-700 border border-gray-200'
    } as const

    return colorMap[color as keyof typeof colorMap] || colorMap.gray
  }

  // Calculate segment position for rendering
  const getSegmentPosition = (segment: EventSegment): React.CSSProperties => {
    switch (segment.position) {
      case 'full':
        return { top: '0', bottom: '0', left: '0', right: '0' }
      case 'start':
        return {
          top: '0',
          height: segment.segmentDuration === 0.5 ? '50%' : '100%',
          left: '0',
          right: '0'
        }
      case 'middle':
        return { top: '50%', bottom: '0', left: '0', right: '0' }
      default:
        return { top: '0', bottom: '0', left: '0', right: '0' }
    }
  }

  // Render duration label for events
  const getDurationLabel = (segment: EventSegment): string | null => {
    if (!segment.isFirst) return null
    
    const totalDuration = segment.originalEvent.totalDuration
    if (totalDuration === 0.5) return 'Half'
    if (totalDuration === 1) return 'Full'
    return `${totalDuration}p`
  }

  return (
    <div className={styles.container({ className })}>
      <div 
        className={`${styles.cell({
          cellType,
          isSelected,
          interactive
        })} ${getCellBackground()}`}
      >
        {enhancedSegments.length === 0 ? (
          // Empty state for cells with no events
          cellType === 'period' && (
            <div className={styles.emptyState()}>
              P{periodTime.period}
            </div>
          )
        ) : (
          // Render event segments
          enhancedSegments.map((segment) => (
            <button
              key={segment.id}
              onClick={() => onEventClick?.(segment.originalEvent)}
              className={`${styles.eventButton()} ${getEventClasses(segment.color)}`}
              style={getSegmentPosition(segment)}
              type="button"
            >
              <p className={styles.eventTitle()}>{segment.title}</p>
              {getDurationLabel(segment) && (
                <p className={styles.eventDetail()}>
                  {getDurationLabel(segment)}
                </p>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )
} 