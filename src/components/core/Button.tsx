import { cn } from '@ui/utils/formatters';
import { tv, type VariantProps } from 'tailwind-variants'
import { textSize, paddingX, paddingY, radii, shadows } from '@ui-tokens/tokens'

// Define specific types for Button component
type ButtonIntent = 'primary' | 'secondary';
type ButtonAppearance = 'solid' | 'alt' | 'outline';
type ButtonTextSize = 'sm' | 'base' | 'lg';
type ButtonPadding = 'sm' | 'md' | 'lg';
type ButtonRadius = 'none' | 'sm' | 'md' | 'full';
type ButtonShadow = 'none' | 'sm' | 'md';

const button = tv({
  slots: {
    base: 'inline-flex items-center justify-center font-semibold transition-colors focus:outline-none cursor-pointer',
    spinner: 'h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent',
    content: '',
  },
  variants: {
    intent: {
      primary: '',
      secondary: '',
    },
    appearance: {
      solid: '',
      alt: '',
      outline: '',
    },
    textSize: {
      sm: textSize.sm,
      base: textSize.base,
      lg: textSize.lg,
    },
    padding: {
      sm: `${paddingX.sm} ${paddingY.xs}`,
      md: `${paddingX.md} ${paddingY.sm}`,
      lg: `${paddingX.lg} ${paddingY.md}`,
    },
    radius: {
      none: radii.none,
      sm: radii.sm,
      md: radii.md,
      full: radii.full,
    },
    shadow: {
      none: shadows.none,
      sm: shadows.sm,
      md: shadows.md,
    },
    fullWidth: {
      true: 'w-full',
      false: '',
    },
    loading: {
      true: '',
      false: '',
    },
    disabled: {
      true: 'opacity-60 pointer-events-none',
      false: '',
    },
  },
  compoundVariants: [
    // Primary Intents
    {
      intent: 'primary',
      appearance: 'solid',
      className: 'bg-primary text-white border border-transparent hover:bg-primary-600',
    },
    {
      intent: 'primary',
      appearance: 'alt',
      className: 'bg-primary-800 text-white border border-transparent hover:bg-primary-700',
    },
    {
      intent: 'primary',
      appearance: 'outline',
      className: 'bg-white text-primary border-2 border-primary hover:bg-primary-50',
    },

    // Secondary Intents
    {
      intent: 'secondary',
      appearance: 'solid',
      className: 'bg-secondary text-white border border-transparent hover:bg-secondary-600',
    },
    {
      intent: 'secondary',
      appearance: 'alt',
      className: 'bg-secondary-800 text-white border border-transparent hover:bg-secondary-700',
    },
    {
      intent: 'secondary',
      appearance: 'outline',
      className: 'bg-white text-secondary border-2 border-secondary hover:bg-secondary-50',
    },
  ],
  defaultVariants: {
    intent: 'primary',
    appearance: 'solid',
    textSize: 'base',
    padding: 'md',
    radius: 'md',
    shadow: 'sm',
    fullWidth: false,
    loading: false,
    disabled: false,
  },
})

export type ButtonVariants = VariantProps<typeof button>

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    intent?: ButtonIntent;
    appearance?: ButtonAppearance;
    textSize?: ButtonTextSize;
    padding?: ButtonPadding;
    radius?: ButtonRadius;
    shadow?: ButtonShadow;
    fullWidth?: boolean;
    loading?: boolean;
    disabled?: boolean;
    className?: string;
    children?: React.ReactNode;
  }

export const Button = ({
  intent,
  appearance,
  textSize,
  padding,
  radius,
  shadow,
  fullWidth,
  loading,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) => {
  const { base, spinner, content } = button({
    intent,
    appearance,
    textSize,
    padding,
    radius,
    shadow,
    fullWidth,
    loading,
    disabled,
  })

  return (
    <button
      className={cn(base(), className)}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center space-x-2">
          <div className={spinner()} />
          <span className="invisible">{children}</span>
        </div>
      ) : (
        <span className={content()}>{children}</span>
      )}
    </button>
  )
}

export default Button