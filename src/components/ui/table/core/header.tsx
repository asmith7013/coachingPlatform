'use client'

import { cn } from '@/lib/utils'
import { textColors, backgroundColors, borderColors } from '@/lib/ui/tokens'
import { TableColumnSchema } from '@/lib/ui/table-schema'

interface TableHeaderProps<T> {
  columns: TableColumnSchema<T>[]
  sortColumn?: string
  onSort?: (columnId: string) => void
  className?: string
  showEdit?: boolean
}

export function TableHeader<T>({
  columns,
  sortColumn,
  onSort,
  className,
  showEdit,
}: TableHeaderProps<T>) {
  return (
    <thead className={cn(
      backgroundColors.surface,
      borderColors.default,
      className
    )}>
      <tr>
        {columns.map((column) => (
          <th
            key={column.id}
            className={cn(
              'px-4 py-3 text-left text-sm font-medium',
              textColors.muted,
              onSort && 'cursor-pointer hover:text-primary',
              sortColumn === column.id && textColors.primary
            )}
            onClick={() => onSort?.(column.id)}
          >
            {column.label}
          </th>
        ))}
        {showEdit && (
          <th className="px-4 py-3 text-right text-sm font-medium text-muted">
            Actions
          </th>
        )}
      </tr>
    </thead>
  )
}
