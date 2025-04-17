import { cn } from '@/lib/utils'
import { tv, type VariantProps } from 'tailwind-variants'
import {
  sizeVariant,
  radiusVariant,
  shadowVariant,
  disabledVariant,
  loadingVariant,
  fullWidthVariant,
  type SizeVariant,
  type RadiusVariant,
  type ShadowVariant,
  type DisabledVariant,
  type LoadingVariant,
  type FullWidthVariant,
} from '@/lib/ui/variants'

interface ButtonProps extends 
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  SizeVariant,
  RadiusVariant,
  ShadowVariant,
  DisabledVariant,
  LoadingVariant,
  FullWidthVariant {
  intent?: 'primary' | 'secondary';
  appearance?: 'solid' | 'alt' | 'outline';
  className?: string;
}

// 🎨 Style segment interface for clearer design contract
interface StyleSegments {
  bg: string;
  text: string;
  border: string;
  hover: string;
}

// 🔁 Helper to DRY up repetitive compound styles with explicit segments
const combo = (
  intent: 'primary' | 'secondary',
  appearance: 'solid' | 'alt' | 'outline',
  styles: StyleSegments
) => ({
  intent,
  appearance,
  className: `${styles.bg} ${styles.text} ${styles.border} ${styles.hover}`,
});

const compoundVariants = [
  // Primary Intent
  combo('primary', 'solid', {
    bg: 'bg-primary',
    text: 'text-white',
    border: 'border border-transparent',
    hover: 'hover:bg-primary-600 hover:border-primary-700',
  }),
  combo('primary', 'alt', {
    bg: 'bg-primary-800',
    text: 'text-white',
    border: 'border border-transparent',
    hover: 'hover:bg-primary-700 hover:border-primary-600',
  }),
  combo('primary', 'outline', {
    bg: 'bg-white',
    text: 'text-primary',
    border: 'border-2 border-primary',
    hover: 'hover:bg-primary-50 hover:border-primary-600',
  }),
  
  // Secondary Intent
  combo('secondary', 'solid', {
    bg: 'bg-secondary',
    text: 'text-white',
    border: 'border border-transparent',
    hover: 'hover:bg-secondary-600 hover:border-secondary-700',
  }),
  combo('secondary', 'alt', {
    bg: 'bg-secondary-800',
    text: 'text-white',
    border: 'border border-transparent',
    hover: 'hover:bg-secondary-700 hover:border-secondary-600',
  }),
  combo('secondary', 'outline', {
    bg: 'bg-white',
    text: 'text-secondary',
    border: 'border-2 border-secondary',
    hover: 'hover:bg-secondary-50 hover:border-secondary-600',
  }),
];

export const button = tv({
  base: 'inline-flex items-center justify-center font-semibold transition-colors focus:outline-none cursor-pointer',
  variants: {
    ...sizeVariant.variants,
    ...radiusVariant.variants,
    ...shadowVariant.variants,
    ...disabledVariant.variants,
    ...loadingVariant.variants,
    ...fullWidthVariant.variants,
    intent: {
      primary: '',
      secondary: '',
    },
    appearance: {
      solid: '',
      alt: '',
      outline: '',
    },
  },
  compoundVariants,
  defaultVariants: {
    intent: 'primary',
    appearance: 'solid',
    size: 'md',
    rounded: 'md',
    shadow: 'sm',
    disabled: false,
    loading: false,
    fullWidth: false,
  },
});

// ✅ Export for atomic style use elsewhere (e.g. <Link>, <div>)
export const buttonStyles = button;

// ✅ Export variant types for reuse
export type ButtonVariants = VariantProps<typeof button>;

export const Button = ({
  intent = 'primary',
  appearance = 'solid',
  size = 'md',
  rounded = 'md',
  shadow = 'sm',
  loading = false,
  disabled = false,
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        button({
          intent,
          appearance,
          size,
          rounded,
          shadow,
          loading,
          disabled,
          fullWidth,
        }),
        className
      )}
      disabled={loading || disabled}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <span className="invisible">{children}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;