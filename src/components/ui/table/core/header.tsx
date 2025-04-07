'use client'

import { cn } from '@/lib/utils'
import { ChevronUpIcon } from '@heroicons/react/24/solid'
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
      'bg-surface border-b border-border',
      className
    )}>
      <tr>
        {columns.map((column) => (
          <th
            key={column.id}
            className={cn(
              'px-4 py-3 text-left text-sm font-medium',
              column.sortable && 'cursor-pointer hover:text-primary',
              sortColumn === column.id && 'text-primary'
            )}
            onClick={() => onSort?.(column.id)}
          >
            <div className="flex items-center gap-2">
              <span>{column.label}</span>
              {column.sortable && (
                <span className="flex-none">
                  {sortColumn === column.id && (
                    <ChevronUpIcon className="h-4 w-4 text-text-muted" aria-hidden="true" />
                  )}
                </span>
              )}
            </div>
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
