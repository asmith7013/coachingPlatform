'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { TableColumnSchema } from '@/lib/ui/table-schema'
import { TableHeader } from './core/header'
import { TableRow } from './core/row'
import { TableEmpty } from './utils/empty'

type TableVariant = 'text' | 'text-muted' | 'primary' | 'secondary' | 'success' | 'danger'

interface TableProps<T> {
  columns: TableColumnSchema<T>[]
  data: T[]
  onEdit?: (item: T) => void
  emptyMessage?: string
  variant?: TableVariant
  className?: string
}

export function Table<T>({
  columns,
  data,
  onEdit,
  emptyMessage,
  variant = 'text',
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
          'border-surface',
          `text-${variant}`,
          className
        )}>
          <TableHeader 
            columns={columns} 
            sortColumn={sortColumn}
            onSort={setSortColumn}
          />
          <tbody className="divide-y divide-surface">
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
