'use client'

import { cn } from '@/lib/utils'
import { textColors } from '@/lib/ui/tokens'
import { TableColumnSchema } from '@/lib/ui/table-schema'

interface TableRowProps<T> {
  item: T
  columns: TableColumnSchema<T>[]
  className?: string
  onClick?: () => void
  onEdit?: (item: T) => void
}

export function TableRow<T>({
  item,
  columns,
  className,
  onClick,
  onEdit,
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
      {onEdit && (
        <td className="px-4 py-3 text-right">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
            className="text-primary hover:text-primary-dark"
          >
            Edit
          </button>
        </td>
      )}
    </tr>
  )
}
