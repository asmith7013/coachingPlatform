'use client'

import { cn } from '@/lib/utils'
import { spacing, fontSizes, textColors } from '@/lib/ui/tokens'
import { TableColumnSchema } from '@/lib/ui/table-schema'

interface TableHeaderProps<T> {
  columns: TableColumnSchema<T>[]
  className?: string
  showEdit?: boolean
  onSort?: (columnId: string) => void
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
}

export function TableHeader<T>({ 
  columns, 
  showEdit, 
  onSort,
  sortColumn,
  sortDirection 
}: TableHeaderProps<T>) {
  const headerTextSize = fontSizes.base
  const headerTextColor = textColors.primary
  const cellPadding = spacing.md

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
    <thead className="bg-white">
      <tr>
        {columns.map((column) => (
          <th
            key={column.id}
            scope="col"
            className={cn(
              'font-semibold',
              headerTextSize,
              headerTextColor,
              cellPadding,
              getAlignmentClass(column.align),
              column.className,
              column.sortable && 'cursor-pointer select-none'
            )}
            onClick={() => column.sortable && onSort?.(column.id)}
            style={{ width: column.width }}
          >
            <div className="flex items-center gap-1">
              {column.label}
              {column.sortable && (
                <span className="ml-1">
                  {sortColumn === column.id ? (
                    sortDirection === 'asc' ? '↑' : '↓'
                  ) : (
                    '↕'
                  )}
                </span>
              )}
            </div>
          </th>
        ))}
        {showEdit && (
          <th scope="col" className="relative">
            <span className="sr-only">Edit</span>
          </th>
        )}
      </tr>
    </thead>
  )
}
