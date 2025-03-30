'use client'

import { cn } from '@/lib/utils'
import { spacing, fontSizes, textColors } from '@/lib/ui/tokens'

interface TableEmptyProps {
  message?: string
  className?: string
}

export function TableEmpty({
  message = 'No data available.',
  className,
}: TableEmptyProps) {
  return (
    <div
      className={cn(
        'w-full text-center py-10',
        spacing.lg,
        fontSizes.base,
        textColors.secondary,
        className
      )}
    >
      {message}
    </div>
  )
}
