import { cn } from '@ui/utils/formatters';
import { tv, type VariantProps } from 'tailwind-variants'
import { 
  textSize, 
  paddingX, 
  paddingY, 
  radii, 
  shadows, 
  borderWidths,
} from '@/lib/tokens/tokens'
import { 
  TextSizeToken,
  PaddingToken,
  RadiusToken,
  ShadowToken
} from '@/lib/tokens/types'
import { backgroundColors, borderColors, hoverBackgroundColors, textColors } from '@/lib/tokens/colors';
import { iconContentLayoutVariant } from '@ui-variants/layout';
// import { disabledVariant, loadingVariant } from '@ui-variants/shared-variants'

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
    base: `inline-flex items-center justify-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary cursor-pointer`,
    spinner: `h-4 w-4 animate-spin rounded-full ${borderWidths.sm} border-white border-t-transparent`,
    content: '',
    iconWrapper: '',
  },
  variants: {
    intent: {
      primary: '',
      secondary: '',
      danger: '',
      success: '',
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
      appearance: 'outline',
      className: {
        base: `${backgroundColors.surface} ${textColors.primary} ${borderWidths.md} ${borderColors.primary} ${hoverBackgroundColors.primary}`,
      }
    },
    {
      intent: 'primary',
      appearance: 'alt',
      className: {
        base: `${backgroundColors.primary} ${textColors.default} ${borderWidths.sm} ${borderColors.muted} ${hoverBackgroundColors.primary}`,
      }
    },


    // Secondary Intents
    {
      intent: 'secondary',
      appearance: 'solid',
      className: {
        base: `${backgroundColors.secondary} ${textColors.white} ${borderWidths.sm} ${borderColors.muted} ${hoverBackgroundColors.secondary}`,
      }
    },
    {
      intent: 'secondary',
      appearance: 'outline',
      className: {
        base: `${backgroundColors.surface} ${textColors.secondary} ${borderWidths.md} ${borderColors.secondary} ${hoverBackgroundColors.secondary}`,
      }
    },
    {
      intent: 'secondary',
      appearance: 'alt',
      className: {
        base: `${backgroundColors.secondary} ${textColors.default} ${borderWidths.sm} ${borderColors.muted} ${hoverBackgroundColors.secondary}`,
      }
    },

    // Danger Intents
    {
      intent: 'danger',
      appearance: 'solid',
      className: {
        base: `${backgroundColors.danger} ${textColors.white} ${borderWidths.sm} ${borderColors.muted} ${hoverBackgroundColors.danger}`,
      }
    },
    {
      intent: 'danger',
      appearance: 'outline',
      className: {
        base: `${backgroundColors.surface} ${textColors.danger} ${borderWidths.md} ${borderColors.danger} ${hoverBackgroundColors.danger}`,
      }
    },
    {
      intent: 'danger',
      appearance: 'alt',
      className: {
        base: `${backgroundColors.danger} ${textColors.default} ${borderWidths.sm} ${borderColors.muted} ${hoverBackgroundColors.danger}`,
      }
    },

    // Success Intents
    {
      intent: 'success',
      appearance: 'solid',
      className: {
        base: `${backgroundColors.success} ${textColors.white} ${borderWidths.sm} ${borderColors.muted} ${hoverBackgroundColors.success}`,
      }
    },
    {
      intent: 'success',
      appearance: 'outline',
      className: {
        base: `${backgroundColors.surface} ${textColors.success} ${borderWidths.md} ${borderColors.success} ${hoverBackgroundColors.success}`,
      }
    },
    {
      intent: 'success',
      appearance: 'alt',
      className: {
        base: `${backgroundColors.success} ${textColors.default} ${borderWidths.sm} ${borderColors.muted} ${hoverBackgroundColors.success}`,
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