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

interface ThreeZoneTimeSlotProps extends VariantProps<typeof timeSlot> {
  timeStart: string
  timeEnd: string
  selectedZone?: ZoneType | null
  onZoneSelect?: (zone: ZoneType) => void
  assignedTeacher?: string | null
  assignedPurpose?: string | null
  /** Option to show period label (e.g., "Period 1") */
  periodLabel?: string
  /** Custom zone options - defaults to all three zones */
  availableZones?: ZoneType[]
  className?: string
}

export const ThreeZoneTimeSlot = forwardRef<HTMLDivElement, ThreeZoneTimeSlotProps>(
  ({ 
    timeStart, 
    timeEnd, 
    selectedZone, 
    onZoneSelect,
    assignedTeacher,
    assignedPurpose,
    periodLabel,
    availableZones = ['first_half', 'second_half', 'full_period'],
    isSelected = false,
    isActive = false,
    isDisabled = false,
    className 
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const styles = timeSlot({ isSelected, isActive: isActive || isOpen, isDisabled })

    const zones = [
      {
        type: 'first_half' as ZoneType,
        label: 'First Half',
        description: `${formatTime(timeStart)} - ${formatTime(new Date((new Date(`1970-01-01T${timeStart}`).getTime() + new Date(`1970-01-01T${timeEnd}`).getTime()) / 2).toISOString().substr(11, 5))}`
      },
      {
        type: 'second_half' as ZoneType,
        label: 'Second Half', 
        description: `${formatTime(new Date((new Date(`1970-01-01T${timeStart}`).getTime() + new Date(`1970-01-01T${timeEnd}`).getTime()) / 2).toISOString().substr(11, 5))} - ${formatTime(timeEnd)}`
      },
      {
        type: 'full_period' as ZoneType,
        label: 'Full Period',
        description: `${formatTime(timeStart)} - ${formatTime(timeEnd)}`
      }
    ].filter(zone => availableZones.includes(zone.type))

    const selectedZoneInfo = zones.find(z => z.type === selectedZone)

    const handleZoneSelect = (zone: ZoneType) => {
      onZoneSelect?.(zone)
      setIsOpen(false)
    }

    const handleToggle = () => {
      if (!isDisabled) {
        setIsOpen(!isOpen)
      }
    }

    // Get styling for the main button based on selected zone
    const getMainButtonStyle = () => {
      if (!selectedZone) {
        return 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
      }
      
      const color = getZoneTypeColor(selectedZone)
      const colorClasses = getEventColorClasses(color)
      return `${colorClasses.container} ${colorClasses.border} ${colorClasses.text}`
    }

    // Get styling for zone buttons
    const getZoneButtonStyle = (zoneType: ZoneType, isCurrentlySelected: boolean = false) => {
      const color = getZoneTypeColor(zoneType)
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
        >
          <div className={styles.content()}>
            <div>
              {periodLabel && (
                <div className="text-xs font-semibold mb-1 opacity-75">
                  {periodLabel}
                </div>
              )}
              <div className={styles.timeDisplay()}>
                {selectedZoneInfo ? selectedZoneInfo.label : 'Select Zone'}
              </div>
              <div className={styles.assignmentInfo()}>
                {selectedZoneInfo ? (
                  <span className="opacity-75">
                    {selectedZoneInfo.description}
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
            {zones.map((zone) => (
              <button
                key={zone.type}
                type="button"
                className={`${styles.zoneButton()} ${getZoneButtonStyle(zone.type, zone.type === selectedZone)} mb-2 last:mb-0`}
                onClick={() => handleZoneSelect(zone.type)}
                role="option"
                aria-selected={zone.type === selectedZone}
              >
                <div className={styles.zoneLabel()}>
                  {zone.label}
                </div>
                <div className={styles.zoneDescription()}>
                  {zone.description}
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