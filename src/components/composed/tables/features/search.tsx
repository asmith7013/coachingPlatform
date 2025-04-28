import { tv, type VariantProps } from 'tailwind-variants'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { cn } from '@ui/utils/formatters';
import { textColors } from '@ui-tokens/tokens'

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
      xs: { icon: 'size-4', input: 'text-xs' },
      sm: { icon: 'size-4', input: 'text-sm' },
      base: { icon: 'size-5', input: 'text-base' },
      lg: { icon: 'size-6', input: 'text-lg' },
      xl: { icon: 'size-6', input: 'text-xl' },
      '2xl': { icon: 'size-6', input: 'text-2xl' }
    },
    padding: {
      none: { input: 'p-0' },
      xs: { input: 'px-2 py-1' },
      sm: { input: 'px-3 py-1.5' },
      md: { input: 'px-4 py-2' },
      lg: { input: 'px-5 py-2.5' },
      xl: { input: 'px-6 py-3' },
    }
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