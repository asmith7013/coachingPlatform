'use client'

import { useState, useCallback } from 'react'
import { tv } from 'tailwind-variants'
import type { 
  PlannedVisit, 
  PeriodTime, 
  HoverState, 
  HoverZone, 
  ScheduleAssignmentType 
} from '@domain-types/schedule'
import type { AssignmentState } from '@zod-schema/visits/schedule-builder-state'
import type { EventPurpose } from '@components/core/dropdowns/PurposeAssignmentDropdown'
import { AssignedTeacherCard } from '@components/domain/scheduling/AssignedTeacherCard'
import { periodsMatch } from '@/lib/domain/schedule/period-utils'
import { getAssignmentType } from '@/lib/domain/schedule/zone-utils'

const plannedScheduleColumn = tv({
  slots: {
    container: 'relative h-full border-b border-gray-200 transition-all duration-300',
    zoneContainer: 'absolute inset-0',
    
    fullZone: 'absolute inset-0 border-2 border-transparent rounded-sm transition-all duration-300 ease-in-out hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-sm',
    firstHalfZone: 'absolute top-0 left-0 right-0 h-1/2 border-2 border-transparent rounded-sm transition-all duration-300 ease-in-out hover:border-green-300 hover:bg-green-50/50 hover:shadow-sm',
    secondHalfZone: 'absolute bottom-0 left-0 right-0 h-1/2 border-2 border-transparent rounded-sm transition-all duration-300 ease-in-out hover:border-orange-300 hover:bg-orange-50/50 hover:shadow-sm',
    
    zoneActive: 'border-dashed border-blue-500 bg-blue-100/30 shadow-md transform scale-[1.02]',
    zoneHover: 'border-dashed border-gray-400 bg-gray-50/30 shadow-sm',
    
    dragOver: 'border-solid border-indigo-500 bg-indigo-100/40 shadow-lg transform scale-[1.03] ring-2 ring-indigo-200',
    
    zoneLabel: 'absolute inset-x-1 flex items-center justify-center text-xs font-medium text-gray-500 pointer-events-none transition-all duration-200',
    zoneLabelVisible: 'opacity-100 transform scale-100',
    zoneLabelHidden: 'opacity-0 transform scale-95',
    
    hoverIndicator: 'absolute inset-0 border border-dashed border-gray-300 bg-gray-50/20 opacity-0 transition-all duration-200 pointer-events-none',
    hoverIndicatorVisible: 'opacity-100',
    hoverLabel: 'absolute inset-0 flex items-center justify-center text-xs text-gray-600 font-medium bg-white/80 backdrop-blur-sm pointer-events-none opacity-0 transition-all duration-200',
    hoverLabelVisible: 'opacity-100',
    
    visitCard: 'absolute bg-white border border-gray-200 rounded p-1 text-xs cursor-pointer transition-all duration-200 hover:border-gray-300 hover:shadow-md hover:z-20 transform hover:scale-[1.02]',
    visitTitle: 'font-medium text-gray-800 truncate',
    visitDetail: 'text-gray-500 text-xs truncate',
    
    loadingOverlay: 'absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-30 transition-opacity duration-300',
    loadingSpinner: 'animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600',
    successFeedback: 'absolute inset-0 bg-green-500/10 flex items-center justify-center z-20 transition-opacity duration-500',
    errorFeedback: 'absolute inset-0 bg-red-500/10 flex items-center justify-center z-20 transition-opacity duration-500',
    feedbackIcon: 'w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center',
    successIcon: 'text-green-600',
    errorIcon: 'text-red-600',
    
    dropZoneIndicator: 'absolute inset-0 border-2 border-dashed border-blue-300 bg-blue-50/30 flex items-center justify-center backdrop-blur-sm',
    dropZoneText: 'text-blue-600 text-xs font-medium pointer-events-none bg-white/80 px-2 py-1 rounded-md shadow-sm',
    
    cell: 'border-b border-gray-100 h-20 relative flex flex-col transition-colors duration-200'
  }
})

export interface PlannedScheduleColumnProps {
  columnIndex: number
  periodIndex: number
  periodTime: PeriodTime
  plannedVisits: PlannedVisit[]
  onPlannedVisitClick?: (visit: PlannedVisit) => void
  onHoverZoneChange?: (hoverState: HoverState | null) => void
  activeHoverZone?: HoverState | null
  className?: string
  activeAssignments?: AssignmentState[]
  onRemoveAssignment?: (assignment: AssignmentState) => void
  onEditAssignmentPurpose?: (assignment: AssignmentState) => void
  getTeacherName?: (teacherId: string) => string
  
  // 🆕 STEP 5: Period assignment props (replaces drag/drop)
  selectedTeacherPeriod?: {
    teacherId: string
    teacherName: string
    period: number
    columnIndex: number
  } | null
  onPeriodAssignment?: (
    periodIndex: number,
    periodTime: PeriodTime,
    assignmentType: ScheduleAssignmentType
  ) => void
  
  // 🗑️ REMOVED: Drag and drop props (no longer needed)
  // onTeacherDrop?: (teacherId: string, dropZone: DropZone) => void
  // draggedTeacher?: DraggedTeacher | null
}

