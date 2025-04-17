import { tv, type VariantProps } from 'tailwind-variants'

const tableLoading = tv({
  slots: {
    root: 'flex items-center justify-center p-8 bg-surface',
    spinner: 'animate-spin text-primary',
    text: 'ml-3 text-text-muted'
  },
  variants: {
    size: {
      sm: {
        spinner: 'size-4',
        text: 'text-xs'
      },
      md: {
        spinner: 'size-5',
        text: 'text-sm'
      },
      lg: {
        spinner: 'size-6',
        text: 'text-base'
      }
    }
  },
  defaultVariants: {
    size: 'md'
  }
})

export type TableLoadingVariants = VariantProps<typeof tableLoading>
export const tableLoadingStyles = tableLoading

interface TableLoadingProps extends TableLoadingVariants {
  message?: string
  className?: string
}

export function TableLoading({
  message = 'Loading...',
  className,
  size
}: TableLoadingProps) {
  const styles = tableLoading({ size })

  return (
    <div className={styles.root({ className })}>
      <svg className={styles.spinner()} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span className={styles.text()}>{message}</span>
    </div>
  )
} 