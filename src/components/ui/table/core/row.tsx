'use client'

import { cn } from '@/lib/utils'
import { textColors } from '@/lib/ui/tokens'
import { TableColumnSchema } from '@/lib/ui/table-schema'

interface TableRowProps<T> {
  item: T
  columns: TableColumnSchema<T>[]
  className?: string
  onClick?: () => void
}

export function TableRow<T>({
  item,
  columns,
  className,
  onClick,
}: TableRowProps<T>) {
  return (
    <tr
      className={cn(
        'hover:bg-gray-50',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {columns.map((column) => (
        <td
          key={column.id}
          className={cn(
            'px-4 py-3 text-sm',
            textColors.secondary,
            column.className
          )}
        >
          {column.accessor(item)}
        </td>
      ))}
    </tr>
  )
}
