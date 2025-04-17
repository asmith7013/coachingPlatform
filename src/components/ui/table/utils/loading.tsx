import { tv, type VariantProps } from 'tailwind-variants'
import { textSizeVariant } from '@/lib/ui/sharedVariants'
import { textColors } from '@/lib/ui/tokens'

const tableLoading = tv({
  slots: {
    root: 'flex items-center justify-center p-8 bg-surface',
    spinner: 'animate-spin text-primary',
    text: [
      'ml-3',
      textColors.muted
    ]
  },
  variants: {
    textSize: {
      ...textSizeVariant.variants.textSize,
      xs: { spinner: 'size-4' },
      sm: { spinner: 'size-4' },
      base: { spinner: 'size-5' },
      lg: { spinner: 'size-6' },
      xl: { spinner: 'size-6' },
      '2xl': { spinner: 'size-6' }
    }
  },
  defaultVariants: {
    textSize: 'base'
  }
})

export type TableLoadingVariants = VariantProps<typeof tableLoading>
export const tableLoadingStyles = tableLoading

interface TableLoadingProps extends Omit<TableLoadingVariants, 'textSize'> {
  message?: string
  className?: string
  textSize?: TableLoadingVariants['textSize']
}

export function TableLoading({
  message = 'Loading...',
  className,
  textSize = 'base'
}: TableLoadingProps) {
  const styles = tableLoading({ textSize })

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