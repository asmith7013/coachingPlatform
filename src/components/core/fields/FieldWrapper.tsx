import { cn } from '@ui/utils/formatters';
import { tv, type VariantProps } from 'tailwind-variants'
import { textColors } from '@ui-tokens/tokens'

const fieldWrapper = tv({
  slots: {
    root: ['w-full'],
    label: [
      'font-medium',
      textColors.default,
    ],
    content: [],
    error: [
      textColors.danger,
    ],
  },
  variants: {
    textSize: {
      xs: { label: 'text-xs mb-0.5', error: 'text-xs mt-0.5' },
      sm: { label: 'text-sm mb-1', error: 'text-sm mt-1' },
      base: { label: 'text-base mb-1', error: 'text-sm mt-1' },
      lg: { label: 'text-lg mb-1.5', error: 'text-sm mt-1.5' },
      xl: { label: 'text-xl mb-2', error: 'text-sm mt-2' },
    },
    padding: {
      none: { root: 'p-0', content: 'mb-0' },
      xs: { root: 'p-1', content: 'mb-1' },
      sm: { root: 'p-1.5', content: 'mb-1.5' },
      md: { root: 'p-2', content: 'mb-2' },
      lg: { root: 'p-3', content: 'mb-3' },
      xl: { root: 'p-4', content: 'mb-4' },
    },
  },
  defaultVariants: {
    textSize: 'base',
    padding: 'md',
  },
})

export type FieldWrapperVariants = VariantProps<typeof fieldWrapper>

export interface FieldWrapperProps extends FieldWrapperVariants {
  id?: string
  label?: string
  error?: string
  children: React.ReactNode
  className?: string
}

export function FieldWrapper({ 
  id, 
  label, 
  error, 
  children, 
  className,
  textSize,
  padding,
}: FieldWrapperProps) {
  const styles = fieldWrapper({ textSize, padding })

  return (
    <div className={cn(styles.root(), className)}>
      {label && (
        <label htmlFor={id} className={styles.label()}>
          {label}
        </label>
      )}
      <div className={styles.content()}>{children}</div>
      {error && (
        <p className={styles.error()}>
          {error}
        </p>
      )}
    </div>
  )
} 