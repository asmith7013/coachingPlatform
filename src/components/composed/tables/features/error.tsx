import { ReactNode } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { textColors } from '@ui-tokens/tokens'

const tableError = tv({
  slots: {
    root: 'flex items-center justify-center p-8 bg-surface',
    message: ''
  },
  variants: {
    textSize: {
      xs: { message: 'text-xs' },
      sm: { message: 'text-sm' },
      base: { message: 'text-base' },
      lg: { message: 'text-lg' },
      xl: { message: 'text-xl' },
    },
    variant: {
      default: { message: textColors.danger },
      muted: { message: textColors.muted },
      accent: { message: textColors.accent }
    }
  },
  defaultVariants: {
    textSize: 'base',
    variant: 'default'
  }
})

export type TableErrorVariants = VariantProps<typeof tableError>
export const tableErrorStyles = tableError

interface TableErrorProps extends Omit<TableErrorVariants, 'textSize'> {
  children: ReactNode
  className?: string
  textSize?: TableErrorVariants['textSize']
}

export function TableError({
  children,
  className,
  textSize = 'base',
  variant = 'default'
}: TableErrorProps) {
  const styles = tableError({ textSize, variant })

  return (
    <div className={styles.root({ className })}>
      <p className={styles.message()}>
        {children}
      </p>
    </div>
  )
} 