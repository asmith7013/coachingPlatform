import { cn } from '@/lib/utils'
import { sizeVariants } from '@/lib/ui/tokens'
import type { SizeVariant } from '@/lib/ui/tokens'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'danger'
  size?: SizeVariant
  isLoading?: boolean
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading,
  className,
  children,
  ...props
}: ButtonProps) => {
  const variantStyles = {
    outline: cn(
      'border',
      'bg-white',
      'text-text',
      'hover:bg-background-alt',
      'focus:ring-2 focus:ring-primary focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ),
    primary: cn(
      'bg-primary',
      'text-white',
      'hover:bg-primary-hover',
      'focus:ring-2 focus:ring-primary focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ),
    secondary: cn(
      'bg-secondary',
      'text-white',
      'hover:bg-surface-hover',
      'focus:ring-2 focus:ring-primary focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ),
    success: cn(
      'bg-success',
      'text-white',
      'hover:bg-success-hover',
      'focus:ring-2 focus:ring-success focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ),
    danger: cn(
      'bg-danger',
      'text-white',
      'hover:bg-danger-hover',
      'focus:ring-2 focus:ring-danger focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ),
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md transition-colors',
        sizeVariants[size],
        variantStyles[variant],
        className
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