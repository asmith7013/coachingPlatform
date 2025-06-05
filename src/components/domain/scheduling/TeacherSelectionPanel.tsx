'use client'

import { useCallback } from 'react'
import { tv } from 'tailwind-variants'
import { XMarkIcon } from '@heroicons/react/24/outline'
import type { TeacherSelectionState } from '@zod-schema/visits/schedule-builder-state'

const teacherSelectionPanel = tv({
  slots: {
    container: 'bg-white rounded-lg border border-gray-200 p-4 space-y-4',
    header: 'flex items-center justify-between',
    title: 'text-lg font-semibold text-gray-900',
    clearButton: 'text-sm text-blue-600 hover:text-blue-700 cursor-pointer font-medium',
    teacherGrid: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3',
    teacherCard: 'relative p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm',
    // PRD: Light blue/gray → dark blue selection visual feedback
    teacherCardUnselected: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100',
    teacherCardSelected: 'bg-blue-600 border-blue-600 text-white shadow-md',
    teacherInfo: 'space-y-1',
    teacherName: 'font-medium text-sm',
    teacherDetails: 'text-xs opacity-75',
    selectionOrder: 'absolute -top-2 -right-2 w-6 h-6 bg-blue-700 text-white rounded-full flex items-center justify-center text-xs font-bold',
    deselectButton: 'absolute top-1 right-1 w-5 h-5 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors',
    selectionSummary: 'bg-blue-50 border border-blue-200 rounded-lg p-3',
    summaryText: 'text-sm text-blue-800 font-medium'
  }
})

interface Teacher {
  id: string
  name: string
  room?: string
  subject?: string
  grade?: string
  availability?: 'available' | 'busy' | 'unavailable'
}

interface TeacherSelectionPanelProps {
  teachers: Teacher[]
  selectedTeachers: TeacherSelectionState[]
  onSelectTeacher: (teacherId: string, teacherName: string) => void
  onDeselectTeacher: (teacherId: string) => void
  onClearSelection: () => void
  onStartDragging: (teacherId: string, teacherName: string) => void
  onStopDragging: () => void
  className?: string
}

export function TeacherSelectionPanel({
  teachers,
  selectedTeachers,
  onSelectTeacher,
  onDeselectTeacher,
  onClearSelection,
  onStartDragging,
  onStopDragging,
  className
}: TeacherSelectionPanelProps) {
  const styles = teacherSelectionPanel()

  // Helper function to check if teacher is selected
  const isTeacherSelected = useCallback((teacherId: string): boolean => {
    return selectedTeachers.some(t => t.teacherId === teacherId)
  }, [selectedTeachers])

  // Get selection order for teacher
  const getSelectionOrder = useCallback((teacherId: string): number | undefined => {
    const teacher = selectedTeachers.find(t => t.teacherId === teacherId)
    return teacher?.selectionOrder !== undefined ? teacher.selectionOrder + 1 : undefined
  }, [selectedTeachers])

  // Handle teacher card click (Task 3.2)
  const handleTeacherClick = useCallback((teacher: Teacher) => {
    if (isTeacherSelected(teacher.id)) {
      onDeselectTeacher(teacher.id)
    } else {
      onSelectTeacher(teacher.id, teacher.name)
    }
  }, [isTeacherSelected, onSelectTeacher, onDeselectTeacher])

  // Handle deselect button click (prevent event bubbling)
  const handleDeselectClick = useCallback((e: React.MouseEvent, teacherId: string) => {
    e.stopPropagation()
    onDeselectTeacher(teacherId)
  }, [onDeselectTeacher])

  // Filter available teachers (exclude unavailable ones)
  const availableTeachers = teachers.filter(teacher => 
    teacher.availability !== 'unavailable'
  )

  return (
    <div className={styles.container({ className })}>
      {/* Header (Task 3.1) */}
      <div className={styles.header()}>
        <h3 className={styles.title()}>
          Select Teachers ({selectedTeachers.length}/{availableTeachers.length})
        </h3>
        {selectedTeachers.length > 0 && (
          <button
            onClick={onClearSelection}
            className={styles.clearButton()}
            type="button"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Selection Summary (Task 3.1) */}
      {selectedTeachers.length > 0 && (
        <div className={styles.selectionSummary()}>
          <div className={styles.summaryText()}>
            {selectedTeachers.length} teacher{selectedTeachers.length !== 1 ? 's' : ''} selected. 
            Drag selected teachers to schedule slots below.
          </div>
        </div>
      )}

      {/* Teacher Grid (Task 3.2) */}
      <div className={styles.teacherGrid()}>
        {availableTeachers.map((teacher) => {
          const isSelected = isTeacherSelected(teacher.id)
          const selectionOrder = getSelectionOrder(teacher.id)

          return (
            <div
              key={teacher.id}
              onClick={() => handleTeacherClick(teacher)}
              className={`${styles.teacherCard()} ${
                isSelected 
                  ? styles.teacherCardSelected() 
                  : styles.teacherCardUnselected()
              }`}
              draggable={isSelected}
              onDragStart={() => isSelected && onStartDragging(teacher.id, teacher.name)}
              onDragEnd={onStopDragging}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleTeacherClick(teacher)
                }
              }}
            >
              {/* Selection order indicator (Task 3.1) */}
              {isSelected && selectionOrder && (
                <div className={styles.selectionOrder()}>
                  {selectionOrder}
                </div>
              )}

              {/* Deselect button (Task 3.2) */}
              {isSelected && (
                <button
                  onClick={(e) => handleDeselectClick(e, teacher.id)}
                  className={styles.deselectButton()}
                  type="button"
                  aria-label={`Deselect ${teacher.name}`}
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              )}

              {/* Teacher Info */}
              <div className={styles.teacherInfo()}>
                <div className={styles.teacherName()}>
                  {teacher.name}
                </div>
                <div className={styles.teacherDetails()}>
                  {teacher.room && <div>Room {teacher.room}</div>}
                  {teacher.subject && <div>{teacher.subject}</div>}
                  {teacher.grade && <div>Grade {teacher.grade}</div>}
                  {teacher.availability === 'busy' && (
                    <div className="text-amber-600 font-medium">Busy</div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty state */}
      {availableTeachers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No teachers available for selection</p>
        </div>
      )}
    </div>
  )
} 