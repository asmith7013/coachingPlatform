import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

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
      'bg-surface',
      'border-surface',
      className
    )}>
      <p className={cn(
        'text-sm font-medium',
        'text-muted'
      )}>
        Filter:
      </p>
      <div className="flex items-center space-x-4">
        {children}
      </div>
    </div>
  )
} 