import { cn } from '@ui/utils/formatters';
import { tv, type VariantProps } from 'tailwind-variants'
import {
  textSize,
  paddingX,
  paddingY,
  radii,
  shadows,
  borderWidths,
  spaceBetween,
} from '@/lib/tokens/tokens'
import {
  TextSizeToken,
  PaddingToken,
  RadiusToken,
  ShadowToken
} from '@/lib/tokens/types'
import { iconContentLayoutVariant } from '@ui-variants/layout';

// Define specific component intent and appearance types
export type ButtonIntent = 'primary' | 'secondary' | 'danger' | 'success';
export type ButtonAppearance = 'solid' | 'alt' | 'outline';

// Use centralized token types for common properties
export type ButtonIconPosition = 'left' | 'right' | 'responsive';

/**
 * Button component variants.
 * Uses iconContentLayoutVariant for handling icon positioning.
 */
const button = tv({
  slots: {
    base: `inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary cursor-pointer`,
    spinner: `h-4 w-4 animate-spin rounded-full ${borderWidths.sm} border-current border-t-transparent`,
    content: '',
    iconWrapper: '',
  },
  variants: {
    intent: {
      // Soft style: light bg with darker text, simple hover
      primary: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      danger: 'bg-red-100 text-red-700 hover:bg-red-200',
      success: 'bg-green-100 text-green-700 hover:bg-green-200',
    },
    appearance: {
      solid: '',
      alt: '',
      outline: '',
    },
    textSize: {
      xs: textSize.xs,
      sm: textSize.sm,
      base: textSize.base,
      lg: textSize.lg,
      xl: textSize.xl,
      '2xl': textSize['2xl'],
    },
    padding: {
      none: `${paddingX.none} ${paddingY.none}`,
      xs: `${paddingX.xs} ${paddingY.xs}`,
      sm: `${paddingX.sm} ${paddingY.xs}`,
      md: `${paddingX.md} ${paddingY.sm}`,
      lg: `${paddingX.lg} ${paddingY.md}`,
      xl: `${paddingX.xl} ${paddingY.lg}`,
      '2xl': `${paddingX['2xl']} ${paddingY['2xl']}`,
    },
    radius: {
      none: radii.none,
      sm: radii.sm,
      md: radii.md,
      lg: radii.lg,
      xl: radii.xl,
      '2xl': radii['2xl'],
      full: radii.full,
    },
    shadow: {
      none: shadows.none,
      sm: shadows.sm,
      md: shadows.md,
      lg: shadows.lg,
      xl: shadows.xl,
      '2xl': shadows['2xl'],
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
      true: 'opacity-50 cursor-not-allowed pointer-events-none',
      false: '',
    },
    // Add icon position variant that uses the iconContentLayoutVariant
    iconPosition: {
      left: {
        iconWrapper: iconContentLayoutVariant({ position: 'left' }).icon(),
      },
      right: {
        iconWrapper: iconContentLayoutVariant({ position: 'right' }).icon(),
      },
      responsive: {
        iconWrapper: iconContentLayoutVariant({ position: 'responsive' }).icon(),
      },
    },
  },
  compoundVariants: [
    // Solid appearance - darker bg, white text
    {
      intent: 'primary',
      appearance: 'solid',
      className: 'bg-blue-600 text-white hover:bg-blue-700',
    },
    {
      intent: 'secondary',
      appearance: 'solid',
      className: 'bg-gray-600 text-white hover:bg-gray-700',
    },
    {
      intent: 'danger',
      appearance: 'solid',
      className: 'bg-red-600 text-white hover:bg-red-700',
    },
    {
      intent: 'success',
      appearance: 'solid',
      className: 'bg-green-600 text-white hover:bg-green-700',
    },
    // Outline appearance - transparent bg with border
    {
      intent: 'primary',
      appearance: 'outline',
      className: 'bg-transparent text-blue-700 border border-blue-300 hover:bg-blue-50',
    },
    {
      intent: 'secondary',
      appearance: 'outline',
      className: 'bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50',
    },
    {
      intent: 'danger',
      appearance: 'outline',
      className: 'bg-transparent text-red-700 border border-red-300 hover:bg-red-50',
    },
    {
      intent: 'success',
      appearance: 'outline',
      className: 'bg-transparent text-green-700 border border-green-300 hover:bg-green-50',
    },
  ],
  defaultVariants: {
    intent: 'primary',
    appearance: 'alt',
    textSize: 'sm',
    padding: 'md',
    radius: 'lg',
    shadow: 'none',
    fullWidth: false,
    loading: false,
    disabled: false,
    iconPosition: 'left',
  },
})

export type ButtonVariants = VariantProps<typeof button>

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    intent?: ButtonIntent;
    appearance?: ButtonAppearance;
    textSize?: TextSizeToken;
    padding?: PaddingToken;
    radius?: RadiusToken;
    shadow?: ShadowToken;
    fullWidth?: boolean;
    loading?: boolean;
    disabled?: boolean;
    className?: string;
    children?: React.ReactNode;
    /**
     * Optional icon element to display alongside text
     */
    icon?: React.ReactNode;
    /**
     * Position of the icon relative to the text
     * - left: Icon displayed to the left of text
     * - right: Icon displayed to the right of text
     * - responsive: Icon stacked above text on mobile, displayed to the left on desktop
     * @default "left"
     */
    iconPosition?: ButtonIconPosition;
  }

/**
 * Button component with responsive icon placement support.
 * Uses the iconContentLayoutVariant for consistent responsive behavior.
 * 
 * @example
 * <Button>Click me</Button>
 * 
 * @example
 * <Button intent="secondary" appearance="outline" icon={<Icon />} iconPosition="responsive">
 *   With Icon
 * </Button>
 */
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
  icon,
  iconPosition = 'left',
  ...props
}: ButtonProps) => {
  const { base, spinner, content, iconWrapper } = button({
    intent,
    appearance,
    textSize,
    padding,
    radius,
    shadow,
    fullWidth,
    loading,
    disabled,
    iconPosition,
  })

  // Determine the container class based on iconPosition
  const containerClass = icon
    ? iconContentLayoutVariant({ position: iconPosition }).container()
    : '';

  return (
    <button
      className={cn(base(), containerClass, className)}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <div className={cn("flex items-center justify-center", spaceBetween.x.sm)}>
          <div className={spinner()} />
          <span className="invisible">{children}</span>
        </div>
      ) : (
        <>
          {icon && <span className={iconWrapper()}>{icon}</span>}
          <span className={content()}>{children}</span>
        </>
      )}
    </button>
  )
}

export default Button