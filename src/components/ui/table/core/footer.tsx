import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { textColors, backgroundColors, borderColors } from '@/lib/ui/tokens'

interface TableFooterProps {
  children: ReactNode
  className?: string
}

export function TableFooter({
  children,
  className,
}: TableFooterProps) {
  return (
    <tfoot className={cn(
      backgroundColors.surface,
      borderColors.default,
      className
    )}>
      <tr>
        <td
          colSpan={100}
          className={cn(
            'px-4 py-3 text-sm',
            textColors.muted
          )}
        >
          {children}
        </td>
      </tr>
    </tfoot>
  )
} 