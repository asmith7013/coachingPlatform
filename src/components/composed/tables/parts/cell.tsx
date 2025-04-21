'use client'

import { ReactNode } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { textColors } from '@/lib/ui/tokens'

const tableCell = tv({
  base: 'px-4 py-3',
  variants: {
    textSize: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    },
    variant: {
      default: textColors.default,
      muted: textColors.muted,
      accent: textColors.accent,
      danger: textColors.danger
    }
  },
  defaultVariants: {
    textSize: 'base',
    align: 'left',
    variant: 'default'
  }
})

export type TableCellVariants = VariantProps<typeof tableCell>
export const tableCellStyles = tableCell

interface TableCellProps extends TableCellVariants {
  children: ReactNode
  className?: string
}

export function TableCell({
  children,
  className,
  align,
  textSize,
  variant
}: TableCellProps) {
  return (
    <td className={tableCell({ align, textSize, variant, className })}>
      {children}
    </td>
  )
}