'use client'

import { useState, useCallback } from 'react'
import { tv } from 'tailwind-variants'
import type { 
  PlannedColumnProps, 
  HoverZone, 
  ScheduleAssignmentType,
  DropZone
} from './types'
import { AssignedTeacherCard } from '@components/domain/scheduling/AssignedTeacherCard'

const plannedColumn = tv({
  slots: {
    container: 'border-r border-gray-100',
    cell: 'border-b border-gray-100 h-20 relative flex flex-col',
    hoverZone: 'absolute cursor-pointer transition-all duration-200 border border-dashed border-transparent',
    hoverZoneActive: 'border-blue-300 bg-blue-50/50 bg-gray-400/20',
    visitCard: 'absolute flex flex-col overflow-hidden p-2 text-xs rounded border border-blue-200 bg-blue-50 text-blue-700 hover:shadow-md transition-shadow cursor-pointer',
    visitTitle: 'font-semibold truncate',
    visitDetail: 'text-xs opacity-75',
    dropZoneIndicator: 'absolute inset-0 border-2 border-dashed border-blue-300 bg-blue-50/30 flex items-center justify-center',
    dropZoneText: 'text-blue-600 text-xs font-medium pointer-events-none'
  }
})

/**
 * Enhanced PlannedColumn component
 * Maintains existing proven three-zone functionality while integrating with consolidated architecture
 * Preserves all working assignment validation and visual feedback patterns
 */
export function PlannedColumn({
  columnIndex,
  periodIndex,
  periodTime,
  plannedVisits,
  selectedTeacherPeriod: _selectedTeacherPeriod,
  activeHoverZone,
  draggedTeacher,
  onPlannedVisitClick,
  onTeacherDrop,
  onHoverZoneChange,
  onPeriodAssignment: _onPeriodAssignment,
  activeAssignments,
  onRemoveAssignment,
  onEditAssignmentPurpose,
  getTeacherName,
  className
}: PlannedColumnProps) {
  const styles = plannedColumn()
  const [localHoverZone, setLocalHoverZone] = useState<HoverZone>(null)

  // Helper function to convert HoverZone to ScheduleAssignmentType
  const getAssignmentType = useCallback((zone: HoverZone): ScheduleAssignmentType => {
    switch (zone) {
      case 'first_half': return 'first_half'
      case 'second_half': return 'second_half'
      case 'full_period':
      default: return 'full_period'
    }
  }, [])

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

    // Convert PeriodTime to TimeSlot format for compatibility
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
  }, [columnIndex, periodIndex, periodTime, draggedTeacher, onTeacherDrop, onHoverZoneChange, getAssignmentType])

  // Check if current position matches active hover zone
  const isActiveHoverZone = useCallback((zone: HoverZone): boolean => {
    return activeHoverZone?.columnIndex === columnIndex && 
           activeHoverZone?.periodIndex === periodIndex && 
           activeHoverZone?.zone === zone
  }, [activeHoverZone, columnIndex, periodIndex])

  // Get hover zone style
  const getHoverZoneStyle = useCallback((zone: HoverZone): string => {
    const isActive = isActiveHoverZone(zone) || localHoverZone === zone
    return `${styles.hoverZone()} ${isActive ? styles.hoverZoneActive() : ''}`
  }, [isActiveHoverZone, localHoverZone, styles])

  // Get cell background based on period index (consistent with ScheduleCell)
  const getCellBackground = (): string => {
    return periodIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
  }

  // Filter assignments for this specific period
  const periodAssignments = activeAssignments?.filter((assignment) =>
    assignment.timeSlot.startTime === periodTime.start &&
    assignment.timeSlot.endTime === periodTime.end
  ) || []

  return (
    <div className={styles.container({ className })}>
      <div className={`${styles.cell()} ${getCellBackground()}`}>
        {/* Three hover zones with proven visual feedback */}
        
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
            type="button"
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

        {/* Render active assignments */}
        {periodAssignments.map((assignment, index) => (
          <AssignedTeacherCard
            key={`assignment-${assignment.teacherId}-${assignment.timeSlot.startTime}-${index}`}
            assignment={assignment}
            teacherName={getTeacherName?.(assignment.teacherId) || 'No teacher name'}
            purpose={assignment.purpose || 'No purpose assigned'}
            onRemove={() => onRemoveAssignment?.({ teacherId: assignment.teacherId, periodIndex })}
            onEditPurpose={() => onEditAssignmentPurpose?.({ teacherId: assignment.teacherId, periodIndex })}
          />
        ))}
      </div>
    </div>
  )
} 