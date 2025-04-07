import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

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
      'bg-surface',
      'border-surface',
      className
    )}>
      <tr>
        <td
          colSpan={100}
          className={cn(
            'px-4 py-3 text-sm',
            'text-muted'
          )}
        >
          {children}
        </td>
      </tr>
    </tfoot>
  )
} 