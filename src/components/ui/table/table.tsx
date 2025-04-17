'use client'

import { cn } from '@/lib/utils'
import { tv, type VariantProps } from 'tailwind-variants'
import { TableColumnSchema } from '@/lib/ui/table-schema'
import { TableHeader } from './core/header'
import { TableRow } from './core/row'
import { TableEmpty } from './utils/empty'

const table = tv({
  slots: {
    wrapper: 'w-full overflow-auto',
    root: 'min-w-full divide-y border-surface',
    body: 'divide-y divide-surface'
  },
  variants: {
    variant: {
      text: { root: 'text-text' },
      'text-muted': { root: 'text-text-muted' },
      primary: { root: 'text-primary' },
      secondary: { root: 'text-secondary' },
      success: { root: 'text-success' },
      danger: { root: 'text-danger' }
    },
    textSize: {
      sm: { root: 'text-sm' },
      base: { root: 'text-base' },
      lg: { root: 'text-lg' }
    },
    padding: {
      sm: { root: 'px-3 py-2' },
      md: { root: 'px-4 py-3' },
      lg: { root: 'px-6 py-4' }
    },
    compact: {
      true: { root: 'text-sm leading-tight' }
    }
  },
  defaultVariants: {
    variant: 'text',
    textSize: 'base',
    padding: 'md',
    compact: false
  }
})

export type TableVariants = VariantProps<typeof table>

export interface TableProps<T> extends Omit<TableVariants, 'textSize' | 'padding'> {
  data: T[]
  columns: TableColumnSchema<T>[]
  className?: string
  onRowClick?: (item: T) => void
  emptyMessage?: string
  textSize?: 'sm' | 'base' | 'lg'
  padding?: 'sm' | 'md' | 'lg'
}

export function Table<T>({
  data,
  columns,
  className,
  variant = 'text',
  textSize = 'base',
  padding = 'md',
  compact = false,
  onRowClick,
  emptyMessage = 'No data available',
  ...props
}: TableProps<T>) {
  const styles = table({ variant, textSize, padding, compact })

  return (
    <div className={cn(styles.wrapper(), className)} {...props}>
      <table className={styles.root()}>
        <TableHeader 
          columns={columns} 
        />
        <tbody className={styles.body()}>
          {data.length > 0 ? (
            data.map((item, index) => (
              <TableRow
                key={index}
                item={item}
                columns={columns}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
              />
            ))
          ) : (
            <TableEmpty message={emptyMessage} />
          )}
        </tbody>
      </table>
    </div>
  )
}
