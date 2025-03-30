'use client'

import { cn } from '@/lib/utils'
import { spacing, fontSizes, textColors, borderColors } from '@/lib/ui/tokens'
import { TableColumnSchema } from '@/lib/ui/table-schema'

interface TableRowProps<T> {
  item: T
  columns: TableColumnSchema<T>[]
  onEdit?: (item: T) => void
  isFirst?: boolean
}

export function TableRow<T>({ item, columns, onEdit, isFirst }: TableRowProps<T>) {
  const cellTextSize = fontSizes.base
  const cellTextColor = textColors.secondary
  const cellPadding = spacing.md
  const borderColor = borderColors.default

  const getAlignmentClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center'
      case 'right':
        return 'text-right'
      default:
        return 'text-left'
    }
  }

  return (
    <tr
      className={cn(
        'border-t',
        borderColor,
        isFirst && 'border-gray-300'
      )}
    >
      {columns.map((column) => (
        <td
          key={column.id}
          className={cn(
            'whitespace-nowrap',
            cellTextSize,
            cellTextColor,
            cellPadding,
            getAlignmentClass(column.align),
            column.className
          )}
          style={{ width: column.width }}
        >
          {column.accessor(item)}
        </td>
      ))}
      {onEdit && (
        <td className={cn('relative whitespace-nowrap text-right', cellTextSize, cellPadding)}>
          <button
            onClick={() => onEdit(item)}
            className={cn(
              textColors.primary,
              'hover:text-indigo-900'
            )}
          >
            Edit
            <span className="sr-only">, {String(columns[0].accessor(item))}</span>
          </button>
        </td>
      )}
    </tr>
  )
}
