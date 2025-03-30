'use client'

import { Table } from '../table'
import { TableHeader } from '../table-header'
import { cn } from '@/lib/utils'
import { TableColumnSchema } from '@/lib/ui/table-schema'
import { colorVariants } from '@/lib/ui/tokens'

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
      <div className={cn('sticky top-0 z-10', colorVariants.surface)}>
        <TableHeader columns={columns} showEdit={!!props.onEdit} />
      </div>
    </div>
  )
}
