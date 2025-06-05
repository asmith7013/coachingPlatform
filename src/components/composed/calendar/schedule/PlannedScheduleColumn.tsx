'use client'

import { useState, useCallback } from 'react'
import { tv } from 'tailwind-variants'
import type { 
  PlannedVisit, 
  PeriodTime, 
  HoverState, 
  HoverZone, 
  DraggedTeacher, 
  DropZone, 
  ScheduleAssignmentType 
} from './types'
import type { AssignmentState } from '@zod-schema/visits/schedule-builder-state'
import { AssignedTeacherCard } from '@components/domain/scheduling/AssignedTeacherCard'

const plannedScheduleColumn = tv({
  slots: {
    container: 'border-r border-gray-100',
    cell: 'border-b border-gray-100 h-20 relative flex flex-col',
    hoverZone: 'absolute cursor-pointer transition-all duration-200 border border-dashed border-transparent',
    hoverZoneActive: 'border-blue-300 bg-blue-50/50 bg-gray-400/20', // Task 2.3: Semi-transparent gray overlay
    visitCard: 'absolute flex flex-col overflow-hidden p-2 text-xs rounded border border-blue-200 bg-blue-50 text-blue-700 hover:shadow-md transition-shadow cursor-pointer',
    visitTitle: 'font-semibold truncate',
    visitDetail: 'text-xs opacity-75',
    dropZoneIndicator: 'absolute inset-0 border-2 border-dashed border-blue-300 bg-blue-50/30 flex items-center justify-center',
    dropZoneText: 'text-blue-600 text-xs font-medium pointer-events-none'
  }
})

export interface PlannedScheduleColumnProps {
  columnIndex: number
  periodIndex: number
  periodTime: PeriodTime
  plannedVisits: PlannedVisit[]
  onPlannedVisitClick?: (visit: PlannedVisit) => void
  onTeacherDrop?: (teacherId: string, dropZone: DropZone) => void
  onHoverZoneChange?: (hoverState: HoverState | null) => void
  activeHoverZone?: HoverState | null
  draggedTeacher?: DraggedTeacher | null
  className?: string
  activeAssignments?: AssignmentState[]
  onRemoveAssignment?: (assignment: AssignmentState) => void
  onEditAssignmentPurpose?: (assignment: AssignmentState) => void
  getTeacherName?: (teacherId: string) => string
}

