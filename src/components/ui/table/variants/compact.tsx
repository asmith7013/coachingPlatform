'use client'

import { Table } from '../table'
import { cn } from '@/lib/utils'
import { TableColumnSchema } from '@/lib/ui/table-schema'

interface CompactTableProps<T> {
  data: T[]
  columns: TableColumnSchema<T>[]
  className?: string
  title?: string
  description?: string
  actions?: React.ReactNode
  onEdit?: (item: T) => void
  emptyMessage?: string
}

export function CompactTable<T extends { id?: string | number }>({
  data,
  columns,
  className,
  ...props
}: CompactTableProps<T>) {
  return (
    <Table
      className={cn('text-sm leading-tight', className)}
      data={data}
      columns={columns}
      {...props}
    />
  )
}
