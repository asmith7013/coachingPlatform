'use client'

import { useMemo } from 'react'
import { BellScheduleGrid } from '@components/composed/calendar/schedule'
import { TeacherSelectionPanel } from '@components/domain/scheduling/TeacherSelectionPanel'
import { ConflictDetectionProvider, ConflictWarningBanner } from '@components/domain/scheduling/ConflictDetectionProvider'
import type { ScheduleColumn, PlannedVisit } from '@components/composed/calendar/schedule/types'
import type { PeriodTime } from '@/lib/domain/schedule/schedule-calendar-utils'
import type { AssignmentState } from '@zod-schema/visits/schedule-builder-state'
import { useVisitScheduleBuilder } from '@hooks/domain/useVisitScheduleBuilder'

interface TeacherScheduleItem {
  id: string
  name?: string
  room?: string
  subject?: string
  grade?: string
  availability?: 'available' | 'busy' | 'unavailable'
}

interface VisitScheduleBuilderProps {
  date: Date
  schoolId: string
  coachId: string
  bellSchedule: PeriodTime[]
  teacherSchedule?: TeacherScheduleItem[]
  existingPlannedVisits?: PlannedVisit[]
  className?: string
}

export function VisitScheduleBuilder({
  date,
  schoolId,
  coachId,
  bellSchedule,
  teacherSchedule = [],
  existingPlannedVisits = [],
  className
}: VisitScheduleBuilderProps) {
  // Schedule builder hook for state management (Task 2.4)
  const {
    selectedTeachers,
    activeAssignments,
    draggedTeacher,
    activeHoverZone,
    selectTeacher,
    deselectTeacher,
    clearSelection,
    startDragging,
    stopDragging,
    updateHoverZone,
    handleTeacherDrop,
    hasUnsavedChanges,
    saveState
  } = useVisitScheduleBuilder(date, schoolId, coachId)

  // =================== HELPER FUNCTIONS ===================

  // Get teacher name by ID
  const getTeacherName = (teacherId: string): string => {
    const teacher = teacherSchedule.find(t => t.id === teacherId)
    return teacher?.name || `Teacher ${teacherId}`
  }

  // Remove assignment
  const _handleRemoveAssignment = (assignment: AssignmentState) => {
    // TODO: Implement assignment removal logic
    console.log('Remove assignment:', assignment)
  }

  // Edit assignment purpose
  const _handleEditAssignmentPurpose = (assignment: AssignmentState) => {
    // TODO: Implement purpose editing logic
    console.log('Edit assignment purpose:', assignment)
  }

  // =================== COLUMN SETUP ===================

  // Create schedule columns (Task 2.5: Integration with existing data)
  const scheduleColumns = useMemo<ScheduleColumn[]>(() => {
    const columns: ScheduleColumn[] = []

    // Add teacher columns from existing schedule data
    teacherSchedule.forEach((teacher, index) => {
      columns.push({
        id: `teacher-${teacher.id}`,
        title: teacher.name || `Teacher ${index + 1}`,
        subtitle: teacher.room || teacher.subject || undefined
      })
    })

    // Add planned visits column for interactive mode (Task 2.1-2.2)
    columns.push({
      id: 'planned-visits',
      title: 'Planned Visits',
      subtitle: 'Drop teachers here'
    })

    return columns
  }, [teacherSchedule])

  // Convert TeacherScheduleItem to Teacher format for TeacherSelectionPanel
  const teachersForSelection = useMemo(() => 
    teacherSchedule.map(teacher => ({
      ...teacher,
      name: teacher.name || `Teacher ${teacher.id}`, // Ensure name is always a string
      availability: teacher.availability || 'available' as const
    })), 
    [teacherSchedule]
  )

  // =================== EVENT HANDLERS ===================

  const handlePlannedVisitClick = (visit: PlannedVisit) => {
    console.log('Planned visit clicked:', visit)
    // TODO: Open visit details/edit modal
  }

  const handleSaveSchedule = async () => {
    try {
      const result = await saveState()
      if (result.success) {
        console.log('Schedule saved successfully')
        // TODO: Show success notification
      } else {
        console.error('Failed to save schedule:', result.error)
        // TODO: Show error notification
      }
    } catch (error) {
      console.error('Error saving schedule:', error)
    }
  }

  // =================== RENDER ===================

  return (
    <ConflictDetectionProvider
      activeAssignments={activeAssignments}
      existingPlannedVisits={existingPlannedVisits}
      preventConflicts={false} // Show warnings but allow conflicts
    >
      <div className={`space-y-4 ${className || ''}`}>
        {/* Schedule Builder Header */}
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Visit Schedule Builder
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Unsaved changes indicator */}
            {hasUnsavedChanges && (
              <div className="text-sm text-orange-600 font-medium">
                Unsaved changes
              </div>
            )}

            {/* Save button */}
            <button
              onClick={handleSaveSchedule}
              disabled={!hasUnsavedChanges}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Save Schedule
            </button>
          </div>
        </div>

        {/* Conflict Warning Banner (Task 3.4) */}
        <ConflictWarningBanner />

        {/* Teacher Selection Panel (Tasks 3.1-3.2) */}
        <TeacherSelectionPanel
          teachers={teachersForSelection}
          selectedTeachers={selectedTeachers}
          onSelectTeacher={selectTeacher}
          onDeselectTeacher={deselectTeacher}
          onClearSelection={clearSelection}
          onStartDragging={startDragging}
          onStopDragging={stopDragging}
        />

        {/* Interactive Schedule Grid (Tasks 2.1-2.5 + 3.3-3.5) */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <BellScheduleGrid
            columns={scheduleColumns}
            events={[]} // No bell schedule events needed for visit planning
            periodTimes={bellSchedule}
            className="min-h-[400px]"
            
            // Interactive mode props (Task 2.1)
            interactive={true}
            plannedVisits={existingPlannedVisits}
            onPlannedVisitClick={handlePlannedVisitClick}
            
            // Drag and drop handlers (Task 2.4)
            onTeacherDrop={handleTeacherDrop}
            onHoverZoneChange={updateHoverZone}
            
            // Visual feedback state (Task 2.3)
            activeHoverZone={activeHoverZone}
            draggedTeacher={draggedTeacher}
          />
        </div>

        {/* Assignment Summary (Task 3.5) */}
        {activeAssignments.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm font-medium text-green-800 mb-2">
              Scheduled Assignments ({activeAssignments.length})
            </div>
            <div className="space-y-2">
              {activeAssignments.map((assignment, index) => (
                <div
                  key={`${assignment.teacherId}-${assignment.timeSlot.startTime}-${index}`}
                  className="bg-green-100 text-green-800 px-3 py-2 rounded text-sm"
                >
                  {getTeacherName(assignment.teacherId)} - {assignment.timeSlot.startTime} to {assignment.timeSlot.endTime} 
                  ({assignment.assignmentType.replace('_', ' ')})
                  {assignment.purpose && ` - ${assignment.purpose}`}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usage Instructions */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700 mb-2">
            How to Use:
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Click teacher cards to select them (they will turn blue)</li>
            <li>• Drag selected teachers to time slots in the Planned Visits column</li>
            <li>• Hover over time slots to see three zones: Full Period, First Half, Second Half</li>
            <li>• Drop teachers in the appropriate zone based on visit duration needed</li>
            <li>• Click assigned teachers to edit purpose or remove assignments</li>
          </ul>
        </div>
      </div>
    </ConflictDetectionProvider>
  )
} 