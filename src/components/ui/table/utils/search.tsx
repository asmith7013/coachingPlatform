import { tv, type VariantProps } from 'tailwind-variants'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

const tableSearch = tv({
  slots: {
    root: 'relative',
    input: [
      'w-full rounded-md border pl-10',
      'text-text bg-background border-surface',
      'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
      'placeholder:text-text-muted'
    ],
    icon: 'absolute left-3 top-1/2 -translate-y-1/2 text-text-muted'
  },
  variants: {
    textSize: {
      sm: {
        input: 'text-xs',
        icon: 'size-4'
      },
      base: {
        input: 'text-sm',
        icon: 'size-5'
      },
      lg: {
        input: 'text-base',
        icon: 'size-6'
      }
    },
    padding: {
      sm: {
        input: 'px-3 py-1'
      },
      md: {
        input: 'px-3 py-1.5'
      },
      lg: {
        input: 'px-4 py-2'
      }
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