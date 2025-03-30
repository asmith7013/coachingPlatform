import { cn } from '@/lib/utils'
import { fontSizes, spacingY, leading } from '@/lib/ui/tokens'
import { ReactNode } from 'react'

interface FieldWrapperProps {
  id?: string
  label?: string
  error?: string
  children: ReactNode
  className?: string
}

export function FieldWrapper({ id, label, error, children, className }: FieldWrapperProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={id} className={cn(fontSizes.base, leading.snug, 'font-medium text-gray-900')}>
          {label}
        </label>
      )}
      <div className="mt-2">{children}</div>
      {error && (
        <p className={cn(spacingY.xs, fontSizes.base, leading.snug, 'text-red-500')}>
          {error}
        </p>
      )}
    </div>
  )
} 