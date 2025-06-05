'use client'

import type { InteractiveScheduleProps } from '@domain-types/schedule'
import { ScheduleGrid } from './ScheduleGrid'
import { InteractiveScheduleGrid } from './InteractiveScheduleGrid'
import { ScheduleEventCell } from './ScheduleEventCell'
import { calculateGridPosition } from '@/lib/domain/schedule/grid-positioning'

/**
 * BellScheduleGrid - Main schedule grid component
 * Now uses composition pattern with ScheduleGrid (layout) and InteractiveScheduleGrid (interactions)
 * Simplified responsibilities for better maintainability
 */
export function BellScheduleGrid({
  columns,
  events,
  periodTimes,
  onEventClick,
  className,
  // Interactive mode props
  interactive = false,
  plannedVisits = [],
  onPlannedVisitClick,
  // Period-specific selection check
  isEventSelected,
  // Period-specific assignment props
  selectedTeacherPeriod,
  onPeriodAssignment,
  // Hover zone handling for UI feedback
  onHoverZoneChange,
  activeHoverZone
}: InteractiveScheduleProps) {

  // Transform props to match new component interfaces
  const adaptedSelectedTeacherPeriod = selectedTeacherPeriod ? {
    teacherId: selectedTeacherPeriod.teacherId || '',
    teacherName: selectedTeacherPeriod.teacherName,
    period: selectedTeacherPeriod.period,
    columnIndex: selectedTeacherPeriod.columnIndex || 0
  } : null

  if (interactive) {
    // Use InteractiveScheduleGrid for planned visits and assignments
    return (
      <InteractiveScheduleGrid
        columns={columns}
        periodTimes={periodTimes}
        events={events}
        plannedVisits={plannedVisits}
        selectedTeacherPeriod={adaptedSelectedTeacherPeriod}
        activeHoverZone={activeHoverZone}
        onEventClick={onEventClick}
        onPlannedVisitClick={onPlannedVisitClick}
        onPeriodAssignment={onPeriodAssignment}
        onHoverZoneChange={onHoverZoneChange}
        isEventSelected={isEventSelected}
        className={className}
      />
    )
  }

  // Use pure ScheduleGrid for read-only mode with event cells
  const renderEventCells = () => {
    return columns.map((column, columnIndex) => (
      periodTimes.map((periodTime, periodIndex) => {
        const hasPlannedColumn = columns.some(col => col.id === 'planned-visits')
        const teacherIndex = columns.filter(col => col.id !== 'planned-visits').indexOf(column)
        const position = calculateGridPosition('teacher', teacherIndex, hasPlannedColumn)
        
        return (
          <div
            key={`${column.id}-${periodIndex}`}
            className="relative bg-white"
            style={{ 
              gridColumn: `${position.column}`, 
              gridRow: `${periodIndex + 2}`
            }}
          >
            <ScheduleEventCell
              columnIndex={columnIndex}
              periodIndex={periodIndex}
              periodTime={periodTime}
              events={events}
              onEventClick={onEventClick}
              isEventSelected={isEventSelected}
            />
          </div>
        )
      })
    )).flat()
  }

  return (
    <ScheduleGrid
      columns={columns}
      periodTimes={periodTimes}
      className={className}
    >
      {renderEventCells()}
    </ScheduleGrid>
  )
} 