'use client'

import { useState } from 'react'
import { tv } from 'tailwind-variants'
import { XMarkIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline'
import type { AssignmentState } from '@zod-schema/visits/schedule-builder-state'

const assignedTeacherCard = tv({
  slots: {
    container: 'absolute flex flex-col p-2 rounded border transition-all duration-200 hover:shadow-md cursor-pointer bg-white',
    // Assignment type specific positioning and styling
    fullPeriod: 'inset-1 border-green-200 bg-green-50',
    firstHalf: 'top-1 left-1 right-1 border-blue-200 bg-blue-50',
    secondHalf: 'bottom-1 left-1 right-1 border-purple-200 bg-purple-50',
    header: 'flex items-center justify-between mb-1',
    teacherInfo: 'flex items-center gap-1 flex-1 min-w-0',
    teacherIcon: 'w-3 h-3 flex-shrink-0 text-gray-500',
    teacherName: 'font-semibold text-xs truncate',
    removeButton: 'w-4 h-4 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors flex-shrink-0',
    details: 'space-y-1',
    purposeRow: 'flex items-center gap-1',
    purposeIcon: 'w-3 h-3 flex-shrink-0 text-gray-400',
    purposeText: 'text-xs text-gray-600 truncate',
    timeInfo: 'flex items-center gap-1',
    timeIcon: 'w-3 h-3 flex-shrink-0 text-gray-400',
    timeText: 'text-xs text-gray-500',
    assignmentTypeText: 'text-xs font-medium',
    // Color variants for assignment types
    fullPeriodText: 'text-green-700',
    firstHalfText: 'text-blue-700',
    secondHalfText: 'text-purple-700'
  }
})

interface AssignedTeacherCardProps {
  assignment: AssignmentState
  teacherName?: string
  purpose?: string
  onRemove?: () => void
  onEditPurpose?: () => void
  className?: string
}

export function AssignedTeacherCard({
  assignment,
  teacherName = 'Unknown Teacher',
  purpose = 'No purpose assigned',
  onRemove,
  onEditPurpose,
  className
}: AssignedTeacherCardProps) {
  const styles = assignedTeacherCard()
  const [isHovered, setIsHovered] = useState(false)

  // Get styling based on assignment type
  const getAssignmentTypeStyles = () => {
    switch (assignment.assignmentType) {
      case 'full_period':
        return {
          container: styles.fullPeriod(),
          text: styles.fullPeriodText(),
          height: '100%',
          label: 'Full Period'
        }
      case 'first_half':
        return {
          container: styles.firstHalf(),
          text: styles.firstHalfText(),
          height: '50%',
          label: 'First Half'
        }
      case 'second_half':
        return {
          container: styles.secondHalf(),
          text: styles.secondHalfText(),
          height: '50%',
          label: 'Second Half'
        }
      default:
        return {
          container: styles.fullPeriod(),
          text: styles.fullPeriodText(),
          height: '100%',
          label: 'Full Period'
        }
    }
  }

  const typeStyles = getAssignmentTypeStyles()

  // Handle remove button click (prevent event bubbling)
  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRemove?.()
  }

  // Handle card click for purpose editing
  const handleCardClick = () => {
    onEditPurpose?.()
  }

  return (
    <div
      className={`${styles.container()} ${typeStyles.container} ${className || ''}`}
      style={{ height: typeStyles.height, zIndex: 10 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
    >
      {/* Header with teacher info and remove button */}
      <div className={styles.header()}>
        <div className={styles.teacherInfo()}>
          <UserIcon className={styles.teacherIcon()} />
          <span className={`${styles.teacherName()} ${typeStyles.text}`}>
            {teacherName}
          </span>
        </div>
        
        {/* Remove button (Task 3.5) */}
        {(isHovered || assignment.isTemporary) && onRemove && (
          <button
            onClick={handleRemoveClick}
            className={styles.removeButton()}
            type="button"
            aria-label={`Remove ${teacherName} assignment`}
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Assignment details */}
      <div className={styles.details()}>
        {/* Purpose row */}
        <div className={styles.purposeRow()}>
          <div className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
          <span 
            className={`${styles.purposeText()} ${purpose === 'No purpose assigned' ? 'italic text-amber-600' : ''}`}
            title={purpose}
          >
            {purpose}
          </span>
        </div>

        {/* Time and assignment type info */}
        <div className={styles.timeInfo()}>
          <ClockIcon className={styles.timeIcon()} />
          <span className={styles.timeText()}>
            {assignment.timeSlot.startTime} - {assignment.timeSlot.endTime}
          </span>
        </div>

        <div className={`${styles.assignmentTypeText()} ${typeStyles.text}`}>
          {typeStyles.label}
        </div>
      </div>

      {/* Temporary assignment indicator */}
      {assignment.isTemporary && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
      )}
    </div>
  )
} 