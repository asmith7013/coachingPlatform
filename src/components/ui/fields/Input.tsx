import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '@/lib/utils'
import { textColors } from '@/lib/ui/tokens'
import { radiusVariant, disabledVariant } from '@/lib/ui/variants'
import { textSizeVariant, paddingVariant } from '@/lib/ui/sharedVariants'
import { FieldWrapper } from './FieldWrapper'

const input = tv({
  base: [
    'w-full',
    'border',
    'border-surface-hover',
    'bg-surface',
    textColors.default,
    'placeholder:text-muted',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-primary',
    'focus:border-transparent',
  ],
  variants: {
    textSize: textSizeVariant.variants.textSize,
    padding: paddingVariant.variants.padding,
    rounded: radiusVariant.variants.rounded,
    disabled: disabledVariant.variants.disabled,
    error: {
      true: [
        'border-danger',
        'focus:ring-danger',
      ],
    },
  },
  defaultVariants: {
    textSize: 'base',
    padding: 'md',
    rounded: 'md',
  },
})

// ✅ Export for atomic style use elsewhere
export const inputStyles = input

export type InputVariants = VariantProps<typeof input>
type InputHTMLProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>

interface InputProps extends InputHTMLProps {
  label?: string
  error?: string
  textSize?: InputVariants['textSize']
  padding?: InputVariants['padding']
  rounded?: InputVariants['rounded']
  disabled?: boolean
}

export function Input({
  label,
  error,
  className,
  textSize,
  padding,
  rounded,
  disabled,
  ...props
}: InputProps) {
  return (
    <FieldWrapper
      label={label}
      error={error}
      textSize={textSize}
      padding={padding}
    >
      <input
        {...props}
        disabled={disabled}
        className={cn(
          input({
            textSize,
            padding,
            rounded,
            error: Boolean(error),
            disabled,
          }),
          className
        )}
      />
    </FieldWrapper>
  )
}

export type { InputProps }
