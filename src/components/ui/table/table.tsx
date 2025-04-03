'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { textColors, borderColors, type TextColor } from '@/lib/ui/tokens'
import { TableColumnSchema } from '@/lib/ui/table-schema'
import { TableHeader } from './core/header'
import { TableRow } from './core/row'
import { TableEmpty } from './utils/empty'

interface TableProps<T> {
  columns: TableColumnSchema<T>[]
  data: T[]
  onEdit?: (item: T) => void
  emptyMessage?: string
  variant?: TextColor
  className?: string
}

export function Table<T>({
  columns,
  data,
  onEdit,
  emptyMessage,
  variant = 'primary',
  className,
}: TableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string>()

  return (
    <div className="w-full overflow-auto">
      {data.length === 0 ? (
        <TableEmpty message={emptyMessage} />
      ) : (
        <table className={cn(
          'min-w-full divide-y',
          borderColors.default,
          textColors[variant],
          className
        )}>
          <TableHeader 
            columns={columns} 
            sortColumn={sortColumn}
            onSort={setSortColumn}
          />
          <tbody className="divide-y divide-gray-200">
            {data.map((item, index) => (
              <TableRow
                key={index}
                item={item}
                columns={columns}
                onEdit={onEdit}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
