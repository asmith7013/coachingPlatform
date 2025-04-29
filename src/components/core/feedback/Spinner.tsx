// src/components/core/Spinner/Spinner.tsx
import React from 'react';
import { tv } from 'tailwind-variants';
import { cn } from '@ui/utils/formatters';

// Define spinner variants using the token-first approach
const spinnerVariants = tv({
  base: "animate-spin rounded-full border-solid border-t-transparent",
  variants: {
    size: {
      xs: "h-3 w-3 border-2",
      sm: "h-4 w-4 border-2",
      md: "h-6 w-6 border-2",
      lg: "h-8 w-8 border-3",
      xl: "h-12 w-12 border-4",
    },
    variant: {
      default: "border-gray-300 dark:border-gray-600",
      primary: "border-blue-600 dark:border-blue-400",
      success: "border-green-600 dark:border-green-400",
      warning: "border-yellow-600 dark:border-yellow-400",
      error: "border-red-600 dark:border-red-400",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The size of the spinner
   * @default "md"
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  
  /**
   * The color variant of the spinner
   * @default "default"
   */
  variant?: "default" | "primary" | "success" | "warning" | "error";
  
  /**
   * Optional text to be announced to screen readers
   * @default "Loading"
   */
  srText?: string;
}

/**
 * Spinner component for indicating loading state
 * 
 * @example
 * <Spinner variant="primary" size="md" />
 */
export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, srText = "Loading", ...props }, ref) => {
    return (
      <div ref={ref} role="status" className="inline-flex" {...props}>
        <div className={cn(spinnerVariants({ size, variant }), className)} />
        <span className="sr-only">{srText}</span>
      </div>
    );
  }
);

Spinner.displayName = "Spinner";

export default Spinner;