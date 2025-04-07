import { cn } from '@/lib/utils'
import { spacing, fontSizes } from '@/lib/ui/tokens'

interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  padding?: keyof typeof spacing
  gap?: keyof typeof spacing
}

export function FormSection({
  title,
  description,
  children,
  className,
  padding = 'md',
  gap = 'sm',
}: FormSectionProps) {
  const paddingClass = spacing[padding]
  const gapClass = spacing[gap]

  return (
    <div className={cn('flex flex-col', gapClass, className)}>
      <div className={cn('flex flex-col', spacing.sm)}>
        <h3 className={cn('font-semibold', fontSizes.lg, 'text-primary')}>{title}</h3>
        {description && (
          <p className={cn('text-sm', 'text-text')}>
            {description}
          </p>
        )}
      </div>
      <div className={cn('mt-sm', paddingClass)}>
        {children}
      </div>
    </div>
  )
}
