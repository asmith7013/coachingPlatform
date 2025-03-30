import { cn } from '@/lib/utils'
import { radii } from '@/lib/ui/tokens'
import { FieldWrapper } from './FieldWrapper'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  error?: string
  className?: string
  disabled?: boolean
}

export function Switch({ checked, onChange, label, description, error, className, disabled }: SwitchProps) {
  return (
    <FieldWrapper id="switch" label={label} error={error}>
      <div className="relative flex items-start">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={cn(
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2',
            checked ? 'bg-indigo-600' : 'bg-gray-200',
            disabled && 'cursor-not-allowed opacity-50',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              checked ? 'translate-x-5' : 'translate-x-0',
              radii.full
            )}
          />
        </button>
        {description && (
          <div className="ml-3 text-sm leading-6">
            <p className="text-gray-600">{description}</p>
          </div>
        )}
      </div>
    </FieldWrapper>
  )
}
