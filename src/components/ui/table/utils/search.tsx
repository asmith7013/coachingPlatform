import { tv, type VariantProps } from 'tailwind-variants'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { textSizeVariant, paddingVariant } from '@/lib/ui/sharedVariants'
import { textColors } from '@/lib/ui/tokens'

const tableSearch = tv({
  slots: {
    root: 'relative',
    input: [
      'w-full rounded-md border pl-10',
      'bg-background border-surface',
      textColors.default,
      'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
      'placeholder:' + textColors.muted
    ],
    icon: [
      'absolute left-3 top-1/2 -translate-y-1/2',
      textColors.muted
    ]
  },
  variants: {
    textSize: {
      ...textSizeVariant.variants.textSize,
      xs: { icon: 'size-4' },
      sm: { icon: 'size-4' },
      base: { icon: 'size-5' },
      lg: { icon: 'size-6' },
      xl: { icon: 'size-6' },
      '2xl': { icon: 'size-6' }
    },
    padding: paddingVariant.variants.padding
  },
  defaultVariants: {
    textSize: 'base',
    padding: 'md'
  }
})

export type TableSearchVariants = VariantProps<typeof tableSearch>

export interface TableSearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  textSize?: TableSearchVariants['textSize']
  padding?: TableSearchVariants['padding']
}

export function TableSearch({
  textSize = 'base',
  padding = 'md',
  className,
  ...props
}: TableSearchProps) {
  const styles = tableSearch({ textSize, padding })

  return (
    <div className={styles.root()}>
      <MagnifyingGlassIcon className={styles.icon()} aria-hidden="true" />
      <input
        type="search"
        className={cn(styles.input(), className)}
        placeholder="Search..."
        {...props}
      />
    </div>
  )
} 