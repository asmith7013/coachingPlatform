'use client'

import { useState } from 'react'
import { tv } from 'tailwind-variants'
import { XMarkIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline'
import { PurposeAssignmentDropdown, type EventPurpose, getRecommendedPurpose } from '@/components/core/dropdowns/PurposeAssignmentDropdown'
import type { AssignmentState } from '@zod-schema/visits/schedule-builder-state'
import { getEventColorClasses, getEventTextClasses, type EventColor } from '@/lib/ui/styles/event-styles'

const assignedTeacherCard = tv({
  slots: {
    container: 'absolute flex flex-col p-2 rounded border transition-all duration-200 hover:shadow-md cursor-pointer bg-white',
    // Assignment type specific positioning - now uses unified colors
    fullPeriod: 'inset-1',
    firstHalf: 'top-1 left-1 right-1',
    secondHalf: 'bottom-1 left-1 right-1',
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
    assignmentTypeText: 'text-xs font-medium'
  }
})

// Map assignment types to unified color system
const getAssignmentTypeColor = (assignmentType: string): EventColor => {
  switch (assignmentType) {
    case 'full_period':
      return 'green'
    case 'first_half':
      return 'blue'
    case 'second_half':
      return 'purple'
    default:
      return 'green'
  }
}

interface AssignedTeacherCardProps {
  assignment: AssignmentState
  teacherName?: string
  purpose?: EventPurpose | null
  onRemove?: () => void
  onPurposeChange?: (purpose: EventPurpose) => void
  onEditPurpose?: () => void
  /** Context for auto-recommending purpose */
  teacherContext?: {
    isTeaching: boolean
    isPrepPeriod: boolean
  }
  /** Whether to show the dropdown or static text */
  interactive?: boolean
  className?: string
}

export function AssignedTeacherCard({
  assignment,
  teacherName = 'Unknown Teacher',
  purpose = null,
  onRemove,
  onPurposeChange,
  onEditPurpose,
  teacherContext,
  interactive = true,
  className
}: AssignedTeacherCardProps) {
  const styles = assignedTeacherCard()
  const [isHovered, setIsHovered] = useState(false)

  // Get recommended purpose if teacherContext is provided
  const recommendedPurpose = teacherContext 
    ? getRecommendedPurpose(teacherContext.isTeaching, teacherContext.isPrepPeriod)
    : undefined

  // Get styling based on assignment type using unified system
  const getAssignmentTypeStyles = () => {
    const color = getAssignmentTypeColor(assignment.assignmentType)
    const colorClasses = getEventColorClasses(color)
    
    const baseConfig = {
      color: colorClasses.container + ' ' + colorClasses.border,
      text: getEventTextClasses(color),
      label: ''
    }

    switch (assignment.assignmentType) {
      case 'full_period':
        return {
          ...baseConfig,
          container: styles.fullPeriod(),
          height: '100%',
          label: 'Full Period'
        }
      case 'first_half':
        return {
          ...baseConfig,
          container: styles.firstHalf(),
          height: '50%',
          label: 'First Half'
        }
      case 'second_half':
        return {
          ...baseConfig,
          container: styles.secondHalf(),
          height: '50%',
          label: 'Second Half'
        }
      default:
        return {
          ...baseConfig,
          container: styles.fullPeriod(),
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
      className={`${styles.container()} ${typeStyles.container} ${typeStyles.color} ${className || ''}`}
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
          {interactive ? (
            <PurposeAssignmentDropdown
              value={purpose}
              onChange={onPurposeChange}
              recommendedPurpose={recommendedPurpose}
              size="sm"
              showRemoveButton={false}
              placeholder="Add purpose"
              className="flex-1 min-w-0"
            />
          ) : (
            <span 
              className={`${styles.purposeText()} ${!purpose ? 'italic text-amber-600' : ''}`}
              title={purpose || 'No purpose assigned'}
            >
              {purpose || 'No purpose assigned'}
            </span>
          )}
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