'use client'

import { Table } from '../table'
import { TableHeader } from '../core/header'
import { cn } from '@/lib/utils'
import { TableColumnSchema } from '@/lib/ui/table-schema'

interface StickyHeaderTableProps<T> {
  data: T[]
  columns: TableColumnSchema<T>[]
  className?: string
  title?: string
  description?: string
  actions?: React.ReactNode
  onEdit?: (item: T) => void
  emptyMessage?: string
}

export function StickyHeaderTable<T extends { id?: string | number }>({
  data,
  columns,
  className,
  ...props
}: StickyHeaderTableProps<T>) {
  return (
    <div className={cn('overflow-auto', className)}>
      <Table
        data={data}
        columns={columns}
        {...props}
      />
      <div className={cn('sticky top-0 z-10', 'bg-surface')}>
        <TableHeader columns={columns} showEdit={!!props.onEdit} />
      </div>
    </div>
  )
}
