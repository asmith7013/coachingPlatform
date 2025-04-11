import { cn } from '@/lib/utils'
import { tv } from 'tailwind-variants'
import {
  sizeVariant,
  fullWidthVariant,
  radiusVariant,
  shadowVariant,
  disabledVariant,
  loadingVariant,
} from '@/lib/ui/sharedVariants'
// import type { SizeVariant, Shadow } from '@/lib/ui/tokens'
// import { defaultBooleanVariant } from '@/lib/ui/sharedVariants'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  intent?: 'primary' | 'secondary';
  appearance?: 'solid' | 'alt' | 'outline';
  size?: 'md' | 'sm' | 'lg' | 'xl';
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const button = tv({
  base: 'inline-flex items-center justify-center font-semibold transition-colors focus:outline-none cursor-pointer',
  variants: {
    ...sizeVariant.variants,
    ...fullWidthVariant.variants,
    ...radiusVariant.variants,
    ...shadowVariant.variants,
    ...disabledVariant.variants,
    ...loadingVariant.variants,
    intent: {
      primary: '',
      secondary: '',
    },
    appearance: {
      solid: '',
      alt: '',
      outline: '',
    },
    loading: {
      true: 'cursor-wait',
      false: '',
    },
    disabled: {
      true: 'opacity-50 pointer-events-none',
      false: '',
    },
    fullWidth: {
      true: 'w-full',
      false: '',
    },
  },
  compoundVariants: [
    {
      intent: 'primary',
      appearance: 'solid',
      className: 'bg-primary text-white hover:bg-primary-600',
    },
    {
      intent: 'primary',
      appearance: 'alt',
      className: 'bg-primary-800 text-white hover:bg-primary-700',
    },
    {
      intent: 'primary',
      appearance: 'outline',
      className: 'bg-white text-primary border-2 border-primary hover:bg-primary-600',
    },
    {
      intent: 'secondary',
      appearance: 'solid',
      className: 'bg-secondary text-white hover:bg-secondary-600',
    },
    {
      intent: 'secondary',
      appearance: 'alt',
      className: 'bg-secondary-800 text-white hover:bg-secondary-700',
    },
    {
      intent: 'secondary',
      appearance: 'outline',
      className: 'bg-white text-secondary border-2 border-secondary hover:bg-secondary-600',
    },
  ],
  defaultVariants: {
    intent: 'primary',
    appearance: 'solid',
    size: 'md',
    fullWidth: false,
    radius: 'md',
    shadow: 'sm',
    disabled: false,
    loading: false,
  },
})

export const Button: React.FC<ButtonProps> = ({
  intent = 'primary',
  appearance = 'solid',
  size = 'md',
  shadow = 'sm',
  loading = false,
  disabled = false,
  fullWidth = false,
  className,
  children,
  ...props
}) => {
  return (
    <button
      className={cn(
        button({
          intent,
          appearance,
          size,
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