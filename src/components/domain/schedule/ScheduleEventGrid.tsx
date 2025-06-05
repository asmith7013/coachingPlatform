'use client'

import React from 'react'
import { ScheduleGrid } from '../../composed/calendar/schedule/ScheduleGrid'
import { ScheduleEventCell } from '../../composed/calendar/schedule/ScheduleEventCell'
import { BaseGridCell } from './BaseGridCell'
import { 
  renderGridCells, 
  createGridCellConfig, 
  generateCellKey,
  isPlannedVisitsColumn 
} from '@/lib/domain/schedule/grid-cell-factory'
import type { 
  ScheduleColumn, 
  PeriodTime, 
  BellSchedule 
} from '@domain-types/schedule'
import { BellScheduleEvent } from '@/lib/transformers/domain/schedule-transforms'

/**
 * Props for the ScheduleEventGrid component
 */
export interface ScheduleEventGridProps {
  // Base schedule data
  columns: ScheduleColumn[]
  periodTimes: PeriodTime[]
  events: BellSchedule[]
  
  // Event handling
  onEventClick?: (event: BellSchedule) => void
  isEventSelected?: (event: BellSchedule) => boolean
  
  // UI configuration
  className?: string
  showHeaders?: boolean
  responsive?: boolean
}

/**
 * ScheduleEventGrid - Basic event grid component with simple interactions
 * 
 * Handles event rendering and basic click interactions without complex
 * interactive features like planned visits or hover zones.
 * 
 * Features:
 * - Basic event rendering using ScheduleEventCell
 * - Event click handling and selection state
 * - Uses shared grid cell infrastructure for consistency
 * - Clean separation from interactive features
 * - Responsive design support
 * 
 * Use Cases:
 * - Read-only schedule displays
 * - Simple event browsing interfaces
 * - Base component for more complex interactive grids
 * 
 * @example
 * ```tsx
 * <ScheduleEventGrid
 *   columns={teacherColumns}
 *   periodTimes={bellSchedulePeriods}
 *   events={scheduleEvents}
 *   onEventClick={handleEventClick}
 *   isEventSelected={isSelected}
 * />
 * ```
 */
export function ScheduleEventGrid({
  columns,
  periodTimes,
  events,
  onEventClick,
  isEventSelected,
  className,
  showHeaders: _showHeaders = true,
  responsive = true
}: ScheduleEventGridProps) {
  
  // Filter out planned visits columns for this basic event grid
  const eventColumns = React.useMemo(() => 
    columns.filter(column => !isPlannedVisitsColumn(column)),
    [columns]
  )
  
  // Detect if we have planned columns in the original set
  const hasPlannedColumn = React.useMemo(() => 
    columns.some(column => isPlannedVisitsColumn(column)),
    [columns]
  )
  
  // Create cell renderer for event cells
  const renderEventCell = React.useCallback((
    column: ScheduleColumn,
    columnIndex: number,
    periodTime: PeriodTime,
    periodIndex: number,
    config: ReturnType<typeof createGridCellConfig>
  ) => {
    // Calculate the original column index for event filtering
    const originalColumnIndex = columns.indexOf(column)
    
    return (
      <BaseGridCell
        key={generateCellKey(column, periodIndex)}
        column={column}
        columnIndex={columnIndex}
        periodTime={periodTime}
        periodIndex={periodIndex}
        config={config}
        aria-label={`${column.title} schedule for ${periodTime.start} to ${periodTime.end}`}
      >
        <ScheduleEventCell
          columnIndex={originalColumnIndex}
          periodIndex={periodIndex}
          periodTime={periodTime}
          events={events}
          onEventClick={onEventClick}
          isEventSelected={isEventSelected}
        />
      </BaseGridCell>
    )
  }, [columns, events, onEventClick, isEventSelected])
  
  // Generate all grid cells using shared infrastructure
  const gridCells = React.useMemo(() => {
    return renderGridCells(
      eventColumns,
      periodTimes,
      (column, columnIndex, periodTime, periodIndex) => {
        // Create cell configuration using factory
        const config = createGridCellConfig(
          column, 
          columnIndex, 
          periodIndex, 
          {
            hasPlannedColumn,
            columnType: 'teacher',
            teacherIndex: columnIndex,
            screenSize: responsive ? 'desktop' : 'desktop'
          }
        )
        
        return renderEventCell(column, columnIndex, periodTime, periodIndex, config)
      },
      {
        hasPlannedColumn,
        screenSize: responsive ? 'desktop' : 'desktop'
      }
    )
  }, [eventColumns, periodTimes, hasPlannedColumn, responsive, renderEventCell])
  
  return (
    <div className={className}>
      <ScheduleGrid
        columns={columns}        
        periodTimes={periodTimes}
      >
        {gridCells}
      </ScheduleGrid>
    </div>
  )
}

/**
 * Hook for managing basic event grid state
 * Provides common state management patterns for event grids
 */
export function useEventGridState(events: BellScheduleEvent[]) {
  const [selectedEventIds, setSelectedEventIds] = React.useState<Set<string>>(new Set())
  
  const handleEventClick = React.useCallback((event: BellScheduleEvent) => {
    setSelectedEventIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(event.id)) {
        newSet.delete(event.id)
      } else {
        newSet.add(event.id)
      }
      return newSet
    })
  }, [])
  
  const isEventSelected = React.useCallback((event: BellScheduleEvent) => {
    return selectedEventIds.has(event.id)
  }, [selectedEventIds])
  
  const clearSelection = React.useCallback(() => {
    setSelectedEventIds(new Set())
  }, [])
  
  const selectAll = React.useCallback(() => {
    setSelectedEventIds(new Set(events.map(event => event.id)))
  }, [events])
  
  return {
    selectedEventIds,
    handleEventClick,
    isEventSelected,
    clearSelection,
    selectAll,
    hasSelection: selectedEventIds.size > 0,
    selectionCount: selectedEventIds.size
  }
}

/**
 * Variant of ScheduleEventGrid optimized for read-only display
 * Removes all interactive features for maximum performance
 */
export function ReadOnlyScheduleEventGrid({
  columns,
  periodTimes,
  events,
  className,
  showHeaders = true
}: Omit<ScheduleEventGridProps, 'onEventClick' | 'isEventSelected' | 'responsive'>) {
  return (
    <ScheduleEventGrid
      columns={columns}
      periodTimes={periodTimes}
      events={events}
      className={className}
      showHeaders={showHeaders}
      responsive={false}
    />
  )
} 