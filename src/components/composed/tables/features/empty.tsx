'use client'

// import { ReactNode } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { textColors } from '@ui-tokens/tokens'

const tableEmpty = tv({
  slots: {
    root: 'flex items-center justify-center bg-surface',
    message: textColors.muted
  },
  variants: {
    textSize: {
      xs: { message: 'text-xs' },
      sm: { message: 'text-sm' },
      base: { message: 'text-base' },
      lg: { message: 'text-lg' },
      xl: { message: 'text-xl' },
    },
    padding: {
      none: { root: 'p-0' },
      xs: { root: 'p-2' },
      sm: { root: 'p-3' },
      md: { root: 'p-4' },
      lg: { root: 'p-6' },
      xl: { root: 'p-8' },
    }
  },
  defaultVariants: {
    textSize: 'base',
    padding: 'md'
  }
})

export type TableEmptyVariants = VariantProps<typeof tableEmpty>

export interface TableEmptyProps {
  message?: string
  textSize?: TableEmptyVariants['textSize']
  padding?: TableEmptyVariants['padding']
}

export function TableEmpty({
  message = 'No data available',
  textSize = 'base',
  padding = 'md'
}: TableEmptyProps) {
  const styles = tableEmpty({ textSize, padding })

  return (
    <tr>
      <td colSpan={1000} className={styles.root()}>
        <p className={styles.message()}>{message}</p>
      </td>
    </tr>
  )
}
