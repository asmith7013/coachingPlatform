import { cn } from '@/lib/utils'
import { radii } from '@/lib/ui/tokens'
import { FieldWrapper } from './FieldWrapper'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  className?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <FieldWrapper id={props.id} label={label} error={error}>
      <input
        className={cn(
          'block w-full bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6',
          radii.md,
          error && 'outline-red-500 focus:outline-red-500',
          className
        )}
        {...props}
      />
    </FieldWrapper>
  )
}
