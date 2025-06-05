'use client'

import { useMemo } from 'react'
import { tv } from 'tailwind-variants'
import { ScheduleEventGrid } from '@/components/domain/schedule/ScheduleEventGrid'
import { BaseGridCell } from '@/components/domain/schedule/BaseGridCell'
import { PlannedScheduleColumn } from './PlannedScheduleColumn'
import { ScheduleGrid } from './ScheduleGrid'
import { 
  renderGridCells, 
  createGridCellConfig, 
  generateCellKey,
  isPlannedVisitsColumn 
} from '@/lib/domain/schedule/grid-cell-factory'
import type { 
  ScheduleColumn,
  PeriodTime,
  BellSchedule, 
  PlannedVisit, 
  HoverState,
  ScheduleAssignmentType,
  SelectedTeacherPeriod
} from '@domain-types/schedule'

const interactiveGrid = tv({
  slots: {
    container: 'relative',
    dragOverlay: 'absolute inset-0 pointer-events-none z-50',
    selectionIndicator: 'absolute top-4 left-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-md shadow-lg border border-blue-200 text-sm font-medium',
    plannedOverlay: 'absolute inset-0 pointer-events-none z-30'
  }
})

export interface InteractiveScheduleGridProps {
  // Base schedule data
  columns: ScheduleColumn[]
  periodTimes: PeriodTime[]
  events: BellSchedule[]
  
  // Interactive features
  plannedVisits?: PlannedVisit[]
  selectedTeacherPeriod?: SelectedTeacherPeriod | null
  activeHoverZone?: HoverState | null
  
  // Event handlers
  onEventClick?: (event: BellSchedule) => void
  onPlannedVisitClick?: (visit: PlannedVisit) => void
  onPeriodAssignment?: (
    periodIndex: number,
    periodTime: PeriodTime,
    assignmentType: ScheduleAssignmentType
  ) => void
  onHoverZoneChange?: (hoverState: HoverState | null) => void
  
  // UI state
  isEventSelected?: (event: BellSchedule) => boolean
  className?: string
}

/**
 * SelectionOverlay - Visual feedback for selected teacher periods
 */
function SelectionOverlay({ 
  selectedTeacher, 
  className 
}: { 
  selectedTeacher: SelectedTeacherPeriod
  className?: string 
}) {
  const styles = interactiveGrid()
  
  return (
    <div className={styles.dragOverlay({ className })}>
      <div className={styles.selectionIndicator()}>
        Selected: {selectedTeacher.teacherName} - Period {selectedTeacher.period}
      </div>
    </div>
  )
}

/**
 * PlannedVisitOverlay - Interactive planned visit cells as overlay
 */
