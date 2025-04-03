'use client'

// import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { textColors, backgroundColors } from '@/lib/ui/tokens'

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
      backgroundColors.surface,
      className
    )}>
      <p className={cn(
        'text-sm',
        textColors.muted
      )}>
        {message}
      </p>
    </div>
  )
}
