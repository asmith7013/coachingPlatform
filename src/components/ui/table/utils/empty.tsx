'use client'

// import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TableEmptyProps {
  message?: string
  className?: string
}

export function TableEmpty({
  message = 'No data available',
  className,
}: TableEmptyProps) {
  return (
    <div className={cn(
      'flex items-center justify-center p-8',
      'bg-surface',
      className
    )}>
      <p className={cn(
        'text-sm',
        'text-muted'
      )}>
        {message}
      </p>
    </div>
  )
}
