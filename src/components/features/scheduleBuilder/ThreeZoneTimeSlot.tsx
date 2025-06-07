'use client'

import { useState, forwardRef } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import type { HoverZone as ZoneType } from '@domain-types/schedule'
import { formatTimeString as formatTime } from '@/lib/schema/reference/schedule/schedule-helpers'
import { getEventColorClasses, type EventColor } from '@/lib/ui/styles/event-styles'

const timeSlot = tv({
  slots: {
    container: 'relative group',
    button: 'relative w-full p-3 text-left transition-all duration-200 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    content: 'flex items-center justify-between',
    timeDisplay: 'text-sm font-medium',
    assignmentInfo: 'mt-1 text-xs',
    chevron: 'w-5 h-5 transition-transform duration-200',
    dropdownPanel: 'absolute z-10 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 p-2',
    zoneButton: 'w-full p-3 text-left rounded-lg border-2 transition-all duration-200 hover:shadow-md transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    zoneLabel: 'text-sm font-medium',
    zoneDescription: 'text-xs mt-1'
  },
  variants: {
    isSelected: {
      true: {},
      false: {}
    },
    isActive: {
      true: {
        chevron: 'rotate-180'
      },
      false: {}
    },
    isDisabled: {
      true: {
        button: 'opacity-50 cursor-not-allowed',
        container: 'pointer-events-none'
      },
      false: {}
    }
  },
  defaultVariants: {
    isSelected: false,
    isActive: false,
    isDisabled: false
  }
})

// Map zone types to unified color system
const getZoneTypeColor = (zoneType: ZoneType): EventColor => {
  switch (zoneType) {
    case 'first_half':
      return 'blue'
    case 'second_half':
      return 'purple'  
    case 'full_period':
      return 'green'
    default:
      return 'gray'
  }
}

// Calculate midpoint time for display purposes
const calculateMidpoint = (startTime: string, endTime: string): string => {
  const start = new Date(`1970-01-01T${startTime}`)
  const end = new Date(`1970-01-01T${endTime}`)
  const midpoint = new Date((start.getTime() + end.getTime()) / 2)
  return midpoint.toISOString().substr(11, 5)
}

interface ThreeZoneTimeSlotProps extends VariantProps<typeof timeSlot> {
  /** Period number (1, 2, 3, etc.) - core data model */
  periodNumber: number
  /** Period start time for display calculations only */
  timeStart: string
  /** Period end time for display calculations only */
  timeEnd: string
  /** Selected portion - simplified approach */
  selectedPortion?: 'first_half' | 'second_half' | 'full_period' | null
  /** Handler for period-portion selection - simplified interface */
  onSelect?: (periodNumber: number, portion: 'first_half' | 'second_half' | 'full_period') => void
  /** Assigned teacher for display */
  assignedTeacher?: string | null
  /** Assignment purpose for display */
  assignedPurpose?: string | null
  /** Period label (e.g., "Period 2") - human readable */
  periodLabel?: string
  /** Available portions - defaults to all three */
  availablePortions?: Array<'first_half' | 'second_half' | 'full_period'>
  className?: string
}

export const ThreeZoneTimeSlot = forwardRef<HTMLDivElement, ThreeZoneTimeSlotProps>(
  ({ 
    periodNumber,
    timeStart, 
    timeEnd, 
    selectedPortion, 
    onSelect,
    assignedTeacher,
    assignedPurpose,
    periodLabel,
    availablePortions = ['first_half', 'second_half', 'full_period'],
    isSelected = false,
    isActive = false,
    isDisabled = false,
    className 
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const styles = timeSlot({ isSelected, isActive: isActive || isOpen, isDisabled })

    // Calculate display times on-demand for UI only
    const midpointTime = calculateMidpoint(timeStart, timeEnd)
    
    const portions = [
      {
        type: 'first_half' as const,
        label: 'First Half',
        description: `${formatTime(timeStart)} - ${formatTime(midpointTime)}`
      },
      {
        type: 'second_half' as const,
        label: 'Second Half', 
        description: `${formatTime(midpointTime)} - ${formatTime(timeEnd)}`
      },
      {
        type: 'full_period' as const,
        label: 'Full Period',
        description: `${formatTime(timeStart)} - ${formatTime(timeEnd)}`
      }
    ].filter(portion => availablePortions.includes(portion.type))

    const selectedPortionInfo = portions.find(p => p.type === selectedPortion)

    const handlePortionSelect = (portion: 'first_half' | 'second_half' | 'full_period') => {
      onSelect?.(periodNumber, portion)
      setIsOpen(false)
    }

    const handleToggle = () => {
      if (!isDisabled) {
        setIsOpen(!isOpen)
      }
    }

    // Get styling for the main button based on selected portion
    const getMainButtonStyle = () => {
      if (!selectedPortion) {
        return 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
      }
      
      const color = getZoneTypeColor(selectedPortion)
      const colorClasses = getEventColorClasses(color)
      return `${colorClasses.container} ${colorClasses.border} ${colorClasses.text}`
    }

    // Get styling for portion buttons
    const getPortionButtonStyle = (portionType: 'first_half' | 'second_half' | 'full_period', isCurrentlySelected: boolean = false) => {
      const color = getZoneTypeColor(portionType)
      const colorClasses = getEventColorClasses(color)
      
      if (isCurrentlySelected) {
        return `${colorClasses.container} ${colorClasses.border} ${colorClasses.text} ring-2 ring-offset-2 ring-blue-500`
      }
      
      return `${colorClasses.container} ${colorClasses.border} ${colorClasses.text}`
    }

    return (
      <div ref={ref} className={`${styles.container()} ${className || ''}`}>
        <button
          type="button"
          className={`${styles.button()} ${getMainButtonStyle()}`}
          onClick={handleToggle}
          disabled={isDisabled}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={`Select time portion for ${periodLabel || `Period ${periodNumber}`}`}
        >
          <div className={styles.content()}>
            <div>
              {periodLabel && (
                <div className="text-xs font-semibold mb-1 opacity-75">
                  {periodLabel}
                </div>
              )}
              <div className={styles.timeDisplay()}>
                {selectedPortionInfo ? selectedPortionInfo.label : 'Select Portion'}
              </div>
              <div className={styles.assignmentInfo()}>
                {selectedPortionInfo ? (
                  <span className="opacity-75">
                    {selectedPortionInfo.description}
                  </span>
                ) : (
                  <span className="opacity-60">
                    {formatTime(timeStart)} - {formatTime(timeEnd)}
                  </span>
                )}
                {assignedTeacher && (
                  <div className="mt-1 font-medium">
                    👤 {assignedTeacher}
                    {assignedPurpose && (
                      <span className="opacity-75 ml-1">({assignedPurpose})</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <ChevronDownIcon className={styles.chevron()} />
          </div>
        </button>

        {isOpen && (
          <div className={styles.dropdownPanel()}>
            {portions.map((portion) => (
              <button
                key={portion.type}
                type="button"
                className={`${styles.zoneButton()} ${getPortionButtonStyle(portion.type, portion.type === selectedPortion)} mb-2 last:mb-0`}
                onClick={() => handlePortionSelect(portion.type)}
                aria-label={`Select ${portion.label} for ${periodLabel || `Period ${periodNumber}`}`}
              >
                <div className={styles.zoneLabel()}>
                  {portion.label}
                </div>
                <div className={styles.zoneDescription()}>
                  {portion.description}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
)

ThreeZoneTimeSlot.displayName = 'ThreeZoneTimeSlot' 