import { cn } from '@/lib/utils'
import { tv, type VariantProps } from 'tailwind-variants'
import { textColors } from '@/lib/ui/tokens'
import { textSizeVariant, paddingVariant } from '@/lib/ui/sharedVariants'

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
    textSize: textSizeVariant.variants.textSize,
    padding: paddingVariant.variants.padding,
  },
  defaultVariants: {
    textSize: 'base',
    padding: 'md',
  },
})

export type FieldWrapperVariants = VariantProps<typeof fieldWrapper>

interface FieldWrapperProps extends FieldWrapperVariants {
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