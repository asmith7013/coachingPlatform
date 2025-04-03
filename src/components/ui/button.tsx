import { cn } from '@/lib/utils'
import { spacing, radii, textColors, backgroundColors, borderColors } from '@/lib/ui/tokens'

type TokenVariant = 'primary' | 'secondary' | 'success' | 'danger'
type CustomVariant = 'outline' | 'link'
type ButtonVariant = TokenVariant | CustomVariant

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}

const sizeVariants = {
  sm: 'text-sm px-2 py-1',
  md: 'text-sm px-3 py-2',
  lg: 'text-sm px-4 py-2.5',
}

const customVariants: Record<CustomVariant, string> = {
  outline: cn(
    'border',
    borderColors.default,
    backgroundColors.white,
    textColors.secondary,
    'hover:bg-gray-50'
  ),
  link: cn(
    'bg-transparent',
    textColors.primary,
    'hover:underline'
  ),
}

const tokenVariants: Record<TokenVariant, string> = {
  primary: cn(
    backgroundColors.primary,
    textColors.white,
    'hover:bg-primary-dark'
  ),
  secondary: cn(
    backgroundColors.secondary,
    textColors.white,
    'hover:bg-secondary-dark'
  ),
  success: cn(
    backgroundColors.success,
    textColors.white,
    'hover:bg-success-dark'
  ),
  danger: cn(
    backgroundColors.danger,
    textColors.white,
    'hover:bg-danger-dark'
  ),
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  children,
  className,
  ...props
}: ButtonProps) {
  const sizeClasses = sizeVariants[size]

  const isTokenVariant = variant in tokenVariants

  const variantClass = isTokenVariant
    ? tokenVariants[variant as TokenVariant]
    : customVariants[variant as CustomVariant]

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center font-semibold',
        radii.md,
        'shadow-xs',
        sizeClasses,
        variantClass,
        className
      )}
      {...props}
    >
      {Icon && (
        <Icon
          className={cn(`mr-${spacing.sm} -ml-0.5 size-5`)}
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  )
} 