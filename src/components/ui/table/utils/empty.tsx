'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { textColors, backgroundColors } from '@/lib/ui/tokens'

interface TableEmptyProps {
  children: ReactNode
  className?: string
}

export function TableEmpty({
  children,
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
        {children}
      </p>
    </div>
  )
}