function PlannedVisitOverlay({
  columns,
  periodTimes,
  plannedVisits,
  onPlannedVisitClick,
  onPeriodAssignment,
  onHoverZoneChange,
  activeHoverZone,
  selectedTeacherPeriod,
  className
}: {
  columns: ScheduleColumn[]
  periodTimes: PeriodTime[]
  plannedVisits: PlannedVisit[]
  onPlannedVisitClick?: (visit: PlannedVisit) => void
  onPeriodAssignment?: (
    periodIndex: number,
    periodTime: PeriodTime,
    assignmentType: ScheduleAssignmentType
  ) => void
  onHoverZoneChange?: (hoverState: HoverState | null) => void
  activeHoverZone?: HoverState | null
  selectedTeacherPeriod?: SelectedTeacherPeriod | null
  className?: string
}) {
  const styles = interactiveGrid()
  
  // Filter to only planned visit columns
  const plannedColumns = columns.filter(col => isPlannedVisitsColumn(col))
  
  // Helper function to get planned visits for a specific time slot
  const getPlannedVisitsForSlot = useMemo(() => 
    (periodIndex: number) => {
      const period = periodTimes[periodIndex]
      return plannedVisits.filter(visit => 
        visit.timeSlot.startTime === period.start && 
        visit.timeSlot.endTime === period.end
      )
    }, [periodTimes, plannedVisits]
  )

  // Render planned visit cells using shared infrastructure
  const plannedCells = renderGridCells(
    plannedColumns,
    periodTimes,
    (column, columnIndex, periodTime, periodIndex) => {
      const config = createGridCellConfig(
        column, 
        columnIndex, 
        periodIndex, 
        {
          hasPlannedColumn: true,
          columnType: 'planned',
          teacherIndex: 0
        }
      )
      
      return (
        <BaseGridCell
          key={generateCellKey(column, periodIndex)}
          column={column}
          columnIndex={columnIndex}
          periodTime={periodTime}
          periodIndex={periodIndex}
          config={config}
          aria-label={`Planned visits for ${periodTime.start} to ${periodTime.end}`}
        >
          <PlannedScheduleColumn
            columnIndex={columnIndex}
            periodIndex={periodIndex}
            periodTime={periodTime}
            plannedVisits={getPlannedVisitsForSlot(periodIndex)}
            onPlannedVisitClick={onPlannedVisitClick}
            onPeriodAssignment={onPeriodAssignment}
            onHoverZoneChange={onHoverZoneChange}
            activeHoverZone={activeHoverZone}
            selectedTeacherPeriod={selectedTeacherPeriod}
          />
        </BaseGridCell>
      )
    },
    { hasPlannedColumn: true }
  )

  return (
    <div className={styles.plannedOverlay({ className })}>
      <ScheduleGrid
        columns={plannedColumns}
        periodTimes={periodTimes}
      >
        {plannedCells}
      </ScheduleGrid>
    </div>
  )
}

/**
 * InteractiveScheduleGrid - Composition-based interactive schedule
 * 
 * Uses clean composition pattern to separate concerns:
 * - ScheduleEventGrid: Handles all event rendering with proper styling
 * - PlannedVisitOverlay: Adds interactive planned visit features
 * - SelectionOverlay: Provides visual feedback for selections
 * 
 * Benefits:
 * - No code duplication - reuses existing working components
 * - Clear separation of concerns - each layer has single responsibility  
 * - Maintains existing patterns - leverages ScheduleEventCell properly
 * - Simple conditional logic - no complex column filtering
 * - Better performance - leverages existing optimizations
 */
export function InteractiveScheduleGrid({
  columns,
  periodTimes,
  events,
  plannedVisits = [],
  selectedTeacherPeriod,
  activeHoverZone,
  onEventClick,
  onPlannedVisitClick,
  onPeriodAssignment,
  onHoverZoneChange,
  isEventSelected,
  className
}: InteractiveScheduleGridProps) {
  const styles = interactiveGrid()

  // Separate planned columns from event columns for overlay logic
  const { eventColumns, hasPlannedColumn } = useMemo(() => {
    const planned = columns.filter(col => isPlannedVisitsColumn(col))
    const events = columns.filter(col => !isPlannedVisitsColumn(col))
    return {
      eventColumns: events,
      hasPlannedColumn: planned.length > 0
    }
  }, [columns])

  return (
    <div className={styles.container({ className })}>
      {/* Base layer: Event grid using existing working component */}
      <ScheduleEventGrid
        columns={eventColumns}
        periodTimes={periodTimes}
        events={events}
        onEventClick={onEventClick}
        isEventSelected={isEventSelected}
      />

      {/* Interactive layer: Planned visit overlay */}
      {hasPlannedColumn && (
        <PlannedVisitOverlay
          columns={columns}
          periodTimes={periodTimes}
          plannedVisits={plannedVisits}
          onPlannedVisitClick={onPlannedVisitClick}
          onPeriodAssignment={onPeriodAssignment}
          onHoverZoneChange={onHoverZoneChange}
          activeHoverZone={activeHoverZone}
          selectedTeacherPeriod={selectedTeacherPeriod}
        />
      )}

      {/* Feedback layer: Selection indicator */}
      {selectedTeacherPeriod && (
        <SelectionOverlay selectedTeacher={selectedTeacherPeriod} />
      )}
    </div>
  )
} 