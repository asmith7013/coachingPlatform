import { cn } from '@/lib/utils'
import { spacing, radii, colorVariants } from '@/lib/ui/tokens'

type TokenVariant = keyof typeof colorVariants
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
  outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
  link: 'bg-transparent text-blue-600 hover:underline',
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

  const isTokenVariant = variant in colorVariants

  const variantClass = isTokenVariant
    ? colorVariants[variant as TokenVariant]
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