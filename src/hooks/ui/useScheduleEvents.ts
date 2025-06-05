import { useCallback, useMemo } from 'react'
import type { 
  BellScheduleEvent, 
  PlannedVisit,
  PeriodTime,
  ScheduleAssignmentType,
  SelectedTeacherPeriod
} from '@domain-types/schedule'
import { isTeacherColumn } from '@/lib/domain/schedule/grid-positioning'
import { normalizePeriod } from '@/lib/domain/schedule/period-utils'

export interface ScheduleEventHandlers {
  handleTeacherEventClick: (event: BellScheduleEvent) => void
  handlePlannedVisitClick: (visit: PlannedVisit) => void
  handlePeriodAssignment: (
    periodIndex: number,
    periodTime: PeriodTime,
    assignmentType: ScheduleAssignmentType
  ) => Promise<void>
  isEventSelected: (event: BellScheduleEvent) => boolean
  getTeacherIdFromEvent: (event: BellScheduleEvent) => string | null
}

export interface UseScheduleEventsProps {
  teacherSchedule: Array<{ id: string; name?: string }>
  selectedTeacherPeriod: SelectedTeacherPeriod | null
  onTeacherPeriodSelect: (selection: SelectedTeacherPeriod | null) => void
  onAssignmentCreate: (teacherId: string, dropZone: unknown) => Promise<unknown>
  hasPlannedColumn?: boolean
}

/**
 * Centralized schedule event handling hook
 * Consolidates event logic scattered across schedule components
 * Provides consistent behavior for all schedule interactions
 */
export function useScheduleEvents({
  teacherSchedule,
  selectedTeacherPeriod,
  onTeacherPeriodSelect,
  onAssignmentCreate,
  hasPlannedColumn = true
}: UseScheduleEventsProps): ScheduleEventHandlers {

  // Helper to get teacher from event
  const getTeacherIdFromEvent = useCallback((event: BellScheduleEvent): string | null => {
    if (!isTeacherColumn(event.columnIndex, hasPlannedColumn)) {
      return null
    }
    
    const teacherIndex = event.columnIndex - (hasPlannedColumn ? 3 : 2)
    const teacher = teacherSchedule[teacherIndex]
    return teacher?.id || null
  }, [teacherSchedule, hasPlannedColumn])

  // Note: Using imported normalizePeriod utility instead of local implementation

  // Handle teacher event clicks with period-specific selection
  const handleTeacherEventClick = useCallback((event: BellScheduleEvent) => {
    const teacherId = getTeacherIdFromEvent(event)
    if (!teacherId) return

    const teacher = teacherSchedule.find(t => t.id === teacherId)
    if (!teacher) return

    const eventPeriodNum = normalizePeriod(event.period)

    // Check if this specific period is already selected
    const isCurrentlySelected = selectedTeacherPeriod?.teacherId === teacherId && 
                                selectedTeacherPeriod?.period === eventPeriodNum

    if (isCurrentlySelected) {
      // Deselect if clicking the same period
      onTeacherPeriodSelect(null)
    } else {
      // Select this specific teacher-period combination
      onTeacherPeriodSelect({
        teacherId,
        teacherName: teacher.name || `Teacher ${teacherId}`,
        period: eventPeriodNum,
        columnIndex: event.columnIndex
      })
    }
  }, [
    getTeacherIdFromEvent,
    teacherSchedule,
    selectedTeacherPeriod,
    onTeacherPeriodSelect,
  ])

  // Handle planned visit clicks
  const handlePlannedVisitClick = useCallback((visit: PlannedVisit) => {
    console.log('Planned visit clicked:', visit)
    // Can be extended for edit/view functionality
  }, [])

  // Handle period assignments
  const handlePeriodAssignment = useCallback(async (
    periodIndex: number,
    periodTime: PeriodTime,
    assignmentType: ScheduleAssignmentType
  ) => {
    if (!selectedTeacherPeriod) {
      console.log('No teacher selected for assignment')
      return
    }

    // Check if the selected period matches the target period
    if (selectedTeacherPeriod.period !== periodTime.period) {
      console.log('Period mismatch:', {
        selected: selectedTeacherPeriod.period,
        target: periodTime.period
      })
      return
    }

    // Create assignment using existing logic
    const dropZone = {
      columnIndex: hasPlannedColumn ? 1 : 0, // Planned visits column
      periodIndex,
      timeSlot: {
        startTime: periodTime.start,
        endTime: periodTime.end,
        periodNum: periodTime.period
      },
      zone: assignmentType
    }

    const result = await onAssignmentCreate(selectedTeacherPeriod.teacherId, dropZone)
    
    if (result && typeof result === 'object' && 'success' in result && result.success) {
      // Clear selection after successful assignment
      onTeacherPeriodSelect(null)
    }
  }, [selectedTeacherPeriod, onAssignmentCreate, onTeacherPeriodSelect, hasPlannedColumn])

  // Check if an event is currently selected
  const isEventSelected = useCallback((event: BellScheduleEvent): boolean => {
    const teacherId = getTeacherIdFromEvent(event)
    if (!teacherId) return false

    return selectedTeacherPeriod?.teacherId === teacherId &&
           selectedTeacherPeriod?.period === normalizePeriod(event.period)
  }, [selectedTeacherPeriod, getTeacherIdFromEvent])

  return useMemo(() => ({
    handleTeacherEventClick,
    handlePlannedVisitClick,
    handlePeriodAssignment,
    isEventSelected,
    getTeacherIdFromEvent
  }), [
    handleTeacherEventClick,
    handlePlannedVisitClick,
    handlePeriodAssignment,
    isEventSelected,
    getTeacherIdFromEvent
  ])
} 