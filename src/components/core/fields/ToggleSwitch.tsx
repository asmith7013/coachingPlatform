'use client'

export interface ToggleSwitchProps {
  /** Current checked state */
  checked: boolean
  /** Handle state change */
  onChange: (checked: boolean) => void
  /** Label text displayed next to the switch */
  label: string
  /** Optional class name for the container */
  className?: string
  /** Optional accent color (gray, orange) */
  accentColor?: 'gray' | 'orange'
}

/**
 * ToggleSwitch - A simple on/off toggle switch component
 *
 * @example
 * ```tsx
 * <ToggleSwitch
 *   checked={showDetails}
 *   onChange={setShowDetails}
 *   label="Show Details"
 * />
 * ```
 */
export function ToggleSwitch({
  checked,
  onChange,
  label,
  className,
  accentColor = 'gray'
}: ToggleSwitchProps) {
  // Define color classes based on accent color
  const colorClasses = {
    gray: {
      checked: 'bg-gray-500',
      unchecked: 'bg-gray-300',
      ring: 'focus:ring-gray-500'
    },
    orange: {
      checked: 'bg-orange-500',
      unchecked: 'bg-gray-300',
      ring: 'focus:ring-orange-500'
    }
  };

  const colors = colorClasses[accentColor];

  return (
    <div className={`bg-white border border-gray-300 rounded-lg px-3 py-2 ${className || ''}`}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 ${colors.ring} focus:ring-offset-2 ${
            checked ? colors.checked : colors.unchecked
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              checked ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
        <span className="text-xs font-medium text-gray-700">{label}</span>
      </div>
    </div>
  )
}

export default ToggleSwitch
