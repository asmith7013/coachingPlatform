'use client'

import { cn } from '@/lib/utils'
import { spacing, fontSizes, textColors } from '@/lib/ui/tokens'

interface TableCellProps {
  children: React.ReactNode
  className?: string
}

export function TableCell({ children, className }: TableCellProps) {
  return (
    <td
      className={cn(
        'whitespace-nowrap',
        spacing.md,
        fontSizes.base,
        textColors.secondary,
        className
      )}
    >
      {children}
    </td>
  )
}