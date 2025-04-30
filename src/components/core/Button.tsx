import { cn } from '@ui/utils/formatters';
import { tv, type VariantProps } from 'tailwind-variants'
import { textSize, paddingX, paddingY, radii, shadows, borderWidths } from '@ui-tokens/tokens'
import { backgroundColors, borderColors, hoverBackgroundColors, textColors } from '@ui-tokens/colors';
import { iconContentLayoutVariant } from '@ui-variants/layout';
// import { disabledVariant, loadingVariant } from '@ui-variants/shared-variants'

// Define specific types for Button component
type ButtonIntent = 'primary' | 'secondary';
type ButtonAppearance = 'solid' | 'alt' | 'outline';
type ButtonTextSize = 'sm' | 'base' | 'lg';
type ButtonPadding = 'sm' | 'md' | 'lg';
type ButtonRadius = 'none' | 'sm' | 'md' | 'full';
type ButtonShadow = 'none' | 'sm' | 'md';
type ButtonIconPosition = 'left' | 'right' | 'responsive';

/**
 * Button component variants.
 * Uses iconContentLayoutVariant for handling icon positioning.
 */
const button = tv({
  slots: {
    base: `inline-flex items-center justify-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary cursor-pointer`,
    spinner: `h-4 w-4 animate-spin rounded-full ${borderWidths.sm} border-white border-t-transparent`,
    content: '',
    iconWrapper: '',
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
    // loading: loadingVariant.variants.loading,
    // disabled: disabledVariant.variants.disabled,
  },
  compoundVariants: [
    // Primary Intents
    {
      intent: 'primary',
      appearance: 'solid',
      className: {
        base: `${backgroundColors.primary} ${textColors.white} ${borderWidths.sm} ${borderColors.muted} ${hoverBackgroundColors.primary}`,
      }
    },
    {
      intent: 'primary',
      appearance: 'alt',
      className: {
        base: `${backgroundColors.primary} ${textColors.default} ${borderWidths.sm} ${borderColors.muted} ${hoverBackgroundColors.primary}`,
      }
    },
    {
      intent: 'primary',
      appearance: 'outline',
      className: {
        base: `${backgroundColors.surface} ${textColors.primary} ${borderWidths.md} ${borderColors.primary} ${hoverBackgroundColors.primary}`,
      }
    },

    // Secondary Intents
    {
      intent: 'secondary',
      appearance: 'solid',
      className: {
        base: `${backgroundColors.secondary} ${textColors.default} ${borderWidths.sm} ${borderColors.muted} ${hoverBackgroundColors.secondary}`,
      }
    },
    {
      intent: 'secondary',
      appearance: 'alt',
      className: {
        base: `${backgroundColors.secondary} ${textColors.default} ${borderWidths.sm} ${borderColors.muted} ${hoverBackgroundColors.secondary}`,
      }
    },
    {
      intent: 'secondary',
      appearance: 'outline',
      className: {
        base: `${backgroundColors.surface} ${textColors.secondary} ${borderWidths.md} ${borderColors.secondary} ${hoverBackgroundColors.secondary}`,
      }
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
    iconPosition: 'left',
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
        <div className="flex items-center justify-center space-x-2">
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