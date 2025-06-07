'use client'

import { tv, type VariantProps } from 'tailwind-variants'

const modeToggle = tv({
  slots: {
    container: 'flex items-center space-x-1 bg-gray-100 rounded-lg p-1',
    button: 'flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors'
  },
  variants: {
    active: {
      true: {
        button: 'text-blue-600 bg-white shadow-sm'
      },
      false: {
        button: 'text-gray-600 hover:text-gray-700 hover:bg-gray-200'
      }
    }
  }
})

export interface ModeOption<T extends string = string> {
  value: T
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface ModeToggleProps<T extends string = string> extends VariantProps<typeof modeToggle> {
  /** Available mode options */
  options: ModeOption<T>[]
  /** Currently selected mode */
  value: T
  /** Handle mode change */
  onChange: (mode: T) => void
  /** Optional class name */
  className?: string
}

export function ModeToggle<T extends string = string>({
  options,
  value,
  onChange,
  className
}: ModeToggleProps<T>) {
  const styles = modeToggle()

  return (
    <div className={`${styles.container()} ${className || ''}`}>
      {options.map((option) => {
        const isActive = value === option.value
        const Icon = option.icon
        
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={styles.button({ active: isActive })}
            aria-pressed={isActive}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default ModeToggle 