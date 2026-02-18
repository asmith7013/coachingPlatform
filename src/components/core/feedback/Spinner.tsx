// src/components/core/feedback/Spinner.tsx
import React from "react";
import { tv } from "tailwind-variants";
import { cn } from "@ui/utils/formatters";
import { borderWidths } from "@/lib/tokens/tokens";

// Define spinner variants using the token-first approach
const spinnerVariants = tv({
  base: "animate-spin rounded-full border-solid",
  variants: {
    size: {
      xs: `h-3 w-3 ${borderWidths.sm}`,
      sm: `h-4 w-4 ${borderWidths.sm}`,
      md: `h-6 w-6 ${borderWidths.md}`,
      lg: `h-8 w-8 ${borderWidths.md}`,
      xl: `h-12 w-12 ${borderWidths.lg}`,
    },
    variant: {
      default: "border-gray-300 border-t-gray-600",
      primary: "border-blue-200 border-t-blue-600",
      success: "border-green-200 border-t-green-600",
      warning: "border-yellow-200 border-t-yellow-600",
      error: "border-red-200 border-t-red-600",
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
  },
);

Spinner.displayName = "Spinner";

export default Spinner;
