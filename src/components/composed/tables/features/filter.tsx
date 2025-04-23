import { ReactNode } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { textColors } from '@ui-tokens/tokens'

const tableFilter = tv({
  slots: {
    root: 'flex items-center bg-surface border-surface',
    label: [
      'font-medium',
      textColors.muted
    ],
    content: 'flex items-center'
  },
  variants: {
    textSize: {
      xs: {
        root: 'px-3 py-2 space-x-3',
        content: 'space-x-3',
        label: 'text-xs'
      },
      sm: {
        root: 'px-3 py-2 space-x-3',
        content: 'space-x-3',
        label: 'text-sm'
      },
      base: {
        root: 'px-4 py-3 space-x-4',
        content: 'space-x-4',
        label: 'text-base'
      },
      lg: {
        root: 'px-5 py-4 space-x-5',
        content: 'space-x-5',
        label: 'text-lg'
      },
      xl: {
        root: 'px-5 py-4 space-x-5',
        content: 'space-x-5',
        label: 'text-xl'
      },
      '2xl': {
        root: 'px-5 py-4 space-x-5',
        content: 'space-x-5',
        label: 'text-2xl'
      }
    }
  },
  defaultVariants: {
    textSize: 'base'
  }
})

export type TableFilterVariants = VariantProps<typeof tableFilter>
export const tableFilterStyles = tableFilter

interface TableFilterProps extends Omit<TableFilterVariants, 'textSize'> {
  children: ReactNode
  className?: string
  label?: string
  textSize?: TableFilterVariants['textSize']
}

export function TableFilter({
  children,
  className,
  label = 'Filter:',
  textSize = 'base'
}: TableFilterProps) {
  const styles = tableFilter({ textSize })

  return (
    <div className={styles.root({ className })}>
      <p className={styles.label()}>{label}</p>
      <div className={styles.content()}>
        {children}
      </div>
    </div>
  )
} 