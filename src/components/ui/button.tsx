import { cn } from '@/lib/utils'
import { spacing, radii, colorVariants } from '@/lib/ui/tokens'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'link'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}

const sizeVariants = {
  sm: 'text-sm px-2 py-1',
  md: 'text-sm px-3 py-2',
  lg: 'text-sm px-4 py-2.5',
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  children,
  className,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: sizeVariants.sm,
    md: sizeVariants.md,
    lg: sizeVariants.lg,
  }

  const variantClasses = {
    primary: cn(
      colorVariants.primary,
      'text-white',
      'hover:bg-primary-dark'
    ),
    secondary: cn(
      'bg-white/10',
      'text-white',
      'hover:bg-white/20'
    ),
    outline: cn(
      'border border-gray-300',
      'bg-white',
      'text-gray-700',
      'hover:bg-gray-50'
    ),
    danger: cn(
      'bg-red-600',
      'text-white',
      'hover:bg-red-700'
    ),
    link: cn(
      'bg-transparent',
      'text-primary',
      'hover:text-primary-dark',
      'hover:underline'
    ),
  }

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center font-semibold',
        radii.md,
        'shadow-xs',
        sizeClasses[size],
        variantClasses[variant],
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