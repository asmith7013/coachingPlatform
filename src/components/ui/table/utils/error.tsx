import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

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
      'bg-surface',
      className
    )}>
      <p className={cn(
        'text-sm',
        'text-danger'
      )}>
        {children}
      </p>
    </div>
  )
} 