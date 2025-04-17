import { tv, type VariantProps } from 'tailwind-variants'
import { layout } from '../tokens'

export const gridVariants = tv({
  base: 'grid',
  variants: {
    cols: layout.grid.cols,
    gap: layout.grid.gap,
  },
  defaultVariants: {
    cols: 1,
    gap: 'md',
  },
})

export const flexVariants = tv({
  base: 'flex',
  variants: {
    direction: {
      row: 'flex-row',
      col: 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'col-reverse': 'flex-col-reverse',
    },
    justify: {
      start: 'justify-start',
      end: 'justify-end',
      center: 'justify-center',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    align: {
      start: 'items-start',
      end: 'items-end',
      center: 'items-center',
      baseline: 'items-baseline',
      stretch: 'items-stretch',
    },
  },
  defaultVariants: {
    direction: 'row',
    justify: 'start',
    align: 'start',
  },
})

export type GridVariants = VariantProps<typeof gridVariants>
export type FlexVariants = VariantProps<typeof flexVariants> 