'use client'

import { useMemo, useCallback } from 'react'
import { tv } from 'tailwind-variants'
import { ScheduleCell } from './ScheduleCell'
import { ThreeZoneTimeSlot } from './ThreeZoneTimeSlot'
import type { ScheduleGridProps, PeriodPortionSelection, VisitPortion } from './types'
import type { BellScheduleEvent } from '@/components/features/scheduleBuilder/types'

const scheduleGrid = tv({
  slots: {
    container: 'w-full overflow-hidden',
    grid: 'grid w-full border border-gray-200 rounded-lg overflow-hidden',
    header: 'bg-gray-100 border-b border-gray-200 font-semibold text-sm',
    headerCell: 'p-3 text-center border-r border-gray-200 last:border-r-0',
    timeColumn: 'bg-gray-50 border-r border-gray-200 p-2 text-xs font-medium flex flex-col justify-center',
    plannedColumn: 'border-r border-gray-200',
    selectionIndicator: 'absolute top-4 left-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-md shadow-lg border border-blue-200 text-sm font-medium z-10',
    dragOverlay: 'absolute inset-0 pointer-events-none z-50'
  },
  variants: {
    interactive: {
      true: '',
      false: ''
    }
  }
})

/**
 * Consolidated ScheduleGrid component
 * Merges functionality from BellScheduleGrid, InteractiveScheduleGrid, and other grid implementations
 * Uses existing transformers and the new ScheduleCell for consistent rendering
 */
