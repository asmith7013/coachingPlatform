'use client'

import { ReactNode } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

const tableCell = tv({
  base: 'px-4 py-3 text-text',
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base'
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    },
    variant: {
      default: 'text-text',
      muted: 'text-text-muted',
      primary: 'text-primary',
      secondary: 'text-secondary',
      success: 'text-success',
      danger: 'text-danger'
    }
  },
  defaultVariants: {
    size: 'md',
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
  size,
  variant
}: TableCellProps) {
  return (
    <td className={tableCell({ align, size, variant, className })}>
      {children}
    </td>
  )
}