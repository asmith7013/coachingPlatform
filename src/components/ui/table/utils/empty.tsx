'use client'

// import { ReactNode } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

const tableEmpty = tv({
  slots: {
    root: 'flex items-center justify-center bg-surface',
    message: 'text-muted'
  },
  variants: {
    textSize: {
      sm: { message: 'text-xs' },
      base: { message: 'text-sm' },
      lg: { message: 'text-base' }
    },
    padding: {
      sm: { root: 'p-4' },
      md: { root: 'p-6' },
      lg: { root: 'p-8' }
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
