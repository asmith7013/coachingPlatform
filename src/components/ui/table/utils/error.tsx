import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { textColors, backgroundColors } from '@/lib/ui/tokens'

interface TableErrorProps {
  children: ReactNode
  className?: string
}

export function TableError({
  children,
  className,
}: TableErrorProps) {
  return (
    <div className={cn(
      'flex items-center justify-center p-8',
      backgroundColors.surface,
      className
    )}>
      <p className={cn(
        'text-sm',
        textColors.danger
      )}>
        {children}
      </p>
    </div>
  )
} 