export function ScheduleGrid({
  columns,
  periodTimes,
  events,
  interactive = false,
  plannedVisits: _plannedVisits,
  selectedTeacherPeriod,
  activeHoverZone,
  threeZoneMode = false,
  onPeriodPortionSelect,
  selectedPortions,
  onEventClick,
  onPlannedVisitClick: _onPlannedVisitClick,
  onPeriodAssignment,
  onHoverZoneChange: _onHoverZoneChange,
  isEventSelected,
  className
}: ScheduleGridProps) {
  const styles = scheduleGrid()

  // Generate CSS Grid column configuration
  const generateGridColumns = useCallback((cols: typeof columns): string => {
    // Time column + planned column (if exists) + teacher columns
    const hasPlannedColumn = cols.some(col => col.id === 'planned-visits')
    const timeColumn = '120px'
    const plannedColumn = hasPlannedColumn ? '200px' : ''
    const teacherColumns = cols
      .filter(col => col.id !== 'planned-visits')
      .map(() => 'minmax(120px, 1fr)')
      .join(' ')

    return [timeColumn, plannedColumn, teacherColumns]
      .filter(Boolean)
      .join(' ')
  }, [])

  // Memoized grid style
  const gridStyle = useMemo(() => ({
    gridTemplateColumns: generateGridColumns(columns),
    gridTemplateRows: `auto repeat(${periodTimes.length}, 80px)`
  }), [columns, periodTimes.length, generateGridColumns])

  // Handle cell click for interactive mode
  const handleCellClick = useCallback((
    columnIndex: number,
    periodIndex: number
  ) => {
    if (!interactive || !onPeriodAssignment) return

    const periodTime = periodTimes[periodIndex]
    if (!periodTime) return

    // Determine assignment type based on active hover zone
    const assignmentType = activeHoverZone?.zone === 'first_half' ? 'first_half' :
                          activeHoverZone?.zone === 'second_half' ? 'second_half' : 
                          'full_period'

    onPeriodAssignment(periodIndex, periodTime, assignmentType)
  }, [interactive, onPeriodAssignment, periodTimes, activeHoverZone])

  // Handle three-zone portion selection
  const handlePeriodPortionSelect = useCallback((selection: PeriodPortionSelection) => {
    if (threeZoneMode && onPeriodPortionSelect) {
      onPeriodPortionSelect(selection)
    }
  }, [threeZoneMode, onPeriodPortionSelect])

  // Get selected portion for a teacher-period combination
  const getSelectedPortion = useCallback((teacherId: string, periodNumber: number): VisitPortion | null => {
    const key = `${teacherId}-${periodNumber}`
    return selectedPortions?.get(key) || null
  }, [selectedPortions])

  // Get events for a specific cell
  const getEventsForCell = useCallback((
    columnIndex: number,
    periodIndex: number
  ): BellScheduleEvent[] => {
    const periodTime = periodTimes[periodIndex]
    if (!periodTime) return []

    return events.filter(event => 
      event.columnIndex === columnIndex && 
      event.period === periodTime.period
    )
  }, [events, periodTimes])

  // Check if an event is selected
  const checkEventSelected = useCallback((event: BellScheduleEvent): boolean => {
    return isEventSelected?.(event) || false
  }, [isEventSelected])

  // Render header row
  const renderHeader = () => (
    <>
      {/* Time column header */}
      <div className={styles.headerCell()}>
        Time
      </div>
      
      {/* Column headers */}
      {columns.map((column) => (
        <div key={column.id} className={styles.headerCell()}>
          <div className="font-semibold">{column.title}</div>
          {column.subtitle && (
            <div className="text-xs font-normal text-gray-600 mt-1">
              {column.subtitle}
            </div>
          )}
        </div>
      ))}
    </>
  )

  // Render period rows
  const renderPeriodRows = () => {
    return periodTimes.map((periodTime, periodIndex) => (
      <div key={`period-${periodTime.period}`} className="contents">
        {/* Time column */}
        <div className={styles.timeColumn()}>
          <div className="font-semibold text-gray-700">
            Period {periodTime.period}
          </div>
          <div className="text-gray-500 mt-1">
            {periodTime.start} - {periodTime.end}
          </div>
        </div>

        {/* Schedule cells for each column */}
        {columns.map((column, columnIndex) => {
          const cellEvents = getEventsForCell(columnIndex, periodIndex)
          const cellType = column.id === 'planned-visits' ? 'planned' : 'teacher'
          const hasSelectedEvent = cellEvents.some(checkEventSelected)

          // For three-zone mode, use ThreeZoneTimeSlot for teacher columns
          // Check if column has teacherId (extended interface)
          const hasTeacherId = 'teacherId' in column
          if (threeZoneMode && cellType === 'teacher' && hasTeacherId) {
            const teacherId = (column as { teacherId: string }).teacherId
            const selectedPortion = getSelectedPortion(teacherId, periodTime.period)
            
            // Create wrapper function to match expected interface
            const handlePortionSelect = (periodNumber: number, portion: VisitPortion) => {
              handlePeriodPortionSelect({ periodNumber, portion })
            }
            
            return (
              <div 
                key={`${column.id}-${periodTime.period}`}
                className="p-2"
              >
                <ThreeZoneTimeSlot
                  periodNumber={periodTime.period}
                  timeStart={periodTime.start}
                  timeEnd={periodTime.end}
                  selectedPortion={selectedPortion}
                  onSelect={handlePortionSelect}
                  periodLabel={`Period ${periodTime.period}`}
                />
              </div>
            )
          }

          return (
            <div 
              key={`${column.id}-${periodTime.period}`}
              onClick={() => handleCellClick(columnIndex, periodIndex)}
              className={column.id === 'planned-visits' ? styles.plannedColumn() : ''}
            >
              <ScheduleCell
                columnIndex={columnIndex}
                periodIndex={periodIndex}
                periodTime={periodTime}
                events={cellEvents}
                cellType={cellType}
                interactive={interactive}
                isSelected={hasSelectedEvent}
                onEventClick={onEventClick}
              />
            </div>
          )
        })}
      </div>
    ))
  }

  return (
    <div className={styles.container({ className })}>
      {/* Selection indicator */}
      {selectedTeacherPeriod && (
        <div className={styles.selectionIndicator()}>
          {selectedTeacherPeriod.teacherName} - Period {selectedTeacherPeriod.periodIndex + 1}
        </div>
      )}

      {/* Main grid */}
      <div 
        className={styles.grid({ interactive })}
        style={gridStyle}
      >
        {/* Header row */}
        <div className={`${styles.header()} contents`}>
          {renderHeader()}
        </div>

        {/* Period rows */}
        {renderPeriodRows()}
      </div>

      {/* Drag overlay for visual feedback */}
      {interactive && activeHoverZone && (
        <div className={styles.dragOverlay()}>
          {/* Visual feedback for hover zones can be added here */}
        </div>
      )}
    </div>
  )
} 