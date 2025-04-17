'use client'

// import { ReactNode } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { textSizeVariant, paddingVariant } from '@/lib/ui/sharedVariants'
import { textColors } from '@/lib/ui/tokens'

const tableEmpty = tv({
  slots: {
    root: 'flex items-center justify-center bg-surface',
    message: textColors.muted
  },
  variants: {
    textSize: textSizeVariant.variants.textSize,
    padding: paddingVariant.variants.padding
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
