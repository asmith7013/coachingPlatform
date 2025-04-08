import { cn } from '@/lib/utils'
import { sizeVariants } from '@/lib/ui/tokens'
import type { SizeVariant } from '@/lib/ui/tokens'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: string // Accept any string as a class for variant
  size?: SizeVariant
  isLoading?: boolean
  className?: string
}

const defaultVariants = {
  primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-2 focus:ring-primary',
  secondary: 'bg-surface text-text hover:bg-surface-hover border border-outline',
  danger: 'bg-danger text-white hover:bg-danger-hover focus:ring-2 focus:ring-danger',
  success: 'bg-success text-white hover:bg-success-hover focus:ring-2 focus:ring-success',
  outline: 'bg-transparent border border-outline text-text hover:bg-surface-hover',
  ghost: 'bg-transparent text-text hover:bg-surface-hover',
}

export const Button = ({
  variant = defaultVariants.primary, // Default variant (you can pass any Tailwind classes or use predefined variants)
  size = 'md',
  isLoading,
  className,
  children,
  ...props
}: ButtonProps) => {
  // If variant is a key in defaultVariants, use that variant's classes
  const variantClasses = defaultVariants[variant as keyof typeof defaultVariants] || variant

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md transition-colors',
        sizeVariants[size],
        variantClasses, // Use either predefined variant or custom classes
        className,
        isLoading && 'opacity-50 cursor-not-allowed'
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}