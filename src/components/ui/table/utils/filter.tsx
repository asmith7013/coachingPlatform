import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { textColors, backgroundColors, borderColors } from '@/lib/ui/tokens'

interface TableFilterProps {
  children: ReactNode
  className?: string
}

export function TableFilter({
  children,
  className,
}: TableFilterProps) {
  return (
    <div className={cn(
      'flex items-center space-x-4 px-4 py-3',
      backgroundColors.surface,
      borderColors.default,
      className
    )}>
      <p className={cn(
        'text-sm font-medium',
        textColors.muted
      )}>
        Filter:
      </p>
      <div className="flex items-center space-x-4">
        {children}
      </div>
    </div>
  )
} 