import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '@/lib/utils'
import { textSize, paddingX, paddingY, radii, textColors } from '@/lib/ui/tokens'

// Define component-specific types
type InputTextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';
type InputPadding = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type InputRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

const input = tv({
  slots: {
    base: 'w-full border bg-surface text-default placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
    wrapper: '',
  },
  variants: {
    textSize: {
      xs: textSize.xs,
      sm: textSize.sm,
      base: textSize.base,
      lg: textSize.lg,
      xl: textSize.xl,
    },
    padding: {
      xs: `${paddingX.xs} ${paddingY.xs}`,
      sm: `${paddingX.sm} ${paddingY.xs}`,
      md: `${paddingX.md} ${paddingY.sm}`,
      lg: `${paddingX.lg} ${paddingY.md}`,
      xl: `${paddingX.xl} ${paddingY.lg}`,
    },
    radius: {
      none: radii.none,
      sm: radii.sm,
      md: radii.md,
      lg: radii.lg,
      full: radii.full,
    },
    disabled: {
      true: 'opacity-60 pointer-events-none',
      false: '',
    },
    error: {
      true: 'border-danger focus:ring-danger',
      false: 'border-surface-hover',
    },
  },
  defaultVariants: {
    textSize: 'base',
    padding: 'md',
    radius: 'md',
    disabled: false,
    error: false,
  },
})

export type InputVariants = VariantProps<typeof input>
type InputHTMLProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>

export interface InputProps extends InputHTMLProps {
  label?: string
  error?: string
  textSize?: InputTextSize
  padding?: InputPadding
  radius?: InputRadius
  disabled?: boolean
}

export function Input({
  label,
  error,
  className,
  textSize,
  padding,
  radius,
  disabled,
  ...props
}: InputProps) {
  const { base, wrapper } = input({
    textSize,
    padding,
    radius,
    error: Boolean(error),
    disabled,
  })
  
  return (
    <div className={wrapper()}>
      {label && (
        <label className={cn("block font-medium mb-1", "text-sm", textColors.default)}>
          {label}
        </label>
      )}
      <input
        {...props}
        disabled={disabled}
        className={cn(base(), className)}
      />
      {error && (
        <p className={cn("mt-1", "text-sm", textColors.danger)}>
          {error}
        </p>
      )}
    </div>
  )
}

export default Input 