import { ReactNode } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { textSizeVariant } from '@/lib/ui/sharedVariants'
import { textColors } from '@/lib/ui/tokens'

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
      ...textSizeVariant.variants.textSize,
      xs: {
        root: 'px-3 py-2 space-x-3',
        content: 'space-x-3'
      },
      sm: {
        root: 'px-3 py-2 space-x-3',
        content: 'space-x-3'
      },
      base: {
        root: 'px-4 py-3 space-x-4',
        content: 'space-x-4'
      },
      lg: {
        root: 'px-5 py-4 space-x-5',
        content: 'space-x-5'
      },
      xl: {
        root: 'px-5 py-4 space-x-5',
        content: 'space-x-5'
      },
      '2xl': {
        root: 'px-5 py-4 space-x-5',
        content: 'space-x-5'
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