export function PlannedScheduleColumn({
  columnIndex,
  periodIndex,
  periodTime,
  plannedVisits,
  onPlannedVisitClick,
  onHoverZoneChange,
  activeHoverZone,
  className,
  activeAssignments,
  onRemoveAssignment,
  onEditAssignmentPurpose,
  getTeacherName,
  selectedTeacherPeriod,
  onPeriodAssignment
}: PlannedScheduleColumnProps) {
  const styles = plannedScheduleColumn()
  const [localHoverZone, setLocalHoverZone] = useState<HoverZone>(null)

  // Note: Using imported getAssignmentType utility instead of local implementation

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

  // Handle click event for zone assignment (replaces drop)
  const handleZoneClick = useCallback((zone: HoverZone) => {
    console.log('🎯 Zone clicked:', zone)
    console.log('📍 Selected teacher period:', selectedTeacherPeriod)
    console.log('⏰ Period time:', periodTime)
    
    if (!selectedTeacherPeriod) {
      console.log('❌ No teacher selected')
      return
    }

    // REPLACED: Use centralized period matching utility
    if (!periodsMatch(selectedTeacherPeriod.period, periodTime.period)) {
      console.log('❌ Period mismatch:', {
        selected: selectedTeacherPeriod.period,
        target: periodTime.period
      })
      return
    }

    console.log('✅ Periods match, proceeding with assignment')
    const assignmentType = getAssignmentType(zone)
    onPeriodAssignment?.(periodIndex, periodTime, assignmentType)
  }, [selectedTeacherPeriod, periodTime, periodIndex, onPeriodAssignment])

  // Check if current position matches active hover zone
  const isActiveHoverZone = (zone: HoverZone): boolean => {
    return activeHoverZone?.columnIndex === columnIndex && 
           activeHoverZone?.periodIndex === periodIndex && 
           activeHoverZone?.zone === zone
  }

  // Get hover zone style
  const getHoverZoneStyle = (zone: HoverZone): string => {
    const isActive = isActiveHoverZone(zone) || localHoverZone === zone
    
    switch (zone) {
      case 'first_half':
        return `${styles.firstHalfZone()} ${isActive ? styles.zoneActive() : ''}`
      case 'second_half':
        return `${styles.secondHalfZone()} ${isActive ? styles.zoneActive() : ''}`
      case 'full_period':
      default:
        return `${styles.fullZone()} ${isActive ? styles.zoneActive() : ''}`
    }
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
          onClick={() => handleZoneClick('full_period')}
        >
          {/* Show assignment option when teacher selected for this period */}
          {selectedTeacherPeriod?.period === periodTime.period && localHoverZone === 'full_period' && (
            <div className={`${styles.hoverIndicator()} ${styles.hoverIndicatorVisible()}`}>
              <div className={`${styles.hoverLabel()} ${styles.hoverLabelVisible()}`}>
                Click to assign {selectedTeacherPeriod.teacherName} - Full Period
              </div>
            </div>
          )}
          
          {/* Regular hover for non-matching periods */}
          {(!selectedTeacherPeriod || selectedTeacherPeriod.period !== periodTime.period) && 
           localHoverZone === 'full_period' && (
            <div className={`${styles.hoverIndicator()} ${styles.hoverIndicatorVisible()}`}>
              <div className={`${styles.hoverLabel()} ${styles.hoverLabelVisible()}`}>
                Full Period
              </div>
            </div>
          )}
          
          {/* Existing drop indicator for dragging */}
          {selectedTeacherPeriod && isActiveHoverZone('full_period') && (
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
          onClick={() => handleZoneClick('first_half')}
        >
          {/* Show assignment option when teacher selected for this period */}
          {selectedTeacherPeriod?.period === periodTime.period && localHoverZone === 'first_half' && (
            <div className={`${styles.hoverIndicator()} ${styles.hoverIndicatorVisible()}`}>
              <div className={`${styles.hoverLabel()} ${styles.hoverLabelVisible()}`}>
                Click to assign {selectedTeacherPeriod.teacherName} - First Half
              </div>
            </div>
          )}
          
          {/* Regular hover for non-matching periods */}
          {(!selectedTeacherPeriod || selectedTeacherPeriod.period !== periodTime.period) && 
           localHoverZone === 'first_half' && (
            <div className={`${styles.hoverIndicator()} ${styles.hoverIndicatorVisible()}`}>
              <div className={`${styles.hoverLabel()} ${styles.hoverLabelVisible()}`}>
                First Half
              </div>
            </div>
          )}
          
          {/* Existing drop indicator for dragging */}
          {selectedTeacherPeriod && isActiveHoverZone('first_half') && (
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
          onClick={() => handleZoneClick('second_half')}
        >
          {/* Show assignment option when teacher selected for this period */}
          {selectedTeacherPeriod?.period === periodTime.period && localHoverZone === 'second_half' && (
            <div className={`${styles.hoverIndicator()} ${styles.hoverIndicatorVisible()}`}>
              <div className={`${styles.hoverLabel()} ${styles.hoverLabelVisible()}`}>
                Click to assign {selectedTeacherPeriod.teacherName} - Second Half
              </div>
            </div>
          )}
          
          {/* Regular hover for non-matching periods */}
          {(!selectedTeacherPeriod || selectedTeacherPeriod.period !== periodTime.period) && 
           localHoverZone === 'second_half' && (
            <div className={`${styles.hoverIndicator()} ${styles.hoverIndicatorVisible()}`}>
              <div className={`${styles.hoverLabel()} ${styles.hoverLabelVisible()}`}>
                Second Half
              </div>
            </div>
          )}
          
          {/* Existing drop indicator for dragging */}
          {selectedTeacherPeriod && isActiveHoverZone('second_half') && (
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
            purpose={(assignment.purpose as EventPurpose) || null}
            onRemove={() => onRemoveAssignment?.(assignment)}
            onEditPurpose={() => onEditAssignmentPurpose?.(assignment)}
          />
        ))}
      </div>
    </div>
  )
}