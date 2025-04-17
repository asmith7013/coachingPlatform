import { ReactNode } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

const tableFilter = tv({
  slots: {
    root: 'flex items-center bg-surface border-surface',
    label: 'text-muted font-medium',
    content: 'flex items-center'
  },
  variants: {
    size: {
      sm: {
        root: 'px-3 py-2 space-x-3',
        label: 'text-xs',
        content: 'space-x-3'
      },
      md: {
        root: 'px-4 py-3 space-x-4',
        label: 'text-sm',
        content: 'space-x-4'
      },
      lg: {
        root: 'px-5 py-4 space-x-5',
        label: 'text-base',
        content: 'space-x-5'
      }
    }
  },
  defaultVariants: {
    size: 'md'
  }
})

export type TableFilterVariants = VariantProps<typeof tableFilter>
export const tableFilterStyles = tableFilter

interface TableFilterProps extends TableFilterVariants {
  children: ReactNode
  className?: string
  label?: string
}

export function TableFilter({
  children,
  className,
  label = 'Filter:',
  size
}: TableFilterProps) {
  const styles = tableFilter({ size })

  return (
    <div className={styles.root({ className })}>
      <p className={styles.label()}>{label}</p>
      <div className={styles.content()}>
        {children}
      </div>
    </div>
  )
} 