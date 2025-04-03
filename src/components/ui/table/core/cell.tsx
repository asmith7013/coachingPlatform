'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { textColors } from '@/lib/ui/tokens'

interface TableCellProps {
  children: ReactNode
  className?: string
  align?: 'left' | 'center' | 'right'
}

export function TableCell({
  children,
  className,
  align = 'left',
}: TableCellProps) {
  return (
    <td
      className={cn(
        'px-4 py-3 text-sm',
        textColors.secondary,
        {
          'text-left': align === 'left',
          'text-center': align === 'center',
          'text-right': align === 'right',
        },
        className
      )}
    >
      {children}
    </td>
  )
}