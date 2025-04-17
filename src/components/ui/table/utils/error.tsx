import { ReactNode } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

const tableError = tv({
  slots: {
    root: 'flex items-center justify-center p-8 bg-surface',
    message: 'text-danger'
  },
  variants: {
    size: {
      sm: { message: 'text-xs' },
      md: { message: 'text-sm' },
      lg: { message: 'text-base' }
    },
    variant: {
      default: { message: 'text-danger' },
      warning: { message: 'text-warning' },
      info: { message: 'text-info' }
    }
  },
  defaultVariants: {
    size: 'md',
    variant: 'default'
  }
})

export type TableErrorVariants = VariantProps<typeof tableError>
export const tableErrorStyles = tableError

interface TableErrorProps extends TableErrorVariants {
  children: ReactNode
  className?: string
}

export function TableError({
  children,
  className,
  size,
  variant
}: TableErrorProps) {
  const styles = tableError({ size, variant })

  return (
    <div className={styles.root({ className })}>
      <p className={styles.message()}>
        {children}
      </p>
    </div>
  )
} 