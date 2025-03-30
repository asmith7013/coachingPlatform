import { cn } from '@/lib/utils'
import { radii } from '@/lib/ui/tokens'
import { FieldWrapper } from './FieldWrapper'

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  description?: string
  error?: string
  className?: string
}

export function Checkbox({ label, description, error, className, ...props }: CheckboxProps) {
  return (
    <FieldWrapper id={props.id} label={label} error={error}>
      <div className="relative flex items-start">
        <div className="flex h-6 items-center">
          <input
            type="checkbox"
            className={cn(
              'h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600',
              radii.sm,
              error && 'border-red-500 text-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
        </div>
        {description && (
          <div className="ml-3 text-sm leading-6">
            <p className="text-gray-600">{description}</p>
          </div>
        )}
      </div>
    </FieldWrapper>
  )
}
