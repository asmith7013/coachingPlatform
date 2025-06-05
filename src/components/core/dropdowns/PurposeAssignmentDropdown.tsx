'use client'

import { useState, useCallback } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { Listbox } from '@headlessui/react'
import { ChevronDownIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

// Extended purpose types - includes existing VisitArcType + new options
export type EventPurpose = 
  | 'Pre-Brief' 
  | 'Observation' 
  | 'Debrief' 
  | 'Pre-meeting' 
  | 'Visitation'
  | 'Check-in'
  | 'Planning'

export interface PurposeOption {
  value: EventPurpose
  label: string
  description?: string
  isRecommended?: boolean
}

// Default purpose options following established patterns
export const PURPOSE_OPTIONS: PurposeOption[] = [
  { 
    value: 'Observation', 
    label: 'Observation', 
    description: 'Classroom observation during teaching period' 
  },
  { 
    value: 'Pre-Brief', 
    label: 'Pre-Brief', 
    description: 'Planning session before observation' 
  },
  { 
    value: 'Debrief', 
    label: 'Debrief', 
    description: 'Reflection session after observation' 
  },
  { 
    value: 'Pre-meeting', 
    label: 'Pre-meeting', 
    description: 'Initial meeting or planning session' 
  },
  { 
    value: 'Visitation', 
    label: 'Visitation', 
    description: 'General classroom visit or check-in' 
  },
  { 
    value: 'Check-in', 
    label: 'Check-in', 
    description: 'Brief follow-up or status meeting' 
  },
  { 
    value: 'Planning', 
    label: 'Planning', 
    description: 'Collaborative planning session' 
  }
]

const purposeDropdown = tv({
  slots: {
    container: 'relative flex items-center gap-2',
    dropdownButton: [
      'relative flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5',
      'text-left text-sm cursor-pointer transition-all duration-200',
      'hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ],
    selectedText: 'flex-1 truncate font-medium text-gray-900',
    placeholderText: 'flex-1 truncate text-gray-400 italic',
    chevronIcon: 'h-4 w-4 text-gray-400 flex-shrink-0',
    removeButton: [
      'rounded-full p-1 text-gray-400 hover:text-red-600 hover:bg-red-50',
      'transition-colors duration-200 flex-shrink-0'
    ],
    removeIcon: 'h-3 w-3',
    options: [
      'absolute z-50 mt-1 max-h-60 w-full min-w-max overflow-auto rounded-md bg-white',
      'py-1 shadow-lg ring-1 ring-black/5 focus:outline-none'
    ],
    option: [
      'relative cursor-pointer select-none py-2 pl-3 pr-9 text-sm',
      'transition-colors duration-150'
    ],
    optionContent: 'block',
    optionLabel: 'font-medium text-gray-900',
    optionDescription: 'text-xs text-gray-500 mt-0.5',
    optionCheck: 'absolute inset-y-0 right-0 flex items-center pr-3',
    checkIcon: 'h-4 w-4 text-blue-600',
    recommendedBadge: 'inline-block px-1.5 py-0.5 ml-2 text-xs bg-blue-100 text-blue-700 rounded'
  },
  variants: {
    size: {
      sm: {
        dropdownButton: 'px-2 py-1 text-xs',
        selectedText: 'text-xs',
        placeholderText: 'text-xs',
        option: 'py-1.5 pl-2 pr-8 text-xs'
      },
      md: {
        dropdownButton: 'px-3 py-1.5 text-sm',
        selectedText: 'text-sm',
        placeholderText: 'text-sm',
        option: 'py-2 pl-3 pr-9 text-sm'
      },
      lg: {
        dropdownButton: 'px-4 py-2 text-base',
        selectedText: 'text-base',
        placeholderText: 'text-base',
        option: 'py-3 pl-4 pr-10 text-base'
      }
    },
    state: {
      default: {},
      error: {
        dropdownButton: 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      },
      success: {
        dropdownButton: 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
      }
    },
    disabled: {
      true: {
        dropdownButton: 'opacity-50 cursor-not-allowed pointer-events-none',
        removeButton: 'opacity-50 cursor-not-allowed pointer-events-none'
      },
      false: {}
    }
  },
  defaultVariants: {
    size: 'md',
    state: 'default',
    disabled: false
  }
})

export interface PurposeAssignmentDropdownProps extends VariantProps<typeof purposeDropdown> {
  /** Current selected purpose value */
  value?: EventPurpose | null
  /** Callback when purpose is selected */
  onChange?: (purpose: EventPurpose) => void
  /** Callback when remove button is clicked */
  onRemove?: () => void
  /** Available purpose options - defaults to PURPOSE_OPTIONS */
  options?: PurposeOption[]
  /** Auto-recommend purpose based on teacher schedule context */
  recommendedPurpose?: EventPurpose
  /** Placeholder text when no purpose selected */
  placeholder?: string
  /** Whether the dropdown is disabled */
  disabled?: boolean
  /** Error message to display */
  error?: string
  /** Additional CSS classes */
  className?: string
  /** Show remove button */
  showRemoveButton?: boolean
  /** Label for accessibility */
  'aria-label'?: string
}

/**
 * PurposeAssignmentDropdown - Dropdown for selecting coaching visit purpose
 * 
 * Features:
 * - Extends VisitArcType with new purpose options (Pre-meeting, Visitation)
 * - Auto-recommendation based on teacher schedule context
 * - Remove button for clearing assignments
 * - Accessible dropdown with keyboard navigation
 * - Visual feedback for assigned vs unassigned states
 * 
 * @example
 * ```tsx
 * <PurposeAssignmentDropdown
 *   value={selectedPurpose}
 *   onChange={(purpose) => updateAssignmentPurpose(purpose)}
 *   onRemove={() => removeAssignment()}
 *   recommendedPurpose="Observation"
 *   showRemoveButton={true}
 * />
 * ```
 */
export function PurposeAssignmentDropdown({
  value,
  onChange,
  onRemove,
  options = PURPOSE_OPTIONS,
  recommendedPurpose,
  placeholder = 'Select purpose',
  disabled = false,
  error,
  className,
  showRemoveButton = true,
  size,
  state = error ? 'error' : 'default',
  'aria-label': ariaLabel
}: PurposeAssignmentDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const styles = purposeDropdown({ size, state: error ? 'error' : state, disabled })
  
  // Add recommended flags to options
  const enhancedOptions = options.map(option => ({
    ...option,
    isRecommended: option.value === recommendedPurpose
  }))
  
  // Get selected option for display
  const selectedOption = options.find(option => option.value === value)
  
  // Handle purpose selection
  const handleSelect = useCallback((selectedPurpose: EventPurpose) => {
    onChange?.(selectedPurpose)
    setIsOpen(false)
  }, [onChange])
  
  // Handle remove action
  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onRemove?.()
  }, [onRemove])
  
  return (
    <div className={`${styles.container()} ${className || ''}`}>
      <Listbox 
        value={value} 
        onChange={handleSelect}
        disabled={disabled}
      >
        <div className="relative flex-1">
          <Listbox.Button 
            className={styles.dropdownButton()}
            aria-label={ariaLabel || 'Select event purpose'}
            onClick={() => setIsOpen(!isOpen)}
          >
            {selectedOption ? (
              <span className={styles.selectedText()}>
                {selectedOption.label}
                {selectedOption.isRecommended && (
                  <span className={styles.recommendedBadge()}>
                    Recommended
                  </span>
                )}
              </span>
            ) : (
              <span className={styles.placeholderText()}>
                {placeholder}
              </span>
            )}
            <ChevronDownIcon 
              className={styles.chevronIcon()} 
              aria-hidden="true" 
            />
          </Listbox.Button>
          
          <Listbox.Options className={styles.options()}>
            {enhancedOptions.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option.value}
                className={({ active }) => `
                  ${styles.option()} 
                  ${active ? 'bg-blue-50 text-blue-900' : 'text-gray-900'}
                `}
              >
                {({ selected }) => (
                  <>
                    <div className={styles.optionContent()}>
                      <div className="flex items-center">
                        <span className={styles.optionLabel()}>
                          {option.label}
                        </span>
                        {option.isRecommended && (
                          <span className={styles.recommendedBadge()}>
                            Recommended
                          </span>
                        )}
                      </div>
                      {option.description && (
                        <div className={styles.optionDescription()}>
                          {option.description}
                        </div>
                      )}
                    </div>
                    
                    {selected && (
                      <span className={styles.optionCheck()}>
                        <CheckIcon className={styles.checkIcon()} aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
      
      {/* Remove Button */}
      {showRemoveButton && value && (
        <button
          type="button"
          onClick={handleRemove}
          className={styles.removeButton()}
          aria-label="Remove assignment"
          disabled={disabled}
        >
          <XMarkIcon className={styles.removeIcon()} />
        </button>
      )}
    </div>
  )
}

/**
 * Utility function to get recommended purpose based on teacher schedule context
 * @param isTeaching - Whether teacher is currently teaching this period
 * @param isPrepPeriod - Whether this is a prep/planning period
 * @returns Recommended purpose based on context
 */
export function getRecommendedPurpose(
  isTeaching: boolean, 
  isPrepPeriod: boolean
): EventPurpose {
  if (isTeaching) {
    return 'Observation'
  } else if (isPrepPeriod) {
    return 'Pre-meeting'
  } else {
    return 'Debrief'
  }
}

export default PurposeAssignmentDropdown 