'use client'

import { cn } from '@/lib/utils'
import { tv, type VariantProps } from 'tailwind-variants'
import { TableColumnSchema } from '@/lib/ui/table-schema'
import { TableHeader } from './parts/header'
import { TableRow } from './parts/row'
import { TableEmpty } from './features/empty'
import { textColors } from '@/lib/ui/tokens'

const table = tv({
  slots: {
    wrapper: 'w-full overflow-auto',
    root: 'min-w-full divide-y border-surface',
    body: 'divide-y divide-surface'
  },
  variants: {
    color: {
      default: { root: textColors.default },
      muted: { root: textColors.muted },
      accent: { root: textColors.accent },
      danger: { root: textColors.danger }
    },
    textSize: {
      xs: { root: 'text-xs' },
      sm: { root: 'text-sm' },
      base: { root: 'text-base' },
      lg: { root: 'text-lg' },
      xl: { root: 'text-xl' }
    },
    padding: {
      xs: { root: 'p-2' },
      sm: { root: 'p-3' },
      md: { root: 'p-4' },
      lg: { root: 'p-6' },
      xl: { root: 'p-8' }
    },
    compact: {
      true: { root: 'text-sm leading-tight' }
    }
  },
  defaultVariants: {
    color: 'default',
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
  textSize?: TableVariants['textSize']
  padding?: TableVariants['padding']
}

export function Table<T>({
  data,
  columns,
  className,
  color = 'default',
  textSize = 'base',
  padding = 'md',
  compact = false,
  onRowClick,
  emptyMessage = 'No data available',
  ...props
}: TableProps<T>) {
  const styles = table({ color, textSize, padding, compact })

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
