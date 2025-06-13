'use client'

import { cn } from '@ui/utils/formatters';
import { tv, type VariantProps } from 'tailwind-variants'
import { TableColumnSchema } from '@ui/table-schema'
import { TableHeader } from './parts/header'
import { TableRow } from './parts/row'
import { TableEmpty } from './features/empty'
import { textColors, textSize, paddingX, paddingY } from '@/lib/tokens/tokens'

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
      xs: { root: textSize.xs },
      sm: { root: textSize.sm },
      base: { root: textSize.base },
      lg: { root: textSize.lg },
      xl: { root: textSize.xl }
    },
    padding: {
      xs: { root: `${paddingX.sm} ${paddingY.sm}` },
      sm: { root: `${paddingX.lg} ${paddingY.lg}` },
      md: { root: `${paddingX.md} ${paddingY.md}` },
      lg: { root: `${paddingX.lg} ${paddingY.lg}` },
      xl: { root: `${paddingX.xl} ${paddingY.xl}` }
    },
    compact: {
      true: { root: `${textSize.sm} leading-tight` }
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
