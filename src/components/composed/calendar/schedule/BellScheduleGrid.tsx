'use client'

import { useMemo } from 'react'
import { tv } from 'tailwind-variants'
import type { BellScheduleGridProps } from './types'
import { ScheduleEventCell } from './ScheduleEventCell'
import { PlannedScheduleColumn } from './PlannedScheduleColumn'

const bellScheduleGrid = tv({
  slots: {
    container: 'flex h-full flex-col',
    header: 'sticky top-0 z-30 flex-none bg-white shadow-sm ring-1 ring-black/5',
    headerGrid: 'grid divide-x divide-gray-100 border-r border-gray-100 text-sm text-gray-500',
    headerCell: 'sticky top-0 left-0 z-40 bg-gray-50 border-b border-r border-gray-200 py-3 text-center text-xs font-medium',
    columnHeader: 'sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200 flex items-center justify-center py-3 px-2',
    columnTitle: 'font-bold text-center text-sm text-gray-900',
    content: 'flex flex-auto overflow-x-auto',
    contentGrid: 'grid flex-auto',
    // Interactive mode styles (Task 2.1)
    interactiveContainer: 'flex h-full flex-col relative', // Add relative positioning for drag overlays
    dragOverlay: 'absolute inset-0 pointer-events-none z-50' // Overlay for drag feedback
  }
})

export function BellScheduleGrid({
  columns,
  events,
  periodTimes,
  onEventClick,
  className,
  // Interactive mode props (Task 2.1)
  interactive = false,
  plannedVisits = [],
  onPlannedVisitClick,
  // Drag and drop handlers (Task 2.4)
  onTeacherDrop,
  onHoverZoneChange,
  // Visual feedback state (Task 2.3)
  activeHoverZone,
  draggedTeacher
}: BellScheduleGridProps) {
  const styles = bellScheduleGrid()
  
  // Calculate responsive column width based on column count
  const { columnWidth, minTotalWidth } = useMemo(() => {
    const columnCount = columns.length
    let width: number
    
    if (columnCount <= 4) width = 250 // Wide columns for few columns
    else if (columnCount <= 6) width = 200 // Medium columns
    else width = 180 // Narrower columns for many columns, but still readable
    
    return {
      columnWidth: width,
      minTotalWidth: 100 + (columnCount * width)
    }
  }, [columns.length])
  
  const gridTemplateColumns = `100px repeat(${columns.length}, ${columnWidth}px)`
  const gridTemplateRows = `auto repeat(${periodTimes.length}, 80px)`

  // Helper function to determine if column supports planned visits
  const isPlannedColumn = (columnIndex: number): boolean => {
    return interactive && columns[columnIndex]?.id === 'planned-visits'
  }

  // Helper function to get planned visits for a specific time slot
  const getPlannedVisitsForSlot = (columnIndex: number, periodIndex: number) => {
    if (!interactive || !isPlannedColumn(columnIndex)) return []
    
    const period = periodTimes[periodIndex]
    return plannedVisits.filter(visit => 
      visit.timeSlot.startTime === period.start && 
      visit.timeSlot.endTime === period.end
    )
  }

  return (
    <div className={styles.container({ 
      className: interactive ? `${styles.interactiveContainer()} ${className || ''}` : className 
    })}>
      {/* Drag overlay for visual feedback when dragging (Task 2.3) */}
      {interactive && draggedTeacher && (
        <div className={styles.dragOverlay()}>
          <div className="absolute top-4 left-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-md shadow-lg border border-blue-200 text-sm font-medium">
            Dragging: {draggedTeacher.teacherName}
          </div>
        </div>
      )}

      {/* Single scrollable container for BOTH header and content */}
      <div className={styles.content()}>
        <div 
          className={styles.contentGrid()}
          style={{ 
            gridTemplateColumns,
            gridTemplateRows,
            minWidth: `${minTotalWidth}px`
          }}
        >
          {/* Header row - Period cell sticky in both directions */}
          <div className={styles.headerCell()}>
            Period
          </div>
          
          {/* Column headers */}
          {columns.map((column) => (
            <div key={`header-${column.id}`} className={styles.columnHeader()}>
              <div>
                <div className={styles.columnTitle()}>
                  {column.title}
                </div>
                {column.subtitle && (
                  <div className="text-xs text-gray-500 text-center">
                    {column.subtitle}
                  </div>
                )}
                {/* Interactive mode indicator (Task 2.1) */}
                {interactive && isPlannedColumn(columns.indexOf(column)) && (
                  <div className="text-xs text-blue-600 text-center mt-1 font-medium">
                    Drop Zone
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Period time column */}
          {periodTimes.map((periodTime, index) => (
            <div 
              key={`period-${index}`}
              className={`sticky left-0 z-10 border-r border-b border-gray-200 h-20 flex flex-col justify-between py-1 px-2 ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
              style={{ gridColumn: '1', gridRow: `${index + 2}` }}
            >
              <div className="text-xs text-gray-500 text-center font-medium">
                {periodTime.start}
              </div>
              <div className="text-sm font-semibold text-gray-700 text-center">
                Period {periodTime.period}
              </div>
              <div className="text-xs text-gray-500 text-center font-medium">
                {periodTime.end}
              </div>
            </div>
          ))}

          {/* Schedule event cells */}
          {columns.map((column, columnIndex) => (
            periodTimes.map((periodTime, periodIndex) => (
              <div
                key={`${column.id}-${periodIndex}`}
                style={{ 
                  gridColumn: `${columnIndex + 2}`, 
                  gridRow: `${periodIndex + 2}` 
                }}
              >
                {interactive && isPlannedColumn(columnIndex) ? (
                  // Render PlannedScheduleColumn for interactive planned visits (Task 2.2)
                  <PlannedScheduleColumn
                    columnIndex={columnIndex}
                    periodIndex={periodIndex}
                    periodTime={periodTime}
                    plannedVisits={getPlannedVisitsForSlot(columnIndex, periodIndex)}
                    onPlannedVisitClick={onPlannedVisitClick}
                    onTeacherDrop={onTeacherDrop}
                    onHoverZoneChange={onHoverZoneChange}
                    activeHoverZone={activeHoverZone}
                    draggedTeacher={draggedTeacher}
                  />
                ) : (
                  // Render standard ScheduleEventCell for read-only mode
                  <ScheduleEventCell
                    columnIndex={columnIndex}
                    periodIndex={periodIndex}
                    periodTime={periodTime}
                    events={events}
                    onEventClick={onEventClick}
                  />
                )}
              </div>
            ))
          ))}
        </div>
      </div>
    </div>
  )
} 