export function PlannedScheduleColumn({
  columnIndex,
  periodIndex,
  periodTime,
  plannedVisits,
  onPlannedVisitClick,
  onTeacherDrop,
  onHoverZoneChange,
  activeHoverZone,
  draggedTeacher,
  className,
  activeAssignments,
  onRemoveAssignment,
  onEditAssignmentPurpose,
  getTeacherName
}: PlannedScheduleColumnProps) {
  const styles = plannedScheduleColumn()
  const [localHoverZone, setLocalHoverZone] = useState<HoverZone>(null)

  // Helper function to convert HoverZone to ScheduleAssignmentType
  const getAssignmentType = (zone: HoverZone): ScheduleAssignmentType => {
    switch (zone) {
      case 'first_half': return 'first_half'
      case 'second_half': return 'second_half'
      case 'full_period':
      default: return 'full_period'
    }
  }

  // Handle hover zone enter
  const handleHoverZoneEnter = useCallback((zone: HoverZone) => {
    setLocalHoverZone(zone)
    onHoverZoneChange?.({
      columnIndex,
      periodIndex,
      zone
    })
  }, [columnIndex, periodIndex, onHoverZoneChange])

  // Handle hover zone leave
  const handleHoverZoneLeave = useCallback(() => {
    setLocalHoverZone(null)
    onHoverZoneChange?.(null)
  }, [onHoverZoneChange])

  // Handle drop event
  const handleDrop = useCallback((zone: HoverZone) => {
    if (!draggedTeacher || !zone) return

    // Convert PeriodTime to TimeSlot format
    const timeSlot = {
        startTime: periodTime.start,
        endTime: periodTime.end,
        periodNum: periodTime.period
    }

    const dropZone: DropZone = {
      columnIndex,
      periodIndex,
      timeSlot,
      zone: getAssignmentType(zone)
    }

    onTeacherDrop?.(draggedTeacher.teacherId, dropZone)
    setLocalHoverZone(null)
    onHoverZoneChange?.(null)
  }, [columnIndex, periodIndex, periodTime, draggedTeacher, onTeacherDrop, onHoverZoneChange])

  // Check if current position matches active hover zone
  const isActiveHoverZone = (zone: HoverZone): boolean => {
    return activeHoverZone?.columnIndex === columnIndex && 
           activeHoverZone?.periodIndex === periodIndex && 
           activeHoverZone?.zone === zone
  }

  // Get hover zone style
  const getHoverZoneStyle = (zone: HoverZone): string => {
    const isActive = isActiveHoverZone(zone) || localHoverZone === zone
    return `${styles.hoverZone()} ${isActive ? styles.hoverZoneActive() : ''}`
  }

  return (
    <div className={styles.container({ className })}>
      <div 
        className={`${styles.cell()} ${
          periodIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
        }`}
      >
        {/* Task 2.3: Three hover zones with visual feedback */}
        
        {/* Full Period Zone */}
        <div
          className={getHoverZoneStyle('full_period')}
          style={{ top: '0', left: '0', right: '0', bottom: '0' }}
          onMouseEnter={() => handleHoverZoneEnter('full_period')}
          onMouseLeave={handleHoverZoneLeave}
          onDrop={(e) => {
            e.preventDefault()
            handleDrop('full_period')
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          {/* Show drop indicator when dragging */}
          {draggedTeacher && isActiveHoverZone('full_period') && (
            <div className={styles.dropZoneIndicator()}>
              <div className={styles.dropZoneText()}>
                Drop for Full Period
              </div>
            </div>
          )}
        </div>

        {/* First Half Zone */}
        <div
          className={getHoverZoneStyle('first_half')}
          style={{ top: '0', left: '0', right: '0', height: '50%' }}
          onMouseEnter={() => handleHoverZoneEnter('first_half')}
          onMouseLeave={handleHoverZoneLeave}
          onDrop={(e) => {
            e.preventDefault()
            handleDrop('first_half')
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          {draggedTeacher && isActiveHoverZone('first_half') && (
            <div className={styles.dropZoneIndicator()}>
              <div className={styles.dropZoneText()}>
                Drop for First Half
              </div>
            </div>
          )}
        </div>

        {/* Second Half Zone */}
        <div
          className={getHoverZoneStyle('second_half')}
          style={{ bottom: '0', left: '0', right: '0', height: '50%' }}
          onMouseEnter={() => handleHoverZoneEnter('second_half')}
          onMouseLeave={handleHoverZoneLeave}
          onDrop={(e) => {
            e.preventDefault()
            handleDrop('second_half')
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          {draggedTeacher && isActiveHoverZone('second_half') && (
            <div className={styles.dropZoneIndicator()}>
              <div className={styles.dropZoneText()}>
                Drop for Second Half
              </div>
            </div>
          )}
        </div>

        {/* Render existing planned visits */}
        {plannedVisits.map((visit, index) => (
          <button
            key={`${visit._id}-${index}`}
            onClick={() => onPlannedVisitClick?.(visit)}
            className={styles.visitCard()}
            style={{
              top: visit.assignmentType === 'second_half' ? '50%' : '0',
              height: visit.assignmentType === 'full_period' ? '100%' : '50%',
              left: '2px',
              right: '2px',
              zIndex: 10 // Ensure visits appear above hover zones
            }}
          >
            <p className={styles.visitTitle()}>
              {visit.purpose}
            </p>
            <p className={styles.visitDetail()}>
              {visit.assignmentType === 'full_period' ? 'Full' : 
               visit.assignmentType === 'first_half' ? 'First Half' : 'Second Half'}
            </p>
          </button>
        ))}

        {/* Render active assignments (Task 3.5) */}
        {activeAssignments?.filter(assignment =>
          assignment.timeSlot.startTime === periodTime.start &&
          assignment.timeSlot.endTime === periodTime.end
        ).map((assignment, index) => (
          <AssignedTeacherCard
            key={`assignment-${assignment.teacherId}-${assignment.timeSlot.startTime}-${index}`}
            assignment={assignment}
            teacherName={getTeacherName?.(assignment.teacherId) || 'No teacher name'}
            purpose={assignment.purpose || 'No purpose assigned'}
            onRemove={() => onRemoveAssignment?.(assignment)}
            onEditPurpose={() => onEditAssignmentPurpose?.(assignment)}
          />
        ))}
      </div>
    </div>
  )
} 